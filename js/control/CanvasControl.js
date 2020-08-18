import Dom from '../model/Dom.js';
import CanvasView from '../view/CanvasView.js';
const dom = new Dom();

export default class CanvasControl {
    // canvasObjects = {
    //     property: new CanvasModel(...),
    // }
    // transition time : int (time in ms)
    // filterModel = new FilterModel(...)
    constructor(canvasObjects, transitionTime, filterModel) {
        for (const [key, value] of Object.entries(canvasObjects)) {
            this[key] = value;
        }
        this.canvasView = new CanvasView(transitionTime);
        this.filterModel = filterModel;
        this.canvasWidth = 0;
        this.canvasHeight = 0;
    }

    // draw copied image to canvas
    draw(canvasObject) {
        this.canvasView.setTitle(canvasObject);
        canvasObject.domCanvas.width = this.canvasWidth;
        canvasObject.domCanvas.height = this.canvasHeight;
        canvasObject.domContext.drawImage(dom.imageSrc, 0, 0, this.canvasWidth, this.canvasHeight);
    }

    // pixel manipulation from RGB to grayscale
    toGrayscale(canvasObject) {
        const pixels =
            canvasObject.domContext.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
        const data = pixels.data;
        const totalPixels = data.length;

        for (let i = 0; i < totalPixels; i += 4) {
            let grayscale = (0.2126 * data[i]) + (0.7152 * data[i + 1]) + (0.0722 * data[i + 2]);
            data[i] = grayscale;
            data[i + 1] = grayscale;
            data[i + 2] = grayscale;
        }

        canvasObject.domContext.putImageData(pixels, 0, 0);
        this.canvasView.setDisplay(canvasObject);
    }

    get2dGrayscalePixels(canvasObject) {
        const pixels =
            canvasObject.domContext.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
        const data = pixels.data;
        const totalPixels = data.length;

        const grayscalePixels = [];
        for (let i = 0; i < totalPixels; i += 4) {
            grayscalePixels.push((data[i] + data[i + 1] + data[i + 2]) / 3);
        }

        const pixels2d = [];
        let rowPixels = [];
        for (const [index, pixel] of grayscalePixels.entries()) {
            rowPixels.push(pixel);
            if (index != 0 && (index + 1) % this.canvasWidth == 0) {
                pixels2d.push(rowPixels);
                rowPixels = [];
            }
        }
        return (pixels2d);
    }

    // image analysis of top n most many pixel containing some color in a canvas
    analyzeTopColors(canvasObject, n = 3) {
        this.canvasView.setColorsListTitle(canvasObject, n);

        let colors = {};
        let sortedColors = [];
        const data =
            canvasObject.domContext.getImageData(0, 0, this.canvasWidth, this.canvasHeight).data;

        const totalData = data.length;
        for (let i = 0; i < totalData; i += 4) {
            const key = `${data[i]}-${data[i + 1]}-${data[i + 2]}-${data[i + 3]}`;
            if (colors[key]) {
                colors[key]++;
            } else {
                colors[key] = 1;
            }
        }
        sortedColors = Object.keys(colors).sort((a, b) => -(colors[a] - colors[b]));
        this.canvasView.renderTopColorsList(canvasObject, n, colors, sortedColors);

        const totalPixelsTopOfLowerTreshold =
            Object.entries(colors).reduce(
                (sum, el) => el[0].split('-')[0] >= this.filterModel.t1 ? sum + el[1] : sum + 0, 0
            );
        this.canvasView.showPixelsOnTopOfLowerTreshold(canvasObject, this.filterModel.t1, totalPixelsTopOfLowerTreshold);
    }

    convolution(grayscale2dPixels, kernel) {
        const pixelsHeight = grayscale2dPixels.length;
        const pixelsWidth = grayscale2dPixels.reduce((sum, curr) => sum + curr.length, 0) / pixelsHeight;
        const kernelHeight = kernel.length;
        const kernelWidth = kernel.reduce((sum, curr) => sum + curr.length, 0) / kernelHeight;

        const convoluted2dPixels = grayscale2dPixels.map(row => {
            const newRow = [];
            for (const pixel of row) {
                newRow.push(pixel);
            }
            return newRow;
        });

        for (let i = 0; i < pixelsHeight - kernelHeight + 1; i++) {
            if (grayscale2dPixels[i + 2] != undefined) {
                for (let j = 0; j < pixelsWidth - kernelWidth + 1; j++) {
                    const samplePixels = [];
                    for (let k = 0; k < kernelHeight; k++) {
                        samplePixels.push(grayscale2dPixels[i + k].slice(j, j + kernelWidth));
                    }

                    const samplePixelsHeight = samplePixels.length;
                    const samplePixelsWidth = samplePixels.reduce((sum, curr) => sum + curr.length, 0) / samplePixelsHeight;
                    let sampleTotal = 0;
                    for (let k = 0; k < samplePixelsHeight; k++) {
                        for (let l = 0; l < samplePixelsWidth; l++) {
                            sampleTotal += kernel[k][l] * samplePixels[k][l];
                        }
                    }
                    convoluted2dPixels[i + (Math.floor(samplePixelsHeight / 2))][j + (Math.floor(samplePixelsWidth / 2))] = sampleTotal;
                }
            } else {
                break;
            }
        }
        return convoluted2dPixels;
    }

    // gx, gy = 2d pixels of convoluted pixels
    sum2dConvolutedPixels(canvasObject, gx, gy) {
        const gxHeight = gx.length;
        const gxWidth = gx.reduce((sum, curr) => sum + curr.length, 0) / gxHeight;
        const gyHeight = gy.length;
        const gyWidth = gy.reduce((sum, curr) => sum + curr.length, 0) / gyHeight;
        if (gxHeight == gyHeight && gxWidth == gyWidth) {
            const sumOfPixels = [];
            for (let i = 0; i < (gxHeight + gyHeight) / 2; i++) {
                sumOfPixels.push([]);
                for (let j = 0; j < (gxWidth + gyWidth) / 2; j++) {
                    sumOfPixels[sumOfPixels.length - 1].push(Math.abs(gx[i][j]) + Math.abs(gy[i][j]));
                }
            }
            return sumOfPixels;
        } else {
            this.canvasView.showError(`Pixel konvolusi Gx dan Gy pada ${canvasObject.stringTitle} memiliki ukuran yang berbeda.`);
        }
    }

    // gx, gy = 2d pixels of convoluted pixels
    count2dPixelsGradient(canvasObject, gx, gy) {
        const gxHeight = gx.length;
        const gxWidth = gx.reduce((sum, curr) => sum + curr.length, 0) / gxHeight;
        const gyHeight = gy.length;
        const gyWidth = gy.reduce((sum, curr) => sum + curr.length, 0) / gyHeight;
        if (gxHeight == gyHeight && gxWidth == gyWidth) {
            const pixelsOfGradient = [];
            for (let i = 0; i < (gxHeight + gyHeight) / 2; i++) {
                pixelsOfGradient.push([]);
                for (let j = 0; j < (gxWidth + gyWidth) / 2; j++) {
                    pixelsOfGradient[pixelsOfGradient.length - 1]
                        .push(gy[i][j] != 0 ? Math.atan(gx[i][j] / gy[i][j]) / Math.PI * 180 : 0);
                }
            }
            return pixelsOfGradient;
        } else {
            this.canvasView.showError(`Pixel konvolusi Gx dan Gy pada ${canvasObject.stringTitle} memiliki ukuran yang berbeda.`);
        }
    }

    // rounding 2d pixels of gradient
    round2dPixelsGradient(pixelsOfGradient) {
        const pixelsHeight = pixelsOfGradient.length;
        const pixelsWidth = pixelsOfGradient.reduce((sum, curr) => sum + curr.length, 0) / pixelsHeight;
        const roundedPixelsOfGradient = [];
        for (let i = 0; i < pixelsHeight; i++) {
            roundedPixelsOfGradient.push([]);
            for (let j = 0; j < pixelsWidth; j++) {
                let gradient = 0;
                if (((pixelsOfGradient[i][j] < 22.5) && (pixelsOfGradient[i][j] > -22.5)) || (pixelsOfGradient[i][j] > 157.5) || (pixelsOfGradient[i][j] < -157.5))
                    gradient = 0;
                if (((pixelsOfGradient[i][j] > 22.5) && (pixelsOfGradient[i][j] < 67.5)) || ((pixelsOfGradient[i][j] < -112.5) && (pixelsOfGradient[i][j] > -157.5)))
                    gradient = 45;
                if (((pixelsOfGradient[i][j] > 67.5) && (pixelsOfGradient[i][j] < 112.5)) || ((pixelsOfGradient[i][j] < -67.5) && (pixelsOfGradient[i][j] > -112.5)))
                    gradient = 90;
                if (((pixelsOfGradient[i][j] > 112.5) && (pixelsOfGradient[i][j] < 157.5)) || ((pixelsOfGradient[i][j] < -22.5) && (pixelsOfGradient[i][j] > -67.5)))
                    gradient = 135;
                roundedPixelsOfGradient[roundedPixelsOfGradient.length - 1].push(gradient);
            }
        }
        return roundedPixelsOfGradient;
    }

    // detect edge in canny canvas
    tracesAlongCanvasEdges(pixels2dInCanvas, rounded2dPixelsGradient) {
        const pixels2d = [];
        pixels2dInCanvas.map(row => pixels2d.push(row.map(pixel => pixel)));

        const findEdge = (
            rowShift,
            colShift,
            pixelRow,
            pixelCol,
            gradient
        ) => {
            let newRow = 0;
            let newCol = 0;
            let edgeEnd = false;

            if (colShift < 0) {
                if (pixelCol > 0) {
                    newCol = pixelCol + colShift;
                } else {
                    edgeEnd = true;
                }
            } else if (pixelCol < this.width) {
                newCol = pixelCol + colShift;
            } else {
                edgeEnd = true;
            }

            if (rowShift < 0) {
                if (pixelRow > 0) {
                    newRow = pixelRow + rowShift;
                } else {
                    edgeEnd = true;
                }
            } else if (pixelRow < this.height) {
                newRow = pixelRow + rowShift;
            } else {
                edgeEnd = true;
            }

            while (
                round2dPixelsGradient[newRow][newCol] == gradient &&
                pixels2dInCanvas[newRow][newCol] > this.filterModel.t1 &&
                !edgeEnd
            ) {
                pixels2d[newRow][newCol] = 255;
                if (colShift < 0) {
                    if (newCol > 0) {
                        newCol = newCol + colShift;
                    } else {
                        edgeEnd = true;
                    }
                } else if (newCol < this.width) {
                    newCol = newCol + colShift;
                } else {
                    edgeEnd = true;
                }

                if (rowShift < 0) {
                    if (newRow > 0) {
                        newRow = newRow + rowShift;
                    } else {
                        edgeEnd = true;
                    }
                } else if (newRow < this.height) {
                    newRow = newRow + rowShift;
                } else {
                    edgeEnd = true;
                }
            }
        };

        // Trace along all gradients in the canvas
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if (cannySumOfConvolutedPixels[i][j] > this.filterModel.t2) {
                    switch (rounded2dPixelsGradient[i][j]) {
                        case 0:
                            findEdge(0, 1, i, j, 0);
                            break;
                        case 45:
                            findEdge(1, 1, i, j, 45);
                            break;
                        case 90:
                            findEdge(1, 0, i, j, 90);
                            break;
                        case 135:
                            findEdge(1, -1, i, j, 135);
                            break;
                        default:
                            pixels2d[newRow][newCol] = 0;
                            break;
                    }
                } else {
                    pixels2d[newRow][newCol] = 0;
                }
            }
        }
        return pixels2d;
    }

    nonMaximumSupression(pixels2dInCanvas, rounded2dPixelsGradient) {
        let pixels2d = [];
        pixels2dInCanvas.map(row => pixels2d.push(row.map(pixel => pixel)));

        const suppressNonMax = (pixels2d, rowShift, colShift, row, col, gradient) => {
            const nonMax = [];
            const max = [0, 0, 0];
            let edgeEnd = false;
            let newRow = 0;
            let newCol = 0;
            let pixelCount = 0;
            for (let i = 0; i < this.height; i++) {
                nonMax.push(...max);
            }

            if (colShift < 0) {
                if (col > 0) {
                    newCol = col + colShift;
                } else {
                    edgeEnd = true;
                }
            } else if (col < this.width) {
                newCol = col + colShift;
            } else {
                edgeEnd = true;
            }

            if (rowShift < 0) {
                if (row > 0) {
                    newRow = row + rowShift;
                } else {
                    edgeEnd = true;
                }
            } else if (row < this.height) {
                newRow = row + rowShift;
            } else {
                edgeEnd = true;
            }

            while (
                pixels2dInCanvas[newRow][newCol] == 255 &&
                rounded2dPixelsGradient[newRow][newCol] == gradient &&
                !edgeEnd
            ) {
                if (colShift < 0) {
                    if (newCol > 0) {
                        newCol = newCol + colShift;
                    } else {
                        edgeEnd = true;
                    }
                } else if (newCol < this.width) {
                    newCol = newCol + colShift;
                } else {
                    edgeEnd = true;
                }

                if (rowShift < 0) {
                    if (newRow > 0) {
                        newRow = newRow + rowShift;
                    } else {
                        edgeEnd = true;
                    }
                } else if (newRow < this.height) {
                    newRow = newRow + rowShift;
                } else {
                    edgeEnd = true;
                }

                nonMax[pixelCount][0] = newRow;
                nonMax[pixelCount][1] = newCol;
                nonMax[pixelCount][2] = rounded2dPixelsGradient[newRow][newCol];
                pixelCount++;
            }

            // find non-maximum parallel edges tracing down
            edgeEnd = false;
            colShift *= -1;
            rowShift *= -1;

            if (colShift < 0) {
                if (col > 0) {
                    newCol = col + colShift;
                } else {
                    edgeEnd = true;
                }
            } else if (col < this.width) {
                newCol = col + colShift;
            } else {
                edgeEnd = true;
            }

            if (rowShift < 0) {
                if (row > 0) {
                    newRow = row + rowShift;
                } else {
                    edgeEnd = true;
                }
            } else if (row < this.height) {
                newRow = row + rowShift;
            } else {
                edgeEnd = true;
            }

            while (
                pixels2dInCanvas[newRow][newCol] == 255 &&
                rounded2dPixelsGradient[newRow][newCol] == gradient &&
                !edgeEnd
            ) {
                if (colShift < 0) {
                    if (newCol > 0) {
                        newCol = newCol + colShift;
                    } else {
                        edgeEnd = true;
                    }
                } else if (newCol < this.width) {
                    newCol = newCol + colShift;
                } else {
                    edgeEnd = true;
                }

                if (rowShift < 0) {
                    if (newRow > 0) {
                        newRow = newRow + rowShift;
                    } else {
                        edgeEnd = true;
                    }
                } else if (newRow < this.height) {
                    newRow = newRow + rowShift;
                } else {
                    edgeEnd = true;
                }

                nonMax[pixelCount][0] = newRow;
                nonMax[pixelCount][1] = newCol;
                nonMax[pixelCount][2] = rounded2dPixelsGradient[newRow][newCol];
                pixelCount++;
            }

            // suppress non-maximum edges
            max[0] = 0;
            max[1] = 0;
            max[2] = 0;
            for (let i = 0; i < pixelCount; i++) {
                if (nonMax[i][2] > max[2]) {
                    max[0] = nonMax[i][0];
                    max[1] = nonMax[i][1];
                    max[2] = nonMax[i][2];
                }
            }

            for (let i = 0; i < pixelCount; i++) {
                pixels2d[i * nonMax[i][0]][nonMax[i][1]] = 0;
            }
            return pixels2d;
        }

        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (pixels2dInCanvas[i][j] == 255) {
                    switch (rounded2dPixelsGradient[i][j]) {
                        case 0:
                            pixels2d = suppressNonMax(1, 0, i, j, 0);
                            break;
                        case 45:
                            pixels2d = suppressNonMax(1, -1, i, j, 45);
                            break;
                        case 90:
                            pixels2d = suppressNonMax(0, 1, i, j, 90);
                            break;
                        case 135:
                            pixels2d = suppressNonMax(1, 1, i, j, 135);
                            break;
                        default:
                            break;
                    }
                }
            }
        }
        return pixels2d;
    }

    // convoluted2dPixels = 2d pixels generated from convolution
    // t1, t2 = 0 - 255
    localTreshold(convoluted2dPixels, t1, t2 = 255) {
        const pixelsHeight = convoluted2dPixels.length;
        const pixelsWidth = convoluted2dPixels.reduce((sum, curr) => sum + curr.length, 0) / pixelsHeight;
        const newPixels = [];
        for (let i = 0; i < pixelsHeight; i++) {
            newPixels.push([]);
            for (let j = 0; j < pixelsWidth; j++) {
                let pixel = convoluted2dPixels[i][j];
                if (pixel < t1) {
                    pixel = 0;
                } else if (pixel > t2) {
                    pixel = 255;
                }
                newPixels[newPixels.length - 1].push(pixel);
            }
        }
        return newPixels;
    }

    // pixels2d = 2d pixels will be apply to canvas
    apply2dPixelsToCanvas(canvasObject, pixels2d) {
        const pixels =
            canvasObject.domContext.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
        const data = pixels.data;

        const pixelsHeight = pixels2d.length;
        const pixelsWidth = pixels2d.reduce((sum, curr) => sum + curr.length, 0) / pixelsHeight;

        const temp = [];
        for (let i = 0; i < pixelsHeight; i++) {
            for (let j = 0; j < pixelsWidth; j++) {
                temp.push(pixels2d[i][j]);
            }
        }

        for (const [index, pixel] of temp.entries()) {
            data[index * 4] = pixel;
            data[index * 4 + 1] = pixel;
            data[index * 4 + 2] = pixel;
        }

        canvasObject.domContext.putImageData(pixels, 0, 0);
    }

    // show preview of copied image in canvas
    listenImageUpload() {
        dom.imageSrc.addEventListener('load', (e) => {
            // set canvas size
            this.canvasWidth = dom.imageSrc.width;
            this.canvasHeight = dom.imageSrc.naturalHeight * (this.canvasWidth / dom.imageSrc.naturalWidth);

            // clear all canvases
            this.canvasView.clearCanvases();

            // original image
            this.canvasView.clearOriginalImageAnalysis();
            this.draw(this.original);

            // show canvases
            this.canvasView.showOriginalImage();
            this.canvasView.scrollToFilter();
        });
    }

    // processes image on click button
    listenButtonSubmit() {
        dom.btnSubmit.addEventListener('click', (e) => {
            if (dom.imageSrc.src == '') {
                this.canvasView.showError('Mohon input citra yang hendak diproses.');
            } else {
                // clear all canvases
                this.canvasView.clearCanvases();

                // original image
                this.draw(this.original);
                this.analyzeTopColors(this.original, this.filterModel.nColors);

                // grayscale image
                this.draw(this.grayscale);
                this.toGrayscale(this.grayscale);
                this.analyzeTopColors(this.grayscale, this.filterModel.nColors);

                // differential gradient method
                this.draw(this.differentialGradient);
                this.toGrayscale(this.differentialGradient);
                const differentialGradient2dPixels = this.get2dGrayscalePixels(this.differentialGradient);
                const differentialGradientKernelX = [
                    [-1, 1]
                ];
                const differentialGradientKernelY = [
                    [1],
                    [-1]
                ];
                const differentialGradientGx =
                    this.convolution(differentialGradient2dPixels, differentialGradientKernelX);
                const differentialGradientGy =
                    this.convolution(differentialGradient2dPixels, differentialGradientKernelY);
                const differentialGradientSumOfConvolutedPixels =
                    this.sum2dConvolutedPixels(this.differentialGradient, differentialGradientGx, differentialGradientGy);
                const differentialGradientTresholded2dPixels =
                    this.localTreshold(differentialGradientSumOfConvolutedPixels, this.filterModel.t1, this.filterModel.t2);
                this.apply2dPixelsToCanvas(this.differentialGradient, differentialGradientTresholded2dPixels);
                this.analyzeTopColors(this.differentialGradient, this.filterModel.nColors);

                // center difference method
                this.draw(this.centerDifference);
                this.toGrayscale(this.centerDifference);
                const centerDifference2dPixels = this.get2dGrayscalePixels(this.centerDifference);
                const centerDifferenceKernelX = [
                    [-1, 0, 1]
                ];
                const centerDifferenceKernelY = [
                    [1],
                    [0],
                    [-1]
                ];
                const centerDifferenceGx =
                    this.convolution(centerDifference2dPixels, centerDifferenceKernelX);
                const centerDifferenceGy =
                    this.convolution(centerDifference2dPixels, centerDifferenceKernelY);
                const centerDifferenceSumOfConvolutedPixels =
                    this.sum2dConvolutedPixels(this.centerDifference, centerDifferenceGx, centerDifferenceGy);
                const centerDifferenceTresholded2dPixels =
                    this.localTreshold(centerDifferenceSumOfConvolutedPixels, this.filterModel.t1, this.filterModel.t2);
                this.apply2dPixelsToCanvas(this.centerDifference, centerDifferenceTresholded2dPixels);
                this.analyzeTopColors(this.centerDifference, this.filterModel.nColors);

                // sobel method
                this.draw(this.sobel);
                this.toGrayscale(this.sobel);
                const sobel2dPixels = this.get2dGrayscalePixels(this.sobel);
                const sobelKernelX = [
                    [-1, 0, 1],
                    [-2, 0, 2],
                    [-1, 0, 1]
                ];
                const sobelKernelY = [
                    [1, 2, 1],
                    [0, 0, 0],
                    [-1, -2, -1]
                ];
                const sobelGx =
                    this.convolution(sobel2dPixels, sobelKernelX);
                const sobelGy =
                    this.convolution(sobel2dPixels, sobelKernelY);
                const sobelSumOfConvolutedPixels =
                    this.sum2dConvolutedPixels(this.sobel, sobelGx, sobelGy);
                const sobelTresholded2dPixels =
                    this.localTreshold(sobelSumOfConvolutedPixels, this.filterModel.t1, this.filterModel.t2);
                this.apply2dPixelsToCanvas(this.sobel, sobelTresholded2dPixels);
                this.analyzeTopColors(this.sobel, this.filterModel.nColors);

                // prewitt method
                this.draw(this.prewitt);
                this.toGrayscale(this.prewitt);
                const prewitt2dPixels = this.get2dGrayscalePixels(this.prewitt);
                const prewittKernelX = [
                    [-1, 0, 1],
                    [-1, 0, 1],
                    [-1, 0, 1]
                ];
                const prewittKernelY = [
                    [1, 1, 1],
                    [0, 0, 0],
                    [-1, -1, -1]
                ];
                const prewittGx =
                    this.convolution(prewitt2dPixels, prewittKernelX);
                const prewittGy =
                    this.convolution(prewitt2dPixels, prewittKernelY);
                const prewittSumOfConvolutedPixels =
                    this.sum2dConvolutedPixels(this.prewitt, prewittGx, prewittGy);
                const prewittTresholded2dPixels =
                    this.localTreshold(prewittSumOfConvolutedPixels, this.filterModel.t1, this.filterModel.t2);
                this.apply2dPixelsToCanvas(this.prewitt, prewittTresholded2dPixels);
                this.analyzeTopColors(this.prewitt, this.filterModel.nColors);

                // roberts method
                this.draw(this.roberts);
                this.toGrayscale(this.roberts);
                const roberts2dPixels = this.get2dGrayscalePixels(this.roberts);
                const robertsKernelX = [
                    [1, 0],
                    [0, -1]
                ];
                const robertsKernelY = [
                    [0, 1],
                    [-1, 0]
                ];
                const robertsGx =
                    this.convolution(roberts2dPixels, robertsKernelX);
                const robertsGy =
                    this.convolution(roberts2dPixels, robertsKernelY);
                const robertsSumOfConvolutedPixels =
                    this.sum2dConvolutedPixels(this.roberts, robertsGx, robertsGy);
                const robertsTresholded2dPixels =
                    this.localTreshold(robertsSumOfConvolutedPixels, this.filterModel.t1, this.filterModel.t2);
                this.apply2dPixelsToCanvas(this.roberts, robertsTresholded2dPixels);
                this.analyzeTopColors(this.roberts, this.filterModel.nColors);

                // laplace 1 method
                this.draw(this.laplace1);
                this.toGrayscale(this.laplace1);
                const laplace1_2dPixels = this.get2dGrayscalePixels(this.laplace1);
                const laplace1Kernel = [
                    [0, 1, 0],
                    [1, -4, 1],
                    [0, 1, 0]
                ];
                const laplace1Convoluted2dPixels =
                    this.convolution(laplace1_2dPixels, laplace1Kernel);
                const laplace1Tresholded2dPixels =
                    this.localTreshold(laplace1Convoluted2dPixels, this.filterModel.t1, this.filterModel.t2);
                this.apply2dPixelsToCanvas(this.laplace1, laplace1Tresholded2dPixels);
                this.analyzeTopColors(this.laplace1, this.filterModel.nColors);

                // laplace 2 method
                this.draw(this.laplace2);
                this.toGrayscale(this.laplace2);
                const laplace2_2dPixels = this.get2dGrayscalePixels(this.laplace2);
                const laplace2Kernel = [
                    [-1, -1, -1],
                    [-1, 8, -1],
                    [-1, -1, -1]
                ];
                const laplace2Convoluted2dPixels =
                    this.convolution(laplace2_2dPixels, laplace2Kernel);
                const laplace2Tresholded2dPixels =
                    this.localTreshold(laplace2Convoluted2dPixels, this.filterModel.t1, this.filterModel.t2);
                this.apply2dPixelsToCanvas(this.laplace2, laplace2Tresholded2dPixels);
                this.analyzeTopColors(this.laplace2, this.filterModel.nColors);

                // laplace 3 method
                this.draw(this.laplace3);
                this.toGrayscale(this.laplace3);
                const laplace3_2dPixels = this.get2dGrayscalePixels(this.laplace3);
                const laplace3Kernel = [
                    [1, -2, 1],
                    [-2, 4, -2],
                    [1, -2, 1]
                ];
                const laplace3Convoluted2dPixels =
                    this.convolution(laplace3_2dPixels, laplace3Kernel);
                const laplace3Tresholded2dPixels =
                    this.localTreshold(laplace3Convoluted2dPixels, this.filterModel.t1, this.filterModel.t2);
                this.apply2dPixelsToCanvas(this.laplace3, laplace3Tresholded2dPixels);
                this.analyzeTopColors(this.laplace3, this.filterModel.nColors);

                // laplace of gaussian method
                this.draw(this.laplaceOfGaussian);
                this.toGrayscale(this.laplaceOfGaussian);
                const laplaceOfGaussian2dPixels = this.get2dGrayscalePixels(this.laplaceOfGaussian);
                const laplaceOfGaussianKernel = [
                    [0, 0, -1, 0, 0],
                    [0, -1, -2, -1, 0],
                    [-1, -2, 16, -2, -1],
                    [0, -1, -2, -1, 0],
                    [0, 0, -1, 0, 0]
                ];
                const laplaceOfGaussianConvoluted2dPixels =
                    this.convolution(laplaceOfGaussian2dPixels, laplaceOfGaussianKernel);
                const laplaceOfGaussianTresholded2dPixels =
                    this.localTreshold(laplaceOfGaussianConvoluted2dPixels, this.filterModel.t1, this.filterModel.t2);
                this.apply2dPixelsToCanvas(this.laplaceOfGaussian, laplaceOfGaussianTresholded2dPixels);
                this.analyzeTopColors(this.laplaceOfGaussian, this.filterModel.nColors);

                // canny method
                this.draw(this.canny);
                this.toGrayscale(this.canny);
                let canny2dPixels = this.get2dGrayscalePixels(this.canny);
                const smoothingKernel = [
                    [2 / 159, 4 / 159, 5 / 159, 4 / 159, 2 / 159],
                    [4 / 159, 9 / 159, 12 / 159, 9 / 159, 4 / 159],
                    [5 / 159, 12 / 159, 15 / 159, 12 / 159, 5 / 159],
                    [4 / 159, 9 / 159, 12 / 159, 9 / 159, 4 / 159],
                    [2 / 159, 4 / 159, 5 / 159, 4 / 159, 2 / 159]
                ];
                const cannySmoothed2dPixels =
                    this.convolution(canny2dPixels, smoothingKernel);
                const cannyGx =
                    this.convolution(cannySmoothed2dPixels, sobelKernelX);
                const cannyGy =
                    this.convolution(cannySmoothed2dPixels, sobelKernelY);
                const cannySumOfConvolutedPixels =
                    this.sum2dConvolutedPixels(this.canny, cannyGx, cannyGy);
                const canny2dPixelsOfGradient =
                    this.count2dPixelsGradient(this.canny, cannyGy, cannyGy);
                const rounded2dPixelsGradient = this.round2dPixelsGradient(canny2dPixelsOfGradient);
                const traced2dPixelsOfEdge =
                    this.tracesAlongCanvasEdges(cannySumOfConvolutedPixels, rounded2dPixelsGradient);
                this.apply2dPixelsToCanvas(this.canny, traced2dPixelsOfEdge);
                canny2dPixels = this.get2dGrayscalePixels(this.canny);
                const nonMaximumSupression2dPixels = this.nonMaximumSupression(canny2dPixels, rounded2dPixelsGradient);
                this.apply2dPixelsToCanvas(this.canny, nonMaximumSupression2dPixels);
                const cannyTresholded2dPixels =
                    this.localTreshold(canny2dPixels, this.filterModel.t1, this.filterModel.t2);
                this.apply2dPixelsToCanvas(this.canny, cannyTresholded2dPixels);
                this.analyzeTopColors(this.canny, this.filterModel.nColors);

                // show canvases
                this.canvasView.showAllCanvases();
                this.canvasView.scrollToCanvases();
            }
        });
    }

}