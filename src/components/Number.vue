<script setup lang="ts">
import {ref, inject, computed} from "vue";
import {NInputNumber} from "naive-ui";
import type {BaseField} from "@/component";
import {empty} from "@/use/Utils";
import {useFormStore} from "@/use/FormStore";
import {Observer} from "@/use/useTraits";

interface Field extends BaseField {
    value: number|null,
    optionsFromKeyValueField: string,
    options: [],
    concatSeparator: string,
    placeholder: string,
    precision: number|undefined,
    step: number|undefined,
    clearable: boolean|undefined,
    min: number|undefined,
    max: number|undefined,
    showButton: boolean,
    bothButton: boolean,
    prepend: string|null,
    append: string|null,
}

const provides = inject<Field>('provides')!
const store = useFormStore()

const form = store.initializer(
    provides.formId,
    provides.name,
    provides.value ?? null,
    provides.attributes.required || false,
    provides.attributes.disabled || false
)

const required = computed((): boolean => {
    const isEmpty = empty(form.value)
    let isLess = false
    let isGreat = false

    if (!isEmpty && 'number' === typeof provides.min) {
        isLess = form.value < provides.min
    }

    if (!isEmpty && 'number' === typeof provides.max) {
        isGreat = form.value >= provides.max
    }

    return (isEmpty && provides.attributes.required) || isLess || isGreat
})

Observer.make(provides.watches, provides.formId, provides.name)
</script>

<template>
    <n-input-number
        v-model:value="form.value"
        :clearable="!!provides.clearable || !form.attributes.required"
        :placeholder="provides.placeholder"
        :precision="provides.precision || 0"
        :step="provides.step || 1"
        :min="provides.min"
        :max="provides.max"
        :readonly="!!provides.disabled"
        :show-button="provides.showButton"
        :button-placement="provides.bothButton ? 'both' : 'right'"
        :disabled="form.attributes.disabled"
    >
        <template #prefix style="color: #949494;">
            {{ provides.prepend }}
        </template>

        <template #suffix style="color: #949494;">
            {{ provides.append }}
        </template>
    </n-input-number>

    <span class="help-block" v-if="!empty(provides.help)">
        <i :class="['fa', provides.help.icon]"></i>&nbsp;{{provides.help.text}}
    </span>

    <input v-if="form.attributes.required || !empty(provides.min) || !empty(provides.max)"
           type="text"
           :required="true"
           :disabled="!required"
           :name="`${form.name}_is_required`"
           style="display: none;">

    <input type="hidden" :name="form.name" :value="form.value">
</template>

<style scoped lang="scss">
</style>
