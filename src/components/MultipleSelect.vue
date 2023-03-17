<script setup lang="ts">
import {ref, inject, onUnmounted, onMounted} from "vue";
import {NSelect} from "naive-ui";
import type {BaseField} from "@/component";
import {useFormStore} from "@/use/FormStore";
import {empty} from "@/use/Utils";
import {Observer} from "@/use/useTraits";

interface Field extends BaseField {
    value: never[] | null | undefined,
    optionsFromKeyValueField: string,
    options: [],
    concatSeparator: string,
    placeholder: string,
}

const provides = inject<Field>('provides')!

const store = useFormStore()
const form = store.initializer(provides.name)

form.value = provides.value

form.options = provides.options?.map(
    (label: any, value: any) => ({
        label: provides.concatSeparator ? `${value}${provides.concatSeparator}${label}` : label,
        value
    })
)

if (provides.optionsFromKeyValueField) {
    store.watchField(
        provides.optionsFromKeyValueField,
        (nv: any) => {
            form.options = nv?.filter(
                (item: any) => !!item.value).map(
                (item: any) => ({
                    label: provides.concatSeparator ? `${item.key}${provides.concatSeparator}${item.value}` : item.value,
                    value: item.key
                })
            )

            form.value = form.value?.filter((item: any) => form.options?.some((option: any) => option.value === item))
        })
}

onUnmounted(() => {
    useFormStore().cleanupWatch(provides.optionsFromKeyValueField)
})

const placement = ref<any>('body')

onMounted(() => {
    placement.value = document.getElementById(provides.vid)!.closest('.layui-layer.layui-layer-page') || 'body'
})

Observer.make(provides.watches)
</script>

<template>
    <n-select
        v-model:value="form.value"
        filterable
        clearable
        :placeholder="provides.placeholder"
        :options="form.options"
        :to="placement"
        multiple
        :disabled="form.attributes.disabled"
    />

    <span class="help-block" v-if="!empty(provides.help)">
        <i :class="['fa', provides.help.icon]"></i>&nbsp;{{provides.help.text}}
    </span>

    <input v-if="form.attributes.required" type="text" :required="empty(form.value)" :disabled="!empty(form.value)"
           :name="`${form.name}_is_required`" style="display: none;">

    <input v-for="item in form.value" type="hidden" :name="form.name + '[]'" :value="item">
    <input v-if="!form.value" type="hidden" :name="form.name" :value="[]">
</template>

<style scoped lang="scss">
</style>
