console.log("index.js is loaded");

const canvas = document.getElementById('renderCanvas');
console.log("Canvas element:", canvas);
const engine = new BABYLON.Engine(canvas, true);
console.log("Babylon.js engine created");

let dayTexture;
let nightTexture;
let texturesLoaded = false;

const dayButton = document.getElementById('dayButton');
const nightButton = document.getElementById('nightButton');
const inspectorButton = document.getElementById('inspectorButton');

// Disable buttons until textures are loaded
dayButton.disabled = true;
nightButton.disabled = true;

const createScene = () => {
    console.log("Creating scene...");
    const scene = new BABYLON.Scene(engine);

    // Create a basic light and camera
    const camera = new BABYLON.ArcRotateCamera('camera1', 0, Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0), scene);

    // Preload the IBL textures
    console.log("Preloading IBL environment textures...");
    dayTexture = new BABYLON.CubeTexture.CreateFromPrefilteredData("./day.env", scene, () => {
        console.log("Day texture loaded");
        checkTexturesLoaded();
    });

    nightTexture = new BABYLON.CubeTexture.CreateFromPrefilteredData("./night.env", scene, () => {
        console.log("Night texture loaded");
        checkTexturesLoaded();
    });

    // Set the initial texture
    scene.environmentTexture = dayTexture;

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

    // Function to switch IBL instantly
    const switchIBL = (newTexture) => {
        scene.environmentTexture = newTexture;
    };

    // Event listeners for buttons
    dayButton.addEventListener('click', () => {
        if (texturesLoaded) {
            console.log("Switching to day IBL...");
            switchIBL(dayTexture);
        }
    });

    nightButton.addEventListener('click', () => {
        if (texturesLoaded) {
            console.log("Switching to night IBL...");
            switchIBL(nightTexture);
        }
    });

    // Inspector button
    inspectorButton.addEventListener('click', () => {
        console.log("Opening Inspector...");
        if (scene.debugLayer.isVisible()) {
            scene.debugLayer.hide();
        } else {
            scene.debugLayer.show({
                embedMode: true,
            });
        }
    });

    return scene;
};

const checkTexturesLoaded = () => {
    if (dayTexture.isReady() && nightTexture.isReady()) {
        texturesLoaded = true;
        dayButton.disabled = false;
        nightButton.disabled = false;
    }
};

const scene = createScene();
engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener('resize', () => {
    engine.resize();
});
