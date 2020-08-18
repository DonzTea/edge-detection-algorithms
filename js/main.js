import Dom from './model/Dom.js';
import CanvasModel from './model/CanvasModel.js';
import CanvasControl from './control/CanvasControl.js';
import FilterControl from './control/FilterControl.js';

import { easeInOutQuint } from '../../node_modules/es6-easings/lib/index.js';
import { animatedScrollTo } from '../../node_modules/es6-scroll-to/lib/index.js';

// initialize access to all DOMs
const dom = new Dom();

// scroll to top of page on click button
dom.btnScrollUp.addEventListener('click', () => {
  animatedScrollTo({
    to: 0,
    easing: easeInOutQuint,
    duration: 1000,
  });
});

// get image source data from file input
dom.fileInput.addEventListener('change', () => {
  try {
    const reader = new FileReader();

    reader.onload = function (event) {
      // get loaded data and render thumbnail.
      dom.imageSrc.src = event.target.result;
    };

    // read the image file as a data URL.
    reader.readAsDataURL(dom.fileInput.files[0]);
  } catch (error) {
    console.log(`Input citra batal diproses.`);
  }
});

// initialize filterControl features
const t1 = 128;
const t2 = 255;
const nColors = 5;
const transitionTime = 300;
const filterControl = new FilterControl(t1, t2, nColors, transitionTime);
filterControl.tresholdFilter();
filterControl.nColorsFilter();
filterControl.filterView.prepareFileInput();

// create object of canvases
const originalModel = new CanvasModel(
  dom.originalCanvas,
  dom.originalContext,
  dom.originalTitle,
  'Citra Original',
  dom.originalColorTitle,
  dom.originalColorList,
);
const grayscaleModel = new CanvasModel(
  dom.grayscaleCanvas,
  dom.grayscaleContext,
  dom.grayscaleTitle,
  'Citra Grayscale',
  dom.grayscaleColorTitle,
  dom.grayscaleColorList,
);
const differentialGradientModel = new CanvasModel(
  dom.differentialGradientCanvas,
  dom.differentialGradientContext,
  dom.differentialGradientTitle,
  'Metode Differential Gradient',
  dom.differentialGradientColorTitle,
  dom.differentialGradientColorList,
  dom.differentialGradientPixelsTopOfLowerTreshold,
);
const centerDifferenceModel = new CanvasModel(
  dom.centerDifferenceCanvas,
  dom.centerDifferenceContext,
  dom.centerDifferenceTitle,
  'Metode Center Difference',
  dom.centerDifferenceColorTitle,
  dom.centerDifferenceColorList,
  dom.centerDifferencePixelsTopOfLowerTreshold,
);
const sobelModel = new CanvasModel(
  dom.sobelCanvas,
  dom.sobelContext,
  dom.sobelTitle,
  'Metode Operator Sobel',
  dom.sobelColorTitle,
  dom.sobelColorList,
  dom.sobelPixelsTopOfLowerTreshold,
);
const prewittModel = new CanvasModel(
  dom.prewittCanvas,
  dom.prewittContext,
  dom.prewittTitle,
  'Metode Operator Prewitt',
  dom.prewittColorTitle,
  dom.prewittColorList,
  dom.prewittPixelsTopOfLowerTreshold,
);
const robertsModel = new CanvasModel(
  dom.robertsCanvas,
  dom.robertsContext,
  dom.robertsTitle,
  'Metode Operator Roberts',
  dom.robertsColorTitle,
  dom.robertsColorList,
  dom.robertsPixelsTopOfLowerTreshold,
);
const laplace1Model = new CanvasModel(
  dom.laplace1Canvas,
  dom.laplace1Context,
  dom.laplace1Title,
  'Metode Operator Laplace 1',
  dom.laplace1ColorTitle,
  dom.laplace1ColorList,
  dom.laplace1PixelsTopOfLowerTreshold,
);
const laplace2Model = new CanvasModel(
  dom.laplace2Canvas,
  dom.laplace2Context,
  dom.laplace2Title,
  'Metode Operator Laplace 2',
  dom.laplace2ColorTitle,
  dom.laplace2ColorList,
  dom.laplace2PixelsTopOfLowerTreshold,
);
const laplace3Model = new CanvasModel(
  dom.laplace3Canvas,
  dom.laplace3Context,
  dom.laplace3Title,
  'Metode Operator Laplace 3',
  dom.laplace3ColorTitle,
  dom.laplace3ColorList,
  dom.laplace3PixelsTopOfLowerTreshold,
);
const laplaceOfGaussianModel = new CanvasModel(
  dom.laplaceOfGaussianCanvas,
  dom.laplaceOfGaussianContext,
  dom.laplaceOfGaussianTitle,
  'Metode Laplace of Gaussian',
  dom.laplaceOfGaussianColorTitle,
  dom.laplaceOfGaussianColorList,
  dom.laplaceOfGaussianPixelsTopOfLowerTreshold,
);
const cannyModel = new CanvasModel(
  dom.cannyCanvas,
  dom.cannyContext,
  dom.cannyTitle,
  'Algoritma Canny',
  dom.cannyColorTitle,
  dom.cannyColorList,
  dom.cannyPixelsTopOfLowerTreshold,
);

// wrap all models
const canvasObjects = {
  original: originalModel,
  grayscale: grayscaleModel,
  differentialGradient: differentialGradientModel,
  centerDifference: centerDifferenceModel,
  sobel: sobelModel,
  prewitt: prewittModel,
  roberts: robertsModel,
  laplace1: laplace1Model,
  laplace2: laplace2Model,
  laplace3: laplace3Model,
  laplaceOfGaussian: laplaceOfGaussianModel,
  canny: cannyModel,
};

// initialize canvasControl features
const canvasControl = new CanvasControl(
  canvasObjects,
  transitionTime,
  filterControl.filterModel,
);
canvasControl.listenImageUpload();
canvasControl.listenButtonSubmit();
