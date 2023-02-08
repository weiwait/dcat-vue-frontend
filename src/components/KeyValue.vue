<script setup lang="ts">
import {ref, inject, unref, onMounted, toRef} from "vue";
import {NDynamicInput, NInput} from "naive-ui";
import type {BaseField} from "@/component";
import {useNum2el} from "@/use/Utils";
import {storeToRefs} from "pinia";
import {useFormStore} from "@/use/FormStore";

interface Field extends BaseField {
    is_sortable: boolean,
    keyLabel: string,
    valueLabel: string,
    value: { key: string, value: string }[],
    keys: string[],
    is_serial: boolean,
    is_list: boolean,
}

const provides = inject<Field>('provides')!
const name = ref(provides.name)
const value = ref(provides.value)

useFormStore().setField(name, value)

function reBuildIndex(uv: any) {
    value.value = uv.map((item: any, i: number) => {
        let key = ''

        if (provides.keys.length) {
            key = provides.keys[i]
        } else {
            key = useNum2el(i)
        }

        return {"key": key, "value": unref(item)?.value}
    })
}

function onUpdate(uv: any) {
    reBuildIndex(uv)
}

onMounted(() => {
    provides.is_serial && reBuildIndex(value.value)
})

</script>

<template>
    <template v-if="!provides.is_serial">
        <n-dynamic-input
            v-model:value="value"
            preset="pair"
            :key-placeholder="'请输入' + provides.keyLabel"
            :value-placeholder="'请输入值' + provides.valueLabel"
            :show-sort-button="provides.is_sortable"
        />

        <template v-for="item in value">
            <input type="hidden" :name="name + '[keys][]'" :value="item.key">
            <input type="hidden" :name="name + '[values][]'" :value="item.value">
        </template>
    </template>

    <template v-else>
        <n-dynamic-input
            v-model:value="value"
            :on-update:value="onUpdate"
            :show-sort-button="provides.is_sortable">

            <template #default="{ value }">
                <div style="display: flex; align-items: center; width: 100%">
                    <n-input
                        v-model:value="value.key"
                        style="margin-right: 12px; width: 160px; text-align: center"
                        :disabled="true"
                    />
                    <n-input v-model:value="value.value" type="text"/>
                </div>
            </template>
        </n-dynamic-input>

        <template v-if="!provides.is_list" v-for="item in value">
            <input type="hidden" :name="name + '[keys][]'" :value="item.key">
            <input type="hidden" :name="name + '[values][]'" :value="item.value">
        </template>

        <template v-else v-for="item in value">
            <input type="hidden" :name="name + '[values][]'" :value="item.value">
        </template>
    </template>

    <span class="help-block" v-if="provides.help">
        <i :class="['fa', provides.help.icon]"></i>&nbsp;{{provides.help.text}}
    </span>

    <input v-if="provides.attributes.required" type="text" :required="!value.length" :disabled="!!value.length"
           :name="`${name}_is_required`" style="display: none;">

    <input v-if="!value.length" type="hidden" :name="name" value="_def_">
</template>

<style scoped lang="scss">
</style>
