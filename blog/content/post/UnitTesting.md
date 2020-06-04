+++
date = "2020-06-04"
title = "What is Unit Testing?"
description = "How does it help creating quality software ?"
slug = "UnitTesting"
draft = true

background = "bg_unittesting"
+++

There is a wealth of resources on the internet on the subject of unit testing. In this post I am documenting my thoughts on the subject.


## What part do unit tests play in software testing ?

Unit tests are functional tests usually caried out by developers, they verify that the code meets the requirements of the feature. They focus on only one part of the system so are not integration tests i.e. they are not responsible for checking that different parts of the system will work together, only that the part they test is doing what is expected. Unit tests do not work though the user interface they interact from within the code. You could argue that they can play a role in regression testing, but regression tests are more likely to be a partial selection of manual or automated tests which are re-executed to check that code changes have not broken previously working code.

![Types of software testing](/post/img/UnitTesting_TypesOfTests.png "Types of software testing")

Unit test vs integration tests:

<iframe width="560" height="315" src="https://www.youtube.com/embed/0GypdsJulKE" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## What is a "Unit" in unit testing 

![Question](/post/img/Question.png)

Here are a couple of definitions of what a unit test is:

#### Definition 1: 

* A unit is the smallest possible testable software component.
We test a unit of code because it is easier than testing larger chunks of code / behaviour. e.g. a Method or Class which performs a single cohesive function.

Unit tests need to be small so that they are maintainable, have you ever had to fix a broken unit test which when you looked at the test you struggled to understand what it was trying to do ?

#### Definition 2: 

* The unit of isolation is the test.  (TDD)
i.e. One test when it runs does not impact another.

Each unit tests needs to be isolated from all other unit tests. Side effects from other tests such as static values or dependencies must not interfere, they must be reset before each test is run, also tests should not have any pre-defined running order.

### An example of a unit test

A unit test runs some code and then asserts that the result is as expected.

<pre class="prettyprint" >

    public class Calculator
    {
        public int Add(int v1, int v2)
        {
            return v1 + v2;
        }
    }

    [TestClass]
    public class CalculatorAddTests
    {
        [TestMethod]
        public void Add_100Plus200_Equals300()
        {
            // Arrange
            var calculator = new Calculator();

            // Act
            var result = calculator.Add(100, 200);

            // Asset
            Assert.AreEqual(300, result);
        }
    }
</pre>



## What are the benefits of unit testing?

![Why](/post/img/Why.png)

Unit testing is not free there is a cost (time), but doing it shows a level of maturity in your development process which will be cheaper in the long run. "Quality Is Free" a book by Philip B. Crosby suggests that quality comes from prevention not detection. Unit tests allow non conformance to be found early, before it gets to the QA or the user where the cost of a fix rises.

Defects revealed by unit tests are easy to locate and relatively easy to repair They determine if the unit is fit for purpose. Writing unit test also makes you think about the edge cases. Subsequently QA should find fewer bugs and the story passes to done quicker.

Unit tests encourage refactoring and this increase maintainability, which allows for a higher quality of code. This also encourages less coupled code, as coupling becomes obvious when testing it. Your process can be more agile by enabling you to change existing code with more confidence. Unit tests can protect against regression.


## What are the characteristics of a good unit test ?

![Why](/post/img/UnitTesting_Characteristics.png)

#### Fast to run: 
Unit test should run fast, so that they can be run frequently during the development process. They should not interact with databases because this will impact performance.

#### Deterministic, Isolated, Repeatable: 
The experiment that the test does should always create the same result. There should be no side effects from the environent which could affect the result and there should be no order in which tests should have to run. You should be able to run tests as a batch or individually and always get the same result.

#### Simplest implementation to pass the test, Fast to write: 
Keeping tests simple makes them more maintainable and hopefully faster to write. If tests are hard/slow to write then it suggests that there is a problem with your code design.


## What different types of unit test are there ?

#### Sanity check / happy path

This type of test checks using normal values, and quickly indicates whether the code works for obvious scenarios. For example obvious in and out of range parameters.

#### Input check: 

Checks that your parameters are handled correctly. For example are the parameters validated correctly.

#### Edge case / boundary: 

An edge case is a problem or situation that occurs only at an extreme (maximum or minimum) operating parameter (which still could be valid). This is something that QA will focus on, so testing these is essential.

#### Corner case: 

A Corner case is more than one edge case. They may occur rarely and could slip through QA, so it is sensible to think about them.


## How to write unit tests

![How](/post/img/UnitTesting_HowToWrite.png)

A unit test should focus on a single scenario. The process of writing unit tests is iterative, each test causes the code to be modified until the test passes. The process of writing lots of tests can be considered incremental as tests cause new functionality to be added. 

While writing tests the design of the code will also be tested, it will become obvious where coupling exists due to the dependencies required during the test setup, and where a lack of cohesion in your class is seen indicated by the different focus of sets of tests. Continuous refactoring is required to improve the design of your code, hopefully the tests will help verify that your code still works afterwards.

## Best practices

![Best Practice](/post/img/UnitTesting_BestPractices.png)

#### Arrange, Act, Assert


> The AAA (Arrange, Act, Assert) pattern is a common way of writing unit tests for a method under test.
>
> * The Arrange section of a unit test method initializes objects and sets the value of the data that is passed to the method under test.
>
> * The Act section invokes the method under test with the arranged parameters.
>
> * The Assert section verifies that the action of the method under test behaves as expected.

https://docs.microsoft.com/en-us/visualstudio/test/unit-test-basics?view=vs-2019

#### Validate one use case per test

This simplifies each test and makes it easier to maintain.

#### Tests are Isolated from each other

A Test should work on its own or run in a batch. The order tests are executed in should not change the result of an individual test.

#### Tests are readable and maintainable

 Code changes mean that correctness will sometimes regress, this should be picked up during development or when the continuous integration runs. It is essential that the tests are easy to understand so that they can be refactored if required.

#### No Large setups in a test.

This indicates a problem with the design of the code.

#### Tests are run by CI

Each build should run all the unit tests to verify the code. Early visibility of problems due to regresssion will allow them to be addressed in a timely manner.


## What to test / or what not to test

This graph gives a guide to the benefit of unit testing vs the cost of doing that testing.

![Best Practice](/post/img/UnitTesting_WhatToTest.png)

### Code you should consider not testing

My guidance is to NOT unit test low value code. Low value code can include the following:

* Prototypes & Proof of concepts - The aim of these is not for perfect code but to find out if something can be done.
* Short lifetime code - The value of writing the tests may be outweighed by the cost.
* Boilerplate code - This code is usually simple and the value of unit testing may be too low.

### Code you should test

You should test code “that you want to work”.

* Test logic - This code should be relatively easy to test as it should have few dependencies.
* Code which may break or is buggy - Focusing on code which has poor design should allow the design to be improved.
* Code that is used a lot (base classes) - The value of testing this code should be obvious.
* Test code which is important (i.e. failure is expensive) - The cost of writing the tests will be outweighed by the value.
* Code which is likely to change / has changed - The number of bugs is proportional to the number of changes made to code. It makes sense to make sure that code in flux is covered by tests.


## What parts of a system to test ?

![ClientServerArchitecture](/post/img/ClientServer.jpg)

#### Client

* JavaScript / Typescript – I would argue that unit testing presentation logic is both expensive and low value, testing it via other means would probably make more sense. Algorthms embedded in the code might be worth the effort.
* ViewModels – Only if it adds real value.


#### Server / Exe

* Controller – No, refactor if necessary to simply them and extract any code that should be tested into separate classes.
* Business Logic /  Services – Yes where appropriate.
* Algorithms - Yes.
* Repository Layer- No, this is usually boiler plate code. You may want to test any custom object mappings.
* Database - No, testing the database is not unit testing. 


## Problems with unit testing

![Problems](/post/img/Problems.jpg)

Unit tests can be hard to maintain. The low readability of some tests can affect our understanding of them. When we can't understand them they are hard to fix or modify. Refactoring of the code being tested can cause the tests to break as we are testing the implementation details, if the code has a poor design we may need to throw away the tests and rewrite them.

Unit tests focus on small parts of the system, the behaviour of the whole system is not being captured and checked. We can't rely on unit tests alone QA still need to do manual/automated testing to verify quality.

When code has a large number of dependencies the unit test may be required to do a large amount of mocking, this can make them hard / slower to write.

We don’t delete tests enough. Some tests should be considered as scaffolding while building our code and then deleted so that there is not a cost to maintaining them.


## Summary

Unit tests are part of verifying the quality of software. They test small parts of the system and should be quite simple so that they are easy to maintain, they do not replace other types of testing. Not all code needs to be unit tested, there needs to be a trade off between the cost of writing a test and the value it gives.

![How](/post/img/Algorithm.jpg)