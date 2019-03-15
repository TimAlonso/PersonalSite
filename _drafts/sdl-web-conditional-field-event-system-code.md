---
layout: post
title: "SDL Web 8 - Conditional Field Validation Using Event System Code"
date: 2018-10-09 20:00:00 +0100
author: "Tim Alonso"
---

## Table Schema Validation

As part of the development for the Table Components, there will need to be validation applied to fields against the embedded Table Cell schema. It is required that an editor is forced to enter values for either a text cell or image cell based on which type they select. Because the cells are based on a simple type the individual fields for text and image cannot be made mandatory in the standard way. To enable the required validation to fire, I will use the TOM.NET API to hook into the SDL events system to validate a Table component when created or saved. The definition of events logic to code is below. 

## Event Hierarchy

The Data Modification Events should be used subscribe to events on CRUD operations of the SAVE event of the Table Schema.

## Event Phase

To enforced the desired logic the Initiated phase should be subscribed to which should prevent the SAVE event from firing if the component does not meet the desired content requirements. The subscription order can be left as the default “Normal” priority.

## Synchronous / Asynchronous

This event system handler should be implemented synchronously not as an asynchronous operation.

## Event Subscription

The event subscription for tables should be against the Component Object using the SaveEventArgs of the Event System.

## Logic

When the event handler fires, the following logic needs to be run and fail the save of any new or existing component if the below conditions validate to a failure. 

For each Inner Table of the Table Schema 
    For each Table Row of the Inner Table 
        For each Table Cell of the Table Row 
            If Table Cell Type = Text & Cell Text is Null or Empty 
                Fail Save 
            If Table Cell Type = Image & Cell Image is Null or Empty 
                Fail Save 

If no table row cells have been defined in the content the standard mandatory flag against each field should fail the save regardless of the event logic. 