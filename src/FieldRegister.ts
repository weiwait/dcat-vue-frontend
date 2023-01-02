import File from './components/File.vue'
import CheckBox from './components/CheckBox.vue'
import Image from './components/Image.vue'
import Tag from './components/Tag.vue'
import DateRange from './components/DateRange.vue'
import List from './components/List.vue'
import KeyValue from './components/KeyValue.vue'
import DistPicker from './components/DistPicker.vue'
import Select from './components/Select.vue'
import type {App} from "vue";


export default function registerFields(app: App) {
    app.component('File', File)
        .component('CheckBox', CheckBox)
        .component('Image', Image)
        .component('Tag', Tag)
        .component('DateRange', DateRange)
        .component('List', List)
        .component('KeyValue', KeyValue)
        .component('DistPicker', DistPicker)
        .component('Select', Select)

    return app
}
