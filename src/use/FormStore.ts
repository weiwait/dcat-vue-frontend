import {defineStore} from "pinia";
import {reactive, ref, unref, watch} from "vue";
import type {Ref} from "vue"


interface FormField {
    name: string,
    origin: any,
    value: any,
    changed: Function[],
}

export const useFormStore = defineStore('form', () => {
    const fields = reactive<any>({})
    const watchs = reactive<any>({})

    function setField(name: string|Ref, value: Ref) {
        const sn: string = unref(name)

        fields[sn] = reactive<FormField>({
            name: sn, origin: unref(value), value, changed: []
        })
    }

    function getField(name: string|Ref, defaultValue: any = undefined) {
        const sn: string = unref(name)

        if (!fields[sn]) {
            setField(sn, ref(defaultValue))
        }

        return fields[sn].value
    }

    function watchField(name: string|Ref, handler: Function) {
        const sn: string = unref(name)
        handler(fields[sn].value)

        watchs[sn] = watch(() => fields[sn].value, () => {
            handler(fields[sn].value)
        }, {deep: true})
    }

    function cleanupWatch(name: string|Ref) {
        const sn: string = unref(name)
        watchs[sn] && watchs[sn]()
    }

    return {setField, getField, fields, watchField, cleanupWatch}
})