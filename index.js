import * as BABYLON from 'https://cdn.babylonjs.com/babylon.js';
import 'https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js';

console.log("index.js is loaded");

const canvas = document.getElementById('renderCanvas');
console.log("Canvas element:", canvas);
const engine = new BABYLON.Engine(canvas, true);
console.log("Babylon.js engine created");

const createScene = () => {
    console.log("Creating scene...");
    const scene = new BABYLON.Scene(engine);

    // Add a basic light and camera
    const camera = new BABYLON.ArcRotateCamera('camera1', 0, 0, 10, new BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0), scene);

    // Add IBL
    const hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("day.env", scene);
    scene.environmentTexture = hdrTexture;

    // Load the model
    console.log("Attempting to load model...");
    BABYLON.SceneLoader.ImportMesh("", "", "model.glb", scene, (meshes) => {
        console.log("Model loaded successfully");
        meshes.forEach(mesh => {
            mesh.scaling.scaleInPlace(0.5);
        });
    }, null, (scene, message, exception) => {
        console.error("Failed to load model", message, exception);
    });

    // Add buttons to change IBL
    const dayButton = document.createElement("button");
    dayButton.innerHTML = "Day";
    dayButton.style.position = "absolute";
    dayButton.style.top = "10px";
    dayButton.style.left = "10px";
    document.body.appendChild(dayButton);

    const nightButton = document.createElement("button");
    nightButton.innerHTML = "Night";
    nightButton.style.position = "absolute";
    nightButton.style.top = "10px";
    nightButton.style.left = "70px";
    document.body.appendChild(nightButton);

    dayButton.addEventListener("click", () => {
        changeIBL(scene, "day.env");
    });

    nightButton.addEventListener("click", () => {
        changeIBL(scene, "night.env");
    });

    return scene;
};

const changeIBL = (scene, iblPath) => {
    console.log(`Changing IBL to ${iblPath}`);
    const newTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(iblPath, scene);
    newTexture.gammaSpace = false;
    
    // Fade effect over 4 seconds
    const currentTexture = scene.environmentTexture;
    const duration = 4000;
    let startTime = performance.now();

    const fade = () => {
        let elapsedTime = performance.now() - startTime;
        let ratio = elapsedTime / duration;

        if (ratio < 1) {
            // Lerp between textures
            scene.environmentTexture.level = 1 - ratio;
            newTexture.level = ratio;
            requestAnimationFrame(fade);
        } else {
            // End of transition
            scene.environmentTexture = newTexture;
        }
    };

    newTexture.onLoadObservable.add(() => {
        newTexture.level = 0;
        scene.environmentTexture = currentTexture; // Set back to currentTexture for fade effect
        requestAnimationFrame(fade);
    });
};

const scene = createScene();
engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener('resize', () => {
    engine.resize();
});
