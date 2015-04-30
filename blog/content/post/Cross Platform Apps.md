+++
date = "2015-04-19"
title = "Cross Platform Apps For Microsoft Developers"
description = "There is a demand which didn’t exist five years ago for business applications which run on tablets and phones."
slug = "Cross-Platform-Apps"
draft = true

background = "mobile_office"
bg_name = "mobile-office_21.05.2011_2218"
bg_url = "https://www.flickr.com/photos/redux/7145995789/in/photolist-bTt6zX-bTt71g-4AYU89-ag9hiv-oyJQB5-83nRah-ncu8zF-neyTyW-neyTr1-newRjP-newJJB-ncucQA-ncugtY-ncuaPk-ncuau2-ncuaMM-oXkoDS-pePuVV-pePx3v-bD2DKY-myA6zS-neyZp3-myA8XY-myAxmS-myyz2k-myAvoU-myzpJP-myz9Zi-myyQM6-myysQ2-myzmpT-myAckE-myzc5R-myznhe-myAyey-myAw5y-myzec6-myAdkf-myyvdD-myAfEA-myzo3x-myA9ZN-myzdDT-myz2g2-myzfTT-myz5bv-myyCYZ-myzk1k-myzd9p-myzf34"
bg_owner = "redux"
bg_owner_name = "Patrick Lauke"
+++

There is a demand which didn’t exist five years ago for business applications which run on tablets and phones. 

If you are a developer in a Microsoft shop you would probably first consider developing your app for windows tablets / phones. But you need to consider what devices your customer has and will have over the next few years. Android and IOS fill 89% of the market so developing only for a windows device would limit the app to a tiny percentage of the market. You could pick one of the big two, but this would require learning a new language (Objective-C / Swift or Java) and understanding the design principles of that platform (Material / Flat). 

There seems to be two viable options for developers in the Microsoft stack:

- Using C# and XAML with Xamarin Forms.
- Javascript and HTML5 which has many choices (Phonegap, Sencha, Appcelerator, iFactr etc).

Write once run anywhere seems like an ideal solution, but there may be compromises. The decision needs to consider the following areas:

**Accessibility:**

- The skillsets your developers already have (XAML or HTML).
- The ease and speed of development in each environment. What tools are available ?
- Resources for learning. e.g. Videos and the information supplied by the suppliers (wiki, web site).

**Popularity:**

- The community and third party activity behind each option. 

**Activity:**

- How active the code owners are (releasing new features, bug fixing).

**Users:**

- Each platform has its own design principles which create a standard experience for the users, a common approach may not be able to supply this native experience. If this matters less to your users than the functionality then this shouldn’t be a problem. Users of business apps probably already experience a multitude of design experiences: ‘Winforms’, ‘Web applications’, ‘WPF/Silverlight’ etc.
- Performance issues may prevent a non native approach. If the app requires a high frame-rate or has intense graphical requirements such as 3D then performance may be an issue.
- What devices are they using. Do they have a mixture running different operating systems or do you only need to support one. 

If there is no clear choice then you could clarify the decision by doing a few sprints developing each solution, then see which the developers and users prefer. 

