import { easeInOutBack } from '../../node_modules/es6-easings/lib/index.js';
import { animatedScrollTo } from '../../node_modules/es6-scroll-to/lib/index.js';

import Dom from '../model/Dom.js';
const dom = new Dom();

export default class CanvasView {
  // transitionTime : int (time in ms)
  constructor(transitionTime) {
    this.transitionTime = transitionTime;
  }

  // hide all canvas
  clearCanvases() {
    for (const container of dom.canvasContainers) {
      container.classList.add('hidden');
    }
  }

  // show copied original image in canvas
  showOriginalImage() {
    setTimeout(() => {
      dom.canvasContainers[0].classList.remove('hidden');
    }, this.transitionTime);
  }

  clearOriginalImageAnalysis() {
    dom.originalColorTitle.innerHTML = '';
    dom.originalColorList.innerHTML = '';
  }

  // show all canvas one by one every transitionTime ms
  showAllCanvases() {
    const interval = this.transitionTime;
    let sumInterval = interval;
    for (const canvasContainer of dom.canvasContainers) {
      setTimeout(() => {
        canvasContainer.classList.remove('hidden');
      }, sumInterval);
      sumInterval += interval;
    }
  }

  // scroll automatically to filter in 3 * transitionTime ms
  scrollToFilter() {
    const targetPositionX = dom.filterContainer.offsetTop;
    setTimeout(() => {
      animatedScrollTo({
        to: targetPositionX + 15,
        easing: easeInOutBack,
        duration: 3 * this.transitionTime,
      });
    }, this.transitionTime);
  }

  // scroll automatically to canvases in 3 * transitionTime ms
  scrollToCanvases() {
    const targetPositionX = dom.canvasLayout.offsetTop;
    let totalCanvasPerRow = 0;
    if (window.outerWidth <= 425) {
      totalCanvasPerRow = 1;
    } else if (window.outerWidth <= 768) {
      totalCanvasPerRow = 2;
    } else {
      totalCanvasPerRow = 4;
    }

    setTimeout(() => {
      animatedScrollTo({
        to: targetPositionX - 15,
        easing: easeInOutBack,
        duration: 3 * this.transitionTime,
      });
    }, this.transitionTime * totalCanvasPerRow);
  }

  // set canvas title based on its model
  setTitle(canvasObject) {
    canvasObject.domTitle.innerHTML = `<b>${canvasObject.stringTitle}</b>`;
  }

  // set canvas display
  setDisplay(canvasObject) {
    canvasObject.domCanvas.style.display = 'inline';
  }

  // set canvas' colors list title along n
  setColorsListTitle(canvasObject, n) {
    canvasObject.domColorTitle.innerHTML = `Analisis Top ${n} Warna Terbanyak :`;
  }

  // render top n colors list
  renderTopColorsList(canvasObject, n, totalColors, colorsValue) {
    let out = '';
    for (let i = 0; i < n; i++) {
      const sortedColor = colorsValue[i];
      if (sortedColor != undefined) {
        const rgba = sortedColor.split('-');
        out += `
                    <li class="text-left mb-1">
                        <span class="border" style="background: rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3]});
                            no-repeat; display: inline-block; width: 40px; height: 40px; vertical-align: top;"></span>
                        ${totalColors[sortedColor]} pixel
                    </li>
                `;
      } else {
        break;
      }
    }
    canvasObject.domColorList.innerHTML = out;
  }

  // show n pixels where pixels is top of lower treshold (filterModel.t1)
  showPixelsOnTopOfLowerTreshold(canvasObject, t1, n) {
    if (canvasObject.domPixelsOnTopOfLowerTreshold != null) {
      canvasObject.domPixelsOnTopOfLowerTreshold.innerHTML = `Jumlah pixel pada ${canvasObject.stringTitle.toLowerCase()} dengan nilai pixel >= lower treshold (${t1}) adalah : ${n} pixel`;
    }
  }

  // show error message
  showError(message) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
    });
  }
}
