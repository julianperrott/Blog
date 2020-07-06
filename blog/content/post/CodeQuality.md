+++
date = "2020-07-06"
title = "Improve Your Code Quality"
description = "With Visual Studio using built in features and free extensions."
slug = "CodeQuality"
draft = true

background = "bg_codequality"
+++

Built into C# 8 and Visual Studio 209 are a couple of code quality settings which you should turn on for all new .Net core projects.

# Introduction

Unit testing is something that you should already be doing if you want functionally correct code. Coding standards should also be in place to enable your developers to be able to maintain each others code. Beyond these key approaches to developing code we get into less obvious ideas on how to make code better. Code reviews allow a developer to get feedback from their peers and should mainly focus on the maintainability of the code. Understanding the SOLID principles and patterns may also help in the design of the code. All these approaches require diligence from the developer.

There are other approaches which allow the developer to get feedback about their code automatically at compile time. Two of which are Nullable and Code Analysis. 

# Nullable

Tony Hoare invented the idea of a Null reference back in the 60's, this has since been determined to have been a bad idea, he considers that decision "my billion-dollar mistake". It has placed the responsibility of checking for nulls on the developer rather than the compiler and language. We can't be too hard on him as code was a lot simpler back then.

![TonyHoare](/post/img/CodeQuality_tonyhoare.jpg )
![Doh](/post/img/CodeQuality_Homer.jpg )


## Some of the main issues with null exceptions are:

* Unpredicatable run time errors, perhaps from untested edge cases. These errors can cause the whole application to end or become inconsitent, requiring a restart.
* Difficulty of debugging a null reference error. Typically the name of the variable is not available and sometimes the line number as well.
* Additional testing requirements to cover edge cases.
* Defensive coding is required by the developer to check for nulls which makes code more messy and harder to read.

![Exception](/post/img/CodeQuality_NullException.png)
 

## The problem in C# #

Objects in C# are referenced by pointers and those pointers may be null. So before using an object you either need to check it is not null or risk disaster.

In this example foo can be null and also the object returned by Score could in theory also be null.

<pre class="prettyprint">
        Game game = null;
        var points = 0;
        ...
        if (game != null) {
            if (game.Score() != null)
            {
                points = game.Score().Points;
            }
        }
</pre>

Since C# 6.0 the above can be simplified by using the [Elvis operator (?.)](https://en.wikipedia.org/wiki/Elvis_operator) and the [null coalescing operator (??)](https://en.wikipedia.org/wiki/Null_coalescing_operator#C#) but perhaps making it more cryptic and less readable.  

<pre class="prettyprint">
        Game game = null;
        int points = game?.Score()?.Points ?? 0;       
</pre>

## Compliler to the rescue

C# 8.0 has introduced [nullable and non nullable reference types](https://docs.microsoft.com/en-us/dotnet/csharp/nullable-references). This means that you can get the compiler to check where an object could be null and there is the possiblity of a null exception.

The null checking needs to be enabled explicitly either in the code or the project file.

For a single file, adding a compiler directive at the top of the file will enable nullable.

<pre class="prettyprint">
    #nullable enable 
</pre>

or add the below code to the project file to turn it on for all files:

    <PropertyGroup>
      <LangVersion>8.0</LangVersion>
      <Nullable>enable</Nullable>
    </PropertyGroup>
 
Once it is enabled warnings will be shown when you compile such as the following:

* Warning	CS8600	Converting null literal or possible null value to non-nullable type.
* Warning	CS8603	Possible null reference return.

Once nullable is turned on, variables which can be null should be indicated using a question mark on their declaration.

<pre class="prettyprint">
    public Scorer? Score { get; set; }
</pre>

## Suppressing compiler warnings

It is possible to suppress a warning when you know a variable will never be null using the [null-forgiving operator (!)](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/operators/null-forgiving), but I advise against it as it should be simple enough to design your code to avoid using it.

<pre class="prettyprint">
    Game? game = null;
    int points = game!.Score()!.Points;
</pre>

## Treating Warnings as Errors

My preference is to turn on warnings as errors to enforce the developer to deal with these warnings immediately as it is too easy just to ignore them for now to deal with them at a time later which never comes.


![Warnings as errors](/post/img/CodeQuality_TurnOnWarningsAsErrors.png)

----

# Code Analysis

"Microsoft created a set of analyzers, called Microsoft.CodeAnalysis.FxCopAnalyzers, that contains the most important "FxCop" rules from legacy analysis. These analyzers check your code for security, performance, and design issues, among others."

The analyzers are Nuget packages which you install from a project properties tab called 'Code Analysis'. Once installed warnings will be shown for detected issues. These issues can then either be fixed or suppressed.

Another benefit of the code analysis is that each warning teaches you to be a better coder.

## Turning on code analysis

Within the properties of a project is a Code Analysis tab which allows the packages to be installed. Errors are shown when you build (the most reliable), and also as you code.

![Turning on code analysis](/post/img/CodeQuality_TurnOnCodeAnalyCodeQuality_sis.png)


## Handling code analysis errors

Depending upon what kind of code and business you are writing for, will determine which rules are most relevant. This flowchart is a suggestion on how to deal with each error.

Within your team you can discuss each error as it comes up and build up an understanding of what warnings must be fixed.

![Handling code analysis errors](/post/img/CodeQuality_CodeAnalysis.png)


## Examples of rules to suppress

Some rules you just won't agree with or perhaps are now out of date. e.g. CA1062 Some rules such as null checks have been supperceded by the Nullable compiler feature and can have their severity adjusted to 'None'.

These are examples which give a flavour of what might be suppressed.

* [CA1062](https://docs.microsoft.com/en-us/visualstudio/code-quality/ca1062): Validate arguments of public methods 
* [CA1031](https://docs.microsoft.com/en-us/visualstudio/code-quality/CA1031): Do not catch general exception types 
* [CA1707](https://docs.microsoft.com/en-us/visualstudio/code-quality/CA1707): Identifiers should not contain underscores 
* [CA2007](https://docs.microsoft.com/en-us/visualstudio/code-quality/CA2007): Consider calling ConfigureAwait on the awaited task 
* [CA1065](https://docs.microsoft.com/en-us/visualstudio/code-quality/CA1065): Do not raise exceptions in unexpected locations 
* [CA1303](https://docs.microsoft.com/en-us/visualstudio/code-quality/CA1303): Do not pass literals as localized parameters 
* [CA1304](https://docs.microsoft.com/en-us/visualstudio/code-quality/CA1304): Specify CultureInfo 
* [CA1305](https://docs.microsoft.com/en-us/visualstudio/code-quality/CA1305): Specify IFormatProvider 
* [CA1307](https://docs.microsoft.com/en-us/visualstudio/code-quality/CA1307): Specify StringComparison 
* [CA2208](https://docs.microsoft.com/en-us/visualstudio/code-quality/ca2208): Instantiate argument exceptions correctly 
* CA2008: Do not create tasks without passing a TaskScheduler

## Case Specific Rules

Sometimes a rule is mostly valid, but needs to be suppressed for that one place and this can be done in a suppression file.

----

# Codemaid

![CodeMaid](/post/img/CodeQuality_codeMaid.png)

This free Visual Studio extennsion is great at tidying up code with no effort. I have been using it for a long time.

    "An open source Visual Studio extension to cleanup and simplify C#, C++, F#, VB, PHP, PowerShell, R, JSON, XAML, XML, ASP, HTML, CSS, LESS, SCSS, JavaScript and TypeScript coding."

    Code Cleaning
    Cleanup random white space into a simple standard order. Add unspecified access modifiers. Utilize Visual Studio’s built-in formatting capabilities. Remove and sort using statements. And do it all automatically on save or on demand, from an individual file to the entire solution.

    Code Reorganizing
    Reorganize the layout of members in a C# file to follow Microsoft’s StyleCop convention, or your own preferences. Automatically generate regions to match. Run on demand or automatically during cleanup.

    Comment Formatting
    Format comments to wrap at a specified column and arrange tags on separate lines. Run on demand or automatically during cleanup.

----

# Conclusion

Developers exist to develop functionality and the benefit of code quality is not always obvious to non developers. Over time better designed code with fewer bugs, being more readable and therefore more maintainable is cheaper. Using free and built in Visual Studio functionality makes good sense to help achieve better code.

----

# Beyond Visual Studio

If you want to take your code analyis to another level. Then further code analysis can be done during continuous integration, for example [SonarQube](https://www.sonarqube.org) is worth taking a look at.

![SoanrQuve](/post/img/CodeQuality_SonarQube.png)