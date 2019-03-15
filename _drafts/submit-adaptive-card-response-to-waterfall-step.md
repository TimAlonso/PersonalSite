---
layout: post
title: "Submit Adaptive Card Response to Subsequent Waterfall Step"
date: 2019-03-14 20:00:00 +0100
author: "Tim Alonso"
---

# Introduction

I'm currently working on a proof of concept bot using Microsoft's [Bot Framework](https://dev.botframework.com/).

The focus is getting a user journey completed with the appropriate inputs. The requirement is that a user can initiate interaction with a bot and request to book an appointment.

As this is a proof of concept, I took a like-for-like example of the form currently used on the live site as a template and defined a JSON representation for an Adaptive Card to capture this information.

This journey is one of 3 different branches of conversation so to accommodate this I'm using a `DialogSet` and represent each branch as a `WaterfallStep`.

So for capturing this form, I've created two steps. One to capture and another to process submission.

## Issue

The issue comes from the transition between the first and second step.

This is the first step:

```
private async Task<DialogTurnResult> CaptureFormStepAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
{
    var reply = await stepContext.Context.Activity.GetReplyFromCardAsync("BusinessyForm");
    await stepContext.Context.SendActivityAsync(reply, cancellationToken);
}
```

The `GetReplyFromCardAsync` is an extension method which takes a JSON representation of an `Activity` with an adaptive card as an attachment.

In the past, I've had to send a prompt back to the user. The user will then respond. In this instance, I don't want to prompt the user as my first step will display a form for them to fill in.

The first step was to figure out how to pass this submission to the next step context. The waterfall setup assumes that a prompt is needed in order to move the conversation forward.

In my instance, I'd like for the context to wait while the user fill out the form and submit it. Unfortunately, this isn't supported out of the box.

## Solution

A helpful user from Stack Overflow provided a viable alternative.

If you're using an Adaptive Card that takes user input, you generally want to handle whatever the user submits outside of the context of a Waterfall Dialog.

The work around is:

1. Display the Adaptive Card
2. Display a Text Prompt
3. Convert the user's Adaptive Card input into the input of a Text Prompt

For Step 1:
```
private async Task<DialogTurnResult> DisplayForm(WaterfallStepContext stepContext, CancellationToken cancellationToken)
{
    var reply = await stepContext.Context.Activity.GetReplyFromCardAsync("BusinessyForm");
    await stepContext.Context.SendActivityAsync(reply, cancellationToken);

    var promtOptions = new PromptOptions
    {
        Prompt = new Activity
        {
            Type = ActivityTypes.Message
        }
    };

    return await stepContext.PromptAsync(TextPrompt, promtOptions);
}
```

For Step 2:
```
private async Task<DialogTurnResult> HandleResponseForm(WaterfallStepContext stepContext, CancellationToken cancellationToken)
{
    // You can parse `stepContext.Result` into an object you can use.
    await stepContext.Context.SendActivityAsync($"Result: {stepContext.Result}");
    return await stepContext.EndDialogAsync(stepContext.Result, cancellationToken);
}
```

For Step 3:
```
if (dialogContext.Context.Activity.GetType().GetProperty("ChannelData") != null)
{
    var channelData = JObject.Parse(dialogContext.Context.Activity.ChannelData.ToString());
    if (channelData["postback"] != null)
    {
        var postBackActivity = dialogContext.Context.Activity;
        postBackActivity.Text = postBackActivity.Value.ToString();
        await dialogContext.Context.SendActivityAsync(postBackActivity);
    }
}
```

## Considerations

### PostBacks

If you're using PostBack anywhere else in your bot - you'll need to define an approach to exclude those or find a way to identify an activity that came from the specific waterfall dialog.