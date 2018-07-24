---
layout: post
title: "SDL Web 8 - How to get custom ECL metadata exposed?"
date: 2017-07-04 20:00:00 +0100
author: "Tim Alonso"
---

In your ECL implementation, you define your metadata’s XML schema:


{% highlight csharp %}

public ISchemaDefinition MetadataXmlSchema
{
    get
    {
        var schemaDefinition = Media.HostServices.CreateSchemaDefinition("MediaItemMetadata", "ecl:CustomMediaProvider");
 
        schemaDefinition.Fields.Add(
            Media.HostServices.CreateSingleLineTextFieldDefinition("title", "Title"));
 
        schemaDefinition.Fields.Add(
            Media.HostServices.CreateNumberFieldDefinition("id", "Id"));
 
        return schemaDefinition;
    }
}

{% endhighlight %}

Another property will populate this schema:

{% highlight csharp %}

public string MetadataXml
{
    get
    {
        var xNamespace = "ecl:CustomMediaProvider";
        var data = new XElement(xNamespace + "MediaItemMetadata");
        var xhtmlNs = "http://www.w3.org/1999/xhtml";
        data.Add(new XAttribute(XNamespace.Xmlns) + "x", xhtmlNs.NamespaceName));
 
        XElement xElement;
        xElement = GetHtmlFieldXml(_mediaItem.Name, xhtmlNs).Root;
        if (xElement != null)
            data.Add(new XElement(xNamespace + "Title", xElement.Nodes()));
 
        return data.ToString();
    }
}
 
private XDocument GetHtmlFieldXml(string fieldName, XNamespace xmlNamespace)
{
    HtmlDocument html = new HtmlDocument();
    html.LoadHtml("<body>" + fieldValue + "</body>");
    html.OptionWriteEmptyNodes = true;
    html.OptionOutputAsXml = true;
 
    StringBuilder sb = new StringBuilder();
    using (XmlWriter xmlWriter = XmlWriter.Create(sb))
    {
        html.Save(xmlWriter);
    }
 
    XDocument doc = XDocument.Parse(sb.ToString());
    foreach (XElement x in doc.Descendants())
    {
        if (string.IsNullOrEmpty(x.Name.NamespaceName))
        {
            x.Name = xmlNamespace + x.Name.LocalName;
        }
    }
 
    return doc;
}

{% endhighlight %}

Deploy this in your DEV environment `~/ProgramData/SDL/SDL Tridion/External Content Library/AddInPipeline/Addins/CustomProvider` and restart your SDL services. You should now be able to see the change reflected in SDL Web.

Simply add this multimedia image to a component with a component presentation using DD4T’s dynamic generate content and you should now be able to see this content on your web app.