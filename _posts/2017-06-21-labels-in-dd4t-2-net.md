---
layout: post
title: "DD4T2 - Resource Management (.NET)"
date: 2017-06-21 20:00:00 +0100
author: "Tim Alonso"
---

I recently had to implement a feature on SDL Web 8.5 for managing resources and found out that DD4T 2 already have this available out of the box. It’s called Dynamic Resource Management.

Unfortunately, there’s limited documentation so I thought I’d write about my experience in order to remind myself in the future and help those who may need it too.

## Setup

Create a page template in Template Builder. Add DD4T’s Resources TBB and ensure that the file extension of the page is set to ‘xml’.

Create a component template using Template Builder which has a default Cleanup TBB. Ensure the template is linked to the Labels schema.

![Label Schema]({{ "/assets/labels-schema.png" | absolute_url }})

Create the component with a sample label using the same schema as the screenshot above and add to a page using the page template and publish.

## Web App

In your web app, add an app setting:

{% highlight xml %}

<appSettings>
    <add key="DD4T.ResourcePath" value="/filepath/us/en/_system/labels.xml" />
</appSettings>

{% endhighlight %}

The value is the filename published to the broker database.

Create an extension method:

{% highlight csharp %}

public static string Resource(this HtmlHelper htmlHelper, string resourceName)
{
    return (string)Resource(htmlHelper.ViewContext.HttpContext, resourceName);
}
 
public static string Resource(this HtmlHelper htmlHelper, string resourceName)
{
    return (string) Resource(htmlHelper.ViewContext.HttpContext, resourceName);
}
 
public static object Resource(this HttpContextBase httpContext, string resourceName)
{
    return httpContext.GetGlobalResourceObject(CultureInfo.CurrentUICulture.ToString();
}

{% endhighlight %}

You can then use these in your views:


{% highlight html %}

@Html.Resource("Label_Key")

{% endhighlight %}

This post is heavily influenced by Rob’s post [here](https://blog.building-blocks.com/dd4t-series-labels-an-iresourceprovider-implementation-backed-by-dd4t/).