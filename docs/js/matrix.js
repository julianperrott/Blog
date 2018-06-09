// Modified from http://thecodeplayer.com/walkthrough/matrix-rain-animation-html5-canvas-javascript
// loading added by J.Perrott 21/10/2016

function matrix() {
    $(window).resize(headerResized);
    startLoading();
}

function headerResized() {
    var element = document.getElementById('canvasdiv');
    var positionInfo = element.getBoundingClientRect();
    var height = positionInfo.height;
    var width = positionInfo.width;
}

function startMatrix() {
    var element = document.getElementById('canvasdiv');
    var positionInfo = element.getBoundingClientRect();
    var height = positionInfo.height;
    var width = positionInfo.width;

    var c = document.getElementById("c");
    var ctx = c.getContext("2d");

    //chinese characters - taken from the unicode charset
    var chinese = "田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑";
    chinese = chinese.split("");

    var font_size = 10;
    var columns = c.width / font_size; //number of columns for the rain
    //an array of drops - one per column
    var drops = [];
    //x below is the x coordinate
    //1 = y co-ordinate of the drop(same for every drop initially)
    for (var x = 0; x < columns; x++) {
        drops[x] = 1;
    }

    var step = 0;

    //drawing the characters
    function draw() {
        if (step == 500) {
            step = 0;
            for (var i = 0; i < drops.length; i++) {
                drops[i] = 0;
            }
        }

        //translucent BG to show trail
        ctx.fillStyle = "rgba(24, 188, 156, 0.05)";
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.fillStyle = "#0F0"; //green text
        ctx.font = font_size + "px arial";

        for (var i = 0; i < drops.length; i++) {
            //a random chinese character to print
            var text = chinese[Math.floor(Math.random() * chinese.length)];

            ctx.fillText(text, i * font_size, drops[i] * font_size);

            //sending the drop back to the top randomly after it has crossed the screen
            //adding a randomness to the reset to make the drops scattered on the Y axis
            if (drops[i] * font_size > c.height && Math.random() > 0.975) {
                drops[i] = 0;
            }

            //incrementing Y coordinate
            drops[i]++;
        }
        setTimeout(draw, 33);

        step++;
    }
    setTimeout(draw, 1000);
}

function startLoading() {
    var element = document.getElementById('canvasdiv');
    var positionInfo = element.getBoundingClientRect();
    var height = positionInfo.height;
    var width = positionInfo.width;

    var c = document.getElementById("c");
    var ctx = c.getContext("2d");
    c.height = window.innerHeight;
    c.width = window.innerWidth;


    var font_size2 = 20;
    var columns = c.width / font_size2; //number of columns for the rain
    ctx.font = font_size2 + "px arial";
    var step = 1;

    var text = "田由甲7申甴+电甶男 甸甹8町3画甼2甽甾甿/畀91畁畂畃4畄畅6畆畇畈*-#&3 畉畊畋界5畍畎 畏畐畑";
    var consoletext = [];
    for (var i = 1; i < 1000; i++) {

        var lineLength = (columns * Math.random());
        var line = [];
        for (var j = 0; j < lineLength; j++) {
            line.push(text[Math.floor(Math.random() * text.length)]);
        }
        consoletext.push(pad((i * 10), 6) + "   " + line);
    }

    function pad(num, size) {
        var s = "000000000" + num;
        return s.substr(s.length - size);
    }

    function draw1() {
        ctx.fillStyle = "rgba(24,188, 156, 1)";
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.fillStyle = "#0F0"; //green text

        for (var i = step - 1; i >= 0; i--) {
            var y = c.height - ((step - i) * (font_size2 + 1));
            if (y < 0) { break; }
            ctx.fillText(consoletext[i], 20, c.height - ((step - i) * (font_size2 + 1)));
        }

        if (step < 48) {
            ctx.fillText("Load"+".........".substring(0,(step/2) %8), 20, 20);
        }

        if (step < 200) {
            setTimeout(draw1, 2 + (Math.random() * 30));
            step++;
        }
        else {
            startMatrix();
        }
    }

    setTimeout(draw1, 1000);
}