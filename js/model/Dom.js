export default class Dom {
    constructor() {
        // input output media
        this.fileInput = document.querySelector('input#fileInput');
        this.imageSrc = document.querySelector('img#imageSrc');
        this.btnUpload = document.querySelector('.btn-upload');
        this.tresholdFilter = document.querySelector('#treshold-filter');
        this.colorsFilter = document.querySelector('#colors-filter');
        this.btnSubmit = document.querySelector('.btn-submit');
        this.btnScrollUp = document.querySelector('#btn-scroll-up');

        // container of filter
        this.filterContainer = document.querySelector('#filter-container');

        // container of all canvases
        this.canvasLayout = document.querySelector('#canvas-layout');

        // canvas containers
        this.canvasContainers = document.querySelectorAll('.canvas-container');

        // canvases
        this.originalCanvas = document.querySelector('canvas#originalPreview');
        this.grayscaleCanvas = document.querySelector('canvas#grayscalePreview');
        this.differentialGradientCanvas = document.querySelector('canvas#differentialGradientPreview');
        this.centerDifferenceCanvas = document.querySelector('canvas#centerDifferencePreview');
        this.sobelCanvas = document.querySelector('canvas#sobelPreview');
        this.prewittCanvas = document.querySelector('canvas#prewittPreview');
        this.robertsCanvas = document.querySelector('canvas#robertsPreview');
        this.laplace1Canvas = document.querySelector('canvas#laplace1Preview');
        this.laplace2Canvas = document.querySelector('canvas#laplace2Preview');
        this.laplace3Canvas = document.querySelector('canvas#laplace3Preview');
        this.laplaceOfGaussianCanvas = document.querySelector('canvas#laplaceOfGaussianPreview');
        this.cannyCanvas = document.querySelector('canvas#cannyPreview');

        // contexts
        this.originalContext = this.originalCanvas.getContext('2d');
        this.grayscaleContext = this.grayscaleCanvas.getContext('2d');
        this.differentialGradientContext = this.differentialGradientCanvas.getContext('2d');
        this.centerDifferenceContext = this.centerDifferenceCanvas.getContext('2d');
        this.sobelContext = this.sobelCanvas.getContext('2d');
        this.prewittContext = this.prewittCanvas.getContext('2d');
        this.robertsContext = this.robertsCanvas.getContext('2d');
        this.laplace1Context = this.laplace1Canvas.getContext('2d');
        this.laplace2Context = this.laplace2Canvas.getContext('2d');
        this.laplace3Context = this.laplace3Canvas.getContext('2d');
        this.laplaceOfGaussianContext = this.laplaceOfGaussianCanvas.getContext('2d');
        this.cannyContext = this.cannyCanvas.getContext('2d');

        // titles
        this.originalTitle = this.originalCanvas.nextElementSibling;
        this.grayscaleTitle = this.grayscaleCanvas.nextElementSibling;
        this.differentialGradientTitle = this.differentialGradientCanvas.nextElementSibling;
        this.centerDifferenceTitle = this.centerDifferenceCanvas.nextElementSibling;
        this.sobelTitle = this.sobelCanvas.nextElementSibling;
        this.prewittTitle = this.prewittCanvas.nextElementSibling;
        this.robertsTitle = this.robertsCanvas.nextElementSibling;
        this.laplace1Title = this.laplace1Canvas.nextElementSibling;
        this.laplace2Title = this.laplace2Canvas.nextElementSibling;
        this.laplace3Title = this.laplace3Canvas.nextElementSibling;
        this.laplaceOfGaussianTitle = this.laplaceOfGaussianCanvas.nextElementSibling;
        this.cannyTitle = this.cannyCanvas.nextElementSibling;

        // title of analyzed colors
        this.originalColorTitle = this.originalTitle.nextElementSibling.children[0];
        this.grayscaleColorTitle = this.grayscaleTitle.nextElementSibling.children[0];
        this.differentialGradientColorTitle = this.differentialGradientTitle.nextElementSibling.children[0];
        this.centerDifferenceColorTitle = this.centerDifferenceTitle.nextElementSibling.children[0];
        this.sobelColorTitle = this.sobelTitle.nextElementSibling.children[0];
        this.prewittColorTitle = this.prewittTitle.nextElementSibling.children[0];
        this.robertsColorTitle = this.robertsTitle.nextElementSibling.children[0];
        this.laplace1ColorTitle = this.laplace1Title.nextElementSibling.children[0];
        this.laplace2ColorTitle = this.laplace2Title.nextElementSibling.children[0];
        this.laplace3ColorTitle = this.laplace3Title.nextElementSibling.children[0];
        this.laplaceOfGaussianColorTitle = this.laplaceOfGaussianTitle.nextElementSibling.children[0];
        this.cannyColorTitle = this.cannyTitle.nextElementSibling.children[0];

        // analyzed color list
        this.originalColorList = this.originalTitle.nextElementSibling.children[1];
        this.grayscaleColorList = this.grayscaleTitle.nextElementSibling.children[1];
        this.differentialGradientColorList = this.differentialGradientTitle.nextElementSibling.children[1];
        this.centerDifferenceColorList = this.centerDifferenceTitle.nextElementSibling.children[1];
        this.sobelColorList = this.sobelTitle.nextElementSibling.children[1];
        this.prewittColorList = this.prewittTitle.nextElementSibling.children[1];
        this.robertsColorList = this.robertsTitle.nextElementSibling.children[1];
        this.laplace1ColorList = this.laplace1Title.nextElementSibling.children[1];
        this.laplace2ColorList = this.laplace2Title.nextElementSibling.children[1];
        this.laplace3ColorList = this.laplace3Title.nextElementSibling.children[1];
        this.laplaceOfGaussianColorList = this.laplaceOfGaussianTitle.nextElementSibling.children[1];
        this.cannyColorList = this.cannyTitle.nextElementSibling.children[1];

        // pixels measurements
        this.differentialGradientPixelsTopOfLowerTreshold = this.differentialGradientCanvas.parentElement.lastElementChild;
        this.centerDifferencePixelsTopOfLowerTreshold = this.centerDifferenceCanvas.parentElement.lastElementChild;
        this.sobelPixelsTopOfLowerTreshold = this.sobelCanvas.parentElement.lastElementChild;
        this.prewittPixelsTopOfLowerTreshold = this.prewittCanvas.parentElement.lastElementChild;
        this.robertsPixelsTopOfLowerTreshold = this.robertsCanvas.parentElement.lastElementChild;
        this.laplace1PixelsTopOfLowerTreshold = this.laplace1Canvas.parentElement.lastElementChild;
        this.laplace2PixelsTopOfLowerTreshold = this.laplace2Canvas.parentElement.lastElementChild;
        this.laplace3PixelsTopOfLowerTreshold = this.laplace3Canvas.parentElement.lastElementChild;
        this.laplaceOfGaussianPixelsTopOfLowerTreshold = this.laplaceOfGaussianCanvas.parentElement.lastElementChild;
        this.cannyPixelsTopOfLowerTreshold = this.cannyCanvas.parentElement.lastElementChild;
    }
}