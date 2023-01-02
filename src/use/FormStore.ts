import {defineStore} from "pinia";
import {reactive, ref, unref, watch} from "vue";
import type {Ref} from "vue"

export const useFormStore = defineStore('form', () => {
    const fields = reactive<any>({})
    const watchs = reactive<any>({})

    function setField(name: string|Ref, value: Ref) {
        const sn: string = unref(name)
        fields[unref(sn)] = value
    }

    function getField(name: string|Ref, defaultValue: any = undefined) {
        const sn: string = unref(name)

        if (!fields[sn]) {
            setField(sn, ref(defaultValue))
        }

        return fields[sn]
    }

    function watchField(name: string|Ref, handler: Function) {
        const sn: string = unref(name)
        handler(fields[sn])

        watchs[sn] = watch(() => fields[sn], () => {
            handler(fields[sn])
        }, {deep: true})
    }

    function cleanupWatch(name: string|Ref) {
        const sn: string = unref(name)
        watchs[sn] && watchs[sn]()
    }

    return {setField, getField, fields, watchField, cleanupWatch}
})