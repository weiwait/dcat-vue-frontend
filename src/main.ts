import {createApp} from 'vue'
import App from './App.vue'
import FieldRegister from './FieldRegister'
import {SinglePinia} from "@/use/Utils";

export default function () {
    const app = createApp(App)
    app.use(SinglePinia.getPinia())
    FieldRegister(app)

    return app
}
