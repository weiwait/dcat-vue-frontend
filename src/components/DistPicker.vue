<script setup lang="ts">
import {ref, inject, onMounted, onUnmounted, reactive} from "vue";
import {
    NSpace,
    NSelect,
    NInput,
    NInputGroup,
} from "naive-ui";
import axios from "axios";
import {WeMap} from "@/use/Maps";
import {empty} from "@/use/Utils";
import {useFormStore} from "@/use/FormStore";
import {Observer} from "@/use/useTraits";
import type {BaseField} from "@/component";

interface Field extends BaseField{
    vid: string,
    value: any,
    areaId: string;
    options: Array<string>,
    provinceField: string,
    cityField: string,
    districtField: string,
    latField: string,
    lngField: string,
    detailField: string,
    height: number,
    disableMap: boolean,
    zoom: number,
    zoomField: string,
    attributes: any,
    disables: number[],
    urls: {
        address2ll: string,
        ll2address: string,
        regions: string,
    },
    help: { icon: string, text: string },
}

const provides = inject<Field>('provides')!
const store = useFormStore();
const form = store.initializer(
    provides.formId,
    provides.name,
    null,
    provides.attributes.required || false,
    provides.attributes.disabled || false
)

const values = {...provides.value}

const province = ref<number | null>(values[provides.provinceField] * 1 || null)
const city = ref<number | null>(values[provides.cityField] * 1 || null)
const district = ref<number | null>(values[provides.districtField] * 1 || null)
const detail = ref<string | null>(values[provides.detailField] || null)
const lat = ref<string | null>(values[provides.latField] || null)
const lng = ref<string | null>(values[provides.lngField] || null)
const zoom = ref<number>(values[provides.zoomField] * 1 || provides.zoom)

form[provides.provinceField] = province
form[provides.cityField] = city
form[provides.districtField] = district
form[provides.detailField] = detail
form[provides.latField] = lat
form[provides.lngField] = lng
form[provides.zoomField] = zoom

const regions: any = {}
const height = provides.height

form.disables = ref(provides.disables || [])
async function getRegions(pcode: string) {
    if (regions.hasOwnProperty(pcode)) {
        return regions[pcode]
    }

    const {data} = await axios.get(provides.urls.regions, {params: {pcode}})

    regions[pcode] = data.items.map((item: any) => {
        if (form.disables.includes(item.value)) {
            item['disabled'] = true
        }

        return item
    })

    return data.items
}

const provinces = ref<any>()
getRegions('0').then(items => provinces.value = items)

function provinceName() {
    return provinces.value.find((item: any) => item.value === province.value)?.label
}

const cities = ref<any>([])
province.value && getRegions(String(province.value)).then(items => cities.value = items)

function provinceUpdatedHandler(selected: string, cityCode: string = '') {
    getRegions(selected).then(items => cities.value = items)
    city.value = null

    districts.value = []
    district.value = null
}

function cityName() {
    return cities.value.find((item: any) => item['value'] == city.value)?.label
}

const districts = ref<any>([])
city.value && getRegions(String(city.value)).then(items => districts.value = items)

function cityUpdatedHandler(selected: string, districtCode: string = '', refresh: boolean = true) {
    getRegions(selected).then(items => districts.value = items)
    district.value = null

    refresh && map?.toAddressLocation(provinceName() + cityName() + districtName())
}

function districtName() {
    return districts.value.find((item: any) => item['value'] == district.value)?.label
}

function districtUpdatedHandler(selected: string) {
    map?.toAddressLocation(provinceName() + cityName() + districtName())
}

function updatingByMap(districtCode: string) {
    if (!districtCode) return 0

    getRegions(districtCode.slice(0, 4) + '00').then(items => {
        districts.value = items
        const currentDistrict = items.find((item: any) => item.value == districtCode)
        district.value = currentDistrict.value

        getRegions(String(currentDistrict.pcode).slice(0, 2) + '0000').then(cityItems => {
            cities.value = cityItems
            city.value = currentDistrict.pcode

            const currentCity = cityItems.find((item: any) => item.value == city.value)
            province.value = currentCity.pcode
        })
    })
}

let map: any = null
function latUpdatedHandler() {
    map?.toLatLngLocation(lat.value, lng.value).setCenter().markerPosition()
}

function lngUpdatedHandler() {
    map?.toLatLngLocation(lat.value, lng.value).setCenter()
}

function detailUpdatedHandler() {
    map?.toAddressLocation(provinceName() + cityName() + districtName() + detail.value)
}

function initMap() {
    map = new WeMap(provides.areaId, provides.urls, updatingByMap, lat, lng, detail, zoom)
}

// 销毁实例
onMounted(() => {
    if (!provides.disableMap) {
        window.addEventListener('imported.map.wemap', initMap, {once: true})
        window.dispatchEvent(new CustomEvent('import.map.wemap'))
    }
})

onUnmounted(() => {
    map?.destroy()
})

Observer.make(provides.watches, provides.formId, provides.name)
</script>

<template>
    <n-space>
        <n-select
            v-if="provides.provinceField || provides.cityField || provides.districtField"
            v-model:value="province"
            filterable
            clearable
            placeholder="-- 省 --"
            :options="provinces"
            :consistent-menu-width="false"
            @update:value="provinceUpdatedHandler"
            :disabled="form.attributes.disabled"
        />
        <n-select
            v-if="provides.provinceField || provides.cityField || provides.districtField"
            v-model:value="city"
            filterable
            clearable
            placeholder="-- 市 --"
            :options="cities"
            :consistent-menu-width="false"
            @update:value="cityUpdatedHandler"
            :disabled="form.attributes.disabled"
        />
        <n-select
            v-if="provides.provinceField || provides.cityField || provides.districtField"
            v-model:value="district"
            filterable
            clearable
            placeholder="-- 区/县 --"
            :options="districts"
            :consistent-menu-width="false"
            @update:value="districtUpdatedHandler"
            :disabled="form.attributes.disabled"
        />
        <n-input-group v-if="provides.latField">
            <n-input
                placeholder="纬度"
                v-model:value="lat"
                @keydown.enter.prevent="latUpdatedHandler"
                :disabled="form.attributes.disabled"
            ></n-input>
            <n-input
                placeholder="经度"
                v-model:value="lng"
                @keydown.enter.prevent="lngUpdatedHandler"
                :disabled="form.attributes.disabled"
            ></n-input>
        </n-input-group>
    </n-space>

    <n-input v-if="provides.detailField" placeholder="详细地址"
             v-model:value="detail"
             autosize
             clearable
             style="margin-top: 18px; min-width: 50%;"
             @keydown.enter.prevent="detailUpdatedHandler"
             :disabled="form.attributes.disabled"
    ></n-input>

    <div v-if="!provides.disableMap" :id="provides.areaId" class="map-container"></div>

    <span class="help-block" v-if="!empty(provides.help)">
        <i :class="['fa', provides.help.icon]"></i>&nbsp;{{provides.help.text}}
    </span>

    <input v-if="provides.provinceField" type="hidden" :name="provides.provinceField" :value="province">
    <input v-if="provides.cityField" type="hidden" :name="provides.cityField" :value="city">
    <input v-if="provides.districtField" type="hidden" :name="provides.districtField" :value="district">
    <input v-if="provides.detailField" type="hidden" :name="provides.detailField" :value="detail">
    <input v-if="provides.latField" type="hidden" :name="provides.latField" :value="lat">
    <input v-if="provides.lngField" type="hidden" :name="provides.lngField" :value="lng">
    <input v-if="provides.zoomField" type="hidden" :name="provides.zoomField" :value="zoom">
</template>

<style lang="scss">
.map-container {
    margin-top: 18px;
    height: v-bind("height");

    canvas {
        border-radius: 10px;
        box-shadow: 1px 1px 6px #aaa;
    }
}
</style>
