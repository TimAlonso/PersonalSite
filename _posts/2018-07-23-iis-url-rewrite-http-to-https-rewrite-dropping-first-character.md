---
layout: post
title: "IIS Url Rewrite – HTTP to HTTPS Rewrite Dropping First Character"
date: 2018-07-23 20:00:00 +0100
author: "Tim Alonso"
---

I encountered an odd issue the other day. I created a series of rules in IIS via Url Rewrite Module for handling old pages and SEO issues. This has been deployed to the Test environment.

The scenario is that if you enter https request in the browser: `https://example.com/first-directory/old.aspx`, a load balancer takes this in and convert it to HTTP.

In IIS, we receive an HTTP request and this goes through the Url Rewrite pipeline and results in HTTP.

This causes another 302 HTTPS redirect as per load balancer requirements.

This results in:

1. https://example.com/first-directory/old.aspx
2. http://example.com/first-directory/old/
3. https://example.com/first-directory/old/

The problem is number 2.

In order to get around this, I created a rule that forces a rewrite for any HTTP request:

{% highlight xml %}

<rule name="HTTP to HTTPS" stopProcessing="false"> 
    <match url="(.*)" /> 
    <conditions logicalGrouping="MatchAll"> 
        <add input="{HTTPS}" pattern="^OFF$" /> 
        <add input="{HTTP_HOST}" matchType="Pattern" pattern="^localhost(:\d+)?$" negate="true" /> 
        <add input="{HTTP_HOST}" matchType="Pattern" pattern="^127\.0\.0\.1(:\d+)?$" negate="true" /> 
    </conditions> 
    <action type="Rewrite" url="https://{HTTP_HOST}/{R:1}" /> 
</rule>

{% endhighlight %}

This ensures that `localhost` and `127.0.0.1` aren’t converted.

Applying this rule results in: `ttps://example.com/first-directory/old/`

Which results in a cancelled page and no content loaded in the browser.

I then enabled Failed Request Tracing to check which rules are causing this.

This is where it gets weird. The first rule (HTTP to HTTPS), is rewriting as expected. The next rule, on the other hand, has request URL set as `ttps://example.com/first-directory/old/`.

The expected behaviour is that the first rule will pass the result (as `stopProcessing` is set to `false`) to the next rule and so on. I then disabled the next rule thinking it’s affecting the results somehow, but this did not work.

Note: changing the RewriteRules.config may not recycle the app pool because it’s only referenced from the web.config and we’re not updating the web.config itself.

There were several tests run by DevOps:

- Confirm that load balancers aren’t interfering
- Confirm that 301 redirect does strip the first character

The first proposal was to replace the match from regex to a wildcard: `*`. It shouldn't make a difference but was worth trying out.

{% highlight xml %}

<rule name="HTTP to HTTPS" pattern="Wildcard" stopProcessing="false"> 
    <match url="*" /> 
    <conditions logicalGrouping="MatchAll"> 
        <add input="{HTTPS}" pattern="^OFF$" /> 
        <add input="{HTTP_HOST}" matchType="Pattern" pattern="^localhost(:\d+)?$" negate="true" /> 
        <add input="{HTTP_HOST}" matchType="Pattern" pattern="^127\.0\.0\.1(:\d+)?$" negate="true" /> 
    </conditions> 
    <action type="Rewrite" url="https://{HTTP_HOST}/{R:1}" /> 
</rule>

{% endhighlight %}

This initially resolved the missing h but it fails the condition. It is still not clear why the regex caused this.

The first condition is now failing. Not exactly sure why, but after updating this to:

{% highlight xml %}

<add input={HTTPS} pattern="off" />

{% endhighlight %}

This seems to resolve the issue.

Unfortunately, it takes us back to the original issue.

## Working Solution

In order to get this working, I’ve had to remove the HTTP to HTTPS rule at the beginning of my rewrite rules.

I then applied the HTTPS in a redirect, not a rewrite at the bottom. For each rule that I have which were intended to be redirected differently, I applied HTTPS. I also removed the conditions and simply created a new rewrite rules config to be used locally.

{% highlight xml %}

<rule name="Redirect Default ASPX" stopProcessing="true">
    <match url="(.*)(default.asxp)" />
    <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" />
</rule>

{% endhighlight %}