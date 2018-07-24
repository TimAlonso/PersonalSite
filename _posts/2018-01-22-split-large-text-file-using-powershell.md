---
layout: post
title: "Split Large Text File using PowerShell"
date: 2018-01-22 20:00:00 +0100
author: "Tim Alonso"
---

## Scenario:

You need to view a large log file (2GB+) and circumstances won’t allow you to download tools online (i.e. security policies). The usual file editors such as Notepad and Notepad++ couldn’t open the file as it’s too big.

You can use an online tool but this makes searching for specific terms unusable.

One way around this is to use PowerShell:

{% highlight console %}

$i=0; Get-Content C:\logs\sample.log -ReadCount 100000 | %{$i++; $_ | Out-File -filepath C:\logs\output\out_$i}

{% endhighlight %}

## Reference:

- [Stack Overflow Answer](https://stackoverflow.com/questions/1001776/how-can-i-split-a-text-file-using-powershell/23061293#23061293)