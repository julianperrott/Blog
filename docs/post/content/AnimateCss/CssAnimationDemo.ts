/// <reference path="../../typescript definitions/jquery.transit.d.ts" />

module animator {
    var requestAnimFrame: (callback: () => void) => void = (function () {
        return window.requestAnimationFrame ||
            (<any>window).webkitRequestAnimationFrame ||
            (<any>window).mozRequestAnimationFrame ||
            (<any>window).oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60, new Date().getTime());
            };
    })();

    export function animate(draw: Function) {
        draw();
        requestAnimFrame(() => animate(draw));
    }
}

module Demo {
    var animatedItems: Array<HtmlElementAnimator.AnimatedCssElement> = new Array<HtmlElementAnimator.AnimatedCssElement>();
    var wind: HtmlElementAnimator.Wind;

    function draw() {
        for (var i = 0; i < animatedItems.length; i++) {
            animatedItems[i].move(wind.speed);
        }
        wind.Recalculate();
    }

    function startAnimation() {
        wind = new HtmlElementAnimator.Wind(4);

        for (var i = 0; i < 50; i++) {
            var image = <HTMLImageElement>document.createElement("img");
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
}

module HtmlElementAnimator {
    export class CssAnimateProperties {
        opacity: number;
        scale: number;
        translate: string;
        rotate: number;
        rotateX: number;
        rotateY: number;
        rotate3d: string;
        perspective: string;
        skewX: number;
        skewY: number;
        x: string;
        y: number;
    }


    // Simulate Wind
    export class Wind {
        frame = 0;
        targetSpeed: number;
        speed = 1;
        maxSpeed: number;

        constructor(maxSpeed: number) {
            this.maxSpeed = maxSpeed;
            this.changeWindDirection();
        }

        Recalculate() {
            this.frame += 1;
            if (this.frame > 180) {
                this.frame = 0;
                this.changeWindDirection();
            }

            // gradually change to the new wind speed
            this.speed += (this.targetSpeed - this.speed) / 180;
        }

        changeWindDirection() {
            this.targetSpeed = 0.25 + Math.random() * 4;
            if (Math.random() > 0.5) {
                this.targetSpeed = -this.targetSpeed;
            }
        }
    }

    // Handle the animation of the element using CSS
    export class AnimatedCssElement {
        htmlElement: HTMLElement;
        position: AnimatedPosition;
        cssTransitionComplete: boolean = false;

        constructor(htmlElement: HTMLElement) {
            this.htmlElement = htmlElement;
            this.position = new AnimatedPosition();
        }

        move(windSpeed: number) {
            this.position.movePositionX(windSpeed);
            this.position.movePositionY(windSpeed);

            this.htmlElement.style.left = this.position.x.toString() + "px";
            this.htmlElement.style.top = this.position.y.toString() + "px";

            if (this.cssTransitionComplete) {
                this.startNewCssTransition(windSpeed);
            }
        }

        startNewCssTransition(windSpeed: number) {
            this.cssTransitionComplete = false;
            var self = this;
            $("#" + this.htmlElement.id).transition(this.createNewTransition(windSpeed), 3000 + Math.random() * 3000, "linear"
                , function () {
                    self.cssTransitionComplete = true;
                });
        }

        createNewTransition(windSpeed: number): CssAnimateProperties {
            var p = new CssAnimateProperties();
            p.scale = Math.random();
            p.rotateY = Math.floor(Math.random() / this.position.vx * 720 * windSpeed);
            p.rotateX = Math.floor(Math.random() / this.position.vy * 720 * windSpeed);
            return p;
        }
    }

    // Handles the animation of the position of an element
    export class AnimatedPosition {
        vx: number;
        vy: number;
        x: number;
        y: number;
        gravity: number = 3.2;

        constructor() {
            this.vx = (Math.random() + 0.1) * 4;
            this.vy = (Math.random() + 0.2) * 3;
            this.x = Math.random() * window.innerWidth;
            this.y = - Math.random() * window.innerHeight;
        }

        randomness(): number {
            return 0.8 + ((Math.random() - 0.5) / 2.5);
        }

        movePositionX(windSpeed: number) {
            // move x
            this.x += this.vx * windSpeed * this.randomness();

            // check we are within the bounds of the screen
            if (this.x > window.innerWidth + 100) {
                this.x = -50;
            }

            if (this.x < -100) {
                this.x = window.innerWidth + 50;
            }
        }

        movePositionY(windSpeed: number) {
            //move y
            this.y += this.vy * Math.abs(windSpeed) * this.randomness() + this.gravity;

            // check we are within the bounds of the screen}
            if (this.y > window.innerHeight) {
                this.y = -100;
                this.x = Math.random() * window.innerWidth;
            }
        }
    }
} 