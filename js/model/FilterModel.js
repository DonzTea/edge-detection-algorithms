export default class FilterModel {
    // t2 : int 1 to 255
    // t1 : int 0 to (t2 - 1)
    // nColors: int 1 to 100
    constructor(t1, t2, nColors) {
        this.t1 = t1;
        this.t2 = t2;
        this.nColors = nColors;
    }
}