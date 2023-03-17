import type {Ref} from "vue";
import {useFormStore} from "@/use/FormStore";
import type {BaseField, Watch} from "@/component";
import {isRef, onBeforeUnmount, unref} from "vue";
import type {ReactiveVariable} from "vue/macros";
import type {Store} from "pinia";

export class Observer {
    private wids: string[] = []

    public static make(watches: Watch[]): Observer {
        const instance = new Observer()

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

            store.watchField(item.field, (nv: any) => {
                Function(`return ${item.handler}`)()(nv, store.getForm(item.field), store)
            }, wid)
        })
    }

    clear() {
        this.wids.forEach(wid => useFormStore().cleanupWatch(wid))
    }
}
