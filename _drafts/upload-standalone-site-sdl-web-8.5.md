---
layout: post
title: "Upload Standalone Site in SDL Web 8.5"
date: 2019-03-05 20:00:00 +0100
author: "Tim Alonso"
---

## Notes

- scenario
- consideration
- approach
    - schemas
    - component and page template
    - custom template building blocks
        - extracting zip content
        - update asset references
- challenges
    - inconsistent implementation per standalone sites
    - javascript dynamically updates asset references
    - references to be updated inside files

## Scenario

A previous client had a collection of standalone interactive sites which they wanted to manage within their CMS.

A key driver for this decision is that their current solution involve giving access to an internal server to drop a directory containng the index page and associated assets. There is a scheduled task that will then copy these directories to the production presentation servers under a specific directory. Within the CMS, there's a field that takes in a string - this string is the internal URL of the standalone site. When published, the page content is saved in the data store and the web app, using DXA, query and consume this data. If it detects the standalone URL it will download the source and render these as is.

This isn't a scalable approach and was put in as a temporary solution. The proposal was to then store these standalone sites in the CMS.

Initial investigation suggestsed utilizing SDL's [Instant Campaign](https://github.com/sdl/dxa-flexible-campaign-content). A plugin that allows users to upload content directly into the CMS. After discussing the approach, it was decided not to proceed with this approach after an internal discussion.

## Approach

The approach was based on SDL's current way of managing the their HTML site.

This will involve defining schema for markup and assets (as a ZIP file), a Component Template which include cusomt Template Building Blocks and a new page template to render the markup.

### Schema

There was a single schema with two fields. Markup (string, multi-line, required) and Assets (multimedia, ZIP file, required).

The markup will take full HTML markup (it's not a rich text field to avoid updated markup). The ZIP file containing all necessary assets will be uploaded as a multimedia component into the CME.

### Componet Template

There will only be one Component Template called `Publish Standalone Site` with 3 custom Template Building Blocks.

### Template Building Blocks

- Publish Assets
- Update References
- Edit Component Field

#### Publish Assets

```
[TcmTemplateTitle("Publish Assets")]
public class PublishAssets : TemplateBase
{
    var component = GetComponent();
    var schema = package.GetValue("CustomSchema");
    if (component.Schema.RootElementName == schema)
    {
        throw new ArgumentException($"Unexpected input Component {component.Id} ('{component.Title}'). Expecting CustomSchema");
    }

    var drive = package.GetValue("D");
    var folder = GetTempFolder(drive);

    Directory.CreateDirectory(folder);

    try
    {
        var fields = new ItemFields(component.Content, component.Schema);
        var assets = fields.GetComponentValues("assets");

        var zipFile = Path.Combine(folder, "custom-assets.zip");
        File.WriteAllBytes(zipFile, assets.BinaryContent.GetByteArray());

        using (var archive = ZipFile.OpenRead(zipFile))
        {
            foreach (var entry in archive.Entries)
            {
                var path = Path.Combine(zipFile, entry.FullName);
                var directory = Path.GetDirectoryName(path);
                if (!Directory.Exists(directory))
                {
                    Directory.CreateDirectory(Path.GetDirectoryName(path));
                }
                
                if (!stirng.IsNullOrEmpty(entry.Name))
                {
                    entry.ExtractToFile(path, true);
                }
            }
        }

        var publication = (Publication)component.ContextRepository;
        var rootStructureGRoupWebDavUrl = publication.RootStructureGroup.WebDavUrl;
        var renderedItem = Engine.PublishingContext.RenderedItem;

        var files = Directory.GetFiles(folder, "*", SearchOption.AllDirectories);
        var binaries = new List<Binary>();
        foreach (var file in files)
        {
            var structureGroupWebDav = GenerateStructureGroupWebDavBasedOnFileExtension(file);
            var structureGroup = (StructureGroup)Engine.GetObject(structureGroupWebDav);

            using (var fileStream = File.OpenRead(file))
            {
                var extension = Path.GetExtension(file);
                var fileName = GenerateFileName(file);
                var variantId = $"dist-{structureGroup.Id.ItemId}-{fileName}";

                var binaryItem = Package.CreateStreamItem(GetContentType(extension), fileStream);
                var binary = renderedItem.AddBinary(
                    binaryItem.GetAsStream(),
                    fileName,
                    structureGroup,
                    variantId,
                    component,
                    GetMimeType(extension));

                binaryItem.Properties[Item.ItemPropertyPublishedPath] = binary.Url;
                package.PushItem(fileName, binaryItem);
            }
        }
    }
}
```

#### Update References

