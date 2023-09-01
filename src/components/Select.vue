<script setup lang="ts">
import {ref, inject, onUnmounted, onMounted} from "vue";
import {NSelect} from "naive-ui";
import type {BaseField} from "@/component";
import {useFormStore} from "@/use/FormStore";
import {empty} from "@/use/Utils";
import axios from "axios";
import {Observer} from "@/use/useTraits";

interface Field extends BaseField {
    value: string|null,
    optionsFromKeyValueField: string,
    options: any,
    concatSeparator: string,
    placeholder: string,
    load: {
        url: string,
        model: string,
        id: string,
        field: string,
        perPage: number,
        filters: string[]
    },
    loadRefs: [{vid: string, name: string, condition: string}],
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

if (provides.options instanceof Array) {
    form.options = provides.options.map(
        (label: any, value: any) => ({label: provides.concatSeparator ? `${value}${provides.concatSeparator}${label}` : label, value})
    )
} else {
    for (const key in provides.options) {
        form.options.push({
            label: provides.options[key],
            value: provides.concatSeparator ? `${provides.options[key]}${provides.concatSeparator}${key}` : key
        })
    }
}

if (provides.optionsFromKeyValueField) {
    store.watchField(provides.formId, provides.optionsFromKeyValueField, (nv: any) => {
        // 过滤空值，封装数据为naive组件的依赖格式
        form.options = nv?.filter((item: any) => !!item.value).map((item: any) =>
            ({
                label: provides.concatSeparator ? `${item.key}${provides.concatSeparator}${item.value}` : item.value,
                value: item.key
            })
        )

        // 当前选中值不在选项中，清除当前值(选项存在覆盖行为)
        if (!form.options?.some((item: any) => item.value === form.value)) {
            form.value = null
        }
    })

    onUnmounted(() => {
        useFormStore().cleanupWatch(provides.formId + provides.optionsFromKeyValueField)
    })
}

const scrolledToBottom: Function[] = []
const loading = ref(false)
function handleScroll(e: Event) {
    for(const callback of scrolledToBottom) {
        callback(e)
    }
}

if (provides.load) {
    let filters: any = {}
    let nextPageUrl: string|null = null
    let preFilters = {}

    async function loadOptions() {
        loading.value = true
        const {data}: {data: {options: [{id: string, field: string}], nextPageUrl: string|null}} = await axios.post(
            nextPageUrl || provides.load.url,
            {
                model: provides.load.model,
                id: provides.load.id,
                field: provides.load.field,
                perPage: provides.load.perPage,
                filters: filters,
            }
        )

        if (nextPageUrl) {
            form.options.push(...data.options.map(item => ({label: item.field, value: item.id})))
        } else {
            form.options = data.options.map(item => ({label: item.field, value: item.id}))
        }

        Object.assign(preFilters, filters)
        loading.value = false

        nextPageUrl = data.nextPageUrl;
    }

    provides.load.filters.forEach(filter => {
        const ref = provides.loadRefs.find(ref => ref.name === filter)!

        useFormStore().watchField(provides.formId, filter, (nv: any) => {
            filters[ref.condition] = nv
            nextPageUrl = null

            loadOptions()
        })

        onUnmounted(() => {
            useFormStore().cleanupWatch(provides.formId + filter)
        })
    })

    if (provides.load.perPage > 0) {
        scrolledToBottom.push((e: Event) => {
            if (loading.value) return

            const currentTarget = e.currentTarget as HTMLElement

            // console.log(currentTarget.scrollTop + currentTarget.offsetHeight)
            // console.log(currentTarget.scrollHeight - 0.5)

            if (nextPageUrl && currentTarget.scrollTop + currentTarget.offsetHeight >= currentTarget.scrollHeight - 0.5) {
                loadOptions()
            }
        })
    }
}

const placement = ref<any>('body')
onMounted(() => {
    placement.value = document.getElementById(provides.vid)!.closest('.layui-layer.layui-layer-page') || 'body'
})

Observer.make(provides.watches, provides.formId, provides.name)
</script>

<template>
    <n-select
        v-model:value="form.value"
        filterable
        clearable
        :placeholder="provides.placeholder"
        :options="form.options"
        :to="placement"
        @scroll="handleScroll"
        :loading="loading"
        :disabled="form.attributes.disabled"
    />

    <span class="help-block" v-if="!empty(provides.help)">
        <i :class="['fa', provides.help.icon]"></i>&nbsp;{{provides.help.text}}
    </span>

    <input v-if="form.attributes.required"
           type="text"
           :required="empty(form.value)"
           :disabled="!empty(form.value)"
           :name="`${form.name}_is_required`"
           style="display: none;">

    <input type="hidden" :name="form.name" :value="form.value">
</template>

<style scoped lang="scss">
</style>
