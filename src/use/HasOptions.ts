import axios from "axios";
import {useFormStore} from "@/use/FormStore";
import type {Ref} from "vue";

export default class HasOptions {
    private filters: any = {}
    private nextPageUrl: string | null = null
    private preFilters = {}
    private load
    private options

    constructor(
        load: {
            url: string,
            model: string,
            id: string,
            field: string,
            perPage: number,
            filters: string[]
        },
        loadRefs: [{vid: string, name: string, condition: string}],
        scrolledToBottom: Function[],
        loading: Ref,
        options: Ref
    ) {
        this.load = load
        this.options = options
        const store = useFormStore()

        load.filters.forEach(filter => {
            const ref = loadRefs.find(ref => ref.name === filter)!

            store.watchField(ref.name, (nv: any) => {
                this.filters[ref.condition] = nv
                this.nextPageUrl = null

                this.loadOptions(loading)
            })
        })

        if (load.perPage > 0) {
            scrolledToBottom.push((e: Event) => {
                if (loading.value) return

                const currentTarget = e.currentTarget as HTMLElement

                // console.log(currentTarget.scrollTop + currentTarget.offsetHeight)
                // console.log(currentTarget.scrollHeight - 0.5)

                if (this.nextPageUrl && currentTarget.scrollTop + currentTarget.offsetHeight >= currentTarget.scrollHeight - 0.5) {
                    this.loadOptions(loading)
                }
            })
        }
    }

    private async loadOptions(loading: Ref) {
        loading.value = true
        const {data}: { data: { options: [{ id: string, field: string }], nextPageUrl: string | null } } = await axios.post(
            this.nextPageUrl || this.load.url,
            {
                model: this.load.model,
                id: this.load.id,
                field: this.load.field,
                perPage: this.load.perPage,
                filters: this.filters,
            }
        )

        if (this.nextPageUrl) {
            this.options.value.push(...data.options.map(item => ({label: item.field, value: item.id})))
        } else {
            this.options.value = data.options.map(item => ({label: item.field, value: item.id}))
        }

        Object.assign(this.preFilters, this.filters)
        loading.value = false

        this.nextPageUrl = data.nextPageUrl;
    }
}
