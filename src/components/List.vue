<script setup lang="ts">
import {ref, inject} from "vue";
import {NDynamicInput} from "naive-ui";
import type {BaseField} from "@/component";
import {empty} from "@/use/Utils";

interface Field extends BaseField {
    max: NumberConstructor,
    min: NumberConstructor,
    sortable: boolean,
}

const provides = inject<Field>('provides')!

const value = ref(provides.value || [''])
const name = ref(provides.name)
const sortable = ref(provides.sortable ?? false)
const max = ref(provides.max)
const min = ref(provides.min)

</script>

<template>
    <n-dynamic-input
        v-model:value="value"
        placeholder="请输入"
        :show-sort-button="sortable"
        :min="min"
        :max="max"
    />

    <span class="help-block" v-if="!empty(provides.help)">
        <i :class="['fa', provides.help.icon]"></i>&nbsp;{{provides.help.text}}
    </span>

    <input v-if="provides.attributes.required" type="text" :required="!value.length" :disabled="!!value.length"
           :name="`${name}_is_required`" style="display: none;">

    <input v-for="item in value" type="hidden" :name="name + '[values][]'" :value="item">
    <input v-if="!value.length" type="hidden" :name="name + '[values][_def_]'">
</template>

<style scoped lang="scss">
</style>
