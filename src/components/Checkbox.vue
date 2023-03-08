<script setup lang="ts">
import {ref, inject} from "vue";
import {NSpace, NCheckbox, NCheckboxGroup} from "naive-ui";
import type {BaseField} from "@/component";
import {useFormStore} from "@/use/FormStore";

interface Field extends BaseField {
    options: Array<any>,
    checked: Array<string | number>,
    disabled: Array<string | number>,
    watches: [{field: string, handler: string}]
}

const provides = inject<Field>('provides')!

interface Option {
    value: string | number,
    attr: {
        name: string,
        disabled: boolean,
    },
}

const formStore = useFormStore()

const value = ref(provides.checked)
const column = ref(provides.column)
formStore.setField(column, value)

const disabled = ref(provides.disabled ?? []);
const options = ref<Array<Option>>()

options.value = provides.options.map((v, k) => {
    return {
        value: k,
        attr: {
            name: v,
            disabled: disabled.value.length > 0 ? disabled.value.includes(k) : false,
        }
    }
})

provides.watches?.forEach(item => {
    formStore.watchField(item.field, (nv: any) => {
        Function(`return ${item.handler}`)()(nv, {self: value, store: formStore})
    })
})

</script>

<template>
    <n-checkbox-group v-model:value="value">
        <n-space item-style="display: flex;">
            <template v-for="option of options" :key="k">
                <n-checkbox :value="option.value" :label="option.attr.name" size="medium"
                            :disabled="option.attr.disabled"></n-checkbox>
            </template>
        </n-space>
    </n-checkbox-group>

    <template v-for="v of value">
        <input type="hidden" :name="column + '[]'" :value="v">
    </template>
</template>

<style>
</style>
