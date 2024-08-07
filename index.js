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

    // Create a circular plane below the objects
    console.log("Creating circular plane...");
    const ground = BABYLON.MeshBuilder.CreateDisc("ground", { radius: 5 }, scene);
    ground.rotation.x = Math.PI / 2;

    // Create and configure the glowing material
    const glowingMaterial = new BABYLON.StandardMaterial("glowingMaterial", scene);
    glowingMaterial.emissiveColor = new BABYLON.Color3(0, 1, 0); // Green glow
    glowingMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0); // No diffuse color to let emissive color shine

    ground.material = glowingMaterial;


    // Create and configure the particle system
    console.log("Creating particle system...");
    const particleSystem = new BABYLON.ParticleSystem("particles", 10000, scene);
    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);
    particleSystem.emitter = new BABYLON.Vector3(0, 1.4, 0); // Emitter position (5 meters above the ground)
    particleSystem.minEmitBox = new BABYLON.Vector3(-1, 0, 0); // Starting point
    particleSystem.maxEmitBox = new BABYLON.Vector3(1, 0, 0); // Ending point

    particleSystem.color1 = new BABYLON.Color4(0, 0.33, 1, 1);
    particleSystem.color2 = new BABYLON.Color4(0, 0.95, 1, 1);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 1);

    particleSystem.minSize = 0.05;
    particleSystem.maxSize = 0.1;

    particleSystem.minLifeTime = 2;
    particleSystem.maxLifeTime = 6;

    particleSystem.emitRate = 300;

    particleSystem.gravity = new BABYLON.Vector3(0, -0.5, 0);

    particleSystem.direction1 = new BABYLON.Vector3(-7, 8, 3);
    particleSystem.direction2 = new BABYLON.Vector3(7, 8, -3);

    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;

    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 0.05;

    // Manual emit count to simulate a burst
    particleSystem.manualEmitCount = 0;

    // Function to trigger the particle system
    const triggerFireworks = () => {
        particleSystem.manualEmitCount = 2000; // Emit all particles at once
        particleSystem.start();
        setTimeout(() => {
            particleSystem.stop();
        }, 1000); // Stop the particle system almost immediately
    };

    // Add event listener to trigger fireworks on screen click
    scene.onPointerDown = function () {
        triggerFireworks();
    };

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
