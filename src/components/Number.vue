<script setup lang="ts">
import {ref, inject} from "vue";
import {NInputNumber} from "naive-ui";
import type {BaseField} from "@/component";
import {empty} from "@/use/Utils";
import {useFormStore} from "@/use/FormStore";

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

const value = ref(provides.value)
const name = ref(provides.name)

useFormStore().setField(name, value)
</script>

<template>
    <n-input-number
        v-model:value="value"
        :clearable="provides.clearable"
        :placeholder="provides.placeholder"
        :precision="provides.precision"
        :step="provides.step"
        :min="provides.min"
        :max="provides.max"
        :readonly="!!provides.disabled"
        :show-button="provides.showButton"
        :button-placement="provides.bothButton ? 'both' : 'right'"
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

    <input v-if="provides.attributes.required"
           type="text"
           :required="empty(value)"
           :disabled="!empty(value)"
           :name="`${name}_is_required`"
           style="display: none;">

    <input type="hidden" :name="name" :value="value">
</template>

<style scoped lang="scss">
</style>
