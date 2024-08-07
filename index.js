console.log("index.js is loaded");

const canvas = document.getElementById('renderCanvas');
console.log("Canvas element:", canvas);
const engine = new BABYLON.Engine(canvas, true);
console.log("Babylon.js engine created");

let hdrTextureDay, hdrTextureNight;

const createScene = () => {
    console.log("Creating scene...");
    const scene = new BABYLON.Scene(engine);

    // Create a basic light and camera
    const camera = new BABYLON.ArcRotateCamera('camera1', BABYLON.Tools.ToRadians(45), BABYLON.Tools.ToRadians(75), 40, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 5;  // Minimum zoom distance (half the start distance)
    camera.upperRadiusLimit = 10;  // Maximum zoom distance (start distance)
    camera.wheelDeltaPercentage = 0.01;  // Smoother zoom

    const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0), scene);

    // Load the initial IBL environment texture (day)
    console.log("Loading initial IBL environment...");
    hdrTextureDay = new BABYLON.CubeTexture.CreateFromPrefilteredData("./day.env", scene);
    hdrTextureNight = new BABYLON.CubeTexture.CreateFromPrefilteredData("./night.env", scene);

    // Preload the textures
    hdrTextureDay.onLoadObservable.addOnce(() => {
        hdrTextureNight.onLoadObservable.addOnce(() => {
            console.log("IBL environments preloaded.");
        });
    });
    scene.environmentTexture = hdrTextureDay;  // Set the initial environment texture
    
    // Set the background texture
    console.log("Setting background texture...");
    const backgroundTexture = new BABYLON.CubeTexture(
        "./cubemap/",
        scene,
        ["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"]
    );
    const skybox = scene.createDefaultSkybox(backgroundTexture, true, 1000);

    // Load the GLB model (car)
    console.log("Attempting to load model (car)...");
    BABYLON.SceneLoader.Append("./", "model.glb", scene, function () {
        console.log("Car model loaded successfully");
    }, function (scene, message, exception) {
        console.error("Failed to load car model");
        console.error("Message:", message);
        console.error("Exception:", exception);
    });

    // Load the GLB model (avatar)
    console.log("Attempting to load model (avatar)...");
    BABYLON.SceneLoader.Append("./", "avatar.glb", scene, function (scene) {
        console.log("Avatar model loaded successfully");
        const avatar = scene.getMeshByName("avatarMesh"); // Adjust this based on the actual name in the GLB file
        avatar.position.x = 1.5;

        // Play animation in a loop
        const animationGroup = scene.getAnimationGroupByName("Celebrated_Clean");
        if (animationGroup) {
            animationGroup.start(true, 1.0, animationGroup.from, animationGroup.to, false);
        }
    }, function (scene, message, exception) {
        console.error("Failed to load avatar model");
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
const switchIBL = (newTexture) => {
    const targetTexture = newTexture;
    scene.environmentTexture = targetTexture;
};

// Event listeners for buttons
document.getElementById('dayButton').addEventListener('click', () => {
    console.log("Switching to day IBL...");
    switchIBL(hdrTextureDay);
});

document.getElementById('nightButton').addEventListener('click', () => {
    console.log("Switching to night IBL...");
    switchIBL(hdrTextureNight);
});

// Inspector button event listener
document.getElementById('inspectorButton').addEventListener('click', () => {
    console.log("Opening inspector...");
    if (scene.debugLayer.isVisible()) {
        scene.debugLayer.hide();
    } else {
        scene.debugLayer.show({
            embedMode: true,
        });
    }
});
