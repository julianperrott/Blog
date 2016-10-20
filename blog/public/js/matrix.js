// http://thecodeplayer.com/walkthrough/matrix-rain-animation-html5-canvas-javascript

function matrix()
{
    $(window).resize(headerResized);
    start();
}

function headerResized()
{
    var element = document.getElementById('canvasdiv');
    var positionInfo = element.getBoundingClientRect();
    var height = positionInfo.height;
    var width = positionInfo.width;
    
    //var c = document.getElementById("c");
    //c.style.width = width+"px";
    //c.style.height = (height-170)+"px";
}

function start()
{
    var element = document.getElementById('canvasdiv');
    var positionInfo = element.getBoundingClientRect();
    var height = positionInfo.height;
    var width = positionInfo.width;
    
    var c = document.getElementById("c");
   // c.style.width = width+"px";
   // c.style.height = (height-170)+"px";

     var ctx = c.getContext("2d"); 

    c.height = window.innerHeight;
    c.width = window.innerWidth;

    //chinese characters - taken from the unicode charset
    var chinese = "田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑";
    chinese = chinese.split("");

    var font_size = 10;
    var columns = c.width/font_size; //number of columns for the rain
    //an array of drops - one per column
    var drops = [];
    //x below is the x coordinate
    //1 = y co-ordinate of the drop(same for every drop initially)
    for(var x = 0; x < columns; x++)
    {
        drops[x] = 1; 
    }

    ctx.fillStyle = "rgba(24,188, 156, 1)";
    ctx.fillRect(0, 0, c.width, c.height);
   
//drawing the characters
function draw()
{
	//translucent BG to show trail
	ctx.fillStyle = "rgba(24, 188, 156, 0.05)";
	ctx.fillRect(0, 0, c.width, c.height);
	
	ctx.fillStyle = "#0F0"; //green text
	ctx.font = font_size + "px arial";
	
	for(var i = 0; i < drops.length; i++)
	{
		//a random chinese character to print
		var text = chinese[Math.floor(Math.random()*chinese.length)];

		ctx.fillText(text, i*font_size, drops[i]*font_size);
		
		//sending the drop back to the top randomly after it has crossed the screen
		//adding a randomness to the reset to make the drops scattered on the Y axis
		if(drops[i]*font_size > c.height && Math.random() > 0.975)
        {
			drops[i] = 0;
        }
		
		//incrementing Y coordinate
		drops[i]++;
	}
    setTimeout(draw, 33);
}

setTimeout(draw, 1000);
}