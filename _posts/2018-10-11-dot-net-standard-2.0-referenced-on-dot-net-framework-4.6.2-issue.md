---
layout: post
title: ".NET Standard 2.0 Referenced on .NET Framework 4.6.2 Issue"
date: 2018-10-10 20:00:00 +0100
author: "Tim Alonso"
---

I'm currently working on a project that is using .NET Framework 4.6.2, .NET Standard 2.0 and .NET Core 2.1.

I encountered an issue whereby pulling the latest code and building the solution locally works just fine. I can also run our API (.NET Framework 4.6.2) and get expected data.

This API is using a Data project (.NET Framework 4.6.2) which is then referencing two other projects (both .NET Standard 2.0). I wanted to update the Data project but I encountered an error that it can't resolve the .NET Standard projects.

## Things that I checked:

- Verified that DLLs are generated in the bin directory after clean and building
- Remove/Re-add references to .NET Standard projects
- Restarted Visual Studio
- Checked Nuget references in case these were interrupting
- Updated my Visual Studio Enterprise 2017 to the latest version (as of this writing) to 15.8.7.

## Solution

Because the projects were buiding with no errors, I thought that it could be visual-related (i.e. intellisense). I had ReSharper installed. I disabled ReSharper and found that this resolved the issue. 

It turns out that my current version of ReSharper (2017.1.2) does not support .NET Standard 2.0 just yet. Upgrading to 2017.2.3 fixed the issue.

Hope that this would help save you a couple of hours.