<script setup lang="ts">
import {ref, inject} from "vue";
import Editor from '@tinymce/tinymce-vue'

interface Field {
    options: Array<any>,
    column: string,
    checked: Array<string|number>,
    disabled: Array<string|number>,
    watch: Array<any>,
}

const provides = inject<Field>('provides')!

interface Option {
    value: string|number,
    attr: {
        name: string,
        disabled: boolean,
    },
}

const options = ref<Array<Option>>()


const value = ref(provides.checked)
const column = ref(provides.column)
const disabled = ref(provides.disabled ?? []);

options.value = provides.options.map((v, k) => {
    return {
        value: k,
        attr: {
            name: v,
            disabled: disabled.value.length > 0 ? disabled.value.includes(k) : false,
        }
    }
})

function change(e: any) {
    document.dispatchEvent(new CustomEvent(`${column.value}:change`, {
        detail: {
            value: [...value.value]
        }
    }))
}

interface Watch {
    type: string
    handler: string
}

const useWatch = provides.watch
useWatch.forEach(({type, handler}: Watch) => {
    document.addEventListener(type, ({detail}: CustomEventInit) => Function(handler)()(
        {
            setDisabled(set: Array<number | string>, rmChecked = false) {
                disabled.value = [...set]
                options.value = options.value?.map(item => {
                    return {
                        value: item.value,
                        attr: {
                            name: item.attr.name,
                            disabled: disabled.value.includes(item.value)
                        }
                    }
                })

                if (rmChecked) {
                    value.value = value.value.filter(item => !disabled.value.includes(item))
                }
            },
            getDisabled() {
                return [...disabled.value]
            },
        },
        [...detail.value]
    ))
})

</script>

<template>
    <editor api-key="p7lyj25wrufyee703b2pga63davo99oj9nrayugctp02goa2"></editor>

    <template v-for="v of value">
        <input type="hidden" :name="column + '[]'" :value="v">
    </template>
</template>

<style>
</style>
