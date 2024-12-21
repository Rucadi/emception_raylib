import JSZip from "jszip";

export default class DragAndDropManager {
  constructor(bodyElement, extractAndParseCallback) {
    this.bodyElement = bodyElement;
    this.extractAndParseCallback = extractAndParseCallback;
  }

  init() {
    this.bodyElement.addEventListener("dragover", this.handleDragOver.bind(this));
    this.bodyElement.addEventListener("dragleave", this.handleDragLeave.bind(this));
    this.bodyElement.addEventListener("drop", this.handleDrop.bind(this));
  }

  handleDragOver(event) {
    event.preventDefault();
    this.bodyElement.classList.add("dragover");
  }

  handleDragLeave() {
    this.bodyElement.classList.remove("dragover");
  }

  async handleDrop(event) {
    event.preventDefault();
    this.bodyElement.classList.remove("dragover");

    const file = event.dataTransfer.files[0];
    if (file && file.type.includes("zip")) {
      await this.extractAndParseCallback(file);
    } else {
      alert("Please drop a valid ZIP file.");
    }
  }
}
