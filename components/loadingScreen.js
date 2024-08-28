export class LoadingScreen {
    constructor() {
        this.loadingScreenDiv = document.getElementById("customLoadingScreenDiv");
        this.progressBar = document.getElementById("progressBar");
        this.loadingText = document.getElementById("loadingText");
        this.loadingScreenDiv.style.display = "none";
    }

    displayLoadingUI() {
        this.loadingScreenDiv.style.display = "flex";
        this.progressBar.style.width = "0%";
        this.loadingText.textContent = "Loading...";
    }

    hideLoadingUI() {
        this.loadingScreenDiv.style.display = "none";
    }

    updateProgress(loadedPercent) {
        this.progressBar.style.width = loadedPercent + "%";
    }
}
