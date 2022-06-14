import Cropper from "cropperjs";

export class useCropper {
    private cropper: Cropper|null = null;
    private done: Function;
    private src: string;
    constructor(img: HTMLImageElement, src: string, done: Function) {
        this.done = done
        this.src = src

        new Promise<void>((resolve, reject) => {
            img.onload = () => resolve()
            img.onerror = () => reject()

            img.style.visibility = 'hidden'
            img.src = src
        }).then(() => {
            this.cropper = new Cropper(img)
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
        
    }
}
