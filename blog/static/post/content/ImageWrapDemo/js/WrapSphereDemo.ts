module WrapSphereDemo {
    var image: ImageData;
    var context: CanvasRenderingContext2D;
    var myImg: HTMLImageElement = new Image();

    window.onload = function () {
        (<HTMLInputElement>document.getElementById("rangeInput")).onchange = Render;
        myImg.onload = Render;
        myImg.src = "images/worldmap.gif";
    };

    function Render() {
        GenerateImage(myImg);
    }

    function GenerateImage(myImg: HTMLImageElement) {
        var canvasToDrawOn: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("myCanvas");
        var canvasToDrawOnContext: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvasToDrawOn.getContext("2d");

        // Copy the image into a canvas and the get the imagedata
        var offscreenCanvas: HTMLCanvasElement = document.createElement("canvas");
        offscreenCanvas.width = myImg.width;
        offscreenCanvas.height = myImg.height;
        var offscreenContext: CanvasRenderingContext2D = <CanvasRenderingContext2D>offscreenCanvas.getContext("2d");
        offscreenContext.drawImage(myImg, 0, 0);
        var fromImage: ImageData = offscreenContext.getImageData(0, 0, myImg.width, myImg.height);

        // Create a new image with the source image wrapped around a sphere
        var yRotate: number = (parseInt((<HTMLInputElement> document.getElementById("rangeInput")).value) - 31) / 10;
        var xRotate: number = Math.PI / 2;
        var toImage: ImageData = canvasToDrawOnContext.getImageData(0, 0, 50 * 2, 50 * 2);
        var image: ImageData = SphereImageLib.WrapSphere(fromImage, toImage, xRotate, yRotate, 50);
        canvasToDrawOnContext.putImageData(image, 25, 25);
    }
}

module SphereImageLib {
    export function WrapSphere(fromImage: ImageData, toImage: ImageData, xRotate: number, yRotate: number, radius: number): ImageData {
        var coordinates = new SphereMapper(fromImage.width, fromImage.height, xRotate, yRotate, radius);

        // clear image
        for (var i = 0; i < toImage.data.length; i++) {
            toImage.data[i] = 0;
        }

        // map each source pixel to a position on the sphere
        for (var i = 0; i < fromImage.width; i++) {
            for (var j = 0; j < fromImage.height; j++) {
                coordinates.Map(i, j);

                if (coordinates.z > 0) {
                    var fromPixel = new Pixel(fromImage, i, j);
                    var toPixel = new Pixel(toImage, coordinates.x + coordinates.radius, coordinates.y + coordinates.radius);
                    toPixel.Copy(fromPixel);
                }
            }
        }
        return toImage;
    }

    export class RotateResult {
        r1: number;
        r2: number;
    }

    export class SphereMapper {
        xRotate: number;
        yRotate: number;
        width: number;
        height: number;

        radius: number;
        theta0: number = 0.0;
        theta1: number = 2.0 * Math.PI;
        phi0: number = 0.0;
        phi1: number = Math.PI;

        x: number;
        y: number;
        z: number;

        constructor(width: number, height: number, xRotate: number, yRotate: number, radius: number) {
            this.width = width;
            this.height = height;
            this.xRotate = xRotate;
            this.yRotate = yRotate;
            this.radius = radius;
        }

        //// map a pixel to a position on the sphere
        Map(i: number, j: number): void {
            var theta: number = this.MapCoordinate(0.0, this.width - 1, this.theta1, this.theta0, i);
            var phi: number = this.MapCoordinate(0.0, this.height - 1, this.phi0, this.phi1, j);

            this.x = this.radius * Math.sin(phi) * Math.cos(theta);
            this.y = this.radius * Math.sin(phi) * Math.sin(theta);
            this.z = this.radius * Math.cos(phi);

            var result: RotateResult;
            result = this.Rotate(this.xRotate, this.y, this.z);
            this.y = result.r1;
            this.z = result.r2;

            result = this.Rotate(this.yRotate, this.x, this.z);
            this.x = result.r1;
            this.z = result.r2;
        }

        MapCoordinate(i1: number, i2: number, w1: number, w2: number, p: number): number {
            return ((p - i1) / (i2 - i1)) * (w2 - w1) + w1;
        }

        Rotate(angle: number, axisA: number, axisB: number): RotateResult {
            return {
                r1: axisA * Math.cos(angle) - axisB * Math.sin(angle),
                r2: axisA * Math.sin(angle) + axisB * Math.cos(angle)
            };
        }
    }

    export class Pixel {
        image: ImageData;
        index: number;

        constructor(image: ImageData, x: number, y: number) {
            this.image = image;
            this.index = (Math.floor(x) + Math.floor(y) * this.image.width) * 4;
        }

        Copy(from: Pixel): void {
            // Copy Red,Green,Blue,Alpha values
            for (var i = 0; i < 3; i++) {
                this.image.data[this.index + i] = from.image.data[from.index + i];
            }
            this.image.data[this.index + 3] = 255; // Alpha not opaque
        }
    }
}