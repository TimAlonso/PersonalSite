---
layout: post
title: "Automating SDL Web 8.5 Content Sync"
date: 2019-03-13 20:00:00 +0100
author: "Tim Alonso"
---

## Notes

- one-off
    - the approach considers from this point onwards. will require a one off sync for the entire content management instance.
- deployment
    - notes on how to deploy across environments
- issues/challenges
    - notes on issues and challenges encountered

## Introduction

The goal is to create a solution to automate syncing content from Production downstream to Test and Dev environments in order to get fresh set of data to test against.

## Approach

There are 3 steps needed:

1. Gather via Event System Code
2. Export via Export Service
3. Import via Import Service

There is also a potential prerequisite step which require to do a full, one-off sync.

## Gather

This is based on work done by Chris Eccles from Dept.

```
[TcmExtension("Content Sync")]
public class ContentSyncEvents : TcmExtension
{
    private const string BundlePackageFolder = "Content Sync";

    public ContentSyncEvents()
    {
        EventSystem.Subscribe<VersionedItem, CheckInEventArgs>(VersionedItemSave, EventPhases.TransactionCommitted);
        EventSystem.Subscribe<OrganizationalItem, SaveEventArgs>(ItemSave, EventPhases.TransactionCommitted);
        EventSystem.Subscribe<Keyword, SaveEventArgs>(ItemSave, EventPhases.TransactionCommitted);
        EventSystem.Subscribe<RepositoryLocalObject, LocalizeEventArgs>(ItemLocalize, EventPhases.TransactionCommitted);
    }

    private void VersionedItemSave(VersionedItem item, CheckInEventArgs args, EventPhases phases)
    {
        AddItemToBundle(item);
    }

    private void ItemSave(RepositoryLocalObject item, SaveEventArgs args, EventPhases phases)
    {
        if ((item is Folder && item.Title != RELEASE_PACKAGES_FOLDER) || item is StructureGroup || item is Category || item is Keyword)
        {
            AddItemtoBundle(item);
        }
    }

    private void ItemLocalize(RepositoryLocalObject item, LocalizeEventArgs args, EventPhases phases)
    {
        AddItemtoBundle(item);
    }

    private void AddItemtoBundle(RepositoryLocalObject item)
    {
        var bundle = GetOrCreateBundle(item.ContextRepository);
        if (bundle != null)
        {
            bundle.AddItem(item);
            bundle.Save();
        }
    }

    private Bundle GetOrCreateBundle(Repository repository)
    {
        var session = repository.Session;
        var bundle = (Bundle)GetObject(session, GetBundleWebDavUrl(repository));
        if (bundle == null)
        {
            bundle = new Bundle(session, GetBundleFolderUri(repository))
            {
                Title = repository.Title
            };

            bundle.Save();
        }

        return bundle;
    }

    private Bundle GetBundleWebDavUrl(Repository repository)
    {
        var pubBit = repository.WebDavUrl.Substring("/webdav/".Length);
        return $"{repository.RootFolder.WebDavUrl}/{BundlePackageFolder}/{pubBit}";
    }

    private TcmUri GetBundleFolderUri(Repository repository)
    {
        var folder = (Folder)GetObject(repository.Session, $"{repository.RootFolder.WebDavUrl}/{BundlePackageFolder}");
        if (folder == null)
        {
            var contextPublicationId = repository.Id.ItemId;
            repository = GetRootRepository(repository);
            folder = new Folder(repository.Session, repository.RootFolder.Id);
            folder.Title = BundlePackageFolder;
            folder.Save();

            return new TcmUri(folder.Id.ItemId, ItemType.Folder, contextPublicationId);
        }

        return folder.Id;
    }

    private Repository GetRootRepository(Repository repository)
    {
        if (repository.Parents.Count == 0)
        {
            return repository;
        }
        else
        {
            return GetRootRepository(repository.Parents[0]);
        }
    }

    private IdentifiableObject GetObject(Session session, string uriOrWebdavUrl)
    {
        if (session.IsExistingObject(uriOrWebdavUrl))
        {
            return session.GetObject(uriOrWebdavUrl);
        }

        return null;
    }
}
```

## Export

Instantiate the client and test connection:

```
var client = new ImportExportServiceClient();

var status = client.TestConnection();
Console.WriteLine(status);
```

Define items for selection and export instructions. Then initiate export:

```
var selections = new Selection[]
{
    new ItemsSelection
    {
        ItemIds = new []
        {
            "tcm:19-53638-8192"
        }
    }
};

var instructions = new ExportInstruction
{
    ErrorHandlingMode = ErrorHandlingMode.Abort,
    BluePrintMode = BluePrintMode.ExportSharedItemsFromOwningPublication,
    LogLevel = LogLevel.Debug
};

var processId = client.StartExport(selections, instructions);
```

Get process state and poll server until state is `Finished`
```
var processState = client.GetProcessState(processId);
while (processState.HasValue && processState == ProcessState.Running)
{
    Thread.Sleep(30000);
    processState = client.GetProcessState(processId);
}
```

Download package
```
var downloadClient = new ImportExportStreamDownloadClient();
using (var stream = downloadClient.DownloadPackage(processId, true))
{
    using (var fileStream = File.Create(@"C:\Example\Example.zip"))
    {
        stream.CopyTo(fileStream);
    }
}

```

## Import

Instantiate the client and test connection:

```
var client = new ImportExportServiceClient();

var status = client.TestConnection();
Console.WriteLine(status);
```

Pass package name and define import instructions

```
var packageName = "Example.zip";

var instructions = new ImportInstruction
{
    CreateUndoPackage = true,
    Description = "Testing import service",
    DiscoverPotentialProblem = true,
    ErrorHandlingMode = ErrorHandlingMode.Abort,
    LogLevel = LogLevel.Debug
};

var processId = client.StartImport(packageName, instructions);
```

## One-Off

Implementation detail of how to capture CME's content snapshot.

## Deployment

Instruction for deploying different components.

## Issues & Challenges

### Documentation

I've got a simple script for exporting 1 bundle from a Test CME and it's returning a process ID. 

I looked at the documentation (Core Service,  `Tridion.ContentManager.ImportExport.Service.IImportExportService201601`) and found no clear information of what I can do with this process ID except pass it to other method for retrieving process info. 

The expectation was a package to be generated similar to that used by Content Porter.

I'm unable to find examples from the official SDL's [documentation](https://docs.sdl.com/LiveContent/content/en-US/SDL%20Web-v5/GUID-DF5EE296-C806-4165-9AE8-FC0865C923C2#addHistory=true&filename=GUID-7FB83357-D92C-40F8-B75B-90CAF2BD5E67.xml&docid=GUID-C1B075E6-7C62-450E-AFB5-77BB5C9C599F&inner_id=&tid=&query=&scope=&resource=&toc=false&eventType=lcContent.loadDocGUID-C1B075E6-7C62-450E-AFB5-77BB5C9C599F) either.

It turns out that to download the package, I must use a different interface:

- Instantiate `ImportExportServiceClient`
- Define Items for Selection
- Define Export Instruction
- Start Export
- Get Process State
- Poll Server Until State == Finished
- Get Process Info
- Instantiate `ImportExportStreamDownloadClient`
- Download Package

### Environment-Specific

One requirement is to import generated package into the appropriate CME. In order to import to Test and Dev (as we will be generating packages from Production), we need to dynamically switch the WCF service to the appropriate instance to import correctly.

There are 2 options:

#### 1. Define Naming Scheme

```
<bindings>
    <binding name="Default_DEV">
        ...
    </binding>
    <binding name="Default_PROD">
        ...
    </binding>
</bindings>
```

#### 2. External Configuration Store

Don't use config files. Define everything in code and load configuration from a database.