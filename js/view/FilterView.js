import Dom from '../model/Dom.js';
const dom = new Dom();

export default class FilterView {
    prepareFileInput() {
        dom.fileInput.style.width = `${dom.btnUpload.offsetWidth}px`;
    }
}