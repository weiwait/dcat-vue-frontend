import File from './components/File.vue'
import CheckBox from './components/CheckBox.vue'
import Image from './components/Image.vue'
import Tag from './components/Tag.vue'
import type {App} from "vue";


export default function registerFields(app: App) {
    app.component('File', File)
        .component('CheckBox', CheckBox)
        .component('Image', Image)
        .component('Tag', Tag)

    return app
}
