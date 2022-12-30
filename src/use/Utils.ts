export const useNum2el = (num: number) => {
    let front = ''

    let floor = Math.floor(num / 26)
    if (floor > 0) {
        front = useNum2el(floor - 1)

        num = num % 26
    }

    let last = String.fromCharCode(65 + num)

    return front + last
}

export class Debounce {
    private static instance: Debounce
    private timeouts: any = {}

    addMark(mark: string, timeout: number) {
        this.timeouts[mark] = timeout
    }

    static debounce(mark: string, handler: Function, time: number = 500) {
        const instance = Debounce.getInstance()

        if (instance.timeouts[mark]) {
            clearTimeout(instance.timeouts[mark])
        }

        instance.addMark(mark, setTimeout(handler, time))
    }

    static getInstance() {
        if (!Debounce.instance) {
            Debounce.instance = new Debounce()
        }

        return Debounce.instance
    }
}
