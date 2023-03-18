import {useFormStore} from "@/use/FormStore";
import type {Watch} from "@/component";
import {onBeforeUnmount} from "vue";

export class Observer {
    private wids: string[] = []
    private fid: string = ''
    private field: string = ''

    public static make(watches: Watch[], fid: string, field: string): Observer|void {
        if (!watches) return void(0)

        const instance = new Observer()
        instance.fid = fid
        instance.field = field

        instance.watch(watches)

        onBeforeUnmount(() => {
            instance.clear()
        })

        return instance
    }

    watch(watches: Watch[]) {
        const store = useFormStore()

        watches?.forEach(item => {
            const wid = 'wid' + Math.random().toString(36).slice(-8)
            this.wids.push(wid)

            store.watchField(this.fid, item.target, (nv: any) => {
                Function(`return ${item.handler}`)()(
                    nv,
                    store.getForm(this.fid, this.field),
                    {forms: store.getForm(this.fid), request: store.request}
                )
            }, wid)
        })
    }

    clear() {
        this.wids.forEach(wid => useFormStore().cleanupWatch(wid))
    }
}
