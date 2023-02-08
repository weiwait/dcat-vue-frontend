<script setup lang="ts">
import {ref, inject, nextTick, watch, computed} from "vue";
import {
    NDynamicTags,
    NButton,
    NIcon,
    NText,
    NAutoComplete,
} from "naive-ui";

import type {AutoCompleteInst} from 'naive-ui'

import {Add} from '@vicons/ionicons5'

interface Field {
    options: Array<string>,
    column: string,
    name: string,
    checked: Array<string | number>,
    disabled: Array<string | number>,
    watch: Array<any>,
    obs: {
        oss: {
            dir: string,
            policy: string,
            accessid: string,
            expire: number,
            host: string,
            signature: string,
            callback: string,
        }
    },
    disk: any,
    uploaded_url: string,
    obs_config_url: string,
    dir: string,
    multiple: boolean,
    value: Array<string>
    attributes: any,
    max: number | undefined,
}

const provides = inject<Field>('provides')!

const name = ref(provides.name)

const tags = ref(provides.value || [])
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

    return provides.options.filter(item =>
        item.startsWith(customInput.value)
        && !tags.value.includes(item)
    )
    .map(item => {
        return {
            label: item,
            value: item
        }
    })
})

</script>

<template>
    <n-dynamic-tags v-model:value="tags" :max="provides.max" size="large">
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

    <span class="help-block" v-if="provides.help">
        <i :class="['fa', provides.help.icon]"></i>&nbsp;{{provides.help.text}}
    </span>

    <input v-if="provides.attributes.required" type="text" :required="!tags.length" :disabled="!!tags.length"
           :name="`${name}_is_required`" style="display: none;">

    <input v-for="tag in tags" type="hidden" :name="name + '[]'" :value="tag">
</template>

<style scoped lang="scss">
.add {
    font-size: 20px;
}
</style>
