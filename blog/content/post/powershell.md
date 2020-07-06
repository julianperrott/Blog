+++
date = "2020-04-15"
title = "An Introduction to Powershell"
description = "A useful skill to have in your dev toolbox to create scripts to do almost anything."
slug = "Powershell"
draft = true

background = "bg_powershell"
+++

I've been using Powershell for a couple of years and it is a useful skill to have in your toolbox. In can be far easier to write a script to complete a task, than to build an exe.

As a flavour of the kinds of things you can do, these are some that I use it for:

* Working with files.
* Running exes / containers.
* Creating Menus.
* Running installers.
* Extracting files.
* Steps in CI / CD.
* Any repetative set of actions.

## What is Powershell

Powershell is a task automation and configuration management framework from Microsoft, 
consisting of a command-line shell and associated scripting language. It is Cross-platform (Windows, macOS, CentOS and Ubuntu), so your skill is useful outside of windows. It was first released in 2006, the current version is 7 (released December 2019).

In PowerShell, administrative tasks are generally performed by what's known as cmdlets which are specialized .NET classes implementing a particular operation. For example 'Rename-Item' allows you to rename a file. The cmdlets work by accessing data in different data stores, like the file system or registry, which are made available to PowerShell via providers. Third-party developers can add cmdlets and providers to PowerShell. Cmdlets may also be used by scripts and scripts may be packaged into modules.

In windows everything is an API which returns structured data in the form of objects. These objects can be passed to other cmdlets to allow for a pipeline of commands.

Windows PowerShell can execute four kinds of named commands:

* cmdlets (.NET Framework programs designed to interact with PowerShell) - Cmdlets are specialized .NET classes.
* PowerShell scripts (files suffixed by .ps1).
* PowerShell functions.
* standalone executable programs.


https://en.wikipedia.org/wiki/PowerShell

https://docs.microsoft.com/en-us/powershell

## Running Powershell Interactively

There are 2 ways I run powershell interactively.

* Powershell CLI - a command line window where commands can be executed.
* Windows PowerShell ISE - ISE stands for Integrated Scripting Environment, it is a graphical user interface that allows you to run commands and create, modify and test scripts without having to type all the commands in the command line. ISE also has a helpful list of commands you can search.

![Powershell command line and ISE screenshot](/post/img/powershell_GetHost.png)

### Where do I get it ?

On Windows 10 version 5.1 "Window Powershell" should already be an installed. Go to the start menu and launch it. 

To find out what version you have installed type:

<pre class="prettyprint">
    > Get-Host | Select-Object Version
</pre>

Version 7 can be installed from: https://github.com/PowerShell/PowerShell#get-powershell

More information about the Select-Object cmdlet can be seen here:
https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/select-object?view=powershell-5.1 

### How do I use Commands ?

So what is "Get-Host" that we just called ? When you run it then an object will be returned of type "Windows PowerShell ISE Host" or "ConsoleHost" (depending upon where you run it from). The result of the cmdlet is an object which has properties which you can work with, or pass the whole object onto another command using a pipe symbol '|'.

<pre class="prettyprint">
    PS C:\windows\system32> Get-Host
    Name             : Windows PowerShell ISE Host
    Version          : 5.1.17763.1007
    InstanceId       : c38d1071-df2a-45a3-b03a-e42d47156137
    UI               : System.Management.Automation.Internal.Host.InternalHostUserInterface
    CurrentCulture   : en-GB
    CurrentUICulture : en-GB
    PrivateData      : Microsoft.PowerShell.Host.ISE.ISEOptions
    DebuggerEnabled  : True
    IsRunspacePushed : False
    Runspace         : System.Management.Automation.Runspaces.LocalRunspace
</pre>

### Referencing the Properties of an Object

A dot allows you to reference properties of an object and call methods associated with those properties, you must wrap the cmdlet in brackets so it has been evaluated first. 'Version' is an object of type System.Version which has a ToString() method, so it combines all it's version values into one string.

<pre class="prettyprint">
    > (Get-Host).Version.ToString()  
     5.1.17763.1007    
</pre>

You can also use Select-Object to get a property from an object. '|' is a pipe which passes the result of one command into the next.

Note: The Select-Object cmdlet selects specified properties of an object or set of objects. It can also select unique objects, a specified number of objects, or objects in a specified position in an array.

<pre class="prettyprint">
    > Get-Host | Select-Object -Property Version
    Version       
    -------       
    5.1.17763.1007
</pre>

using Select with -ExpandProperty allows access to the properties of an object in the pipeline.

<pre class="prettyprint">
    > Get-Host | Select-Object -ExpandProperty Version
    
    Major  Minor  Build  Revision
    -----  -----  -----  --------
    5      1      17763  1007    
</pre>

### Learning about the Properties of an Object

The cmdlet Get-Member will list the members of an object. This can be useful to discover what you can do with an object.

<pre class="prettyprint">
    > PS C:\windows\system32> (Get-Host).Version | Get-Member
    
       TypeName: System.Version

    Name          MemberType Definition                                                                                                                                                         
    ----          ---------- ----------                                                                                                                                                         
    ToString      Method     string ToString(), string ToString(int fieldCount)                                                                                                                 
    Build         Property   int Build {get;}                                                                                                                                                   
    Major         Property   int Major {get;}                                                                                                                                                   
    MajorRevision Property   int16 MajorRevision {get;}                                                                                                                                         
    Minor         Property   int Minor {get;}                                                                                                                                                   
    MinorRevision Property   int16 MinorRevision {get;}                                                                                                                                         
    Revision      Property   int Revision {get;}         
</pre>

### Exercise 1

If you would like to try to apply what you have read so far, fire up powershell. "Find out only the build number of powershell using 'Get-Host'". The answer can be found at the end of this blog.

<pre class="prettyprint">
    > ?
    Build
    -----
    17763
</pre>

## Using Variables

Variables can be created and they hold objects. These variable are defined using the $ symbol. 

In the code below I am assigning some variables which are strings and integers. A string can be defined using either single or double quotes. Next I write them to the output using Write-Host.

<pre class="prettyprint">
    > $player1 = "julian"; $player2 = 'jane';$player1Score=23; $player2Score=98;
    > Write-Host "$player1 $player1Score, $player2 $player2Score. Total score: ("($player1Score+$player2Score)")"
    julian 23, jane 98. Total score: ( 121 )
</pre>

Variables can be used in if statements:

<pre class="prettyprint">
    > if ($player1Score > $player2Score) { Write-Host "$player1 wins" } else { Write-Host "$player2 wins"}
	jane wins
</pre>

## Working with Files

Cmdlet Get-ChildItem allows you to view file details. If we set up a folder location we can pass that into the cmdlet so search for files using a filter.

<pre class="prettyprint">
    > $folder="c:\windows\system32"
    > Get-ChildItem $folder -filter *.dll

        Directory: C:\windows\system32
    Mode                LastWriteTime         Length Name                                                                                                                                         
    ----                -------------         ------ ----                                                                                                                                         
    -a----       15/09/2018     08:28         196608 aadauthhelper.dll                                                                                                                            
    -a----       05/04/2020     15:56         692736 aadcloudap.dll                                                                                                                               
    -a----       15/09/2018     08:28          68096 aadjcsp.dll                                                                                                                                  
    -a----       05/04/2020     15:56        1824768 aadtb.dll                                                                                                                                    
    -a----       15/09/2018     08:28         145720 aadWamExtension.dll
	... etc
</pre>

https://docs.microsoft.com/en-us/powershell/scripting/samples/working-with-files-and-folders?view=powershell-5.1

### Exercise 2

Find all png files starting with 'S' in c:\windows\system32 and then put the result into a variable (Use a modified version of the above Get-ChildItem example). The answer can be found at the end of this blog.

<pre class="prettyprint">
    > $files = ?
</pre>	

## Working with arrays

We often need to work with sets of objects. We can refer to an element in a list / array using square brackets [ ] and passing an index.

Lets investigate element 0 in our array:

<pre class="prettyprint">
    > $files[0]
    Directory: C:\windows\system32
    Mode                LastWriteTime         Length Name                                                                                                                                         
    ----                -------------         ------ ----                                                                                                                                         
    -a----       15/09/2018     08:28            232 @AppHelpToast.png    
</pre>

We can see that different properties for the item are shown. It is more than just a string, it is an object. We can see which properties it has using 'Get-Member'.

<pre class="prettyprint">
    > $files[0] | Get-Member
	Name                      MemberType     Definition                                                                                                                                           
	----                      ----------     ----------                                                                                                                                           
	... (not all members shown)
	Directory                 Property       System.IO.DirectoryInfo Directory {get;}                                                                                                             
	DirectoryName             Property       string DirectoryName {get;}                                                                                                                          
	Exists                    Property       bool Exists {get;}     
	FullName                  Property       string FullName {get;}                                                                                                                               
	IsReadOnly                Property       bool IsReadOnly {get;set;}                                                                                                                           
	LastWriteTime             Property       datetime LastWriteTime {get;set;}                                                                                                                    
	Length                    Property       long Length {get;}                                                                                                                                   
</pre>

We can also access the properties of the object for example FullName.

<pre class="prettyprint">
    > $files[0].FullName
    C:\windows\system32\@AppHelpToast.png
</pre>

We can also work with the whole set of files and do something with each element for example. In this example I am going to launch the first 5 in chrome:

<pre class="prettyprint">
    > $files | Select-Object -First 5 | ForEach-Object { $file=$_.FullName; Start-Process "chrome.exe" "file:///$file" }
or 

    > Get-ChildItem -Path "c:\windows\system32" -Filter s*.png | Select-Object -First 5 | ForEach-Object {  $file=$_.FullName; Start-Process "chrome.exe" "file:///$file"}
</pre>

![Powershell images launched in Chrome](/post/img/Powershell_Files.png)

Files can be deleted using cmdlet "Remove-Item" or viewed using Get-Content.

<pre class="prettyprint">
    > Get-Content (Get-ChildItem -Path *  -filter *.txt)[0]
    
    Third Party Legal Notices 
    This product contains software licensed under terms which require Microsoft to display the following notice(s): 
    •	For LibTif only: 
    o	Note: While Microsoft is not the author of this file, Microsoft is offering you a license subject to the terms of the end user license agreement for LIBTIF. Microsoft reserves all other rig
    hts. The notices below are provided for informational purposes only and are not the license terms under which Microsoft distributed this file.
    o	Copyright (c) 1988-1997 Sam Leffler 
    o	Copyright (c) 1991-1997 Silicon Graphics, Inc. 
</pre>

## Working with Windows Services

Scripting the management of services can be very useful. There are commands to view, stop, start and manage the properties of a service. You can find out what service are in a particular state.

<pre class="prettyprint">
    > (Get-Service)[0] | Get-Member
    > Get-Service | Where-Object {$_.Status -eq 'Stopped'}
</pre>

https://docs.microsoft.com/en-us/powershell/scripting/samples/managing-services?view=powershell-7

## Cmdlet Aliases

Certain commands have aliases which have shortened names for example the alias for 'Get-Content' is 'cat'.

<pre class="prettyprint">
   > Get-ChildItem -Path "c:\windows\system32" -Filter *.txt | ForEach-Object { cat $_.FullName }
</pre>

https://ilovepowershell.com/2011/11/03/list-of-top-powershell-alias/
https://docs.microsoft.com/en-us/powershell/scripting/developer/cmdlet/cmdlet-aliases?view=powershell-7

## Creating a Script

Creating scripts is where the real power of Powershell is achieved. Allowing automation to save time and increase quality.

Scripts can accept parameters either via being passed as parameters, being input by the user or from pre-set host variables.

We are going to create a script to do the following:

1. Get a city from the user.
2. Find out the time for that City: (Invoke-WebRequest "http://worldtimeapi.org/api/timezone/Europe/London").Content
3. Format the result.

The command to accept input from the user is Read-Host. If we put the following into a file and name it timezone.ps1 we can executed it using .\timezone.ps1

<pre class="prettyprint">
    $city = Read-Host "What city ?"
    $content = (Invoke-WebRequest "http://worldtimeapi.org/api/timezone/Europe/$city").Content
    Write-Host (ConvertFrom-Json $content).datetime
</pre>

Note: the script is not digitally signed so you will need to allow it to run by running: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine

<pre class="prettyprint">
    > Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
    > .\timezone.ps1
    What city ?: London
    2020-04-14T19:28:09.588199+01:00
</pre>

We can improve the script by showing just the time in a nicer message. We can also pass a value into the script using the param keyword.

<pre class="prettyprint">
    param ([string]$city)
    $content = (Invoke-WebRequest "http://worldtimeapi.org/api/timezone/Europe/$city").Content
    $time=((ConvertFrom-Json $content).datetime).SubString(11,5)
    Write-Host "In $city it is $time"

    > .\timezone.ps1 "London"
	In London it is 19:33
</pre>

## Functions		 

Functions allow libaries of defined in files and then loaded and used as needed.

<pre class="prettyprint">
    function getCityTime
    {
  	    param ([string]$city)
	    $content = (Invoke-WebRequest "http://worldtimeapi.org/api/timezone/Europe/$city").Content
	    Write-Host (ConvertFrom-Json $content).datetime
    }
</pre>
We can place this in a file called getCityTime.ps1 and then load it read for use.

<pre class="prettyprint">
    > . .\getCityTime.ps1
    
    > getCityTime "london"
    2020-04-14T19:39:03.094545+01:00

    > getCityTime "Paris"
    2020-04-14T20:39:09.142408+02:00
</pre>

## Miscellaneous Tidbits

### Tailing a file

You can tail a text file to watch for changes using the -wait argument on the Get-Content cmdlet.

<pre class="prettyprint">
	> Add-Content dealer.txt "Hello from PS1"
	> cat dealer.txt -wait
    Hello from PS1
    Hello from PS2
</pre>

From another powershell enter the following command to append a line to the text file. The line will appear in the firest powershell session.

<pre class="prettyprint">
	> Add-Content dealer.txt "Hello from PS2"
</pre>

### Unzipping Archives

To extract an archive use the "expand-archive" cmdlet.

<pre class="prettyprint">
    > $name = "myzipfile.zip"
    > expand-archive -Path "$name" -DestinationPath . -force		
</pre>

## Exercise Answers

### Exercise 1: Find out the build number of powershell using 'Get-Host'

<pre class="prettyprint">
    (Get-Host).Version.Build
    Get-Host | Select -ExpandProperty Version | Select Build
</pre>

### Exercise 2: Find all png files starting with 'S' in c:\windows\system32 and then put the result into a variable.

<pre class="prettyprint">
    $folder="c:\windows\system32"
    $files = Get-ChildItem $folder -filter *.png
</pre>