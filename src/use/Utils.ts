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


