import { LoadingScreen } from './components/loadingScreen.js';

// Get the canvas element
const canvas = document.getElementById('renderCanvas');

// Create the Babylon.js engine
const engine = new BABYLON.Engine(canvas, true);

// Create the loading screen instance
const loadingScreen = new LoadingScreen();

// Create the scene function
const createScene = async () => {
    const scene = new BABYLON.Scene(engine);

    // Set up the camera
    const camera = new BABYLON.ArcRotateCamera('camera', Math.PI / 2, Math.PI / 4, 10, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    // Set up the lighting
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Load the environment texture from .env file
    const hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData('./assets/environment.env', scene);
    scene.environmentTexture = hdrTexture;

    // Create the skybox for the cubemap
    const skybox = BABYLON.MeshBuilder.CreateBox('skyBox', { size: 1000.0 }, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial('skyBoxMaterial', scene);
    skyboxMaterial.backFaceCulling = false;

    // Load cubemap faces
    const cubemap = new BABYLON.CubeTexture('./assets/cubemap/', scene, [
        'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'
    ]);
    cubemap.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

    skyboxMaterial.reflectionTexture = cubemap;
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    // Show loading screen
    loadingScreen.displayLoadingUI();

    // Load .glb models
    const loadGLBModels = (scene, numberOfModels) => {
        return new Promise((resolve, reject) => {
            let modelsLoaded = 0;
            let totalModels = numberOfModels;

            for (let i = 1; i <= totalModels; i++) {
                BABYLON.SceneLoader.ImportMesh('', '', `./assets/${i}.glb`, scene, (meshes) => {
                    modelsLoaded++;
                    // Update progress bar
                    loadingScreen.updateProgress((modelsLoaded / totalModels) * 100);

                    if (modelsLoaded === totalModels) {
                        resolve();
                    }
                }, null, reject);
            }
        });
    };

    // Load models and wait for completion
    await loadGLBModels(scene, 24);

    // Hide loading screen
    loadingScreen.hideLoadingUI();

    return scene;
};

// Create the scene and run the render loop
const runRenderLoop = async () => {
    const scene = await createScene();
    engine.runRenderLoop(() => {
        scene.render();
    });
};

// Handle window resize
window.addEventListener('resize', () => {
    engine.resize();
});

// Start the render loop
runRenderLoop();
