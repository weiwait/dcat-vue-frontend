import File from './components/File.vue'
import Checkbox from './components/Checkbox.vue'
import Image from './components/Image.vue'
import Tag from './components/Tag.vue'
import DateRange from './components/DateRange.vue'
import List from './components/List.vue'
import KeyValue from './components/KeyValue.vue'
import DistPicker from './components/DistPicker.vue'
import Select from './components/Select.vue'
import MultipleSelect from './components/MultipleSelect.vue'
import NumberComponent from './components/Number.vue'
import type {App} from "vue";
// import {defineAsyncComponent} from "vue";


export default function registerFields(app: App) {
    app.component('File', File)
        .component('Checkbox', Checkbox)
        .component('Image', Image)
        .component('Tag', Tag)
        .component('DateRange', DateRange)
        .component('List', List)
        .component('KeyValue', KeyValue)
        .component('DistPicker', DistPicker)
        .component('Select', Select)
        .component('MultipleSelect', MultipleSelect)
        .component('Number', NumberComponent)

    // app.component('File', defineAsyncComponent(() => import('@/components/File.vue')))
    //     .component('CheckBox', defineAsyncComponent(() => import('@/components/CheckBox.vue')))
    //     .component('Image', defineAsyncComponent(() => import('@/components/Image.vue')))
    //     .component('Tag', defineAsyncComponent(() => import('@/components/Tag.vue')))
    //     .component('DateRange', defineAsyncComponent(() => import('@/components/DateRange.vue')))
    //     .component('List', defineAsyncComponent(() => import('@/components/List.vue')))
    //     .component('KeyValue', defineAsyncComponent(() => import('@/components/KeyValue.vue')))
    //     .component('DistPicker', defineAsyncComponent(() => import('@/components/DistPicker.vue')))
    //     .component('Select', defineAsyncComponent(() => import('@/components/Select.vue')))
    //     .component('MultipleSelect', defineAsyncComponent(() => import('@/components/MultipleSelect.vue')))
    //     .component('Number', defineAsyncComponent(() => import('@/components/Number.vue')))

    return app
}
