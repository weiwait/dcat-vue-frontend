import {createApp} from 'vue'
import App from './App.vue'
// import App from './TinyMce.vue'
// import {createPinia} from "pinia";
import FieldRegister from './FieldRegister'

const register = function () {
    const app = createApp(App)
    // app.use(createPinia())
    FieldRegister(app)

    return app
}

register()
