<script setup lang="ts">
import {ref, inject, onUnmounted, onMounted} from "vue";
import {NSelect} from "naive-ui";
import type {BaseField} from "@/component";
import {useFormStore} from "@/use/FormStore";
import {empty} from "@/use/Utils";

interface Field extends BaseField {
    value: string|null,
    optionsFromKeyValueField: string,
    options: [],
    concatSeparator: string,
    placeholder: string,
}

const provides = inject<Field>('provides')!

const value = ref(provides.value)
const name = ref(provides.name)
const options = ref()

options.value = provides.options.map((label: any, value: any) => ({label: provides.concatSeparator ? `${value}${provides.concatSeparator}${label}` : label, value}))

if (provides.optionsFromKeyValueField) {
    useFormStore().watchField(provides.optionsFromKeyValueField, (nv: any) => {
        options.value = nv?.filter((item: any) => !!item.value).map((item: any) => ({label: provides.concatSeparator ? `${item.key}${provides.concatSeparator}${item.value}` :item.value, value: item.key}))
    })

    onUnmounted(() => {
        useFormStore().cleanupWatch(provides.optionsFromKeyValueField)
    })
}

const placement = ref<any>('body')

onMounted(() => {
    placement.value = document.getElementById(provides.mountId)!.closest('.layui-layer.layui-layer-page') || 'body'
})
</script>

<template>
    <n-select
        v-model:value="value"
        filterable
        clearable
        :placeholder="provides.placeholder"
        :options="options"
        :to="placement"
    />

    <span class="help-block" v-if="provides.help">
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
