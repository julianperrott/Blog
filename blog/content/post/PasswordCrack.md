+++
date = "2017-07-21"
title = "Better Passwords"
description = "So, how do you avoid your accounts being compromised? Well, you can’t avoid it completely so you need to limit your exposure."
slug = "Better-Passwords"
draft = true

background = "bg_password"
bg_name = "Linux password file"
bg_url = "https://www.flickr.com/photos/christiaancolen/20971563620/in/photolist-xXbKe7-xXcTvd-xXcSZJ-xXcT8Q-yeNZAa-j766j1-pAjBfi-4jdyER-m179nU-xhVBRn-yfuYtM-qfwstJ-ycuxnY-nNUfNg-v6a5n-W2UazS-o4kzvS-ycuxvU-ycuxEG-8CFyta-d4yEjy-gRc6BQ-xhMCS7-kTXEDa-eN3LjN-o8snC2-o6pSLP-4MdzVo-at864M-7erQ4r-gRcbQs-e8y5Jm-oQjoSi-d4yEyY-9VhaWN-iue3Mr-4TsEiK-nyvZCn-qfvzds-gRcQyR-d4yDWY-4ss9fo-4so6j2-pfEA7d-5h6ped-oTuvUK-o6oAEr-d7cbP3-d4yDhm-iudENrA"
bg_owner = "christiaancolen"
bg_owner_name = "Christiaan Colen"
+++

Passwords are a pain. You have to remember them for a start and you are supposed to use different passwords on every site, and they ought to be complicated. It all seems like a lot of effort. Is it really worth it ? 

Well, I have the hash killer list and on it there are a hell of alot of passwords. The list is not a secret; lots of people have it. The list is long and getting longer every day. Some example passwords on the list are:

* DarkJediPrincess
* RainbowJumper<3
* Italianstud1978
* {[brainy]}
* stupid is as stupid does

The list contains the top 25 passwords of 2017 and another 34 million and counting.

Because choosing and remembering a password is hard, people reuse the same password across multiple sites: Paypal, Facebook, Netflix, Amazon, LinkedIn, Adobe, Reddit, Skype, Twitter, Pinterest, Flickr, Spotify, Talk Talk etc. Alarmingly 55% of users use the same password on most of their sites.

Now, if you are wondering how does a hacker know which password yours is ? Well they have to wait until someone (e.g. a bored teenager) hacks one of the many sites you use and steals all of their email addresses and passwords and posts them online. The passwords are usually cryptographically one way hashed for example as “1aa3fdd77c64b143504ea30d67e5425e”, this hash can’t be converted back into the plain text, but If they know how the hashing is done and they probably do, then they can hash each password in the list and if they get a match then they have both your email and your password. 

Once they know your email address and password then they can try logging in to all of the popular sites using this combination and see if they get any hits. Once an account is compromised it can be sold online and criminals can exploit it.

Even if your password is not in the list then using brute force is another approach where all combinations of letters and numbers are tried, but this is slowed by the type of hashing algorithm and the length of the password.

So, how do you avoid any of your accounts being compromised? Well, you can’t avoid it completely so you need to limit your exposure by:

* Using a different password on every site. Memorising all those passwords is going to be nightmare, so using a password manager such as 1Password to keep track of them is sensible. 
* The longer the better, perhaps a unique phrase memorable to you e.g. “My son's birthday is 12 December, 2004”. Diceware is a means to create a random pass phrase. See https://en.wikipedia.org/wiki/Diceware.
* Using a larger range of characters will make the password take longer to brute force. Make sure you use upper case, lower case, special characters and numbers.

<br/>
## Defending against a brute force attack

If a dictionary attack fails to find a password because it is not in the Hashkiller password list, then passwords can be brute force attacked by trying all combinations in a characters set, starting with 1 character then 2, and so on.

You choice of the character set in your password will affect how many combinations there are for each character in the password. For example if a your password is 8 characters long then the number of combinations are as follows:

 Character set | Character set size | Combinations
 --- | ---: |---:
 Lower case | 26 | 208,827,064,576
 Lower case and numbers | 36 | 2,821,109,907,456
 Lower case, upper case and numbers | 62 | 218,340,105,584,896
 Lower case, upper case, numbers and special chars | 157 | 369,145,194,573,386,000

If it took a second to brute force a password that was 26 characters (lower case), then to brute force one which was 157 characters (Lower case, upper case, numbers and special chars) would take 20 days. Adding another character to the password would multiply the number of combinations by 157, and so would take 8.6 years.

An analysis of the Hashkiller passwords highlights the following weaknesses which made brute forcing the majority of them easier.

* 74.4% are 10 characters or less long. The longer a password the more time it will take to brute force.
* 90 % of passwords don't include special characters. The larger the character set the longer it will take to brute force.
* 69.5 % of passwords are contain only lower case or/and numbers. A smaller character set (36) reduces the time to try all the combinations.

<br/>

#### Hashkiller Dictionary - Character set popularity

An analysis of the usage of different character sets can be seen in the table below.

 Character set  &nbsp; | Lower case (26) | Upper case (26) | Numbers (10)	| Special characters (95)  | x
  --- | ---	| --- | ---	| --- | ---
"12ab" (36)|X	|	|X	| | 	43.5%
 "abcd" (26) |X	|	|	| | 	15.2%
 "abC1" (62) |X	|X	|X	| | 	12.5%
 "1234" (10)|	|	|X	| | 	10.8%
 "ab1#" (131)|X	|	|X	|X | 	4.1%
 "AB12" (36)|	|X	|X	| | 	3.6%
 "aC3$" (157) |X	|X	|X	|X | 	2.9%
 "abCD" (52) |X	|X	|	| | 	2.8%
 "ab!@" (121) |X	|	|	|X | 	1.7%
 "ABCD" (26) |	|X	|	| | 	1.5%
 "12#$" (105)|	|	|X	|X | 	0.5%
 "abC$" (147)|X	|X	|	|X | 	0.4%
 "AB1#" (131)|	|X	|X	|X | 	0.3%
 "!@#$" (95)|	|	|	|X | 	0.1%
 "AB!@" (121)|	|X	|	|X | 	0.1%


<br/>
<br/>
#### Hashkiller Dictionary - Password Length

Passwords under 20 characters make up 93% of the list. 

![Distribution Of Password Length](/post/img/DistributionOfPasswordLength.png "Distribution Of Password Length")

![Passwords This Length Or Shorter](/post/img/PasswordsThisLengthOrShorter.png "Passwords This Length Or Shorter")


## Some Links
* https://weakpass.com/wordlist/50
* https://hashkiller.co.uk/
