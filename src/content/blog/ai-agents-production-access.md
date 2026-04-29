---
title: "Why AI Agents Need Access to Production Environments"
pubDate: 2026-04-29
draft: true
---

OK, let's talk about the argument against giving AI agents access to production environments.

## The "Good Enough" Fallacy

I've heard people say that just telling an agent "you're in production" is a good enough fix. That somehow, if you're scaling to ten or a hundred agents at a time, just telling them all that they're in production will work.

That's just not true.

## The "Not That Much Access" Fallacy

Second, I hear people say that agents don't really need that much access to existing infrastructure, don't need that much access to test code. It's like... what's the worst that can happen?

In reality, I could see even just having something as simple as Git or curl access. Having just curl access could make it so the agent can spin up a very simple node server quickly. It can have endpoints and make POST requests or GET requests or whatever. And then the agent can be like, "Hey, I'm running a local server to test"—and then it just does it. Then it sends the script to the server.

You're going to get what you're going to get with something like that.

## Security

Now, look, there will be fixes against this in some form of prompt management or prompt chaining or something. Yeah, absolutely there will.

But I just think the idea that you don't need this sort of protection, that our agents don't need clones of production to work safely from agents, is just... I don't like it at all.

## The Staging Environment Problem

I was talking to someone in the game, in the AI game, and they said, "What if the agent is just working in the cloud? I have a staging environment. I have a dev environment. I have my production environment. What do I need to spin up? What do I need to allow the agent to spin a sandbox up, you know, a clone of a production VM? If I just have a dev and a staging, the really basic things, you know..."

Here's the problem: dev and staging are fine in theory, they're supposed to be the same, but in reality, production is the one that's really being hammered. Production is the one that's really being used.

## Why Dev and Staging Aren't Enough

If you have dev, staging, and production, the issues you're going to see in production are just data issues, logging issues, network issues—issues that are not going to be well-tested in dev or staging.

It's like, okay, so you're not seeing the same shape. If you saw the same shape in dev, wouldn't you have fixed it there? Yeah, okay, so then it's like... what about now you're seeing an issue in production, how do you fix it?

In dev, it's like, "Oh yeah, I have to go find the logs, I have to see like network requests, etc." Maybe you tried to recreate it—failed.

Like, this is literally just a matter of recreation. It's just making a clone of production and giving an agent to use. That's really the gist.

## The Production Runtime Is Unique

I get what you're saying with staging—like, staging exists. Yes, there in theory, there are the same. But in reality, your production runtime is the one that's really being hammered. Production is the one that's really being used.

I just don't see that there's a world where something like this doesn't exist, you know.

Even read-only stuff, I mean, maybe it doesn't need to be as strict because it's not a strict sandbox—we can go read things that are not... sure. Having some sort of read-only access, like with a read-only shell, that's a fine idea. That actually makes the most sense.

## The Scale Problem

I just don't think the idea in your head where it's like, "OK, think about like the issues that you're seeing now that you're fixing by just prompting or just by using some small language model"—these issues are going to become unbelievably complex, and you just can't expect every single engineer to understand what all these agents are doing.

Because look, when you're running 10 agents, maybe eventually you'll be running 50 agents, maybe eventually 100 agents—how can you expect to be the singular person to be able to see everything these agents are doing? It's just impossible.

And then you think that some sort of prompt or some sort of staging environment... no.

## Agents Are Like Humans

It's like, why do humans do these things already? We as humans do these things already. LLMs are in a sense like fake humans, they need their own environment to do these types of things.

That's really what this is trying to do. We use LLMs to debug things and just spectate. Sure, you know? We can do something like that. But when you scale up beyond one agent—when you scale up to 10 agents, 100 agents—you can't rely on being able to see everything.

You need some sort of sandbox to push what you want under the agents.

## Conclusion

The reality is that as we scale AI agent operations, we can't rely on:
- Just telling agents "you're in production"
- Dev/staging environments that don't match production reality
- Manual supervision of every agent's actions

We need actual production-like sandbox environments where agents can safely operate, debug, and learn. It's not a nice-to-have—it's going to be essential.
