---
layout: post
title: "WFFM Custom Field – Form Name Field"
date: 2018-05-24 20:00:00 +0100
author: "Tim Alonso"
---

I recently had a requirement for capturing the form name on submission so that the client can determine exactly which form a particular lead came from.

I am using a Web Forms for Marketer (WFFM) for Sitecore (version 8.1 rev 160523) which integrates with Microsoft Flow to generate a lead in Dynamics 365 CRM.

The client would like to populate the “Topic” field in their CRM in the following format: – . For example, “Request a Quote – United Kingdom”.

The selected location is already available on form submission but not the form name.

I decided on creating a custom field which would be populated on submission. This field will be rendered as a hidden input.

My first approach was to get the `FormId` which is already available to `SingleLineTextField`:

{% highlight csharp %}

using Sitecore.Data;
using Sitecore.Forms.Mvc.ViewModels.Fields;
 
public class FormNameTextField : SingleLineTextField
{
    public FormNameTextField()
    {
        var item = Sitecore.Context.Database.GetItem(new DataUri(FormID));
        Value = item != null ? item.Name : string.Empty;
    }
}

{% endhighlight %}

Unfortunately, the `FormId` and the majority of SingleLineTextField properties were `null`.

My second approach was to retrieve the rendering of the form on the current page as this will have the data source which directly links to the target form.

{% highlight csharp %}

using System.Linq;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Forms.Mvc.ViewModels.Fields;
using Sitecore.Layouts;
 
public class FormNameTextField : SingleLineTextField
{
    public FormNameTextField()
    {
        var currentItem = Sitecore.Context.Item;
        var renderingTemplateId = Constants.FormRenderingTemplateId;
 
        var rendering = currentItem.Visualization.GetRenderingByTemplateId(renderingTemplateId);
        var dataSource = rendering.Settings.DataSource;
 
        var item = Sitecore.Context.Database.GetItem(dataSource);
        Value = item.Name;
    }
}

{% endhighlight %}

GetRenderingByTemplate is an extension method:

{% highlight csharp %}

public static class VisualizationExtensions
{
    public static RenderingReference GetRenderingByTemplate(this ItemVisualization visualization, ID templateId)
    {
        return visualization.GetRenderings(Sitecore.Context.Device, true)
            .FirstOrDefault(x => x.RenderingID == templateId);
    }
 
    public static RenderingReference GetRenderingByTemplate(this ItemVisualization visualization, string templateId)
    {
        return visualization.GetRenderingByTemplate(templateId);
    }
}

{% endhighlight %}

This is paired with a Razor view:

{% highlight html %}

@model FormNameTextField
 
@if (!Model.Visible) {
    return;
}

</pre>
<div class="hidden">@Html.Hidden("Id", Model.Item.ID) @Html.Hidden("Value", Model.Value)</div>

{% endhighlight %}

Instructions on how this is configured in Sitecore can be found in Sitecore’s documentation here.

The result is a hidden field which includes the form’s name in the submission.