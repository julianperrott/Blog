var app = angular.module('myApp', []);
app.controller('fruitMachine', ['$interval', function ($interval) {
    var vm = this;
    vm.start = function () { 
      vm.stop();
      vm.interval = $interval(vm.move, 50); 
    };
    
    vm.stop = function () { 
      if (vm.interval) {
        $interval.cancel(vm.interval); 
      }
    };

    vm.move = function () {
        vm.reelViews = vm.reels.map(function (reel, i) {
            reel.move();
            var views = vm.reelView.createSymbolViews(reel.degrees, reel.symbolSize);
            views.forEach(function (v) { v.symbolNo = (v.symbolNo + reel.symbolsCount + reel.symbolNo) % reel.symbolsCount });
            views.index = i;
            return views;
        });
    };

    vm.createReel = function (symbols, degreesStep, symbolSize) {
        return {
            symbolsCount: symbols.length,
            degreesStep: degreesStep,
            symbolNo: 0,
            degrees: 90,
            symbolSize: symbolSize,
            move: function () {
                var c = document.getElementById("myCanvas");
                var ctx = c.getContext("2d");
                ctx.strokeStyle = '#000000';
                ctx.clearRect(0, 0, 600,600);
                
                ctx.beginPath();
                ctx.arc(0,300,300,0,2*Math.PI);
                ctx.stroke();
                
                var c2 = document.getElementById("myCanvas2");
                var ctx2 = c2.getContext("2d");
                ctx2.strokeStyle = '#000000';
                ctx2.clearRect(0, 0, 600,600);
              
                this.degrees += this.degreesStep; // move the required number of degrees

                if (this.degrees > 90) { // 90 is the centre of the reel
                    this.symbolNo = (this.symbolNo + 1) % this.symbolsCount;
                    this.degrees = this.degrees - this.symbolSize; // move the reel location
                }
            }
        };
    };

    vm.createReelViewGenerator = function (height) {

        var radius = height / 2;
        var reelViewGenerator = {
            degreeOffsety: [],
            degreeOffsetx: [],

            createSymbolViews: function (degrees, symbolSize) {
                var symbolNo = 0;

                // move to top of reel
                while (degrees >= 0) {
                    degrees -= symbolSize;
                    symbolNo++;
                }

                // now move down to fill the reel wth symbols
                var views = [];
                while (degrees < 180) {
                    views.push(this.createSymbolView(symbolSize, degrees, symbolNo));
                    degrees += symbolSize;
                    symbolNo--;
                }
                return views;
            },

            createSymbolView: function (symbolHeight, degreesStart, symbolNo) {
                // works out where each symbol starts and ends vertically so that it can be scaled to that height
                var view = { scale: 1, symbolNo: symbolNo, imgTop: 0 };

                var degreesEnd = degreesStart + symbolHeight - 1;
                if (degreesStart < 0) { degreesStart = 0; }
                if (degreesEnd >= 180) { degreesEnd = 179; }
                if (degreesEnd < 0) { degreesEnd = 0; }

                view.startPx = this.degreeOffsety[degreesStart];
                view.startPy = this.degreeOffsetx[degreesStart];
                view.endPx = this.degreeOffsety[degreesEnd];
                view.height = (view.endPx - view.startPx);
                view.heightdiv = view.height;

                if (degreesEnd - degreesStart < symbolHeight - 1 && degreesStart < 179 && degreesEnd > 0) {
                    view.scale = (degreesEnd - degreesStart) / (symbolHeight-1);
                    view.height = Math.round(view.height / view.scale) + 0;
                    if (degreesStart === 0) {
                        view.imgTop = (view.endPx - view.startPx) - view.height;
                    }
                }
                
                var c = document.getElementById("myCanvas");
                var ctx = c.getContext("2d");
                ctx.beginPath();
                ctx.moveTo(0,300);
                ctx.strokeStyle = '#000000';
                ctx.lineTo(view.startPy-300,view.startPx);
                ctx.stroke();
                
                ctx.closePath();
                
                ctx.beginPath();
                ctx.setLineDash([5, 3]);
                ctx.strokeStyle = 'orange';
                ctx.moveTo(view.startPy-298,view.startPx);
                ctx.lineTo(302,view.startPx);
                ctx.stroke();
                
              ctx.closePath();
              
               c = document.getElementById("myCanvas2");
              ctx = c.getContext("2d");
                ctx.beginPath();
                ctx.setLineDash([1, 2]);
                ctx.strokeStyle = 'white';
                ctx.moveTo(132,view.startPx+view.height/2);
                ctx.lineTo(180,13+view.startPx+view.height/4);
                ctx.stroke();
                
              ctx.closePath();

                return view;
            },
        };

        // the vertical position of each degree from -90 to + 90 (the visible face of the reel)
        for (var i = 0; i < 180; i += 1) {
            var y = radius * Math.sin(2 * Math.PI * (i - 90) / 360);
            reelViewGenerator.degreeOffsety[i] = Math.round(y + radius);
            
            var x = radius * Math.cos(2 * Math.PI * (i - 90) / 360);
            reelViewGenerator.degreeOffsetx[i] = Math.round(x + radius);
        }

        return reelViewGenerator;
    };

    // initialise
    vm.symbols = ["images/1.png", "images/2.png", "images/3.png", "images/4.png", "images/5.png", "images/6.png", "images/7.png", "images/8.png", "images/9.png"];
    vm.height=600;
    vm.reelView = vm.createReelViewGenerator(vm.height);
    vm.reelcount = 1;

    vm.reels = [];
    for (var i = 0; i < vm.reelcount; i++) {
        vm.reels.push(vm.createReel(vm.symbols, 1, 30));
        vm.reels[i].symbolNo = Math.round(Math.random() * vm.symbols.length); // random start symbol
    }
    
    vm.start();
}]);
