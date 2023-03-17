<script setup lang="ts">
import {ref, inject} from "vue";
import {NDynamicInput} from "naive-ui";
import type {BaseField} from "@/component";
import {empty} from "@/use/Utils";
import {useFormStore} from "@/use/FormStore";
import {Observer} from "@/use/useTraits";

interface Field extends BaseField {
    max: NumberConstructor,
    min: NumberConstructor,
    sortable: boolean,
}

const provides = inject<Field>('provides')!
const store = useFormStore()

const form = store.initializer(provides.name, provides.value || [''])
form.attributes.required = provides.attributes.required || false
form.attributes.disabled = provides.attributes.disabled || false

const sortable = ref(provides.sortable ?? false)
const max = ref(provides.max)
const min = ref(provides.min)

Observer.make(provides.watches)
</script>

<template>
    <n-dynamic-input
        v-model:value="form.value"
        placeholder="请输入"
        :show-sort-button="sortable"
        :min="min"
        :max="max"
        :aria-disabled="form.attributes.disabled"
    />

    <span class="help-block" v-if="!empty(provides.help)">
        <i :class="['fa', provides.help.icon]"></i>&nbsp;{{provides.help.text}}
    </span>

    <input v-if="form.attributes.required" type="text" :required="!form.value.length" :disabled="!!form.value.length"
           :name="`${form.name}_is_required`" style="display: none;">

    <input v-for="item in form.value" type="hidden" :name="form.name + '[values][]'" :value="item">
    <input v-if="!form.value.length" type="hidden" :name="form.name + '[values][_def_]'">
</template>

<style scoped lang="scss">
</style>
