
import { Imagick, ImagickDraw, ImagickPixel } from 'imagick';
import { Exception } from '../Core';
const fs = require('fs');
const { execSync } = require('child_process');

export class Image {
    static GRAVITY_CENTER = 'center';
    static GRAVITY_TOP_LEFT = 'top-left';
    static GRAVITY_TOP = 'top';
    static GRAVITY_TOP_RIGHT = 'top-right';
    static GRAVITY_LEFT = 'left';
    static GRAVITY_RIGHT = 'right';
    static GRAVITY_BOTTOM_LEFT = 'bottom-left';
    static GRAVITY_BOTTOM = 'bottom';
    static GRAVITY_BOTTOM_RIGHT = 'bottom-right';

    private image: Imagick;
    private width: number;
    private height: number;
    private cornerRadius: number = 0;
    private borderWidth: number = 0;
    private borderColor: string = '';
    private rotation: number = 0;

    constructor(data: string) {
        this.image = new Imagick();
        this.image.readImageBlob(data);
        this.image.setFirstIterator();

        this.width = this.image.getImageWidth();
        this.height = this.image.getImageHeight();

        const orientationType = this.image.getImageProperties()['exif:Orientation'] || null;

        if (orientationType) {
            switch (orientationType) {
                case '3':
                    this.rotation = 180;
                    break;
                case '6':
                    this.rotation = 90;
                    break;
                case '8':
                    this.rotation = -90;
                    break;
            }
        }
    }

    static getGravityTypes(): string[] {
        return [
            Image.GRAVITY_CENTER,
            Image.GRAVITY_TOP_LEFT,
            Image.GRAVITY_TOP,
            Image.GRAVITY_TOP_RIGHT,
            Image.GRAVITY_LEFT,
            Image.GRAVITY_RIGHT,
            Image.GRAVITY_BOTTOM_LEFT,
            Image.GRAVITY_BOTTOM,
            Image.GRAVITY_BOTTOM_RIGHT,
        ];
    }

    crop(width: number, height: number, gravity: string = Image.GRAVITY_CENTER): this {
        const originalAspect = this.width / this.height;

        if (!width) {
            width = Math.floor(height * originalAspect);
        }

        if (!height) {
            height = Math.floor(width / originalAspect);
        }

        if (!height && !width) {
            height = this.height;
            width = this.width;
        }

        let resizeWidth = this.width;
        let resizeHeight = this.height;
        if (gravity !== Image.GRAVITY_CENTER) {
            if (width > height) {
                resizeWidth = width;
                resizeHeight = Math.floor(width * originalAspect);
            } else {
                resizeWidth = Math.floor(height * originalAspect);
                resizeHeight = height;
            }
        }

        let x = 0, y = 0;
        switch (gravity) {
            case Image.GRAVITY_TOP_LEFT:
                x = 0;
                y = 0;
                break;
            case Image.GRAVITY_TOP:
                x = (resizeWidth / 2) - (width / 2);
                break;
            case Image.GRAVITY_TOP_RIGHT:
                x = resizeWidth - width;
                break;
            case Image.GRAVITY_LEFT:
                y = (resizeHeight / 2) - (height / 2);
                break;
            case Image.GRAVITY_RIGHT:
                x = resizeWidth - width;
                y = (resizeHeight / 2) - (height / 2);
                break;
            case Image.GRAVITY_BOTTOM_LEFT:
                x = 0;
                y = resizeHeight - height;
                break;
            case Image.GRAVITY_BOTTOM:
                x = (resizeWidth / 2) - (width / 2);
                y = resizeHeight - height;
                break;
            case Image.GRAVITY_BOTTOM_RIGHT:
                x = resizeWidth - width;
                y = resizeHeight - height;
                break;
            default:
                x = (resizeWidth / 2) - (width / 2);
                y = (resizeHeight / 2) - (height / 2);
                break;
        }
        x = Math.floor(x);
        y = Math.floor(y);

        if (this.image.getImageFormat() === 'GIF') {
            this.image = this.image.coalesceImages();

            for (const frame of this.image) {
                if (gravity === Image.GRAVITY_CENTER) {
                    frame.cropThumbnailImage(width, height);
                } else {
                    frame.scaleImage(resizeWidth, resizeHeight, false);
                    frame.cropImage(width, height, x, y);
                    frame.thumbnailImage(width, height);
                }
            }

            this.image.deconstructImages();
        } else {
            for (const frame of this.image) {
                if (gravity === Image.GRAVITY_CENTER) {
                    this.image.cropThumbnailImage(width, height);
                } else {
                    this.image.scaleImage(resizeWidth, resizeHeight, false);
                    this.image.cropImage(width, height, x, y);
                }
            }
        }
        this.height = height;
        this.width = width;

        return this;
    }

    setBorder(borderWidth: number, borderColor: string): this {
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;

        if (this.cornerRadius) {
            return this;
        }
        this.image.borderImage(borderColor, borderWidth, borderWidth);

        return this;
    }

    setBorderRadius(cornerRadius: number): this {
        const mask = new Imagick();
        mask.newImage(this.width, this.height, new ImagickPixel('transparent'), 'png');

        const rectwidth = (this.borderWidth > 0 ? (this.width - (this.borderWidth + 1)) : this.width - 1);
        const rectheight = (this.borderWidth > 0 ? (this.height - (this.borderWidth + 1)) : this.height - 1);

        const shape = new ImagickDraw();
        shape.setFillColor(new ImagickPixel('black'));
        shape.roundRectangle(this.borderWidth, this.borderWidth, rectwidth, rectheight, cornerRadius, cornerRadius);

        mask.drawImage(shape);
        this.image.compositeImage(mask, Imagick.COMPOSITE_DSTIN, 0, 0);

        if (this.borderWidth > 0) {
            const bc = new ImagickPixel();
            bc.setColor(this.borderColor);

            const strokeCanvas = new Imagick();
            strokeCanvas.newImage(this.width, this.height, new ImagickPixel('transparent'), 'png');

            const shape2 = new ImagickDraw();
            shape2.setFillColor(new ImagickPixel('transparent'));
            shape2.setStrokeWidth(this.borderWidth);
            shape2.setStrokeColor(bc);
            shape2.roundRectangle(this.borderWidth, this.borderWidth, rectwidth, rectheight, cornerRadius, cornerRadius);

            strokeCanvas.drawImage(shape2);
            strokeCanvas.compositeImage(this.image, Imagick.COMPOSITE_DEFAULT, 0, 0);

            this.image = strokeCanvas;
        }

        return this;
    }

    setOpacity(opacity: number): this {
        if (opacity === 1) {
            return this;
        }
        this.image.setImageAlpha(opacity);

        return this;
    }

    setRotation(degree: number): this {
        if (degree === 0) {
            return this;
        }

        this.image.rotateImage('transparent', degree);

        return this;
    }

    setBackground(color: any): this {
        this.image.setImageBackgroundColor(color);
        this.image = this.image.mergeImageLayers(Imagick.LAYERMETHOD_FLATTEN);

        return this;
    }

    output(type: string, quality: number = 75): string | false | null {
        return this.save(null, type, quality) as any;
    }

    save(path: string | null = null, type: string = '', quality: number = 75): string | void {
        if (path !== null && !fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }

        if (this.rotation !== 0) {
            this.image.rotateImage('transparent', this.rotation);
        }

        switch (type) {
            case 'jpg':
            case 'jpeg':
                this.image.setImageCompressionQuality(quality);
                this.image.setImageFormat('jpg');
                break;

            case 'gif':
                this.image.setImageFormat('gif');
                break;

            case 'webp':
                try {
                    this.image.setImageCompressionQuality(quality);
                    this.image.setImageFormat('webp');
                } catch (e) {
                    const signature = this.image.getImageSignature();
                    const temp = `/tmp/temp-${signature}.${this.image.getImageFormat().toLowerCase()}`;
                    const output = `/tmp/output-${signature}.webp`;

                    this.image.writeImages(temp, true);
                    execSync(`cwebp -quiet -metadata none -q ${quality} ${temp} -o ${output}`);

                    const data = fs.readFileSync(output);

                    if (!path) {
                        return data.toString();
                    } else {
                        fs.writeFileSync(path, data);
                    }

                    this.image.clear();
                    this.image.destroy();

                    fs.unlinkSync(output);
                    fs.unlinkSync(temp);

                    return;
                }
                break;

            case 'png':
                const scaleQuality = Math.round((quality / 100) * 9);
                const invertScaleQuality = 9 - scaleQuality;

                this.image.setImageCompressionQuality(invertScaleQuality);
                this.image.setImageFormat('png');
                break;

            default:
                throw new Exception('Invalid output type given');
        }

        if (!path) {
            return this.image.getImagesBlob();
        } else {
            this.image.writeImages(path, true);
        }

        this.image.clear();
        this.image.destroy();
    }

    protected getSizeByFixedHeight(newHeight: number): number {
        const ratio = this.width / this.height;
        const newWidth = newHeight * ratio;

        return Math.floor(newWidth);
    }

    protected getSizeByFixedWidth(newWidth: number): number {
        const ratio = this.height / this.width;
        const newHeight = newWidth * ratio;

        return Math.floor(newHeight);
    }
}