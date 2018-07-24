---
layout: post
title: "SDL Web 8 - How to map ECL external metadata to your view model"
date: 2018-02-12 20:00:00 +0100
author: "Tim Alonso"
---

## The problem

An ECL item has an external metadata defined. The values in this metadata are not easily accessible within DD4T 2. I’m expecting to easily bind these values in a custom view model in my application by simply annotating properties with DD4T’s content model attributes.

## First approach

The first thing that I did was to map the external metadata into my custom view model. I created an extension method on `IComponentPresentation` to retrieve the first matching linked component value in a specific field by their TCM id.

{% highlight csharp %}

public static IComponent GetFirstLinkedComponentById(this IComponentPresentation componentPresentation, string fieldName, string tcmId)
{
    var component = componentPresentation.Component.Fields[fieldName].
        LinkedComponentValues.First(x => x.Id == tcmId);
 
    return component;
}

{% endhighlight %}

In my view model, I created a private method which would take an `IComponent` object. The view model already referenced DD4T library as it’s using content model attributes.

This private method then uses another extension method of `IComponent` for getting the ECL field from the component:

{% highlight csharp %}

public static IFieldSet GetFieldEclExternalMetadata(this IComponent component, string fieldName, string eclExternameMetadataFieldName = "ECL-ExternalMetadata")
{
    if (component.Fields != null && component.Fields.ContainsKey(fieldName))
    {
        var namedComponent = component.Fields[fieldName];
        if (namedComponent.LinkedComponentValues != null && namedComponent.LinkedComponentValues.Any())
        {
            var metadata = namedComponent.LinkedComponentValues.First().
                ExtensionData[eclExternameMetadataFieldName];
 
            return metadata;
        }
    }
 
    return null;
}

{% endhighlight %}

## Lesson Learned:

- The implementation is fragile and difficult to maintain.
- This is only applied to one component presentation.

## Second approach

My second attempt was to use a custom TBB which is applied to the component presentation in question.

This approach is based on Bart Koopman’s [sample code](https://gist.github.com/bkoopman/6436263).

I had to update the sample code to handle the difference in the data structure. What I mean by that is that the sample takes a component using an ECL multimedia item which we can search.

In my current project, the data structure was that a Component List can contain many components of type “Internal Link”, “External Link”, “Internal File Link” and “External File Link”. I only wanted to process components that have an “Internal File Link” schema. This component then has a field which links to the ECL multimedia item.

This was cumbersome to build as it required a lot of XML manipulation, retrieving components using TOM.NET API and having a lot of null checks to ensure that the TBB doesn’t blow up when publishing.

## Lesson Learned:

In order to use this, you must amend the `allowWriteOperationsInTemplates` setting to `true` in Tridion.`ContentManager.config`. There is a warning from SDL: “SDL strongly recommends against this practice as it compromises your security”. This was a deal breaker which I didn’t catch early on.
Summary

There are two more approaches that I have yet to try (add the metadata through event handlers and adding the metadata in the custom ECL provider). I ran out of time to attempt the two approach and I’ve ended up using the first option.

## Sources:

- [ECL Event Handlers](http://www.tridiondeveloper.com/ecl-event-handlers)