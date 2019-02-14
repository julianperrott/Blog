+++
date = "2016-10-05"
title = "SimCity BuildIt Buying and Selling Bot"
description = "Next in my SimCity BuildIt bot I tackle buying and Selling crafted items to generate in game currency."
slug = "SimCity-BuildIt-Bot-Part-2"
draft = true

background = "bg_simcitybot"
+++

On my previous blog post I described how I had automated the crafting element of SimCity BuildIt. Next I tackle buying from "Global Trade" and Selling crafted items to generate in game currency.

The main new problem I had to solve was recognising images from the game screen. This was solved using perceptual hashing with a dictionary of categorised image hashes.

<br/>
### 1. Buying Items

Assuming we have a shopping list of items we need, then the goal is to buy those items.

Clicking on the Global trade building brings up the trade window. The window contains a number of panels, each representing an item for sale. Dragging within the list from right to left reveals more items.

![Global Trade HQ](/post/img/SB2_1_Global Trade.png)

Usefully each panel is the same size, so If we can find where a panel starts, then the item will always be in the same place and all we need to do is to recognise the item in the panel. The way I solved this is described below:

<br/>
#### Finding Panels

The tops of the panels are always the same distance from the top of the screen. 
Finding the tops of the panels required looking along this line for pixels close to the colour of the bounding line around the panels (See indicator red lines at the top of each panel below).

Each continuous block of matching pixels is one panel. The first pixel in each line represents the top left of the panel. 

![Panels](/post/img/SB2_2_Global Trade.png)

<br/>
#### Recognising the item in the panel

If we image capture a rectangle a fixed distance from the top left of the panel of a set size, we now have an image which can be processed and recognised using Image hashing.

![Sale Item](/post/img/SB2_3_Panel.png)

We recognise it using a library of pre-captured images. We create this library by storing unmatched images and then classify them by hand into named folders. Images which are almost the same (90%) can be automatically classified.

As each image is processed  a hash is created e.g. 70088502915571468. The file is then renamed to the hash so that this never needs to be re-computed.

![Image Hashes](/post/img/SB2_4_Hashes.png)

Once we've recognised an item that we want to buy, we then click on the panel and are transported to the trade depot of the city who is selling the item.

<br/>
#### Buying the item

Once you are at the city selling the item, you usually find many other items for sale.

The trade depot is similar to the global trade except that it has boxes instead of panels. We can use the same approach we used earlier to find the contents of the boxes and click on the desired item to buy it

![Trade Depot](/post/img/SB2_5_TradeDepot.png)

<br/>
### 2. Selling items

We have a trade depot where we can sell items. It contains a number of boxes each of which can contain a single item for sale. Once we click on an empty box a "Create Sale" dialog is shown.
 
![Trade Depot](/post/img/SB2_7_HomeDepot.png)

To sell an item, we need to:

 1. Open up our trade depot.
 2. Collect any sold items.
 3. Pick an empty box, we may need to scroll horizontally to see more boxes.
 4. Click on the box to open the "Create Sale" dialog.
 5. Pick an item to sell and click on it.
 6. Press the quantity increase button until it turns grey.
 7. Press the price increase button until it turns grey.
 8. Click the 'Put on sale' button.

Most of these steps simply require clicking at predetermined locations on the screen.

Steps 2, 3 & 5 use the same image matching technique used when buying items.



<br/>
### 3. What is Perceptual Hashing

> A perceptual hash is a fingerprint of a multimedia file derived from various features from its content. Unlike cryptographic hash functions which rely on the avalanche effect of small changes in input leading to drastic changes in output, 
perceptual hashes are "close" to one another if the features are similar.

The bot uses https://github.com/jforshee/ImageHashing which is an implementation of the algorithm found here: http://www.hackerfactor.com/blog/index.php?/archives/432-Looks-Like-It.html

A long number hash is created in the following steps:

 1. Reduce the image to 8x8 pixels
 2. Reduce the color of each pixel from RGB (24 bits) to grayscale (6 bits).
 3. Compute the mean of all the 6-bit values
 4. Translate each pixel into a bit. 1 if the greyscale is >= to the mean.
 5. Turn the binary number into a long decimal.

The following shows the processes as it took place on 2 similar images. The images turned out to be only 73% similar. 

![Hashing Examples](/post/img/SB2_6_Compared.png)

----------


### Bot Demo

<iframe allowfullscreen="" frameborder="0" height="270" src="https://www.youtube.com/embed/JFwONo9b-RE" width="480"></iframe>