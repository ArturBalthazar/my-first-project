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
    camera.lowerRadiusLimit = 4;  // Minimum zoom distance (half the start distance)
    camera.upperRadiusLimit = 9;  // Maximum zoom distance (start distance)
    camera.wheelDeltaPercentage = 0.01;  // Smoother zoom

    const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0), scene);
    light.intensity = 2;

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

    // Load the primary GLB model (car)
    console.log("Attempting to load primary model (car)...");
    BABYLON.SceneLoader.Append("./", "model.glb", scene, function () {
        console.log("Car model loaded successfully");
        
        // Rotate all meshes of the car model by 90 degrees (PI/2 radians)
        scene.meshes.forEach(mesh => {
            if (mesh.name.includes("car")) {  // Assuming the car mesh names contain "car"
                mesh.rotation.y = BABYLON.Tools.ToRadians(90);
            }
        });

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

    // Our built-in 'ground' shape.
    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 2, height: 2, subdivisions: 128 }, scene);
    ground.scaling = new BABYLON.Vector3(10, 2, 10);
    ground.position.y = -.5;

    BABYLON.NodeMaterial.ParseFromSnippetAsync("#3FU5FG#250", scene).then((mat) => {
        ground.material = mat;
        window.mat = mat;
    });

    let addPostEffects = ()=>{
        var pipeline = new BABYLON.DefaultRenderingPipeline(
            "defaultPipeline", // The name of the pipeline
            false, // Do you want the pipeline to use HDR texture?
            scene, // The scene instance
            [camera] // The list of cameras to be attached to
        );

        pipeline.bloomEnabled   = true;
        pipeline.bloomThreshold = 0;
        pipeline.bloomKernel    = 0.35;
        pipeline.bloomScale     = .5;

        pipeline.grainEnabled = false;
        pipeline.grain.intensity = 8;
        pipeline.grain.animated = true;

        pipeline.chromaticAberrationEnabled = true;
        pipeline.chromaticAberration.aberrationAmount = 65.1;
        pipeline.chromaticAberration.radialIntensity = 2;

        pipeline.sharpenEnabled = true;
        pipeline.sharpen.edgeAmount = 0.15;
    }

    addPostEffects();

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
