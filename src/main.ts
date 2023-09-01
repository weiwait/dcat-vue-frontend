import {createApp} from 'vue'
import App from './App.vue'
import FieldRegister from './FieldRegister'
import {SinglePinia} from "@/use/Utils";

// 多实例，类工厂
export default function (name: string = '') {
    const app = name ? createApp({...App, name}) : createApp(App)
    app.use(SinglePinia.getPinia())
    FieldRegister(app)

    return app
}
