<script setup lang="ts">
import {ref, inject, nextTick, watch, computed} from "vue";
import {
    NDynamicTags,
    NButton,
    NAutoComplete,
} from "naive-ui";

import type {AutoCompleteInst} from 'naive-ui'
import {empty} from "@/use/Utils";
import {useFormStore} from "@/use/FormStore";
import {Observer} from "@/use/useTraits";
import type {BaseField} from "@/component";

const provides = inject<BaseField>('provides')!
const store = useFormStore()

const form = store.initializer(
    provides.formId,
    provides.name,
    provides.value || [],
    provides.attributes.required || false,
    provides.attributes.disabled || false
)

form.max = provides.max || undefined

const customInput = ref('')
const autoCompleteInstRef = ref<AutoCompleteInst | null>(null)
watch(autoCompleteInstRef, (value) => {
    customInput.value = ''
    if (value) nextTick(() => value.focus())
})

const options = computed(() => {
    if (customInput.value === null) {
        return []
    }

    return form.options.filter(item =>
        item.startsWith(customInput.value)
        && !form.value.includes(item)
    )
    .map(item => {
        return {
            label: item,
            value: item
        }
    })
})

Observer.make(provides.watches, provides.formId, provides.name)
</script>

<template>
    <n-dynamic-tags v-model:value="form.value" :max="form.max" size="large">
        <template #input="{ submit, deactivate }">
            <n-auto-complete
                ref="autoCompleteInstRef"
                v-model:value="customInput"
                size="medium"
                :options="options"
                :clear-after-select="true"
                @select="submit($event)"
                @blur="submit(customInput)"
                @keydown.enter.stop.prevent="() => false"
                @keyup.enter.stop.prevent="submit(customInput); customInput = ''"
            />
        </template>
        <template #trigger="{ activate, disabled }">
            <n-button
                size="medium"
                type="default"
                dashed
                :disabled="disabled"
                @click="activate()"
                class="add"
            >+</n-button>
        </template>
    </n-dynamic-tags>

    <span class="help-block" v-if="!empty(provides.help)">
        <i :class="['fa', provides.help.icon]"></i>&nbsp;{{provides.help.text}}
    </span>

    <input v-if="form.attributes.required" type="text" :required="!form.value.length" :disabled="!!form.value.length"
           :name="`${form.name}_is_required`" style="display: none;">

    <input v-for="tag in form.value" type="hidden" :name="form.name + '[]'" :value="tag">
</template>

<style scoped lang="scss">
.add {
    font-size: 20px;
}
</style>
