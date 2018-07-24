---
layout: post
title: "IIS Url Rewrite Idea - Automate Testing Rewrite Rules"
date: 2018-07-19 20:00:00 +0100
author: "Tim Alonso"
---

One feature I really want is to automate tests with rewrite rules using IIS via Url Rewrite module. I’m almost certain that this is not an original idea but I haven’t found an existing and acceptable solution just yet.

This is a common enough task .NET developers will encounter at some point in their career. Whether it’s redirecting from old pages after a migration, personal preference of how a client would like their URLs or SEO-related we all somehow end up using it.

It’s generally the same process too. Either write a regular expression for your intended pattern or a wildcard, test the pattern with sample input, test in your local IIS or deploy to a test server to continue testing. If something isn’t quite right, you either have to tweak your pattern or enable Failed Request Tracing for outputting.

How I currently imagine this to work would be to pull in a NuGet package which is a self-contained engine of IIS’s Url Rewrite module. I can then combine this with a test harness and create a series of unit tests to assert outputs given a sample input and rewrite rule definition.

One approach would be something like:

{% highlight csharp %}
[SetUp]
public void Setup()
{
    _engine = new UrlRewriteEngine();
}

[TestCase("http://www.example.com/default.aspx")]
public void ShouldRemoveDefaultAspx(string input)
{
    var result = _engine.Input(input);
    Assert.That(result.Output, Is.Equals("http://www.example.com/");
}
{% endhighlight %}

When instantiating the UrlRewriteEngine it’ll grab your web.config by default and attempts to look for an existing `<rewrite>` element. Then parse this into a collection of rules which we sequentially run.

It would be nice if we could pass in an XML snippet to the UrlRewriteEngine constructor which emulates the structure of the `<rewrite>` element in case you wanted to test a single rule.

I can see a test class written per rule and individual asserts for different URLs. It would also be nice if there is a mechanism that would allow you to test rewrite chaining or all of your rules in one go so that you can ensure that these are behaving as you’d expect them to.

This battery of tests can be used as a quick regression check each time a rewrite rule is added, deleted or updated.

## Things to consider

One thing worth thinking about is the actual input must be what IIS expect. It can’t be parsing the rules, checking the type of pattern and create a regex to see which matches.

It’s also worth looking at how we can test rewrite chaining. Is there a way for us to see the state of the input in each rule similar to how Failed Request Tracing output?

If you know of an existing tool/package that can already do this, please let me know as I would be very interested!