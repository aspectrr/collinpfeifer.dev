---
title: "CAF (Cost-to-Acquire-Friends)"
pubDate: 2026-04-12
author: "Collin Pfeifer"
draft: true
---

## Introduction

Before we prove anything about friendship, we need to establish what money actually is.

<div class="proof">

**Assumption A.** *Money is a store of potential time.*

Every dollar represents time already spent — someone traded hours of their life to earn it. When you spend that dollar, you're converting stored time back into lived time: a meal you didn't have to cook, a ride you didn't have to walk, a tool you didn't have to build. The exchange rate between money and time is subjective, but the relationship holds:

$$M = \sum_{i} t_i \cdot v_i$$

where $t_i$ is the time traded and $v_i$ is the value assigned to that time by the person trading it. This can vary depending on the exchange but the idea is the same.

**Assumption B.** *Money compresses time to outcome.*

Offer someone double or triple the price and the outcome arrives in half the time. This is not a trick — it's a direct consequence of Assumption A. If money is stored time, then spending more of it injects more time into the system from the other side. The seller reallocates *their* time toward your outcome because the exchange rate became favorable:

$$T_{outcome} \propto \frac{1}{M_{offered}}$$

**Assumption C.** *Social outcomes are outcomes.*

Friendship, trust, connection — these are outcomes like any other. They take time. And if money compresses time to outcome, then money can accelerate the conditions under which friendship forms.

</div>

**Proposition**: *It is a strictly dominant strategy to invest in friendship.*

<div class="proof">

By contradiction. 

**Definitions**

$$ i = interaction $$

$$ t_i = time_{interaction} $$

$$ q_i = quality_{interaction} $$ (Value is in the eye of the beholder, could be a measure of fun, measure of goal setting, measure of commradury, loyalty)

$$LTV_{friend} = \sum_{i} t_i * q_i $$

Suppose that using money to acquire a friendship is not worthwhile. Then:

$$CAF > LTV_{friend}$$

But $LTV_{friend}$ is only unbounded when quality interactions produce growth from both participants — conversations that are new, interesting, and demand something from each person. Without mutual growth, interactions decay:

$$\text{If } \frac{dq_i}{dt} \leq 0 \text{, then } LTV_{friend} \text{ is bounded.}$$

A bounded friend — one where conversations repeat, neither person grows, and interactions become routine — converges to a fixed value. These are not worth acquiring at any cost.

<div style="display:flex;gap:2rem;justify-content:center;margin:1.5rem 0;flex-wrap:wrap;">
  <div style="flex:1;min-width:220px;max-width:320px;">
    <img src="/graphs/bounded.svg" alt="Bounded friendship LTV graph" style="width:100%;" />
  </div>
  <div style="flex:1;min-width:220px;max-width:320px;">
    <img src="/graphs/unbounded.svg" alt="Unbounded friendship LTV graph" style="width:100%;" />
  </div>
</div>

But an unbounded friend — one where each interaction raises the quality ceiling through mutual growth — diverges:

$$\text{If } \frac{dq_i}{dt} > 0 \text{, then } LTV_{friend} \to \infty$$

And a super connector, by definition, is a friend whose value extends beyond themselves — they can be bounded or unbounded, but their LTV equals their own plus the sum of every friend they introduce you to:

$$LTV_{super\ connector} = LTV_{self} + \sum_{j=1}^{n} LTV_{friend_j}$$

Which also means the acquisition cost for those $n$ friends is amortized to near zero:

$$CAF_{super\ connector} \approx 0$$

<div style="display:flex;justify-content:center;margin:1.5rem 0;">
  <img src="/graphs/super-connector-ltv.svg" alt="Super connector LTV comparison graph" style="max-width:480px;width:100%;" />
</div>

For a bounded super connector, each introduced friend adds a discrete step. If each of $n$ friends has an average bounded value of $\overline{LTV}_b$:

$$LTV_{SC,\ bounded} = LTV_{self} + n \cdot \overline{LTV}_b$$

This grows linearly with network size — still finite per friend, but far exceeds a single bounded friend.

For an unbounded super connector, the friends they introduce are also more likely to be unbounded (growth-oriented people attract growth-oriented people). This creates a compounding effect:

$$LTV_{SC,\ unbounded} = LTV_{self} + \sum_{j=1}^{n} LTV_{friend_j} \quad \text{where } \frac{dq_j}{dt} > 0$$

The key insight: even a bounded super connector is worth acquiring because the *network multiplier* ($n$) can offset the boundedness of each individual friend. An unbounded super connector is the jackpot — every friend in their network is a divergent series.

But none of this means bounded friends are worthless. A bounded friend can hold an idea worth more than the entire LTV of an unbounded friend — a single insight that reshapes how you think. The question is whether you're equipped to extract it.

$$LTV_{extracted} = \min(LTV_{actual},\ E_{skill})$$

where $E_{skill}$ is your ability to extract knowledge from any interaction. If your extraction skill is low, even an unbounded friend's value goes unrealized. If it's high, you can pull the full LTV from a bounded friend fast — compressing the time to capture all their value without sacrificing anything:

$$T_{extracted} \propto \frac{1}{E_{skill}}$$

This convolutes the idea of friendship. Are we reducing people to idea dispensers? Not exactly. Unbounded friends give you ideas *and* growth — new tactics, new frameworks, things they pick up along their journey that compound over time. Bounded friends may give you a fixed set of ideas, but one of those ideas could be the most important one you ever hear. The question becomes: **what do you want out of friendship?**

$$LTV_{friend} = f(\text{growth, comfort, emotional connection, support, ideas, trust})$$

The weights you assign determine everything. A person who values comfort over growth will optimize for a different set of friends than someone who values growth. Neither is wrong — but the strategy changes entirely.

For myself, I weight growth highest. That means I optimize for unbounded friendships where each interaction raises the ceiling. But I also stay sharp at extracting maximum value from every bounded friend I meet — because the one idea they have that I don't could change everything.

Giving:

$$0 < \infty \implies CAF < LTV_{friend}$$

A contradiction. Therefore it is a strictly dominant strategy to invest in acquiring unbounded friendships. $\blacksquare$

</div>

## The Friendship Problem

In our day and age, people have become more and more lonely and are looking for more and more different ways to make friends. People have less friends per capita — nearly 30% of people have no close friends. If you realize this and you have some money, you can also see that there's a cost to acquire a friend.

## CAC & LTV in Business

If you look at business leads, there are two values that mean a lot: **CAC** (Cost to Acquire Customer) and **LTV** (Lifetime Value).

$$CAC = \frac{\text{Total Marketing Spend}}{\text{Number of New Customers}}$$

$$LTV = \text{ARPA} \times \text{Average Customer Lifespan}$$

Your cost to acquire a customer needs to be lower than the lifetime value:

$$CAC < LTV$$

Over time you're profitable by being able to make money from customers over an extended period of time. Starbucks's lifetime value is roughly $16,000. That means they can spend *over* $16,000 to try and acquire new customers. When they run a 50% deal or offer extra stars, they're getting nowhere close to the value you'll give them over your lifetime.

## The Value of Friendship

Now apply this to friends. What is the value of a friendship? How do people interact with you? What does having good friends actually *do* for you?

Being social is an important part of being human. Having friends gives you:

- People to bounce ideas off of
- People to hang out with
- People to collaborate with

That's really the selling point. Talking to people is good.

## CAF: Cost-to-Acquire-Friends

Now it comes down to: how do you *get* friends? The cost to acquire friends is really about:

1. How often do you find people?
2. How often do you find people that would qualify as a good friend?
3. What events can you meet them at where it costs money to get in?
4. How many people do you talk to at these events?

Based on all those percentages, you can figure out your cost to acquire a friend:

$$CAF = \frac{C_{event} + C_{travel} + C_{time}}{N_{attendees} \times R_{conversation} \times R_{compatibility} \times R_{followthrough}}$$

Where:

- $C_{event}$ = cost of attending the event
- $C_{travel}$ = travel costs
- $C_{time}$ = monetary value of your time
- $N_{attendees}$ = number of people at the event
- $R_{conversation}$ = rate of starting conversations
- $R_{compatibility}$ = rate of finding compatible people
- $R_{followthrough}$ = rate of converting to actual friendship

Once you figure out your cost to acquire a friend, you can start optimizing.

## Putting Numbers to It

Let's say you have a networking event that costs $15 for one night. You talk to 10 people and find one friend. That's a 10% conversion rate. Your cost per conversation is:

$$\frac{\$15}{10} = \$1.50 \text{ per conversation}$$

This gives you a great ratio to find how much it costs to acquire different types of friends. If one out of ten people you meet becomes a friend, look at something like sports volleyball. Maybe it costs $50 to sign up. You interact with the eight people on your team and a couple on the other team — realistically eight people every week. At a one-in-ten chance, it's not guaranteed, but it's high enough to make it worth it for $50.

## Super Connectors

The best way to make friends is through what people call **super connectors** — people that know a bunch of people. At this point it's kind of like word of mouth. You acquire one friend and they introduce you to all their friends, and all their friends' friends, and your cost to acquire a friend basically becomes nil.

$$CAF_{super\ connector} \approx 0$$

But these are the cream of the crop — the type of people that you *like* to interact with. So where do these people hang out? Do they like networking events? Coffee shops? Are they approachable? Are they not? This helps you find people who could possibly be super connectors and drive your cost to acquire friends down to zero.

Because at that point, these people will introduce you to other people, and those people will introduce you to other people, and everyone has a good time.

## Become the Super Connector

The better idea: *become* the super connector. Become the person that people want to hang out with, the type of person that people want to interact with and find. Then people come to you instead of the other way around. You get to introduce people to other people, and everyone gets to become friendly.
