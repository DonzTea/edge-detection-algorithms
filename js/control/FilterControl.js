import FilterModel from '../model/FilterModel.js';
import FilterView from '../view/FilterView.js';
import Dom from '../model/Dom.js';
const dom = new Dom();

export default class FilterControl {
    // t2 : int 1 to 255
    // t1 : int 0 to (t2 - 1)
    // nColors : int 1 to 100
    constructor(t1, t2, nColors) {
        this.filterModel = new FilterModel(t1, t2, nColors);
        this.filterView = new FilterView();
    }

    // listen for thershold values
    tresholdFilter() {
        const filter = new rSlider({
            target: `#${dom.tresholdFilter.id}`,
            values: [...Array(256).keys()],
            range: true,
            set: [this.filterModel.t1, this.filterModel.t2],
            width: null,
            scale: true,
            labels: null,
            tooltip: true,
            step: null,
            disabled: false,
            onChange: (values) => {
                let [t1, t2] = values.split(',');
                if (t1 == t2) {
                    this.filterModel.t1 = parseInt(t2 - 1);
                    this.filterModel.t2 = parseInt(t2);
                    filter.setValues(this.filterModel.t1, this.filterModel.t2);
                } else {
                    this.filterModel.t1 = parseInt(t1);
                    this.filterModel.t2 = parseInt(t2);
                }
            }
        });
    }

    // listen for n analyzed colors value
    nColorsFilter() {
        new rSlider({
            target: `#${dom.colorsFilter.id}`,
            values: [...Array(101).keys()].slice(1),
            range: null,
            set: [this.filterModel.nColors],
            width: null,
            scale: true,
            labels: null,
            tooltip: true,
            step: null,
            disabled: false,
            onChange: (value) => {
                this.filterModel.nColors = value;
            }
        });
    }
}