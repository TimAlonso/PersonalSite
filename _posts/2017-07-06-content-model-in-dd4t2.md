---
layout: post
title: "SDL Web 8 - Content Model in DD4T 2 (.NET)"
date: 2017-07-06 20:00:00 +0100
author: "Tim Alonso"
---

This is a personal reference guide which I use to remind myself the different types of attributes available in DD4T 2 that I can use for my models.

## Basic

{% highlight csharp %}

[ContentModel("basic", true)]
public class Basic : IViewModel
{
    [TextField(FieldName = "text_field")]
    public string TextField { get; set; }
 
    [RichTextField(FieldName = "rich_text_field")]
    public MvcHtmlString RichTextField { get; set; }
 
    [LinkedComponentField(FieldName = "linked_component_field", LinkedComponentTypes = new[] { typeof(GeneralContent) })]
    public IViewModel LinkedComponent { get; set; }
 
    [KeywordKeyField(FieldName ="keyword_key_field")]
    public string KeywordKeyField { get; set; }
 
    [MultimediaField(FieldName = "multimedia")]
    public IMultimedia Multimedia { get; set; }
 
    [TextField(FieldName = "text_field_bool", IsBooleanValue = true)]
    public bool BoolTextField { get; set; }
 
    [NumberField(FieldName = "number_field")]
    public double NumberField { get; set; }
 
    [DateField(FieldName = "date_field")]
    public DateTime DateField { get; set; }
 
    [ComponentId]
    public TcmUri ComponentId { get; set; }
}
 
[ContentModel("general_content", true)]
public class GeneralContent : IViewModel
{
    [TextField(FieldName = "text_field")]
    public string TextField { get; set; }
}

{% endhighlight %}

## Embedded Schemas

{% highlight csharp %}

[ContentModel("embedded_schemas",true)]
public class EmbeddedSchema : IViewModel
{
    [EmbeddedSchemaField(FieldName = "embedded_schema_field")]
    public EmbeddedSchemaItem EmbeddedSchemaItem { get; set; }
 
    [EmbeddedSchemaField(FieldName = "embedded_schema_field")]
    public List<EmbeddedSchemaItem> EmbeddedSchemaItems { get; set; }
}
 
[ContentModel("embedded_schema_item",true)]
public class EmbeddedSchemaItem : IViewModel
{
    [TextField(FieldName = "text_field")]
    public string TextField { get; set; }
}

{% endhighlight %}

## Metadata

{% highlight csharp %}

[ContentModel("basic", true)]
public class Basic : BasicMetadata
{
    [TextField(FieldName = "text_field")]
    public string TextField { get; set; }
}
 
[ContentModel("embedded_schema_item",true)]
public class BasicMetadata : IViewModel
{
    [TextField(FieldName = "text_field")]
    public string TextField { get; set; }
}

{% endhighlight %}

## Extra

These attributes are available from the current version of DD4T 2. I’ve not used these yet so I’m keeping them here for future reference.

{% highlight csharp %}

using System;
using System.Collections.Generic;
using DD4T.ContentModel;
using DD4T.Core.Contracts.ViewModels;
using DD4T.ViewModels.Attributes;
 
[ContentModel("example", true)]
public class Example : IViewModel
{
    [KeywordKeyField(FieldName = "keyword_key_field")]
    public string StringKewordKeyField { get; set; }
 
    [KeywordKeyField(FieldName = "keyword_key_field_bool", IsBooleanValue = true)]
    public bool BoolKewordKeyField { get; set; }
 
    [KeywordTitleField(FieldName = "keyword_title_field")]
    public string StringKeywordTitleField { get; set; }
 
    [KeywordTitleField(FieldName = "keyword_title_field_bool", IsBooleanValue = true)]
    public bool BoolKeywordTitleField { get; set; }
 
    [NumericKeywordKeyField(FieldName = "numeric_keyword_key_field")]
    public double NumericKeywordKeyField { get; set; }
 
    [MultimediaUrl]
    public string MultimediaUrl { get; set; }
 
    [ComponentTitle]
    public string ComponentTitle { get; set; }
 
    [PageTitle]
    public string PageTitle { get; set; }
 
    [ComponentPresentations]
    public IList<IViewModel> ComponentPresentations { get; set; }
 
    [PresentationsByView(ViewPrefix = "example")]
    public IList<IViewModel> PresentationsByView { get; set; }
 
    [PresentationsByRegion(Region = "example")]
    public IList<IViewModel> PresentationsByRegion { get; set; }
 
    [KeywordData]
    public IKeyword KeywordData { get; set; }
 
    [EnumField(FieldName = "enum_field")]
    public Enum EnumField { get; set; }
 
    [ResolvedUrlField(FieldName = "resolved_url_field")]
    public string ResolvedUrlField { get; set; }
 
    [PageId]
    public TcmUri PageId { get; set; }
}

{% endhighlight %}