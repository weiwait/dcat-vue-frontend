<script setup lang="ts">
import {NInput, NTable, NSpace, NButton} from 'naive-ui'
import {reactive, ref, inject, watch} from "vue";
import {useFormStore} from "@/use/FormStore";
import type {BaseField} from "@/component";


type Attribute = {
    code: string,
    name: string,
}

type Specification = {
    code: string,
    name: string,
    attributes: Attribute[]
}

type Combination = [Attribute[]?]

type Sku = {
    code: string,
    [key: string]: any
}

type Field = BaseField &  {
    value: {
        specifications: Specification[],
        skus: Sku[]
    }
}

const provides = inject<Field>('provides')!
const store = useFormStore()

const form = store.initializer(
    provides.formId,
    provides.name,
    null,
    provides.attributes.required || false,
    provides.attributes.disabled || false
)

form.value = provides.value || {
    specifications: [],
    skus: [],
}

watch(form.value.specifications, () => {
    form['combination'] = combiningSpecifications(form.value.specifications)
    form.value.skus = buildSkus()
})

function combiningSpecifications([first, ...surplus]: Specification[], combination: Combination = [[]]): Combination
{
    if (undefined === first && !surplus.length) {
        return combination
    }

    let tmp: Combination = []
    combination.forEach(item => {
        first.attributes.forEach(attribute => {
            attribute.name.length && tmp.push(item!.concat(attribute))
        })
    });

    return combiningSpecifications(surplus, tmp)
}

function buildSkus(): Sku[]
{
    let skus: Sku[] = []
    form['combination']?.forEach((item: Attribute[]) => {
        skus.push({
            code: item.map(attribute => attribute.code).join(''),
            attributes: item,
            price: '',
            stock: 0
        })
    })

    return skus
}

function onFocusedSpec()
{
    form.value.specifications.push({
        code: Math.random().toString(),
        name: '',
        attributes: []
    })
}


const specInput = ref('')
function onBlurredSpec()
{
    if (specInput.value.length === 0) {
        form.value.specifications.pop()
    } else {
        addAttribute(form.value.specifications.at(-1)!.attributes)
    }

    specInput.value = ''
}

function onInputSpec(spec: string)
{
    form.value.specifications.at(-1)!.name = spec
}

function addAttribute(attributes: Attribute[])
{
    const last = attributes.at(-1)
    if (attributes.length < 1 || (last && last.name.length > 0)) {
        attributes.push({
            code: Math.random().toString(),
            name: ''
        })
    }
}
</script>

<template>
    <div class="sku-container">
        <n-table :single-line="false" style="border-radius: 18px 18px 0 0; border-bottom: none;">
            <thead>
            <tr>
                <th style="width: 8em">规格</th>
                <th>属性</th>
                <th style="width: 12em">
                    <n-input
                        clearable
                        placeholder="新建规格"
                        v-model:value="specInput"
                        @focus="onFocusedSpec"
                        @blur="onBlurredSpec"
                        @input="onInputSpec"
                    ></n-input>
                </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="specification in form.value.specifications" :key="specification.code">
                <td>{{specification.name}}</td>
                <td colspan="2">
                    <div class="attribute-container" v-show="specification.name">
                        <div class="attribute" v-for="attribute in specification.attributes" :key="attribute.code">
                            <n-input
                                placeholder="新建属性"
                                v-model:value="attribute.name"
                            ></n-input>
                        </div>

                        <div class="attribute">
                            <n-button @click="addAttribute(specification.attributes)">+</n-button>
                        </div>
                    </div>
                </td>
            </tr>
            </tbody>
        </n-table>
        <n-table :single-line="false" style="border-radius: 0 0 18px 18px">
            <thead>
            <tr>
                <th v-for="specification in form.value.specifications" :key="specification.code">{{specification.name}}</th>
                <th>价格</th>
                <th>库存</th>
            </tr>
            </thead>

            <tbody>
            <tr v-for="sku in form.value.skus" :key="sku.code">
                <td v-for="attribute in sku.attributes">{{attribute.name}}</td>
                <td>{{sku.price}}</td>
                <td>{{sku.stock}}</td>
            </tr>
            </tbody>
        </n-table>
    </div>
</template>

<style scoped lang="scss">
.sku-container {
  border-radius: 18px;
  background-color: #f3f3f3;
  box-shadow: 2px 2px 6px 2px #d6d6d6;
}

.attribute-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(8em, 1fr));
    gap: 1em;
}
</style>