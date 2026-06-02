---
title: "On Software Factories and Fully Autonomous Agents"
pubDate: 2026-05-11
draft: false
---

I think there's a fundamental misunderstanding about where AI agents are headed. Most people are still thinking in terms of local agents that help you when you get stuck. But they're missing the end-goal: fully autonomous agents running in the cloud, pulling tickets from Linear, creating pull requests, and operating with minimal human oversight. Like truly autonomous.

We are already here and the tooling is looking completely different. It's turned less on how can we optimize an agent and more how can we make it more autonomous. If anything the more autonomous we can make it the faster we can learn. We're going to see software factories where agents are maintaining and building software, and humans are purely maintaining those agents.

## The Ground Truth Problem

Here's the issue: humans reason by analogy. We rely on tribal knowledge, context, and subtle judgments learned through painful experience. Agents don't have that. They're stateless, and they don't learn on the job the way humans do.

This means agents need to get closer to the ground truth than humans do. They need to work directly with reality, not interpretations of it.

Take SRE agents as an example. Right now, most on-call agents are judging things based on logs or Sentry alerts or 500 errors. They don't have visibility into the production systems themselves because people don't know how to give them safe access. But without that ground truth, they're guessing at the wrong level of abstraction.

## Analogies vs. Truth

When humans are in the loop, they can interpret logs. They can say "oh, this is how you need to read this" or "this is the context you're missing." But when there are no humans in the loop, agents need to reason from the ground up.

Agents need different primitives than humans. They need raw data they can manipulate, not curated views designed for human consumption. When you give agents assumptions, you get hallucinations. When you give them curated data instead of ground truth, they can't reason effectively.

## The Missing Layer: Feedback Loops

I think we're going to see a shift toward tools that give agents both ground truth and feedback loops. We already see this in software engineering with test-driven development: you have a failing test, you iterate until it passes, and the test tells you when you're done.

That's how software factories are built. Feature request → write test → implement feature → automated review. The feedback loop is built in.

But this gets harder outside of pure software. How do you create feedback loops for an HR memo? How do you validate whether an employee raise is appropriate? What's the ground truth for financial modeling or marketing strategy?

These are domains full of assumptions, and companies make decisions based on those assumptions without ever testing if they're true. Then they're stuck with false ideas guiding the company.

## The Crack in Human Systems

The more we build agents, the more we're exposing the cracks in our own human systems. We're not truth seekers. We're cognitive dissonance minimizers. We care more about how to keep our own interpretation of the world happy rather than how we can find the truth.

This is why companies operate on untested assumptions. This is why tribal knowledge exists. This is why knowledge gets siloed, it's efficient in the short term, even if it's brittle in the long term.

But agents can't operate that way. They need truth to work effectively. And building for agents forces us to build more truthful organizations.

## What Needs to Change

We need tools that:
- Give agents direct access to ground truth (production systems, raw data, actual workflows)
- Provide automated feedback loops (tests, metrics, validation)
- Minimize the need for interpretation and analogy
- Make it easy to give agents safe access to real systems

We're trying to adapt agents to human assumptions when we should be getting closer to ground truth. Not just because it helps agents work better—but because it makes our organizations more truthful in general.

The current ecosystem is built for humans who reason by analogy. The next ecosystem needs to be built for agents who reason from truth.

That's a hard transition, but I think it's a necessary one. Companies that can't provide ground truth for their work processes won't be able to leverage agents at scale. And those that can will have a massive advantage.
