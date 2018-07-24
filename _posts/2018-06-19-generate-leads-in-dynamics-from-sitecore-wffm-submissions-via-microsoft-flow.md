---
layout: post
title: "Sitecore and WFFM - Generate Leads in Dynamics via Microsoft Flow"
date: 2018-06-19 20:00:00 +0100
author: "Tim Alonso"
---

I’ve recently completed some work for a client who wanted a way to create Leads in their CRM each time an end-user successfully submits from a selected set of forms.

The approach decided was to use Microsoft Flow as an API bridge between Sitecore’s Web Forms for Marketers (WFFM) and Dynamics 365. Similar to the diagram below.

![API Bridge]({{ "/assets/api-bridge.png" | absolute_url }})

## Microsoft Flow?

It’s an online workflow service which allows you to create automated workflows between apps and services to get notifications, synchronize files, collect data and more.

The reason Microsoft Flow was selected was to create a robust approach by defining clear steps for processing each form submission and eventually generating a lead.

## Prerequisites

- Sitecore 8.1 rev. 160519 – Update-3
- Web Forms for Marketings (WFFM) 8.1 rev. 160523.

## Install and Configure Sitecore Flow

Sitecore Flow is a free, open source Sitecore / Microsoft Flow connector. This allows Sitecore to connect to Dynamics.

Instructions can be found [here](https://github.com/adoprog/Sitecore-Flow#installation).

Follow the instructions to create a new (or use existing) WFFM form configured with Microsoft Flow [here](https://github.com/adoprog/Sitecore-Flow#usage).

## Create Flow

The configuration will include instructions in creating a “Flow” within Microsoft Flow’s web UI.

The mechanism for creating a Flow is relatively straightforward. You select an action from a wide variety of connectors and these can either take an input, process said input and generate output for the next action. Other times, it runs something such as send emails or creates a document.

### Switch Statements

I found switch statements annoying if you have more than 3 conditions. By default, the switch statement actions are expanded so when you first open your flow to edit it, you see a blank space. You’ll need to scroll to the right to see the rest.

In order to make it easier to read the workflow, rename your actions and variables with appropriate naming convention instead of variable 1.

### Mapping

One area that I found quite challenging is mapping the data from your submission into a custom field in the Lead on Dynamics. Two items specifically. If the field type is a “Drop Down” or “Option Set” and if the submission data doesn’t have the necessary data point to map directly to a lead.

I haven’t found an acceptable solution yet.

The current approach is to get a deeper understanding of Dynamics data structure and you’ll find that each Option Set is a value/key pair. The value is an arbitrary number. This identifier is used in Microsoft Flow to map the text of each Option Set, if it matches, set the value of the Lead item to the value of Option Set.

This is a fragile solution because:

If the text value changes in Dynamics, this will need to be updated in Microsoft Flow.
Microsoft Flow is coupled with Dynamics inner working.
If the number of Option Set increased to 5+, then your mapping (switch statements) will become unmanageable.
If the value required by the CRM is not included in the form submission then the only workaround I found is to define a default which needs to be agreed upon.

## Testing

In order to test your Flow, publish your form in Sitecore, navigate to it on your local implementation, fill out the form and submit.

If you navigate back to your Flow, you should find that your “Run History” will process your form submission. It’ll tell you if your workflow was successful or not. If it fails, it identifies the exact item that requires fixing.

![Microsoft Flow Run History]({{ "/assets/microsoft-flow-run-history.png" | absolute_url }})

One thing I like about this is you can re-use the data of your previous submission to test your workflow once you’ve completed your fix.

## Deploying

The client has 4 environments; Dev, Test, UAT and Production.

In my approach, I’ve created 4 individual flows to represent each environment. Each environment would have a specific data (i.e. option set’s identifier).

In this approach, it’ll require you to manually change each flow as you move to each environment. This is a manual task that is error-prone. Ideally, I’d like to copy a flow and pass the environment-related variables as a parameter to auto-populate it but I’m not able to do this at the moment.

## Conclusion

Microsoft Flow is excellent for a simple workflow that handles a one-to-one mapping between each field to a Lead item. If submitted data require to be processed in order to fit into a mandatory or “Option Set” type field, then it gets a bit unwieldy. I hope that my experience is helpful to others.