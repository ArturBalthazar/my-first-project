console.log("index.js is loaded");

const canvas = document.getElementById('renderCanvas');
console.log("Canvas element:", canvas);
const engine = new BABYLON.Engine(canvas, true);
console.log("Babylon.js engine created");

let hdrTextureDay, hdrTextureNight;

const createInitialScene = () => {
    console.log("Creating initial scene...");
    const scene = new BABYLON.Scene(engine);

    // Create a basic light and camera
    const camera = new BABYLON.ArcRotateCamera('camera1', BABYLON.Tools.ToRadians(45), BABYLON.Tools.ToRadians(75), 40, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.location.y = 0.5;
    camera.lowerRadiusLimit = 4;  // Minimum zoom distance (half the start distance)
    camera.upperRadiusLimit = 10;  // Maximum zoom distance (start distance)
    camera.wheelDeltaPercentage = 0.01;  // Smoother zoom

    const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0), scene);

    // Create a circular plane below the objects
    console.log("Creating circular plane...");
    const ground = BABYLON.MeshBuilder.CreateDisc("ground", { radius: 5 }, scene);
    ground.rotation.x = Math.PI / 2;

    // Create and configure the white material with glow effect
    const whiteMaterial = new BABYLON.StandardMaterial("whiteMaterial", scene);
    whiteMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1); // White color
    ground.material = whiteMaterial;

    // Create glow layer
    const glowLayer = new BABYLON.GlowLayer("glow", scene);
    glowLayer.intensity = 1;

    return scene;
};

const loadAdditionalAssets = (scene) => {
    // Load the IBL environment textures
    console.log("Loading IBL environments...");
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
    console.log("Attempting to load primary model (car)...");
    BABYLON.SceneLoader.Append("./", "model.glb", scene, function () {
        console.log("Car model loaded successfully");

        // Load the secondary GLB model (avatar) after the primary model has loaded
        console.log("Attempting to load secondary model (avatar)...");
        BABYLON.SceneLoader.Append("./", "avatar.glb", scene, function () {
            console.log("Avatar model loaded successfully");
            // Move all meshes in the avatar to Z = 1.5
            scene.meshes.forEach(mesh => {
                if (mesh.name.includes("avaturn")) {
                    mesh.position.z = 1.5;
                }
            });

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
    }, function (scene, message, exception) {
        console.error("Failed to load car model");
        console.error("Message:", message);
        console.error("Exception:", exception);
    });
};

const initialScene = createInitialScene();
engine.runRenderLoop(() => {
    initialScene.render();
});

window.addEventListener('resize', () => {
    engine.resize();
});

window.addEventListener('load', () => {
    setTimeout(() => {
        loadAdditionalAssets(initialScene);
    }, 100);  // Delay loading additional assets by 100ms to ensure initial scene is visible
});

// Function to switch IBL
const switchIBL = (newTexture) => {
    const targetTexture = newTexture;
    initialScene.environmentTexture = targetTexture;
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
    if (initialScene.debugLayer.isVisible()) {
        initialScene.debugLayer.hide();
    } else {
        initialScene.debugLayer.show({
            embedMode: true,
        });
    }
});
