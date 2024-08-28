export class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.inputMap = {};

        this.scene.actionManager = new BABYLON.ActionManager(scene);
        this.initializeListeners();
    }

    initializeListeners() {
        this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
                this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
            }
        ));

        this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
                this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
            }
        ));
    }

    isKeyPressed(key) {
        return this.inputMap[key] || false;
    }

    handleMovement(camera, deltaTime) {
        const speed = 5;
        if (this.isKeyPressed("w")) camera.position.z += speed * deltaTime;
        if (this.isKeyPressed("s")) camera.position.z -= speed * deltaTime;
        if (this.isKeyPressed("a")) camera.position.x -= speed * deltaTime;
        if (this.isKeyPressed("d")) camera.position.x += speed * deltaTime;
    }
}
