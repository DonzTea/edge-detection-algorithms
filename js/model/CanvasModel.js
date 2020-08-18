export default class CanvasModel {
    constructor(
        domCanvas,
        domContext,
        domTitle,
        stringTitle,
        domColorTitle,
        domColorList,
        domPixelsOnTopOfLowerTreshold = null
    ) {
        this.domCanvas = domCanvas;
        this.domContext = domContext;
        this.domTitle = domTitle;
        this.stringTitle = stringTitle;
        this.domColorTitle = domColorTitle;
        this.domColorList = domColorList;
        this.domPixelsOnTopOfLowerTreshold = domPixelsOnTopOfLowerTreshold;
    }
}