import Cropper from "cropperjs";

export class useCropper {
    private cropper: Cropper|null = null;
    private done: Function;
    private src: string;
    private opened: string | File;
    private index: number | null;

    constructor(img: HTMLImageElement, src: string, done: Function, opened: string | File, index: number | null = null) {
        this.done = done
        this.src = src
        this.opened = opened
        this.index = index

        new Promise<void>((resolve, reject) => {
            img.onload = () => resolve()
            img.onerror = () => reject()

            img.src = src
        }).then(() => {
            this.cropper = new Cropper(img, {
                checkCrossOrigin: false
            })
        })
    }

    crop() {
        this.cropper!.getCroppedCanvas().toBlob(blob => {
            this.done(blob)
        })
    }

    targetUp() {
        this.cropper!.move(0, -10)
    }

    targetDown() {
        this.cropper!.move(0, 10)
    }

    targetLeft() {
        this.cropper!.move(-10, 0)
    }

    targetRight() {
        this.cropper!.move(10, 0)
    }
    
    reset() {
        this.cropper!.reset()
    }
    
    original() {
        if (this.opened instanceof File) {
            return this.done(this.opened)
        }

        this.done(false)
    }

    delete(handler: Function) {
        handler(this.index)
    }
}
