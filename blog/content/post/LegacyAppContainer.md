+++
date = "2019-02-14"
title = "Windows Container Guide For Legacy Applications"
description = "How to create windows app Docker images and troubleshoot them."
slug = "Containerise-Legacy-Windows-Apps"
draft = true

background = "bg_legacy_container"
+++

I've converted about 30 web applications and windows services into Docker container images. I have documented the process as it might be useful to others and for me when I forget. Some of the information in this post may go out of date pretty quickly, but it should point you in the right direction.

----

*"Docker on Windows: From 101 to production with Docker on Windows" is a book by Elton Stoneman which I recommend. He also has blog at blog.sixeyed.com*

----

## Firstly, understanding your application {#alpha-101}
You can compare containerising an application to installing via powershell on a freshly installed server. Some of the things to understand are as follows:

* What version of the windows operation system can be used ?
* What dependencies does it have ?
* How do I install it ?
* How is it configured ?

### What version of the windows operation system can be used ?
Firstly, determine the version of Windows server your test / production environments use, so you know what the app currently works under. You can find out using powershell command: 

<pre class="prettyprint" >
> [System.Environment]::OSVersion.Version 

Major  Minor  Build  Revision
-----  -----  -----  --------
10     0      16299  0
</pre>

If its not server 2016 or later, then the OS is not supported by containerisation and you will need to investigate if it will work 'as is' on a later OS or will require modification. Mainstream support for 2012 has already ended so hopefully you won't have this problem.

The server that will host the container will need to be at the same build or later version as the container. For example the server can't be on the "2016 Long Term Service Channel - 14393" and the container on the "Semi-Annual Service Channel - 16299".

![](/post/img/CLWA_OSSupport.png) 
https://docs.microsoft.com/en-us/virtualization/windowscontainers/deploy-containers/version-compatibility

### Container Base Image

There are two types of base images to choose from:

* nanoserver – smaller, leaner. More suitable for non Microsoft applications.
* Windowsservercore – For most legacy .NET applications

![](/post/img/CLWA_OSTarget.png) 

https://docs.microsoft.com/en-us/dotnet/standard/microservices-architecture/net-core-net-framework-containers/net-container-os-targets

Assuming that Windowsservercore is going to be used, it also has a number of derived images, one of which will be the base image for your legacy app’s container.

*	microsoft/dotnet-framework – for windows services. 
https://hub.docker.com/r/microsoft/dotnet-framework/

*	microsoft/aspnet – for web applications. 
https://hub.docker.com/r/microsoft/aspnet/

You also need to know what version of .NET your application needs. Hopefully it is .NET framework 4 although 3.5 is still supported.
So if my application is a web application which needs .NET framework 4 and my environment supports windows server version 1709. The base image I will use is microsoft/aspnet and the tag is 4.7.2-windowsservercore-1709

<pre class="prettyprint" >
docker pull microsoft/aspnet:4.7.2-windowsservercore-1709
</pre>
----

## Secondly, determine the  application's dependencies
Understanding what else the application needs besides .NET framework will need to be discovered by trial and error or read from the existing installation documentation / company wiki / talking to the development team.

As a first step getting it running locally on your development machine should make it easier to identify the dependencies. If your dev machine has a lot of pre-deployed applications then creating a VM in Hyper V or in Azure can give you a clean machine to work with, it may help if this VM has a UI so you can more easily investigate errors during installation or during first run.
Running “Get-WindowsFeature | Where Installed” or “dism /online /get-features” will show you what features are installed / available on a test/production environment, which may help. 

### Some dependency examples:

Dependency | Description
 --- | ---
Windows Feature Web-Metabase | The metabase is a structure for storing Internet Information Server (IIS) configuration settings
Windows Features NET-WCF-HTTP-Activation45 | Required for WCF .svc services.
Oracle client | This can be installed using the xcopy ODAC version. It also requires the Microsoft Visual C++ 2013 Redistributable.
Crystal Reports Runtime | Installed from CRRuntime msi. It also needs oledlg.dll copied into the windows system folder.
Redis | An in-memory data structure store.

### How do I install it ?

What is most important to understand is whether it can be installed from the command line in a silent mode without any user input via a windows UI. If it can't then it will need to be modified to allow it to. You may need to invesigate the installer software to determine what command line switches enable silent mode.

### How is it configured ?

These are some questions you need to understand about configuration:

* Where are the configuration values are stored, Are they in a file or the registry ? 
* Are they encrypted, and if so do you have a command line tool to do the encryption ?
* Which values can be hardcoded at build time ?
* Which values should be set at runtime ? e.g. Passwords.

----

## Next, build the image

A dockerfile contains several steps used by docker to build your container image. In this example dockerfile below, files are copied into the container which are then installed or run during the build process. 

This example uses a pre-built MSI, other alternatives are to install from a zip file, or best of all to build the application from the source using a multi-stage build (https://blog.sixeyed.com/weekly-windows-dockerfile-6/).

<pre class="prettyprint" >
# Specifies the base image to use
FROM  microsoft/aspnet:4.7.2-windowsservercore-1709

# Copies files from the folder the dockerfile is in into a new folder in the container
COPY . /setup/

# Sets the current container folder to the new folder
WORKDIR c:/setup

# Installs myapp.msi, this msi was copied into the container
RUN  ["msiexec", "/i", "c:\\setup\\myapp.msi", "TARGETvDIR=MyApp", "/q"]

# Runs a powershell script to do more configuration
RUN  "./config.ps1"

# Sets the file that will execute when the container starts
ENTRYPOINT ["powershell", "c:\\setup\\config-runtime.ps1"]
</pre>

![](/post/img/CLWA_Folder.png) 


The build process is started using the docker build command:

https://docs.docker.com/engine/reference/builder/#usage

<pre class="prettyprint" >
PS D:\dockerfiles\myapp> docker build . -t myapp --no-cache
Sending build context to Docker daemon  9.062MB
Step 1/6 : FROM  cloudone.azurecr.io/oneeducation-oraclewebserver
 ---> d4ca81feabce
Step 2/6 : COPY . /setup/
 ---> 59307e7d451f
Step 3/6 : WORKDIR c:/setup
 ---> Running in 3f1be8744826
Removing intermediate container 3f1be8744826
 ---> 5e16c8412a89
Step 4/6 : RUN  ["msiexec", "/i", "c:\\setup\\myapp.msi", "TARGETvDIR=MyApp", "/q"]
 ---> Running in afe9cc86500f
Removing intermediate container afe9cc86500f
 ---> 0c303087bec3
Step 5/6 : RUN  "./config.ps1"
 ---> Running in 075baf70f75b
config.ps1 running
Removing intermediate container 075baf70f75b
 ---> 91c4ffddc324
Step 6/6 : ENTRYPOINT ["powershell", "c:\\setup\\config-runtime.ps1"]
 ---> Running in 3cb765eb549c
Removing intermediate container 3cb765eb549c
 ---> 60765c722b33
Successfully built 60765c722b33
Successfully tagged myapp:latest
</pre>

### Installation of the application using an MSI
If your application is built into an MSI it can be installed using misexec. The following command installs myapp.msi which was copied into the container by the previous copy step.
<pre class="prettyprint" >
COPY . /setup/
RUN  ["msiexec", "/i", "c:\\setup\\myapp.msi", "TARGETvDIR=MyApp", "/q"","/L*V","install.log"]
</pre>

#### Install errors
Error during installation are possible. To enable their investigation I recommend you include /L*VX and a log filename in your msiexec command parameters.
An error might look like this:
<pre class="prettyprint" >
---> Running in f01d25c18b33
The command 'msiexec /i c:\setup\myapp.msi TARGETvDIR=MyApp /q /L*VX install.log' returned a non-zero code: 1603
</pre>

When docker errors during a build you don’t have an image you can run to investigate further. What you have is an intermediate layer which must be committed before you can access the log. 
The name of the image to commit from the example above is f01d25c18b33, only a couple of chars is needed to uniquely refer to it. I will name this committed image Msilog.
<pre class="prettyprint" >
docker commit f01d msilog
</pre>

#### To investigate the log you can do one of the following:

a) Enter the container and simply view the log: (probably not the easiest way to do it)

<pre class="prettyprint" >
docker run -it --entrypoint powershell msilog
get-content install.log
</pre>

b) Enter the container and copy the log to a shared volume:

<pre class="prettyprint" >

docker run -it --entrypoint powershell -v c:\temp:c:\shared msilog
copy *.log c:\shared\
exit
notepad c:\temp\install.log
</pre>

c) Run the container and copy the file out.

<pre class="prettyprint" >
docker run -d --name msilog1 --entrypoint powershell msilog
docker cp msilog1:c:\setup\install.log c:\temp\install.log
notepad c:\temp\install.log
</pre>

#### Understanding the MSI Error

The reason for the error is unlikely to be documented at the end of the log. It will be worth searching for the last occurrence of ‘value 3’ (An unrecoverable error has occurred).

<pre class="prettyprint" >
Error 1606. Could not access network location \MyApp.
Action ended 16:49:40: INSTALL. Return value 3.
</pre>

This blog may help you further understand the log: https://blogs.technet.microsoft.com/richard_macdonald/2007/04/02/how-to-interpret-windows-installer-logs/


### Installation of the application using a Zip file
Zip files can be extracted using powershell command ‘Expand-Archive’.The command below will extract a zip file into the IIS folder. The file in this case ‘MyWebSite.zip’ is copied into the container by a previous step. 

<pre class="prettyprint" >
COPY . /setup/
RUN powershell -Command "expand-archive -Path 'c:\Setup\MyWebSite.zip' -DestinationPath 'c:/inetpub/wwwroot/MyWebSite'"
</pre>

For a web application you will most likely also need to convert the virtual directory into an application.
<pre class="prettyprint" >
import-module WebAdministration
ConvertTo-WebApplication -PSPath "IIS:\Sites\Default Web Site\MyWebSite"
</pre>

### Static Configuration 
Quite often your application will need modifying from the initial installation state. The may involve adding features to IIS or copying additional configuration files into the web application folder or various other modifications. These can be done as steps in the docker file or could be wrapped up in a powershell script file.

#### Some examples of configuration steps in a docker file:

Description | Command
--- | ---
Add a Windows Feature | RUN Add-WindowsFeature NET-WCF-HTTP-Activation45
Copy File (from outside to inside) | COPY web.config c:/inetpub/wwwroot/MyWebApp/web.config
Copy File (from inside to Inside) | RUN xcopy /Y C:\setup\Oracle.DataAccess.dll C:\inetpub\wwwroot\MyWebApp\bin
Expose a port | EXPOSE 443
Run a powershell script | RUN  "./install.ps1"
Install chocolaty | RUN Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient). DownloadString('https://chocolatey.org/install.ps1'))
Install using chocolaty | RUN ["choco", "install", "vcredist2013", "-y", "--allow-empty-checksums"]
Set environment path | RUN "[Environment]::SetEnvironmentVariable(\"Path\", $env:Path + \";C:\\oracle\\\", [EnvironmentVariableTarget]::Machine)"


There are many things you may want to configure during the container build. These may be easier to do by placing them in a powershell file.

#### Examples of running a powershell script to do configuration:

<pre class="prettyprint" >
RUN  "./config.ps1"
</pre>

Description | Command
--- | ---
Enable IIS Cmdlets | import-module WebAdministration
Set Web Config Property | Set-WebConfigurationProperty -pspath "IIS:\Sites\Default Web Site\MyWebSite\" -Filter "/system.web/customErrors" -Name mode -Value "Off"
Convert virtual directory into a web application | ConvertTo-WebApplication -PSPath "IIS:\Sites\Default Web Site\MyWebSite"
Set service to manual start | Set-Service -Name “MyServiceName” -StartupType Manual<br/>Set-Service -Name W3SVC -StartupType Manual
Stop IIS | NET STOP W3SVC
Stop App pool | Stop-WebAppPool -Name "DefaultAppPool"
Windows Service |  Set service to manual start	Set-Service -Name “MyServiceName” -StartupType Manual

### Tidying up
Old containers and images can take up a lot of space, so tidying up frequently is required.

<a id="part-3"></a>

Description | Example
--- | ---
Stop all running containers	 | docker stop $(docker ps -q)
Kill all running containers	 | docker kill $(docker ps -q)
Delete all stopped containers | docker rm $(docker ps -a -q)
Delete all dangling images | docker rmi $(docker images -f "dangling=true" -q)

----
## Finally, running the container

Once your container has been built you will want to run it. The run command turns our image into a container, below are some of the most useful switches.

Switch | Example | Description
--- | --- | ---
-d | Docker run -d myimagename | Starts the container in detached mode, i.e. not interactive but running in the background.
-it  | docker run -it --entrypoint powershell myimagename  | Run it in interactive mode so you can poke around inside the container. You will probably will want to change the entrypoint to powershell.
-e  | docker run -d -e MYVAR1=http://somesite.com myimagename |  Pass in an environment variable into the container.
--name | Docker run --name MYAPP -d myimagename |  Give your container a friendlier name
-v | Docker run -d -v c:\external:c:\internal myimagename | Mounts a volume which is visible inside and outside of the container, which can be used for copying files in and out.

https://docs.docker.com/engine/reference/run/

### Runtime Configuration
It’s highly likely that not all configuration can be baked into your container at build time and some will need to be done at runtime. For example usernames and passwords could be a security risk if stored in a container, also rebuilding a container because a password changed would be inefficient.
When your container starts you can push in configuration so that a generic container can become specific to your environment. Some examples of run time configuration:

*	Database connection strings
*	Location of services to communicate with
*	Username / password

Configuration can be pushed in as environment variables, secrets or configs.
To use these values you need to set a powershell script to run when the container starts, this will need to be copied into the container from your setup folder during the container build.
The default entypoint was probably ServiceMonitor.exe, we can change it as below to use config-runtime.ps1 as what runs when the container starts. The last step of config-runtime.ps1 will need to call ServiceMonitor.exe so the container doesn't exit immediately.

<pre class="prettyprint" >
# Sets the file that will execute when the container starts
ENTRYPOINT ["powershell", "c:\\setup\\bootstrap.ps1"]
</pre>

example: bootstrap.ps1
<pre class="prettyprint" >
    $site="MyApp"
    #Set database connection string in web.config app setting from an environment variable
    $filter = "appSettings/add[@key=`"$database`"]"
    Set-WebConfigurationProperty -pspath "IIS:\Sites\Default Web Site\$site\" -filter $filter -Name "value"  -Value $env:database
    &c:\\ServiceMonitor.exe w3svc
</pre>

The last line of the bootstrap script should either monitor the w3svc or tail an application log to output it into the docker log.

* &c:\\ServiceMonitor.exe w3svc
* Get-Content -path "C:\inetpub\wwwroot\MyApp\App_Data\log.txt"" -Wait

#### Environment variables
Environment variables can be pushed in as parameters on the Docker run command, via docker compose, or from kubenettes secrets.

<pre class="prettyprint" >
docker run -d -e MYVAR1=”http://somesite.com” -e MYVAR2=23 myimagename
</pre>

They can then be accessed in the bootstrap.ps1 script by pre-fixing with $env. For example to set an appsetting in a web config file you could do the following::

<pre class="prettyprint" >
Set-WebConfigurationProperty -pspath "IIS:\Sites\Default Web Site\MyWebApp\" -filter 'appSettings/add[@key="AppServer"]' -Name "value" -Value $env:MYVAR1
</pre>

#### Docker Compose Secrets
Secrets are the preferred way to push sensitive configuration into a container. They are pushed in via a docker compose file, which might look like the example below. Secrets end up as files in C:\ProgramData\Docker\secrets e.g. C:\ProgramData\Docker\secrets\my_database

<pre class="prettyprint">
  myapp:
    image: mycontainerimage
    ports:
      - target: 80
        published: 80
        protocol: tcp
        mode: host
    deploy:
      replicas: 1
      endpoint_mode: dnsrr
    environment:
      - MYVAR1=http://somesite.com
      - MYVAR2=23
    secrets:
      - my_database
secrets:
  my_database:
    external: true
</pre>


They can be read into vars using Get-Content.

<pre class="prettyprint" >
$key="my_database"
$path = "C:\programdata\docker\secrets\$key"
if([System.IO.File]::Exists($path)){
​    $val = Get-Content $path -First 1
​    $val= $val.Trim();
}
...next, put $val in a config
</pre>

https://docs.docker.com/engine/swarm/secrets/
https://docs.docker.com/compose/compose-file/#long-syntax-2

<a id="part-4"></a>

#### Docker Configs

Swarm service configs allow you to store non-sensitive information, such as configuration files, outside a service’s image or running containers. This allows you to keep your images as generic as possible, without the need to bind-mount configuration files into the containers or use environment variables.
https://docs.docker.com/engine/swarm/configs/

----


## Interacting with your running container

Quite often when testing your containers are working you will need to run commands on them or go in them.

### Container ID Shortcuts
A container can be referred to my its name which is either supplied by you or randomly generated, or by its hex ID. The full hex ID is not needed, as long as the fragment you use uniquely identifies the container then it will work. So 05a82e2ff613 can be referred to by 05 and it should be identified.

![](/post/img/CLWA_ContainerId.png) 

### Getting Log Information
Running the logs command will  show you any output written (Write-Host or Write-Output) while the container is running. This is output only from the process that is running, you won’t see anything from application logs here. ServiceMonitor.exe generally shows very little (https://github.com/Microsoft/IIS.ServiceMonitor)

<pre class="prettyprint">
docker logs 05
</pre>

### Entering a running container
You may need to enter a container to investigate a failed install, or look at the state of it. This command will take you inside.

<pre class="prettyprint">
docker exec -it containerid powershell
</pre>

### Executing a powershell command in a running container
You can run commands on the container without entering the container:
<pre class="prettyprint">
docker exec -i containerid powershell Get-Service W3SVC
</pre>
Or execute an internal powershell script in the container.
<pre class="prettyprint">
docker exec -i containerid powershell .\config.ps1
</pre>

### Recycle the app pool
If you need to reset your web application then an app pool recycle should be done, rather than an IISRESET which will kill your container as the ServiceMonitor will think it has finished.
<pre class="prettyprint">
docker exec -i containerid powershell Restart-WebAppPool -Name "DefaultAppPool"

</pre>

### Copying a file from a running container

If you have a log or some other file you want to copy out it is pretty easy to get it out.

<pre class="prettyprint">
docker cp containerid:c:\setup\install.log c:\temp\install.log
</pre>

### Copying a file to a running container
Copying to will may require stopping the container first, doing the copy and then restarting it… which is far from ideal. It’s probably easier to mount a volume.
<pre class="prettyprint">
docker cp myscript.ps1 containerid:"c:\setup"
</pre>

### Viewing the event log
Viewing the event log is useful when trying to get a container to work. Sometime helpful errors relating to web server crashes are logged there. 

#### wevtutil
This command gets the last 10 application messages:

This command gets the last 10 application messages:

<pre class="prettyprint">
docker exec -i containerid powershell  “wevtutil qe Application /c:10 /rd:true /f:text”
Event[0]:
  Log Name: Application
  Source: MyIntegrationService
  Date: 2019-01-05T11:25:48.065
  Event ID: 0
  Task: N/A
  Level: Error
  Opcode: Info
  Keyword: Classic
  User: N/A
  User Name: N/A
  Computer: e00608d0645d
  Description:
Service cannot be started. System.Runtime.InteropServices.SEHException (0x80004005): External component has thrown an exception.
   at System.RuntimeMethodHandle.InvokeMethod(Object target, Object[] arguments, Signature sig, Boolean constructor)
   at System.Reflection.RuntimeConstructorInfo.Invoke(BindingFlags invokeAttr, Binder binder, Object[] parameters, CultureInfo culture)
   at System.ServiceModel.Description.ServiceDescription.CreateImplementation(Type serviceType)
   at System.ServiceModel.Description.ServiceDescription.SetupSingleton(ServiceDescription serviceDescription, Object implementation, Boolean isWellKnown)
   at System.ServiceModel.Description.ServiceDescription.GetService(Type serviceType)
   at System.ServiceModel.ServiceHost.CreateDescription(IDictionary`2& implementedContracts)
   at System.ServiceModel.ServiceHostBase.InitializeDescription(UriSchemeKeyedCollection baseAddresses)
   at System.ServiceModel.ServiceHost..ctor(Type serviceType, Uri[] baseAddresses)
   at IntegrationServer.IntegrationServi...

Event[1]:  … etc, other 9 messages
</pre>


#### Get-EventLog
Alternatively you can use Get-EventLog:

<pre class="prettyprint">
docker exec -i containerid powershell Get-EventLog -Newest 10 -LogName "Application"
   Index Time          EntryType   Source                 InstanceID Message
   ----- ----          ---------   ------                 ---------- -------
     120 Jan 05 11:27  Error       MyIntegrat...            0 Service...
     119 Jan 05 11:27  Error       .NET Runtime                 1026 Applica...
     118 Jan 05 11:26  Error       MyIntegrat...            0 Service...
     117 Jan 05 11:26  Error       .NET Runtime                 1026 Applica...
     116 Jan 05 11:25  Error       MyIntegrat...            0 Service...
     115 Jan 05 11:25  Error       .NET Runtime                 1026 Applica...
     114 Jan 05 11:24  Error       MyIntegrat...            0 Service...
     113 Jan 05 11:24  Error       .NET Runtime                 1026 Applica...
     112 Jan 05 11:23  Error       MyIntegrat...            0 Service...
     111 Jan 05 11:23  Error       .NET Runtime                 1026 Applica...
</pre>

The interesting stuff is usually in the message, so preventing it from being truncated is useful.

<pre class="prettyprint">
docker exec -i containerid powershell "Get-EventLog -Newest 10 -LogName Application | Format-Table Index,EntryType,Message -AutoSize -Wrap"
Index   EntryType Message
-----   --------- -------
  125       Error Service cannot be started.
                  System.Runtime.InteropServices.SEHException (0x80004005):
                  External component has thrown an exception. at System.RuntimeMethodHandle.InvokeMethod(Object target,
                  Object[] arguments, Signature sig, Boolean constructor) at System.Reflection.RuntimeConstructorInfo.Invoke(BindingFlags
                  invokeAttr, Binder binder, Object[] parameters, CultureInfo culture)
                     at System.ServiceModel.Description.ServiceDescription.CreateImplementation(Type serviceType)
                     at System.ServiceModel.Description.ServiceDescription.SetupSingleton(ServiceDescription serviceDescription, Object
                  implementation, Boolean isWellKnown)
                     at System.ServiceModel.Description.ServiceDescription.GetService(Type serviceType)
                     at System.ServiceModel.ServiceHost.CreateDescription(IDictionary`2& implementedContracts)
                     at System.ServiceModel.ServiceHostBase.InitializeDescription(UriSchemeKeyedCollection baseAddresses)
                     at System.ServiceModel.ServiceHost..ctor(TypeserviceType, Uri[] baseAddresses)
                     at IntegrationServer.IntegrationServi...
  124       Error Application: IntegrationServer.exe
	Etc …
</pre>

#### Backing the event log up
The event log can also be backed up and extracted out of the container if necessary for viewing by the host UI event log viewer:
<pre class="prettyprint">
docker exec -i containerid powershell wevtutil epl Application C:\setup\AppLogBackup.evtx
docker stop containerid
docker cp containerid:c:\setup\AppLogBackup. evtx c:\temp
</pre>

https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.management/get-eventlog?view=powershell-5.1
https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/wevtutil

#### Viewing a log file in a container
Custom text logs can be viewed by using powershell command ‘Get-Content’, or its alias ‘cat’.


<a id="part-5"></a>

<pre class="prettyprint">
docker exec -i EMAIL powershell  “get-content c:\email_services\log-file.txt”
docker exec -i EMAIL powershell  “cat c:\inetpub\wwwroot\myweb\app_data\log.txt”
</pre>

<hr/>

## Tidying up
Old containers and images can take up a lot of space, so tidying up frequently is required.

Description | Example
--- | ---
Stop all running containers	 | docker stop $(docker ps -q)
Kill all running containers	 | docker kill $(docker ps -q)
Delete all stopped containers | docker rm $(docker ps -a -q)
Delete all dangling images | docker rmi $(docker images -f "dangling=true" -q)

----

## Further IIS configuration

### Localisation
If your web server is set to the wrong locale then it won’t format dates etc correctly. It appears that the configuration of this needs to be done at runtime with IIS Stopped. So changing this configuration can be part of your config-runtime.ps file.

e.g.

<pre class="prettyprint">
Write-Host "Set culture to en-GB."
Import-Module International
Set-WinSystemLocale -SystemLocale en-GB
Set-WinHomeLocation -GeoId 242
Set-WinUserLanguageList -LanguageList (New-WinUserLanguageList -Language en-GB) -Force
Set-Culture en-GB

c:\windows\system32\control.exe "intl.cpl,,/f:`"C:/setup/UKRegion.xml`""
</pre>

<pre class="prettyprint">
&lt;gs:GlobalizationServices xmlns:gs="urn:longhornGlobalizationUnattend"&gt; 
    &lt;!--User List--&gt;
    &lt;gs:UserList&gt;
        &lt;gs:User UserID="Current" CopySettingsToDefaultUserAcct="true" CopySettingsToSystemAcct="true"/&gt; 
    &lt;/gs:UserList&gt;
    &lt;!-- user locale --&gt;
    &lt;gs:UserLocale&gt; 
        &lt;gs:Locale Name="en-GB" SetAsCurrent="true"/&gt; 
    &lt;/gs:UserLocale&gt;
    &lt;!-- system locale --&gt;
    &lt;gs:SystemLocale Name="en-GB"/&gt;
    &lt;!-- GeoID --&gt;
    &lt;gs:LocationPreferences&gt; 
        &lt;gs:GeoID Value="242"/&gt; 
    &lt;/gs:LocationPreferences&gt;
    &lt;gs:MUILanguagePreferences&gt;
        &lt;gs:MUILanguage Value="en-GB"/&gt;
        &lt;gs:MUIFallback Value="en-US"/&gt;
    &lt;/gs:MUILanguagePreferences&gt;
    &lt;!-- input preferences --&gt;
    &lt;gs:InputPreferences&gt;
        &lt;!--en-GB--&gt;
        &lt;gs:InputLanguageID Action="add" ID="0809:00000809" Default="true"/&gt; 
    &lt;/gs:InputPreferences&gt;
&lt;/gs:GlobalizationServices&gt;
</pre>

https://www.lewisroberts.com/2017/03/01/set-language-culture-timezone-using-powershell/ 

### Stopping / Starting IIS
It is important that your web application is not running until it has been configured at run time.

Stop during build:

<pre class="prettyprint">
Set-Service -Name W3SVC -StartupType Manual
NET STOP W3SVC
Stop-WebAppPool -Name "DefaultAppPool"
</pre>

Start at runtime after configuration:
<pre class="prettyprint">
Set-Service -Name W3SVC -StartupType Automatic
NET START W3SVC
Start-WebAppPool -Name "DefaultAppPool"
</pre>

### App pool idle timeout
It makes sense to increase the idle timeout from the default 20 mins to something larger so that your application is more responsive after a period of inactivity. This may not be necessary if you have configured a health check.

<pre class="prettyprint">
import-module WebAdministration
$name="DefaultAppPool"
Set-ItemProperty ("IIS:\AppPools\$name") -Name processModel.idleTimeout -value ( [TimeSpan]::FromMinutes(120))
$timeout=Get-ItemProperty ("IIS:\AppPools\$name") -Name processModel.idleTimeout.value
Write-Host "IIS Idle Timeout=$timeout"
</pre>

https://stackoverflow.com/questions/19985710/iis-idle-timeout-vs-recycle

### Compression
Dynamic compression helps performance as less data needs to be moved from the server to the client. You will need to work out what mime type your application uses and configure them as appropriate.

<pre class="prettyprint">
Import-Module ServerManager
Add-WindowsFeature Web-Metabase
Add-WindowsFeature Web-Dyn-Compression

$env:windir\system32\inetsrv\Appcmd.exe set config -section:urlCompression /doDynamicCompression:true
& $env:windir\System32\Inetsrv\Appcmd.exe set config -section:httpCompression "-[name='gzip'].staticCompressionLevel:7"
& $env:windir\System32\Inetsrv\Appcmd.exe set config -section:httpCompression "-[name='gzip'].dynamicCompressionLevel:4"
& $env:windir\system32\inetsrv\appcmd.exe set config -section:system.webServer/httpCompression /+"dynamicTypes.[mimeType='application/json',enabled='True']" /commit:apphost
& $env:windir\system32\inetsrv\appcmd.exe set config -section:system.webServer/httpCompression /+"dynamicTypes.[mimeType='application/json; charset=utf-8',enabled='True']" /commit:apphost
& $env:windir\system32\inetsrv\appcmd.exe set config -section:system.webServer/httpCompression /+"dynamicTypes.[mimeType='application/soap+xml',enabled='True']" /commit:apphost
& $env:windir\system32\inetsrv\appcmd.exe set config -section:system.webServer/httpCompression /+"dynamicTypes.[mimeType='application/soap+xml; charset=utf-8',enabled='True']" /commit:apphost
& $env:windir\system32\inetsrv\appcmd.exe set config -section:system.webServer/httpCompression /+"dynamicTypes.[mimeType='application/soap+msbin1',enabled='True']" /commit:apphost
</pre>

https://stackoverflow.com/questions/2384647/how-can-i-turn-on-dynamiccompression-feature-of-iis-programmatically

https://weblogs.asp.net/owscott/iis-7-compression-good-bad-how-much

https://blogs.msdn.microsoft.com/friis/2017/09/05/iis-dynamic-compression-and-new-dynamic-compression-features-in-iis-10/

### Using IIS Manager on a container
It may be useful to use IIS Manager to troubleshoot a service during containerisation. To allow IIS Manager to connect to your container you will need to run a script inside the container to enable the web management service and to create a user.

![](/post/img/CLWA_Manager1.png) 

<pre class="prettyprint">
Install-WindowsFeature -Name Web-Mgmt-Service
New-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\WebManagement\Server -Name EnableRemoteManagement -Value 1 -Force
Get-Service -Name WMSVC | Start-Service
net user "jperrott" "#Password1" /ADD
net localgroup administrators "jperrott" /add
</pre>

If your host IIS Manager does not allow you to connect to remote servers then you will need to download “IIS Manager for Remote Administration”. Then connect to your container IP/name from “File -> Connect to a Server”, enter the credentials of the user you just created to connect.

![](/post/img/CLWA_Manager2.png) 

### Investigating 500 Internal Server Errors

If when you run your container for the first time you get a 500 error and the event log 
doesn’t shed any light on the issue then it may help to turn on “Failed Request Tracing”. You can also use this to trace other errors or slow performance.

 ![](/post/img/CLWA_Tracing3.png) 

First install the tracing feature, then turn on tracing by adding a rule as below.

<pre class="prettyprint">
Add-WindowsFeature Web-Http-Tracing
Enable-WebRequestTracing -Name "Default Web Site"
</pre>

If you enable remote management of IIS, then this is what the feature will now look like:

![](/post/img/CLWA_Tracing1.png) 
![](/post/img/CLWA_Tracing2.png) 

Next capture an error by browsing to your container's web application. This should write some xml files in C:\inetpub\logs\failedreqlogfiles\w3svc1. 

![](/post/img/CLWA_Tracing4.png) 

Copy them out of the container after first stopping it.
<pre class="prettyprint">
docker exec -i 4d powershell "dir C:\inetpub\logs\failedreqlogfiles\w3svc1"
docker stop 4d
docker cp 4d:C:\inetpub\logs\failedreqlogfiles\w3svc1\fr000001.xml .
</pre>
Next open up the file in internet explorer, and click on compact view and hopefully find the smoking gun.

![](/post/img/CLWA_Tracing5.png) 

https://blogs.msdn.microsoft.com/benjaminperkins/2016/06/15/lab-4-install-and-configure-failed-request-tracing/
https://docs.microsoft.com/en-us/iis/troubleshoot/using-failed-request-tracing/troubleshooting-failed-requests-using-tracing-in-iis-85

-------

## In Conclusion
I hope that these notes are useful to help you to containerise your legacy apps, please add comments if they are. Also any corrections you have are also welcome.
<br/>
<br/>
