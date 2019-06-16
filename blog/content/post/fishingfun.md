+++
date = "2019-06-16"
title = "A World of Warcraft fishing bot"
description = "Written in c#."
slug = "FishingFun"
draft = true

background = "bg_fishingfun"
+++

In World of Warcraft, Fishing is a time consuming task which is simple and so lends itself to automation very well. There are many fishing bots out there. This post describes the bot that I wrote for fun and the problems solved to make it work.

## What is fishing in World of Warcraft

Fishing is a way to catch fish which can be used to cook food. You can also gain achievements thorugh fishing. 

The machanics of fishing involve casting your line into in-land or sea waters and then waiting up to 30 seconds for a bite, then looting within a couple of seconds to catch the fish.

## What would the bot do while fishing

The bot needs to transition through the following states:

* Casting.
* Watching the bobber for a bite. If a bite is seen then move to Looting. If the bobber is not seen for a few seconds or 30 seconds elapses then move back to the casting state.
* Looting

## What are the problems to solve.

The main problems to solve are: 
* Finding the coordinates of the bobber.
* Determining when a bite has taken place.

### Finding the bobber

The bobber is tiny on the screen, so to make it easier to find the character view must be zoomed in so that the bobber is bigger and there is less noise to handle.

![Screenshot0](/img/fishingfun_zoomedout.jpg)

To further simplify finding the bobber, it must appear in the middle half of the screen as viewed by the character. The following image has a red area which indicates this area.

![Screenshot0](/img/FishingFun_ZoomedIn.jpg)

The bobber is pretty easy for us to spot now, but a computer needs a simple way to determine where the bobber is. We could train an AI to find the float, but that seems an over complicated solution. We can use the red colour of the bobber to locate it.

If we find all the red pixels in middle half of the screen, then find the pixel with most red pixels around it then we should have our bobber location.

<pre class="prettyprint">
        public static Bitmap GetBitmap()
        {
            var bmpScreen = new Bitmap(Screen.PrimaryScreen.Bounds.Width / 2, Screen.PrimaryScreen.Bounds.Height / 2);
            var graphics = Graphics.FromImage(bmpScreen);
            graphics.CopyFromScreen(Screen.PrimaryScreen.Bounds.Width / 4, Screen.PrimaryScreen.Bounds.Height / 4, 0, 0, bmpScreen.Size);
            graphics.Dispose();
            return bmpScreen;
        }
</pre>

### Determining when a bite has taken place.

When a bite occurs the bobber moves down a few pixels. If we track the position of the bobber while fishing, we can see an obvious change in the Y position when the bite happens.

## Determining when Red is Red

Due to the different times of day and environments in the game, the red that the bobber feather contains are different and even within the feather the red colour changes.

![Screenshot0](/img/fishingfun_bobbers.png)

The red we are looking for is going have an RGB value with a high Red value compared to the Green and Blue. In the cube below that is going to be towards the back left.

![Screenshot0](/img/finshingfun_cube.png)

This is the algorithm I have used:

* Red is greater that Blue and Green by a chosen percentage e.g. 200%.
* Blue and Green are reasonably close together.

<pre class="prettyprint" >
        public double ColourMultiplier { get; set; } = 0.5;
        public double ColourClosenessMultiplier { get; set; } = 2.0;

        public bool IsMatch(byte red, byte green, byte blue)
        {
            return isBigger(red, green) && isBigger(red, blue) && areClose(blue, green);
        }

        private bool isBigger(byte red, byte other)
        {
            return (red * ColourMultiplier) > other;
        }

        private bool areClose(byte color1, byte color2)
        {
            var max = Math.Max(color1, color2);
            var min = Math.Min(color1, color2);

            return min * ColourClosenessMultiplier > max - 20;
        }
</pre>

The algorithm produces an area (indicated by the white boundary) in the images below which animates the Red value going from 0 to 255 in a 2D square of Blue and Green (0-255).

![Screenshot0](/img/fishingfun_red.png)


## User Interface

The WPF user interface allows the user to see what the bot sees and how it is doing finding the bobber. 

There is an image which shows the part of the screen being monitored, the bobber position is indicated by a recticle, the recognised red pixels are shown in pure red colour.

The amplitude of the bobber is shown in an animated graph. It moves up and down a few pixels during fishing. When the bite occurs it drops 7 or more pixed.

![Screenshot0](/img/fishingfun_screenshot1.jpg)

A second configuration screen allows the investigation of different paramters for the 'Red' pixel detection.

![Screenshot0](/img/fishingfun_screenshot3.jpg)



## Console Version

A console version is also available if the UI is not needed. It exposes the log so that some feedback on the bot is given to the user.

![Screenshot0](/img/fishingfun_console.png)
## Screenshots and Video






The souce code is here: [Ionic-WordCloud](https://github.com/julianperrott/Ionic-WordCloud)


