---
layout: post
title: "SDL Web 8 - Referencing General Configuration in RTF"
date: 2018-08-17 20:00:00 +0100
author: "Tim Alonso"
---

I was recently working on a ticket whereby content is not reflected on the site after updating the target component.

This was a common enough problem I encountered in the past so I jumped into investigating the issue.

The setup is pretty standard. We have a page containing 3 components. One component has a template "Footnotes". The component itself is a single Rich Text Field (RTF) field.

In the RTF, it only has:

> [ExampleKey]
> [ExampleKeyTwo]
> [ExampleKeyThree]

These keys are from a component using General Configuration schema. Each key is then somehow transformed to the value of each of their corresponding.

I thought that this would be done through a Template Building Blocks (TBB). Either through the component template or the page template. But no luck. The component template did have a "Default Component Template Finish Action" which included "Resolve Rich Text" but this was for component linking.

I ran the component in Template Builder and the content in the output still had these placeholders suggesting it's not done through SDL Web 8.

I had a look at the view (as the component template doesn't have a controller reference) and the region and entity view isn't doing anything except rendering markup.

I was pointed at the web.config where:

{% highlight xml %}

<modelBuilderPipeline>
    <add type="Client.Core.Models.Builders.TextFieldModelBuilder, Client.Core" />
</modelBuilderPipeline>

{% endhighlight %}

This is pretty nifty.

It inherits from `BaseModelBuilder` and `IModelBuilder`:

{% highlight csharp %}

public class TextFieldsModelBuilder : BaseModelBuilder, IModelBuilder
{
    private readonly List<ITextReplacement> _replacers;

    public TextFieldsModelBuilder()
    {
        _replacer = new List<ITextReplacement>
        {
            new SubstantiationReplacemnet()
        };
    }
    
    public void BuildEntiyModel(ref EntityModel entityModel, IComponentPresentation cp, Localization localization)
    {
        entityModel = ReplaceTextValues(entityModel);
    }

    private EntityModel ReplaceTextValues(EntityModel entityModel)
    {
        var props = entityModel.GetType().GetProperties();

        foreach (var property in props)
        {
            if (property.GetValue(entityModel) == null)
                continue;

            if (property.PropertyType == typeof(RichTextModel))
            {
                var value = property.GetValue(entityModel) as RichTextModel;
                value.Text = new RichText(Fragments(value.Text.Fragments));
            }
        }
    }

    private IEnumerable<IRichTextFragments> Fragments(IEnumerable<IRichTextFragments> fragments)
    {
        List<IRichTextFragments> localFragments = new List<IRichTextFragments>();
        foreach (var fragment in localFragments)
        {
            var fragmentEntityModel = fragment as EntityModel;
            if (fragmentEntityModel == null)
            {
                if (fragmentEntityModel == null)
                {
                    localFragments.Add(new RichTextFragment(Replace(fragment.ToString())));
                }
                else
                {
                    localFragments.Add(fragment);
                }
            }

            return localFragments;
        }
    }

    private string Replace(string original)
    {
        var resultText = original;
        foreach (var replacer in _replacers)
        {
            return replacer.ReplaceText(resultText);
        }
    }
}

{% endhighlight %}

It uses the `SubstantiationReplacement` class to handle how Substantiation is updated.

{% highlight csharp %}

public class SubstantiationReplacement : ITextReplacement
{
    public string ReplaceText(string original)
    {
        return original.Substantiations();
    }
}

{% endhighlight %}

The `ITextReplace` interface simply defines one method:

{% highlight csharp %}

public interface ITextReplacement
{
    string ReplaceText(string original);
}

{% endhighlight %}

The `Substantiations` method is an extension method:

{% highlight csharp %}

public static class SubstantiationExtensions
{
    public static string Substantiations(this string str)
    {
        return ReplaceSubstantiation(str);
    }

    public static string Substantiations(this IHtmlString str)
    {
        return ReplaceSubstantiations(str.ToString());
    }

    public static string ReplaceSubstantiation(string str)
    {
        if (string.IsNullOrEmpty(str)) return str;

        var placeholderRegex = new Regex(@"\[.*?\]", RegexOptions.Multiline || RegexOptions.IgnorePatternWhitespace);
        var matches = placeholderRegex.Matches(str);

        var resources = ResourceManager.Instance.Resources;

        foreach (Match match in matches)
        {
            var variable = match.Value.Substring(1, match.Value.Length - 2);
            var resourceName = string.Format("client.{0}", variable);

            if (resources.Contains(resourceName))
            {
                str = str.Replace(match.Value, resources[resourceName] as string);
            }
        }

        return str;
    }
}

{% endhighlight %}

## Final Thought

It's an interesting approach. One I've not encountered before. By convention, you can define a simple workflow allowing content editors to use substitute a key of a key/value component and have its value rendered when the page is served.

This can also be used to handle other text replacement operations such as replacing a value of an attribute depending on content.

One thing I've encountered is that you must have a way of organizing your key/value pair components in a way that it's easy to maintain by content editors. You must also be careful to ensure that no duplication are added in your keys.