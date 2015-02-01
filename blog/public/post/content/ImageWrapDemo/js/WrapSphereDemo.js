var WrapSphereDemo;
(function (WrapSphereDemo) {
    var image;
    var context;
    var myImg = new Image();

    window.onload = function () {
        document.getElementById("rangeInput").onchange = Render;
        myImg.onload = Render;
        myImg.src = "images/worldmap.gif";
    };

    function Render() {
        GenerateImage(myImg);
    }

    function GenerateImage(myImg) {
        var canvasToDrawOn = document.getElementById("myCanvas");
        var canvasToDrawOnContext = canvasToDrawOn.getContext("2d");

        // Copy the image into a canvas and the get the imagedata
        var offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = myImg.width;
        offscreenCanvas.height = myImg.height;
        var offscreenContext = offscreenCanvas.getContext("2d");
        offscreenContext.drawImage(myImg, 0, 0);
        var fromImage = offscreenContext.getImageData(0, 0, myImg.width, myImg.height);

        // Create a new image with the source image wrapped around a sphere
        var yRotate = (parseInt(document.getElementById("rangeInput").value) - 31) / 10;
        var xRotate = Math.PI / 2;
        var toImage = canvasToDrawOnContext.getImageData(0, 0, 50 * 2, 50 * 2);
        var image = SphereImageLib.WrapSphere(fromImage, toImage, xRotate, yRotate, 50);
        canvasToDrawOnContext.putImageData(image, 25, 25);
    }
})(WrapSphereDemo || (WrapSphereDemo = {}));

var SphereImageLib;
(function (SphereImageLib) {
    function WrapSphere(fromImage, toImage, xRotate, yRotate, radius) {
        var coordinates = new SphereMapper(fromImage.width, fromImage.height, xRotate, yRotate, radius);

        for (var i = 0; i < toImage.data.length; i++) {
            toImage.data[i] = 0;
        }

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
    SphereImageLib.WrapSphere = WrapSphere;

    var RotateResult = (function () {
        function RotateResult() {
        }
        return RotateResult;
    })();
    SphereImageLib.RotateResult = RotateResult;

    var SphereMapper = (function () {
        function SphereMapper(width, height, xRotate, yRotate, radius) {
            this.theta0 = 0.0;
            this.theta1 = 2.0 * Math.PI;
            this.phi0 = 0.0;
            this.phi1 = Math.PI;
            this.width = width;
            this.height = height;
            this.xRotate = xRotate;
            this.yRotate = yRotate;
            this.radius = radius;
        }
        //// map a pixel to a position on the sphere
        SphereMapper.prototype.Map = function (i, j) {
            var theta = this.MapCoordinate(0.0, this.width - 1, this.theta1, this.theta0, i);
            var phi = this.MapCoordinate(0.0, this.height - 1, this.phi0, this.phi1, j);

            this.x = this.radius * Math.sin(phi) * Math.cos(theta);
            this.y = this.radius * Math.sin(phi) * Math.sin(theta);
            this.z = this.radius * Math.cos(phi);

            var result;
            result = this.Rotate(this.xRotate, this.y, this.z);
            this.y = result.r1;
            this.z = result.r2;

            result = this.Rotate(this.yRotate, this.x, this.z);
            this.x = result.r1;
            this.z = result.r2;
        };

        SphereMapper.prototype.MapCoordinate = function (i1, i2, w1, w2, p) {
            return ((p - i1) / (i2 - i1)) * (w2 - w1) + w1;
        };

        SphereMapper.prototype.Rotate = function (angle, axisA, axisB) {
            return {
                r1: axisA * Math.cos(angle) - axisB * Math.sin(angle),
                r2: axisA * Math.sin(angle) + axisB * Math.cos(angle)
            };
        };
        return SphereMapper;
    })();
    SphereImageLib.SphereMapper = SphereMapper;

    var Pixel = (function () {
        function Pixel(image, x, y) {
            this.image = image;
            this.index = (Math.floor(x) + Math.floor(y) * this.image.width) * 4;
        }
        Pixel.prototype.Copy = function (from) {
            for (var i = 0; i < 3; i++) {
                this.image.data[this.index + i] = from.image.data[from.index + i];
            }
            this.image.data[this.index + 3] = 255; // Alpha not opaque
        };
        return Pixel;
    })();
    SphereImageLib.Pixel = Pixel;
})(SphereImageLib || (SphereImageLib = {}));
//# sourceMappingURL=WrapSphereDemo.js.map
