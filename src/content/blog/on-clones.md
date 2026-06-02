---
title: "On Clones for Agents"
pubDate: 2026-05-15
draft: true
---

## On Clones for Agents

Let me start by sayig I believe that in the future we will use replicas/clones for many different things but specifically because of the use of AI Agents. AI Agents allow us to do things in parrallel or do things without human supervision for the first time ever.

We truly have ghosts in the machine that go around and do things for us. With this in mind, let us walk through what I believe the future will hold and why.

## Autonomous Agents

To begin we must believe that agents are/will become fully autonomous, i.e. they will need to do things completely on their own without human supervision. I believe this as it is what we already see, when coding with agents we want to get them as close to reality as possible, get them to run the tests or run their code against a test case to see if they did a good job. If not try again. Repeat.

## Feedback Loops

This is what makes the agents so powerful, you can give it a test and say this is failing and watch it go, sometimes giving up but if you pester it enough it will complete the job. This is what I mean by being autonomous. They will run on their own but first they need test cases or ways to test their work.

## Testing

In the world that I come from (Linux, Data Engineer, sys-admin), the feedback/debugging loops are not as clear and pretty as testing for code. Agents need a place to test things.


## Why Not Development?

I use development/dev environments at work, we will pull a pipeline into dev to test and make changes before moving those changes over. 

I mean literally that is my workflow right now for the issue we are seeing. I pulled the data into dev, added a logstash config and am testing it and waiting for a review. 

Okay then for example, there is a bug in a pipeline and there is a parsing error. What is stopping an autonomous agent like codex from just having access to a dev logstash, running ansible playbooks to it, deploying the existing pipeline, sending the pipeline to elasticsearch, reading the logs and iterating until the pipeline starts? 

I'm not sure.

Even with ETL pipelines, the errors get logged to the DLQ, agent investigates the DLQ with some read only thing, then how does it test? 





(Sadly) lots of debugging, investigation and testing is done in a production system, almost all the work I do in maintaining these environments are in production systems.

Take that with what you will, I never said it was good but in real-time streaming cases, this is often the case.

Now imagine giving an agent an issue on a machine that is in production that is running a log processor that processes a billion events a minute. If it goes down that is bad. Even changing things that are not correct is bad in ETL pipelines, very bad. Basicall what I am saying is that I would never trust an agent on a production system to do any type of work. Even humans mess up, now image 10 agents working on the same machine solving different issues.

## Okay....

Okay so you see the issue, agents need an environment to get a feedback loop and test their fixes that scales with how many agents there are (1 environment per agent). For code this is git worktrees or sandboxes. But there will be many of these for every field.

Think of multiple agents working on an excel spreadsheet. Hopefully they are doing different things but still having multiple agents working on soemthing (like a codebase), is a mess, they get confused becasue things that they didn't change are changing and they don't understand why, they start hallucinating they made the changes when they didn't, they delete these changes for consistency, you yell at them to stop deleting things, you tell them it's another agent they tell you you're stupid, its a big mess.

Basically they each need a seperate environment.

## Environments

The problem. Agents need a fully seperate ephemeral environment that contains the problem they need to fix. This is what gives us the feedback loop to heaven. 

Okay cool, now second issue. Cloning the environment where the agents need to work is hard. If you have ever done hot fixes in prod, you know it's hard. There is config drift all the time. The IaC is not the source of truth, production (usually, sadly) is.


## BUTTTTTTT....

Cloning a VM with a 5TB disk is hard. Cloning a data ETL pipeline is hard. Cloning a kubernetes cluster with outside dependencies is hard. Cloning a distributed system with webhook APIs, moving parts, jobs, queues, streams, you name it, is hard.

But these are the environments where real humans work today that agents will need to work in tomorrow, whether it's for fixing data pipelines, SRE agents, dev ops testings, maintaining legacy systems.

## Finally

That is the problem I am trying to solve. Ephemeral environments that match reality (enough) to give autonomous agents a full feedback loop for us to achieve all the awesome qualities of agents, safely.


## TLDR holy fucking shit collin

Autonomous agents need feedback loops to achieve their full glory. Systems that humans work in today can't be touched by agents, therefore we need clones of these environments for agents to work.
