---
layout: post
title: "Ambient Data Framework Throwing 500 Error"
date: 2018-10-09 20:00:00 +0100
author: "Tim Alonso"
---

A content editor raised that we're getting a plain text JSON message displayed if an incorrect query string is passed in our site: https://example.com?test

This results in:

{% highlight json %}

{"error":"InternalServerError"}

{% endhighlight %}

Inspecting the log file `cd_client.log`, I found this error message:

> ERROR [Sdl.Web.Delivery.ADF.AmbientRuntime.OnRequestStart] - Problem 
EXCEPTION: System.ArgumentNullException: Value cannot be null. 
    Parameter name: key 
        at System.ThrowHelper.ThrowArgumentNullException(ExceptionArgument argument) 
        at System.Collections.Generic.Dictionary\`2.Insert(TKey key, TValue, value, Boolean add) 
        at Sdl.Web.Delivery.ADF.AmbientRuntime.SetWebRequestClaims(HttpRequest request, IClaimStore claimStore) 
        at Sdl.Web.Delivery.ADF.AmbientRuntime.OnRequestStart(HttpApplication application, HttpContext context, IClaimStore claimStore, ISet\`1 templateReadOnlyClaims, ISet\`1 templateImmutableClaims, ISet`1 templateSessionScopeClaims, Boolean dispatchOdataRequest)
> ERROR: [Sdl.Web.Delivery.ADF.AmbientRuntime.OnRequestStart] - > Setting status code:500

## Troubleshooting

Due to the nature of the error, I disabled ADF from the `web.config` and the page renders correctly despite having an incorrect query string.

So the issue is within ADF, I re-enabled it and attempted to step through my `PageController` in an attempt to see where this is referenced from but no luck.

I had a look at the we app's logs but found no error related to ADF. I then hada  look at ADF's documentation to see if there's anything in the `cd_ambient_conf.xml` that would help but still no luck.

I reached out to SDL's support and they confirmed that it's an issue on their side.

## Solution

SDL have released the hotfix `CD_8.5.0.6337` which resolved the issue. This can be found [here](http://csei.sdl.com/hotfixes/#/hotfixes/c).