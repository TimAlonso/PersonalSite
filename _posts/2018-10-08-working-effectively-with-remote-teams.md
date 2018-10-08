---
layout: post
title: "Working Effecively with Remote Teams"
date: 2018-10-10 20:00:00 +0100
author: "Tim Alonso"
---

As part of my work with [Dept](https://www.deptagency.com/en-gb/), I often work remotely with clients to help their development team with SDL Web related projects. These are my notes on what I've found useful when working with remote teams.

## Kick Off

The purpose of this is two-fold. The first reason is to provide context, background and goals for the project. This allows the team to start from the same point. The second reason is to introduce the team; engineers, project managers and stakeholders. This allows you to know who the decision makers are, who your colleagues are and what their responsibilities are.

The key takeaway from this session is to establish an understanding of what is expected from both parties. If you will be working on a specific piece of work on your own or work as part of the team.

If feasible, have this meeting in person.

## Technical Onboarding

The purpose of this is to give you an overview of the development workflow of the remote teams. This introduces you to the following things:

* Local development setup
* Code repository
* Build and Deployment
* Environments
* Monitoring

The idea is that this would give you an end to end snapshot of what's needed in order to get a new feature or bug fix deployed live. It also gives you and the client a good starting point with what access to give you.

If time permits, another session could be used to get an introduction to the architecture and major components of the codebase.

## Access

One of the most important things to get right.

In a remote scenario, you will likely be accessing the client's network via VPN. In some instances a physical key is necessary. It's important that access is requested as soon as possible as this can often be time-consuming. Hopefully, the technical onboarding session will make it clear that this is needed early on.

Other areas which may need access considerations are:

* Network
* Code Repository
* RDP (Remote Desktop)
* Database
* Issue Tracker
* Monitoring Tools

## Working Together

The purpose of this is to define how the team would work together throughout the duration of the project. Things that may require to be defined are:

* Instant Messaging (i.e. Slack, Hangouts)
* Calls with Screen Sharing (i.e. Slack, Skype)
* Issue Tracking (i.e. Jira, VSTS)
* Document Repository (i.e. Confluence, Sharepoint)
* Stand up
* Timezones

These are intended to reduce friction and provide plenty of opportunities for collaboration between two parties.

In scenarios where there are multiple teams scattered across multiple timezones, attempt to maximize time when all of you are in the office.

## Communication

I've always found that you can never over-communicate when working remotely. We tend to take a lot of things for granted when working with other engineers in the same room. Body language and tone of voice for example.

These are practical tips that I found useful:

* Update tickets often with your progress
* Provide appropriately detailed commit messages
* Write an email update, especially if your colleagues start much earlier than you
* Let the client know about your upcoming holidays
* Let the client know of public holidays as not many in the United States know what a "bank holiday" is

## External Dependencies

This is a recent discovery. While it's important to develop features and fix bugs, it's worthwhile taking a step back and see how your work fits into the big picture. Is the application you're working on relying on other systems? Web services, databases or third-party tools? Are there applications relying on your application? Are there dependencies on deployments?

These are important questions to answer as early as possible to avoid headaches.

## Attitude

It's great if you're introduced to the project with the principles above followed but sometimes that isn't the case. There are times when you're dropped in a project where there is no kick-off, no onboarding, no introduction, no documentation, large undocumented legacy codebase, many open bugs and short timelines.

In such cases, stop.

Take a deep breath.

Take stock of what you currently have (if possible, drag your Project Manager and whoever else is working with you in a room) and proactively define the list of things that need to be done in order to get started.

* No access? List the possible things that you may need and send this off to your point of contact.
* No documentation? Set one up locally. Create a Confluence space.
* Build and deployment unknown? Deploy a single fix and document the process.
* Environments unknown? Ask.
* Lots of open bugs? Raise these on the issue tracker for the entire team to gain visibility.

Be proactive. Be pragmatic. Be positive.

## Colleagues

You will be working with a wide range of people with different cultures, background and experiences. Be open, respectful and patient.

Get to know your new colleagues. Ask about what they do over the weekend. Ask about their previous experience. Ask for their opinion. Build that relationship as these are the people you'll be relying on getting things done.

## Others

These are other advice that I found useful.

* Get a headset. It's a fuss to constantly find a room when needing to chat with your colleagues. Request an inexpensive headset.
* If you encounter a piece of code that no one seems to understand either write tests around it or document it. If you encounter an unknown deployment process, document it.
* Share with the team.
* Spend time understanding the client process. Please take your time to understand before suggesting improvements.