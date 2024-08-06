console.log("index.js is loaded");

const canvas = document.getElementById('renderCanvas');
console.log("Canvas element:", canvas);
const engine = new BABYLON.Engine(canvas, true);
console.log("Babylon.js engine created");

const createScene = () => {
    console.log("Creating scene...");
    const scene = new BABYLON.Scene(engine);

    // Create a basic light and camera
    const camera = new BABYLON.ArcRotateCamera('camera1', 0, Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0), scene);

    // Load the initial IBL environment texture (day)
    console.log("Loading initial IBL environment...");
    let hdrTexture = new BABYLON.CubeTexture.CreateFromPrefilteredData("./day.env", scene);
    scene.environmentTexture = hdrTexture;

    // Set the background texture
    console.log("Setting background texture...");
    const backgroundTexture = new BABYLON.CubeTexture(
        "./cubemap/",
        scene,
        ["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"]
    );
    const skybox = scene.createDefaultSkybox(backgroundTexture, true, 1000);

    // Load the GLB model
    console.log("Attempting to load model...");
    BABYLON.SceneLoader.Append("./", "model.glb", scene, function () {
        console.log("Model loaded successfully");
    }, function (scene, message, exception) {
        console.error("Failed to load model");
        console.error("Message:", message);
        console.error("Exception:", exception);
    });

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener('resize', () => {
    engine.resize();
});

// Function to switch IBL
const switchIBL = (newTexturePath) => {
    const targetTexture = new BABYLON.CubeTexture.CreateFromPrefilteredData(newTexturePath, scene);
    scene.environmentTexture = targetTexture;
};

// Event listeners for buttons
document.getElementById('dayButton').addEventListener('click', () => {
    console.log("Switching to day IBL...");
    switchIBL('./day.env');
});

document.getElementById('nightButton').addEventListener('click', () => {
    console.log("Switching to night IBL...");
    switchIBL('./night.env');
});
