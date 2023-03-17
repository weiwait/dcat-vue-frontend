import {defineStore} from "pinia";
import {isProxy, isRef, reactive, ref, toRaw, unref, watch} from "vue";
import type {Ref} from "vue"
import axios from "axios";

type Form  = {
    [key: string]: any,
    name: string,
    value: any,
    options: any[],
    disabled: boolean,
    attributes: {
        disabled: boolean,
        required: boolean,
        [key: string]: any,
    }
}

export const useFormStore = defineStore('form', () => {
    const forms = reactive<any>({})
    const watches = reactive<any>({})
    const delays: any = {}

    function getForm(name: string|Ref, defaultValue: any = undefined): Form
    {
        const sn: string = unref(name)

        if (!forms[sn]) {
            initializer(sn)
        }

        return forms[sn]
    }

    function updateField(name: string|Ref, value: any, state: string = 'value'): boolean
    {
        const sn = unref(name)

        if (!forms[sn]) return false

        forms[sn][state] = value

        return true
    }

    function watchField(name: string|Ref, handler: (v: any) => void, wid: string = '')
    {
        const sn: string = unref(name)

        if (forms[sn]) {
            watching(sn, handler, wid)
        } else {
            delays[sn] ? delays[sn].push({handler, wid}) : delays[sn] = [{handler, wid}]
        }
    }

    function watching(sn: string, handler: (v: any) => void, wid: string)
    {
        watches[wid || sn] = watch(() => forms[sn].value, () => {
            handler(toRaw(forms[sn].value))
        }, {deep: true})
    }

    function cleanupWatch(id: string|Ref<string>)
    {
        const wid: string = unref(id)
        watches[wid] && watches[wid]()
    }

    function request(config: {})
    {
        return axios.request(config)
    }

    function initializer(field: string|Ref<string>, value: any = null): Form
    {
        const sn: string = unref(field)

        forms[sn] = reactive<Form>({
            name: sn,
            value: value,
            disabled: false,
            options: [],
            attributes: {
                required: false,
                disabled: false,
            }
        })

        if (undefined !== delays[sn]) {
            delays[sn].forEach((delay: {handler: (v: any) => void, wid: string}) => {
                watching(sn, delay.handler, delay.wid)
            })

            delays[sn] = undefined
        }

        return forms[sn]
    }

    return {getForm, watchField, cleanupWatch, updateField, request, initializer}
})