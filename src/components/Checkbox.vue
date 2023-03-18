<script setup lang="ts">
import {ref, inject} from "vue";
import {NSpace, NCheckbox, NCheckboxGroup} from "naive-ui";
import type {BaseField} from "@/component";
import {useFormStore} from "@/use/FormStore";
import {Observer} from "@/use/useTraits";

interface Field extends BaseField {
    options: Array<any>,
    checked: Array<string | number>,
    disabled: Array<string | number>,
}

const provides = inject<Field>('provides')!

const store = useFormStore()

const form = store.initializer(
    provides.formId,
    provides.name,
    provides.value || [],
    provides.attributes.required || false,
    provides.attributes.disabled || false
)

form.disabledOptions = ref<Array<string|number>>(provides.disabled || [])

form.options = provides.options.map((v, k) => ({
    label: v,
    value: k,
    disabled: form.disabledOptions.includes(k),
}))

Observer.make(provides.watches, provides.formId, provides.name)
</script>

<template>
    <n-checkbox-group v-model:value="form.value" :disabled="form.attributes.disabled">
        <n-space item-style="display: flex;">
            <template v-for="option of form.options" :key="k">
                <n-checkbox :value="option.value"
                            :label="option.label"
                            size="medium"
                            :disabled="form.attributes.disabled || option.disabled"
                ></n-checkbox>
            </template>
        </n-space>
    </n-checkbox-group>

    <template v-for="v of form.value">
        <input type="hidden" :name="form.name + '[]'" :value="v">
    </template>
</template>

<style>
</style>
