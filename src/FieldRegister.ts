import File from './components/File.vue'
import CheckBox from './components/CheckBox.vue'
import type {App} from "vue";


export default function registerFields(app: App) {
    app.component('File', File)
        .component('CheckBox', CheckBox)

    return app
}
