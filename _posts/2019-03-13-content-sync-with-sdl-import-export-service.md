---
layout: post
title: "Content Syncing using SDL's Import and Export Service"
date: 2019-03-13 20:00:00 +0100
author: "Tim Alonso"
---

I am working with the client that have 3 environments; Dev, Test and Staging/Production.

One area identified for improvement is that Dev and Test CME lack content to easily replicate issues from Production. This results in developers from having to manually recreate content or content port from Production.

We'd like to know if it's possible to authomate content sync from Production to Test without manually porting content or back-sync Production's database.

The ideal scenario is that content is automatically synced in a pre-determine schedule from Production to Test.

## Approach

The fundamental idea is two-folds, to use SDL's Import Export Service for generating packages to export and uploading said packages to the server for importing.

The second part would be to track future updates into a bundle, to be then exported automatically from one content manager instance and imported automatically to another via a console app.

## Gather

This is based on work done by Chris Eccles from Dept. This is using the Event System code to track when an item is checked in, an item is saved, a keyword is saved and an item is localized. These items are then added to bundles within their current publication.

```c#
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

This will be a console app using SDL's Import and Export Service. The idea would be to export the specified bundle.

Instantiate the client and test connection:

```c#
var client = new ImportExportServiceClient();

var status = client.TestConnection();
Console.WriteLine(status);
```

Define items for selection and export instructions. Then initiate export:

```c#
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
```c#
var processState = client.GetProcessState(processId);
while (processState.HasValue && processState == ProcessState.Running)
{
    Thread.Sleep(30000);
    processState = client.GetProcessState(processId);
}
```

Download package
```c#
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

Using the Import Service, we instantiate the client and test connection:

```c#
var client = new ImportExportServiceClient();

var status = client.TestConnection();
Console.WriteLine(status);
```

Then upload the exported package to the content management server
```c#
var fileName = _uploadClient.UploadPackage(File.ReadAllButes(@"C:\Example\Example-Package.zip"));
```

Pass the temporary file name of where the zip file was uploaded and define import instructions

```c#
var instructions = new ImportInstruction
{
    CreateUndoPackage = true,
    Description = "Testing import service",
    DiscoverPotentialProblem = true,
    ErrorHandlingMode = ErrorHandlingMode.Abort,
    LogLevel = LogLevel.Debug
};

var processId = _client.StartImport(fileName, instructions);
var processState = _client.GetProcessState(processId);
```

Handle if the process is aborted:
```c#
if (processState.HasValue && processState == ProcessState.Aborted)
{
    using (var stream = _downloadClient.DownloadProcessLogFile(processId, true))
    {
        using (var fileStream = File.Create(@"C:\Example\Example.log"))
        {
            stream.CopyTo(fileStream);
        }
    }
}
```

Poll the process state until import is done:
```c#
while (processState.HasValue && processState == ProcessState.Running)
{
    Console.WriteLine("Waiting...");
    Thread.Sleep(30000);
    processState = _client.GetProcessState(processId);
}
```

## Issues & Challenges

### Documentation

I've got a simple script for exporting 1 bundle from a Test CME and it's returning a process ID. 

I looked at the documentation (Core Service, `Tridion.ContentManager.ImportExport.Service.IImportExportService201601`) and found no clear information of what I can do with this process ID except pass it to other method for retrieving process info. 

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

This can be achieve by configuring access to the WCF service by code:

```c#
public static IImportExportService Create()
{
    string hostname = ConfigurationManager.AppSettings["ImportExportService.Host"];
    string username = ConfigurationManager.AppSettings["ImportExportService.Username"];
    string password = ConfigurationManager.AppSettings["ImportExportService.Password"];
    string endpointPath = ConfigurationManager.AppSettings["ImportExportService.Endpoint"];

    var binding = new BasicHttpBinding
    {
        MaxBufferSize = 4194304,
        MaxBufferPoolSize = 4194304,
        MaxReceivedMessageSize = 4194304,
        ReaderQuotas = new XmlDictionaryReaderQuotas
        {
            MaxStringContentLength = 4194304,
            MaxArrayLength = 4194304
        },
        Security = new BasicHttpSecurity
        {
            Mode = BasicHttpSecurityMode.Transport,
            Transport = new HttpTransportSecurity
            {
                ClientCredentialType = HttpClientCredentialType.Basic
            }
        }
    };

    hostname = string.Format("{0}{1}{2}", hostname.StartsWith("http") ? "" : "http://", hostname, hostname.EndsWith("/") ? "" : "/");
    var endpoint = new EndpointAddress(hostname + endpointPath);
    var factory = new ChannelFactory<IImportExportService>(binding, endpoint);

    if (factory.Credentials != null)
    {
        factory.Credentials.Windows.ClientCredential = new NetworkCredential(username, password);
    }
    else
    {
        throw new ApplicationException("Tridion channel has failed to authenticate. Please ensure the configuration is correct.");
    }

    return factory.CreateChannel();
}
```

Then parse the console app's arguments:

```bash
ContentSync.exe --action import --target dev
```
