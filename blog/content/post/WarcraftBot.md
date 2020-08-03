+++
date = "2020-07-26"
title = "How I developed a World of Warcraft bot"
description = "Using Pixel reading and Blazor server."
slug = "wowbot"
draft = true

background = "bg_wowbot"
+++

World of Warcraft Classic is a massively multiplayer online role-playing game (MMORPG), I have written a bot to play the game for me. Players run around a 3D world killing monster NPCs (non player characters) and completing quests to either get loot (worth in game currency) and/or experience for their characters. The current maximum level that can be attained is level 60 and getting there can take many weeks of effort. Once at 60 the end game raids are where a lot of fun can be had. Automating some of the levelling is helpful once it starts to take longer and becomes more of a grind than fun. 

15 years ago [Glider](https://en.wikipedia.org/wiki/Glider_(bot)) was the king of the [bots](https://WOWwiki.fandom.com/wiki/Bot), after being shutdown in 2010 other bots became popular such as HonorBuddy which has since also been shutdown. In 2017 Blizzard increased the code security in the client which meant that memory reading (where the application memory is spied upon) and Dll injection (inserting code into the application) became much harder. Currently there are no mainstream bots for WOW classic, although bots do still exist in the game these are either Pixel bots or bots using unlocked LUA (the in-game scripting language).

Because LUA unlocking cost money each month I was put off using it. 

The alternative of a Pixel bot was made possible after seeing a post on Ownedcore which provided an addon which exposed the WOW client data. There was no bot provided though, just some basic guidance. After seeing how an WOW addon can expose game state on the screen via pixels I decided to experiment with writing a bot, which has evolved into a working grind bot which can play for hours at a time unattended. 


### What is a pixel bot? 

A pixel bot is a bot that instead of getting game info from memory-reading, will read info from pixels on the screen. Those pixels can be native WOW pixels (e.g. health bars) or an addon-made bar. Using native pixels is easier, but using an addon allows us to access more complete data.

### What is LUA unlocking? 

"There are functions in WOW's addon API which are 'protected', and can only be called from secure (Blizzard) Lua code. These protected functions do things such as control movement, spell casting, etc. A Lua unlock will allow insecure code (regular addons) to call these protected functions".
 
# Approach to writing the bot

My initial approach was to do a proof of concept. Some simple code was written to verify that a bot could be written.

I started by following the guidance in the ownedcore post which involved coding the examples in NodeJs, 
once these were working I translated them into C# as I find the development and debugging environment to be better. 

Next I experimented by getting the character to turn to face a desired direction e.g. North, South East and West.
Then I experimented with recording a path for the bot to travel and then to get the bot to run it.

Once the basics were proved I determined some design principles / objectives for my bot:

1. **Feedback:** Make the bot decision making visible so it is easier to understand what it is doing and the state is it using to make those decisions and so easier to debug.
2. **Remote access:** Make the bot user interface visible in a browser, this makes monitoring the bot possible away from the PC, for example on a tablet.
3. **Extendability:** The transition between different states (Eating, Fighting, Pathing, Looting etc) should not require a complex tightly coupled finite state machine, allowing the bot to be easily extendable.
4. **Configurable:** The bot should be driven by a configuration file allowing the user to determine what spells to cast and in what order.
5. **Flexibility:** The bot should support all player class types.

# Software architecture

The first choice I made was the language to code the bot in, this was C# as it is a good multi-purpose language which I am familiar with and provides multi-threading which I guessed I would need.

The next choice was how to code the different states of functionality. I wondered if there was an AI approach that could work? After a little research I found something called ["Goal Orientated Action Planning"](https://gamedevelopment.tutsplus.com/tutorials/goal-oriented-action-planning-for-a-smarter-ai--cms-20793) which gives the ability to have multiple goals which are independent and can be switched between without needing to know about each other.

The other major decision was the front end. To allow the bot to be visible remotely I decided to use [Blazor Server](https://dotnet.microsoft.com/apps/aspnet/web-apps/blazor). Because the bot is running on the server (my PC), it has access to all the bot's state and can render it as it changes, pushing down the new UI changes to the client using [SignalR](https://dotnet.microsoft.com/apps/aspnet/signalr). This choice also lets me gain experience with Blazor.

To enable the current state of the game to be accessible without needing to read it each time, I decided that more than one thread would be required.

1. A thread to read the game state via the addon. This will allow the bot to run without being delayed each time it needs to see some game state.
2. A thread for the bot actions. The bot will run on this thread.
3. A thread to create screen shots. Providing a stream of screen shots to be displayed on the UI.

### Architectural diagram

![Architecture diagram](/post/img/wowbot_Architecture.png)

[Source code on GitHub](https://github.com/julianperrott/WowClassicGrindBot)

### Video of the bot in action

[![Grind Bot Fun YouTube](https://img.youtube.com/vi/CIMgbh5LuCc/0.jpg)](https://www.youtube.com/watch?v=CIMgbh5LuCc)


# How the addon works

The addon is code which runs inside the World of Warcraft client using a language called LUA and is used to query the internal WOW API for information. The API is restricted so there is a limited amount of information that is available. The addon paints this information on the client screen as a set of pixels each pixel contains 3 colours, 8 bits each making a total of 24 bits per pixel. The bot takes screenshots of the client and uses those pixels to read the information out.

For example pixel 1 and 2 display the character's X & Y coordinates. In this example below we are at 54.44, 66.7 which is verified by the in game minimap location (54:66).

![Pixels](/post/img/wowbot_xy.png)

## What can the addon tell you ?

To give you an idea of the challenge that the bot faces imagine that you are the character from ["Blind Fury"](https://www.youtube.com/watch?v=rgnlJ38ntQw) the movie. Basically you can't see what is going on inside the game, but you know where you are and if you are fighting an NPC. Using the limited information the addon provides, you need to create an effective bot which doesn't look like a bot.

The main information the Addon allows the bot to access:

- Your X,Y position and direction you are facing.
- Your Health, Mana, Energy, Rage and any buffs you have.
- Yout target's information: id, name, health, debuffs.
- Spells that are in range of the target.
- Contents of your bags.

![My Location](/post/img/wowbot_MyLocation.png)
![My Target](/post/img/wowbot_TargetHealth.png)


# Some of the trickier parts of the bot to code

## Looting

Once an NPC has died it has items which can be looted and perhaps skinned by right clicking on. 
The problem here is that we don't know exactly where the NPC died, it might be just in front of us, or could be slightly to the left or right, or perhaps we have killed
more than one NPC and we want to loot them all, so we need to do a search for them. When the mouse is moved over an NPC it changes the icon that is shown, so if we move the
mouse in a circle around our character and read the mouse icon we can see what icon it changes to and decide what action to take.

![gif example of mouse moving](/post/img/wowbot_Loot.gif)

To move the mouse I calculate x,y coordinates around a point and use native method SetCursorPos of User32.DLL to set the cursor position.

<pre class="prettyprint" >
	[DllImport("user32.dll")]
	[return: MarshalAs(UnmanagedType.Bool)]
	public static extern bool SetCursorPos(int x, int y);
</pre>		


To recognise which cursor is shown we can use perceptual hashing to reduce the image to a simplified binary number and from those binary digits work out how close (just in case it is not a perfect match) to the image is to the known images.

Some examples of the WOW cursors and their hash:

![Cursors](/post/img/wowbot_cursor2.png)

<pre class="prettyprint" >
	private static Dictionary<CursorClassification, ulong> imageHashes = new Dictionary<CursorClassification, ulong>()
	{
		{CursorClassification.Kill, 9286546093378506253},
		{CursorClassification.Loot, 16205332705670085656},
		{CursorClassification.None, 4645529528554094592},
		{CursorClassification.Skin, 13901748381153107456},
		{CursorClassification.Mine, 4669700909741929478 },
		{CursorClassification.Herb, 4683320813727784960 }
	};
</pre>	

### What is perceptual hashing ?

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


## Allowing remote access

The bot runs on the same PC as the WOW client. To expose the bot state via a browser I have used .Net Blazor server. Various threads notify the blazor pages when they have changed. Blazor server then refreshes the browser pages using SignalR. Assuming the PC has opened the port the web server is using then it can be accessed remotely from another device on the same LAN.

![Blazor server](/post/img/wowbot_blazorserver.png)


## Target aquisition

When not in combat a player must select a target in the game either my clicking on it with the mouse or my using the tab key. Targeting using the Tab key doesn't always target the closest NPC, but the one closest to the centre line on the screen and this target must be in a narrow view cone in front of the player, roughly indicated by the yellow lines in the image below. Some targets are not close enough to the view cone and we need another mechanism to enable the bot to target them. This limitation can be overcome by analysing a screenshot and looking for the red name plates of the NPCs (indicated by the white arrows in the image below), and using this to get an idea where to click on the screen to select one of them as your target.

![Targets](/post/img/wowbot_targets.jpg)

## Running a path

One of the first problems I tackled was how to move the character around, we want the character to run around a map through places where NPCs to kill are. We know where we are as the addon can tell us the X,Y of the character and what direction we are facing. If we record a path of X,Y coordinates and store it in a JSON file, we can move between them, we send cursor keys to the client to move forward, turn left or right. Once we get close enough to a way point we can remove it from the list and head towards the next one. Once the list is exhausted we can either retrace our steps (there and back), or run this same path again (good for paths which end close to where they start).

![Path example](/post/img/wowbot_path.png)


## Allowing the bot to be configurable

There are a number of core things that a bot controlled player needs to be able to do: follow a path, find a target, pull the target, fight the target, loot the corpse and return to your corpse if you die. Then there are other less defined tasks such as pressing a key to eat when the character isn't well-fed, these other kinds of actions are ones the user needs to define.

To allow for both types of tasks a Goal object was created, with each goal made up of a sequence of one or more keys which can be pressed, these are the actions. The GOAP agent determines the highest priority goal and allows it to run until it completes or the goal decides to allow the agent to re-determine the highest priority goal.

Each goal has a priority and a predefined set of conditions which must be met for it to be allowed to run. For example the combat goal requires that the player is in combat and has a target, 
this also has a list of "Key" objects which are also evaluated to determine which key to press and when. Each key object has a requirements list to determine if it can be pressed, a key definition to say what key to press and a cooldown in seconds.

The bot configuration is stored in a JSON file e.g.

<pre class="prettyprint" >
	{
	"ClassName": "Mage",

	"PathFilename": "1_Gnome.json",
	"SpiritPathFilename": "1_Gnome_SpiritHealer.json",

	"Pull": {
		"Sequence": [
		{
			"Name": "Fireball",
			"HasCastBar": true,
			"StopBeforeCast": true,
			"Key": "2",
			"ManaRequirement": 30
		}
		]
	},
	"Combat": {
		"Sequence": [
		{
			"Name": "Fireball",
			"HasCastBar": true,
			"StopBeforeCast": true,
			"Key": "2",
			"ManaRequirement": 30
		},
		{
			"Name": "Interact",
			"Key": "H",
			"Cooldown": 3
		}
		]
	},
	"Adhoc": {
		"Sequence": [
		{
			"Name": "Frost Armor",
			"StopBeforeCast": false,
			"Key": "3",
			"ManaRequirement": 60,
			"Requirement": "not Frost Armor"
		},
		{
			"Name": "Drink",
			"HasCastBar": true,
			"StopBeforeCast": true,
			"Key": "-",
			"Requirement": "Mana%<50",
			"Cooldown": 60
		}
		]
	}
	}
</pre>

## Getting stuck

Occasionally when moving between locations the bot gets stuck when it tries to run through something it can't such as a house. This is a tricky problem to solve as we don't know what we are trying to run through or how big it is. The main way to fix this issue is to make sure your path avoids such obstacles, but sometimes when approaching an NPC or returning back to the path after killing an NPC this issue occurs. 

Firstly I have to track when the bot has got stuck by tracking a lack of movement when there should be some. Once it is determines that the bot is stuck the simplest solution is to try to jump over the obstacle and this solves most problems. If this fails then trying to strafe(moving sideways) in a random direction usually works, but can take a few attempts. If this fails after a couple of minutes the bot gives up and stops.

This problem needs further work as it currently has quite a simplistic solution.



# More about GOAP and how I have used it

"Goal oriented action planning is an artificial intelligence system for agents that allows them to plan a sequence of actions to satisfy a particular goal. The particular sequence of actions depends not only on the goal but also on the current state of the world and the agent. This means that if the same goal is supplied for different agents or world states, you can get a completely different sequence of actions, which makes the AI more dynamic and realistic"

My bot is a single agent which does not have complex goals which require a tree of multi branching actions. All of the goals are one level deep. So there isn't really any planning, but the framework that GOAP provides allows for many goals to be available and to switch between them easily as the world state changes rapidly.  

## Evaluation of bot AI logic choices

| Name  |  Pros  |  Cons  |
|---|---|---|
| [Finite State Machine](https://en.wikipedia.org/wiki/Finite-state_machine)   | Good for simple problems  | As more states are added it becomes hard to maintain and debug, is not modular and is code intensive. |
| [Goal Orientated Action Planning](https://gamedevelopment.tutsplus.com/tutorials/goal-oriented-action-planning-for-a-smarter-ai--cms-20793)  | Responsive to a changing world state. Actions can be designed independently of goals.  | Can be harder/ more complicated to design correctly. Can be slow to plan.  |
| [Behavior Tree](https://en.wikipedia.org/wiki/Behavior_tree_(artificial_intelligence,_robotics_and_control))  |  Good visual readability, designer friendly, easy to debug and modular. | The cost of evaluating the tree can be expensive. Bad handling of  interruptions. |
