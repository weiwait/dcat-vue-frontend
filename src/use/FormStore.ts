import {defineStore} from "pinia";
import {reactive, toRaw, watch} from "vue";
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

    function getForm(fid: string, field: string = ''): Form|void
    {
        if (field) {
            return forms[fid][field] || void 0
        }

        return forms[fid] || void 0
    }

    function watchField(fid: string, field: string, handler: (v: any) => void, wid: string = '')
    {
        if (!forms[fid]) {
            forms[fid] = {}
        }

        if (!delays[fid]) {
            delays[fid] = {}
        }

        if (forms[fid][field]) {
            watching(fid, field, handler, wid)
        } else {
            delays[fid][field] ? delays[fid][field].push({handler, wid}) : delays[fid][field] = [{handler, wid}]
        }
    }

    function watching(fid: string, field: string, handler: (v: any) => void, wid: string)
    {
        watches[wid || fid + field] = watch(() => forms[fid][field].value, () => {
            handler(toRaw(forms[fid][field].value))
        }, {deep: true})
    }

    function cleanupWatch(wid: string)
    {
        watches[wid] && watches[wid]()
        watches[wid] = undefined
    }

    function request(config: {})
    {
        return axios.request(config)
    }

    function initializer(
        fid: string,
        field: string,
        value: any = null,
        required: boolean = false,
        disabled: boolean = false,
    ): Form {
        if (!forms[fid]) {
            forms[fid] = {}
        }

        forms[fid][field] = reactive<Form>({
            name: field,
            value: value,
            disabled: false,
            options: [],
            attributes: {
                required: required,
                disabled: disabled,
            }
        })

        if (delays[fid] && delays[fid][field]) {
            delays[fid][field].forEach((delay: {handler: (v: any) => void, wid: string}) => {
                watching(fid, field, delay.handler, delay.wid)
            })

            delays[fid][field] = undefined
        }

        return forms[fid][field]
    }

    return {getForm, watchField, cleanupWatch, request, initializer, forms, watches}
})