<script setup lang="ts">
import {ref, inject} from "vue";
import {NSpace, NCheckbox, NCheckboxGroup} from "naive-ui";

interface Field {
  options: Array<any>,
  column: string,
  checked: Array<string|number>,
  disabled: Array<string|number>,
  watch: Array<any>,
}

const provides = inject<Field>('provides')!

interface Option {
  value: string|number,
  attr: {
    name: string,
    disabled: boolean,
  },
}

const options = ref<Array<Option>>()


const value = ref(provides.checked)
const column = ref(provides.column)
const disabled = ref(provides.disabled ?? []);

options.value = provides.options.map((v, k) => {
  return {
    value: k,
    attr: {
      name: v,
      disabled: disabled.value.length > 0 ? disabled.value.includes(k) : false,
    }
  }
})

function change(e: any) {
  document.dispatchEvent(new CustomEvent(`${column.value}:change`, {
    detail: {
      value: [...value.value]
    }
  }))
}

interface Watch {
  type: string
  handler: string
}

const useWatch = provides.watch
useWatch.forEach(({type, handler}: Watch) => {
  document.addEventListener(type, ({detail}: CustomEventInit) => Function(handler)()(
      {
        setDisabled(set: Array<number | string>, rmChecked = false) {
          disabled.value = [...set]
          options.value = options.value?.map(item => {
            return {
              value: item.value,
              attr: {
                name: item.attr.name,
                disabled: disabled.value.includes(item.value)
              }
            }
          })

          if (rmChecked) {
            value.value = value.value.filter(item => !disabled.value.includes(item))
          }
        },
        getDisabled() {
          return [...disabled.value]
        },
      },
      [...detail.value]
  ))
})

</script>

<template>
  <n-checkbox-group v-model:value="value" @change="change($event)">
    <n-space item-style="display: flex;">
      <template v-for="option of options" :key="k">
        <n-checkbox :value="option.value" :label="option.attr.name" size="medium" :disabled="option.attr.disabled"></n-checkbox>
      </template>
    </n-space>
  </n-checkbox-group>

  <template v-for="v of value">
    <input type="hidden" :name="column + '[]'" :value="v">
  </template>
</template>

<style>
</style>
