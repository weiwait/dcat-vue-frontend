<script setup lang="ts">
import {ref, inject, computed} from "vue";
import {
    NDatePicker,
    NGrid,
    NGridItem,
} from "naive-ui";
import {empty} from "@/use/Utils";

interface Field {
    options: Array<string>,
    column: {start: string, end: string},
    disabled: Array<string | number>,
    watch: Array<any>,
    value: [number, number],
    attributes: any,
    disableDates: [{start: string|number, end: string|number}],
    help: { icon: string, text: string },
}

const provides = inject<Field>('provides')!
const column = ref(provides.column)

const value = ref<[number, number]>(provides.value)
const start = computed(() => value.value ? new Date(value.value[0]).toLocaleDateString() : '')
const end = computed(() => value.value ? new Date(value.value[1]).toLocaleDateString() : '')

function disableDates(ts: number) {
    let disable = false

    if (provides.disableDates) {
        disable = provides.disableDates.some(item => {
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

    return disable
}

</script>

<template>
    <n-grid :cols="2">
        <n-grid-item>
            <n-date-picker v-model:value="value" type="daterange" clearable :is-date-disabled="disableDates"></n-date-picker>
        </n-grid-item>
    </n-grid>

    <span class="help-block" v-if="!empty(provides.help)">
        <i :class="['fa', provides.help.icon]"></i>&nbsp;{{provides.help.text}}
    </span>

    <input v-if="provides.attributes.required" type="text" :required="!start" :disabled="!!start"
           :name="`${column.start}_is_required`" style="display: none;">

    <input type="hidden" :name="column.start" :value="start">
    <input type="hidden" :name="column.end" :value="end">
</template>

<style scoped lang="scss">
</style>
