import sharp from 'sharp';
import { Exception } from '../Core';
const fs = require('fs');

export class Image {
    static GRAVITY_CENTER = 'center';
    static GRAVITY_TOP_LEFT = 'northwest';
    static GRAVITY_TOP = 'north';
    static GRAVITY_TOP_RIGHT = 'northeast';
    static GRAVITY_LEFT = 'west';
    static GRAVITY_RIGHT = 'east';
    static GRAVITY_BOTTOM_LEFT = 'southwest';
    static GRAVITY_BOTTOM = 'south';
    static GRAVITY_BOTTOM_RIGHT = 'southeast';

    private image: sharp.Sharp;
    private width: number;
    private height: number;
    private cornerRadius: number = 0;
    private borderWidth: number = 0;
    private borderColor: string = '';
    private rotation: number = 0;

    constructor(data: Buffer) {
        this.image = sharp(data);
        this.image.metadata().then(metadata => {
            this.width = metadata.width || 0;
            this.height = metadata.height || 0;
        });
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

    async crop(width: number, height: number, gravity: string = Image.GRAVITY_CENTER): Promise<this> {
        await this.image.extract({ width, height, left: 0, top: 0 }).toBuffer();
        this.width = width;
        this.height = height;
        return this;
    }

    setBorder(borderWidth: number, borderColor: string): this {
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
        // Sharp does not directly support border, so this would need a workaround
        return this;
    }

    setBorderRadius(cornerRadius: number): this {
        this.cornerRadius = cornerRadius;
        // Sharp does not directly support rounded corners, so this would need a workaround
        return this;
    }

    setOpacity(opacity: number): this {
        // Sharp does not directly support setting opacity, so this would need a workaround
        return this;
    }

    setRotation(degree: number): this {
        this.rotation = degree;
        this.image.rotate(degree);
        return this;
    }

    setBackground(color: any): this {
        this.image.flatten({ background: color });
        return this;
    }

    async output(type: string, quality: number = 75): Promise<Buffer | null> {
        return this.save(null, type, quality) as any;
    }

    async save(path: string | null = null, type: string = '', quality: number = 75): Promise<Buffer | void> {
        let format = this.image;
        switch (type) {
            case 'jpg':
            case 'jpeg':
                format = this.image.jpeg({ quality });
                break;
            case 'png':
                format = this.image.png({ quality });
                break;
            case 'webp':
                format = this.image.webp({ quality });
                break;
            default:
                throw new Exception('Invalid output type given');
        }

        if (path) {
            await format.toFile(path);
        } else {
            return await format.toBuffer();
        }
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