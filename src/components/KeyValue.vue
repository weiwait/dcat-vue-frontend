<script setup lang="ts">
import {ref, inject, unref, onMounted} from "vue";
import {NDynamicInput, NInput} from "naive-ui";
import type {BaseField} from "@/component";
import {useNum2el} from "@/use/Utils";
import {useFormStore} from "@/use/FormStore";
import {empty} from "@/use/Utils";
import {Observer} from "@/use/useTraits";

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
const store = useFormStore()

const form = store.initializer(
    provides.formId,
    provides.name,
    provides.value,
    provides.attributes.required || false,
    provides.attributes.disabled || false
)

function reBuildIndex(uv: any) {
    form.value = uv.map((item: any, i: number) => {
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
    provides.is_serial && reBuildIndex(form.value)
})

Observer.make(provides.watches, provides.formId, provides.name)
</script>

<template>
    <template v-if="!provides.is_serial">
        <n-dynamic-input
            v-model:value="form.value"
            preset="pair"
            :key-placeholder="'请输入' + provides.keyLabel"
            :value-placeholder="'请输入值' + provides.valueLabel"
            :show-sort-button="provides.is_sortable"
            :aria-disabled="form.attributes.disabled"
        />

        <template v-for="item in form.value">
            <input type="hidden" :name="form.name + '[keys][]'" :value="item.key">
            <input type="hidden" :name="form.name + '[values][]'" :value="item.value">
        </template>
    </template>

    <template v-else>
        <n-dynamic-input
            v-model:value="form.value"
            :on-update:value="onUpdate"
            :show-sort-button="provides.is_sortable"
            :aria-disabled="form.attributes.disabled"
        >

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

        <template v-if="!provides.is_list" v-for="item in form.value">
            <input type="hidden" :name="form.name + '[keys][]'" :value="item.key">
            <input type="hidden" :name="form.name + '[values][]'" :value="item.value">
        </template>

        <template v-else v-for="item in form.value">
            <input type="hidden" :name="form.name + '[values][]'" :value="item.value">
        </template>
    </template>

    <span class="help-block" v-if="!empty(provides.help)">
        <i :class="['fa', provides.help.icon]"></i>&nbsp;{{provides.help.text}}
    </span>

    <input v-if="form.attributes.required" type="text" :required="!form.value.length" :disabled="!!form.value.length"
           :name="`${form.name}_is_required`" style="display: none;">

    <input v-if="!form.value.length" type="hidden" :name="form.name" value="_def_">
</template>

<style scoped lang="scss">
</style>
