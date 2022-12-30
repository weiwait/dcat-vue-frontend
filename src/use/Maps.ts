import axios from "axios";
import type {Ref} from "vue";
import {Debounce} from "@/use/Utils";

abstract class Map {
    protected Map: any
    protected Marker: any
    protected lng: Ref
    protected lat: Ref
    protected detail: Ref
    protected zoom: Ref
    protected container: string = ''
    protected urls: {address2ll: string, ll2address: string}
    protected addressUpdatedHandler: Function;

    constructor(container: string, urls: any, addressUpdatedHandler: Function, lat: Ref, lng: Ref, detail: Ref, zoom: Ref) {
        this.container = container
        this.urls = urls
        this.addressUpdatedHandler = addressUpdatedHandler

        this.lat = lat
        this.lng = lng
        this.detail = detail
        this.zoom = zoom

        if (!this.lat.value) {
            navigator.geolocation.getCurrentPosition(position => {
                this.lat.value = position.coords.latitude
                this.lng.value = position.coords.longitude

                this.setCenter().markerPosition()
            }, positionError => {
                console.log(positionError)
            })
        }
    }

    address2ll(address: string): Promise<{lat: number, lng: number}> {
        return new Promise(resolve => {
            axios.get(this.urls.address2ll, {params: {address: address}}).then(({data}: any) => {
                resolve(data.result.location)
            })
        })
    }

    ll2address(lat: number, lng: number): Promise<any> {
        return new Promise(resolve => {
            axios.get(this.urls.ll2address, {params: {lat, lng}}).then(({data}: any) => {
                resolve(data.result)
            })
        })
    }

    abstract setCenter(lat?: number|null, lng?: number|null): this

    abstract markerPosition(lat?: number|null, lng?: number|null): this

    abstract destroy(): void

    abstract getLat(lat?: number|null): number

    abstract getLng(lng?: number|null): number
}

export class WeMap extends Map {
    constructor(container: string, urls: any, addressUpdatedHandler: Function, lat: Ref, lng: Ref, detail: Ref, zoom: Ref) {
        super(container, urls, addressUpdatedHandler, lat, lng, detail, zoom);
        // @ts-ignore
        this.Map = new TMap.Map(document.getElementById(this.container), {
            // @ts-ignore
            center: new TMap.LatLng(this.getLat(), this.getLng()), // 设置地图中心点坐标
            zoom: zoom.value,   //设置地图缩放级别
        });

        // @ts-ignore
        this.Marker = new TMap.MultiMarker({
            map: this.Map,
            geometries: [{
                id: 'position',
                // @ts-ignore
                position: new TMap.LatLng(this.getLat(), this.getLng())
            }]
        })

        this.Map.on('click', (e: any) => {
            this.markerPosition(e.latLng.lat, e.latLng.lng)
            this.toLatLngLocation(e.latLng.lat, e.latLng.lng)
        })

        this.Map.on('zoom', () => {
            Debounce.debounce(this.container + '-zoom', () => {
                zoom.value = this.Map.getZoom()
            })
        })
    }

    setCenter(lat: number|null = null, lng: number|null = null): this {
        // @ts-ignore
        this.Map.setCenter(new TMap.LatLng(this.getLat(lat), this.getLng(lng)))

        return this;
    }

    markerPosition(lat: number|null = null, lng: number|null = null): this {
        let position = this.Marker.getGeometryById('position');
        Object.assign(position, {
            // @ts-ignore
            position: new TMap.LatLng(this.getLat(lat), this.getLng(lng)),
        });

        this.Marker.updateGeometries([position])

        return this;
    }

    getLat(lat: number|null) {
        return lat || this.lat.value || 39.984120
    }

    getLng(lng: number|null) {
        return lng || this.lng.value || 116.307484
    }

    toAddressLocation(address: string) {
        // @ts-ignore
        this.address2ll(address).then(({lat, lng}) => {
            this.setCenter(lat, lng).markerPosition(lat, lng)
        })

        return this
    }

    toLatLngLocation(lat: number|null = null, lng: number|null) {
        // @ts-ignore
        this.ll2address(this.getLat(lat), this.getLng(lng)).then(({ad_info, pois}) => {
            this.addressUpdatedHandler(ad_info.adcode)
            if (lat) this.lat.value = lat
            if (lng) this.lng.value = lng

            const first = pois[0]
            if (first) {
                this.detail.value = (first.address + first.title).replace(first.ad_info.province + first.ad_info.city + first.ad_info.district, '') ?? null
            }
        })

        return this
    }

    destroy() {
        this.Map.destroy()
    }
}
