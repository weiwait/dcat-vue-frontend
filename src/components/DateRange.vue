<script setup lang="ts">
import {ref, inject, computed} from "vue";
import {
    NDatePicker,
    NGrid,
    NGridItem,
} from "naive-ui";
import {empty} from "@/use/Utils";
import type {BaseField} from "@/component";
import {useFormStore} from "@/use/FormStore";
import {Observer} from "@/use/useTraits";

interface Field extends BaseField {
    column: {start: string, end: string},
    watch: Array<any>,
    value: {start: string, end: string},
    attributes: any,
    disableDates: [{start: string|number, end: string|number}],
    help: { icon: string, text: string },
}

const provides = inject<Field>('provides')!

const store = useFormStore()
const form = store.initializer(
    provides.formId,
    (<any>Object).values(provides.name).join(''),
    null,
    provides.attributes.required || false,
    provides.attributes.disabled || false
)

form.value = provides.value?.start && provides.value?.end
        ? [Date.parse(provides.value.start), Date.parse(provides.value.end)]
        : null

const start = computed(() => form.value ? new Date(form.value[0]).toLocaleDateString() : '')
const end = computed(() => form.value ? new Date(form.value[1]).toLocaleDateString() : '')

form[provides.column.start] = start
form[provides.column.end] = end

form.disableDates = ref(provides.disableDates || [])

function disableDates(ts: number): boolean
{
    return form.disableDates.some((item: {start: string, end: string}) => {
        if (item.start && item.end) { // 禁区间
            return ts >= new Date(item.start).getTime() && ts <= new Date(item.end).getTime()
        } else if (item.start) { // 禁未来
            return ts >= new Date(item.start).getTime()
        } else if (item.end) { // 禁过去
            return  ts <= new Date(item.end).getTime()
        }

        return false
    })
}

Observer.make(provides.watches, provides.formId, (<any>Object).values(provides.name).join(''))
</script>

<template>
    <n-grid :cols="2">
        <n-grid-item>
            <n-date-picker
                v-model:value="form.value"
                type="daterange"
                clearable
                :is-date-disabled="disableDates"
                :disabled="form.attributes.disabled"
            ></n-date-picker>
        </n-grid-item>
    </n-grid>

    <span class="help-block" v-if="!empty(provides.help)">
        <i :class="['fa', provides.help.icon]"></i>&nbsp;{{provides.help.text}}
    </span>

    <input v-if="provides.attributes.required" type="text" :required="!start" :disabled="!!start"
           :name="`${provides.column.start}_is_required`" style="display: none;">

    <input type="hidden" :name="provides.column.start" :value="start">
    <input type="hidden" :name="provides.column.end" :value="end">
</template>

<style scoped lang="scss">
</style>
