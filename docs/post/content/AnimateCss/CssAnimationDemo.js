/// <reference path="../../typescript definitions/jquery.transit.d.ts" />
var animator;
(function (animator) {
    var requestAnimFrame = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
            window.setTimeout(callback, 1000 / 60, new Date().getTime());
        };
    })();

    function animate(draw) {
        draw();
        requestAnimFrame(function () {
            return animate(draw);
        });
    }
    animator.animate = animate;
})(animator || (animator = {}));

var Demo;
(function (Demo) {
    var animatedItems = new Array();
    var wind;

    function draw() {
        for (var i = 0; i < animatedItems.length; i++) {
            animatedItems[i].move(wind.speed);
        }
        wind.Recalculate();
    }

    function startAnimation() {
        wind = new HtmlElementAnimator.Wind(4);

        for (var i = 0; i < 50; i++) {
            var image = document.createElement("img");
            image.src = "images/leaf" + ((i % 6) + 1).toString() + ".gif";
            image.id = "box" + i;
            $("#page").append(image);
            image.style.position = "fixed";
            var animatedImage = new HtmlElementAnimator.AnimatedCssElement(image);
            animatedImage.startNewCssTransition(wind.speed);
            animatedItems.push(animatedImage);
        }
        animator.animate(draw);
    }

    $(document).ready(function docReady() {
        startAnimation();
    });
})(Demo || (Demo = {}));

var HtmlElementAnimator;
(function (HtmlElementAnimator) {
    var CssAnimateProperties = (function () {
        function CssAnimateProperties() {
        }
        return CssAnimateProperties;
    })();
    HtmlElementAnimator.CssAnimateProperties = CssAnimateProperties;

    // Simulate Wind
    var Wind = (function () {
        function Wind(maxSpeed) {
            this.frame = 0;
            this.speed = 1;
            this.maxSpeed = maxSpeed;
            this.changeWindDirection();
        }
        Wind.prototype.Recalculate = function () {
            this.frame += 1;
            if (this.frame > 180) {
                this.frame = 0;
                this.changeWindDirection();
            }

            // gradually change to the new wind speed
            this.speed += (this.targetSpeed - this.speed) / 180;
        };

        Wind.prototype.changeWindDirection = function () {
            this.targetSpeed = 0.25 + Math.random() * 4;
            if (Math.random() > 0.5) {
                this.targetSpeed = -this.targetSpeed;
            }
        };
        return Wind;
    })();
    HtmlElementAnimator.Wind = Wind;

    // Handle the animation of the element using CSS
    var AnimatedCssElement = (function () {
        function AnimatedCssElement(htmlElement) {
            this.cssTransitionComplete = false;
            this.htmlElement = htmlElement;
            this.position = new AnimatedPosition();
        }
        AnimatedCssElement.prototype.move = function (windSpeed) {
            this.position.movePositionX(windSpeed);
            this.position.movePositionY(windSpeed);

            this.htmlElement.style.left = this.position.x.toString() + "px";
            this.htmlElement.style.top = this.position.y.toString() + "px";

            if (this.cssTransitionComplete) {
                this.startNewCssTransition(windSpeed);
            }
        };

        AnimatedCssElement.prototype.startNewCssTransition = function (windSpeed) {
            this.cssTransitionComplete = false;
            var self = this;
            $("#" + this.htmlElement.id).transition(this.createNewTransition(windSpeed), 3000 + Math.random() * 3000, "linear", function () {
                self.cssTransitionComplete = true;
            });
        };

        AnimatedCssElement.prototype.createNewTransition = function (windSpeed) {
            var p = new CssAnimateProperties();
            p.scale = Math.random();
            p.rotateY = Math.floor(Math.random() / this.position.vx * 720 * windSpeed);
            p.rotateX = Math.floor(Math.random() / this.position.vy * 720 * windSpeed);
            return p;
        };
        return AnimatedCssElement;
    })();
    HtmlElementAnimator.AnimatedCssElement = AnimatedCssElement;

    // Handles the animation of the position of an element
    var AnimatedPosition = (function () {
        function AnimatedPosition() {
            this.gravity = 3.2;
            this.vx = (Math.random() + 0.1) * 4;
            this.vy = (Math.random() + 0.2) * 3;
            this.x = Math.random() * window.innerWidth;
            this.y = -Math.random() * window.innerHeight;
        }
        AnimatedPosition.prototype.randomness = function () {
            return 0.8 + ((Math.random() - 0.5) / 2.5);
        };

        AnimatedPosition.prototype.movePositionX = function (windSpeed) {
            // move x
            this.x += this.vx * windSpeed * this.randomness();

            // check we are within the bounds of the screen
            if (this.x > window.innerWidth + 100) {
                this.x = -50;
            }

            if (this.x < -100) {
                this.x = window.innerWidth + 50;
            }
        };

        AnimatedPosition.prototype.movePositionY = function (windSpeed) {
            //move y
            this.y += this.vy * Math.abs(windSpeed) * this.randomness() + this.gravity;

            // check we are within the bounds of the screen}
            if (this.y > window.innerHeight) {
                this.y = -100;
                this.x = Math.random() * window.innerWidth;
            }
        };
        return AnimatedPosition;
    })();
    HtmlElementAnimator.AnimatedPosition = AnimatedPosition;
})(HtmlElementAnimator || (HtmlElementAnimator = {}));
//# sourceMappingURL=CssAnimationDemo.js.map
