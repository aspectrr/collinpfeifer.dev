---
title: "On Data Stubs for Agents"
pubDate: 2026-05-15
draft: true
---

## On Data Stubs

So my point that I will be arguing today is that Stubs of existing data sources and outgoing data stores are necessary to complete the feedback loop for LLM data engineering.

So this comes from letting agents be able to create sandboxes containing the parser it needs and then being able to pull the logstash config from a logstash node it needed or use Ansible playbooks, except pulling data or adding small agent is kinda a non-starter. We can make the assumption that IaC is the same as prod, not always true but mostly true (not exaclty this tools fault either, I think that is bad practice, but also very common). Anyway we give an environment for the agent to run ansible playbooks on the sandbox, playbooks get run and files get acquired (could just be easier to have the agent on the VMs??? idk cause at least in our case, many different scripts will run in different places, things will be out of sync). 


Either way when the files get on the sandbox and the thing starts there are some options, lets say for example that we have a field that is not being parsed correctly from a log source. We want the agent to make the change and open a PR. It gets the correct config on the sandbox (somehow), and then it needs to use some sort of data to test the changes it made, maybe big/small change, who cares. Either way it needs the data.

There are a couple ways to do this which is:
a. don't do data stubs, tell it to make guesses based on reads, not sure it is ideal but could work well enough if the logstash starts, no feedback loop does make it hard.

b. allow for stubs for data sources (somehow derived from the environment), that are connected to allow agents to send data in. Like if we give it some example issue data or data that is not parsed correctly then it can do that? No, often times the data we don't have a perfect example of it, we have to look at elasticsearch first to understand the issue, look through DLQ, then pull feed into dev, then test changes, then get reviews and update the GitHub.

c. Pass through data through whatever host to the sandbox at a port for testing, yippee! Except connecting to the data sources will be a pain and be an issue probably. installing stuff on data source nodes is a non starter, making a new group to read from or the keys or whatever to read from kafka, postgres, s3 is a non-starter. So then the different ideas becomes passing through the network config needed. Like the sandbox can only open the ports needed by data sources and just use those directly. But (for example), must not pull production data. Every team does this differently.


Testing:

a. stub the data store, aka stub the data lake, elasticsearch, opensearch etc. testing for things along the way.

b. allow the the sandbox to point to a dev cluster that the agent can query freely. makes the most sense for simplicity, just open the firewall on the cluster and let the agent query.


Full feedback loop tho is being able to query the data source at the end, check for the correct formatting and that the data is coming back correctly. 

for elasticsearch:

a. api key is no good
b. browser to click around kibana is no good.




i think the best idea i had was to do a CA make anything you want the agents to log into trust it (VMs, pods, whatever) and the managed agents api can create ephemeral certificates per agent or whatever.


## Can this just be a feature of something like sandbox0 vs a whole product?

So theoretically just have a way to check what parsers, data source, and data store is beign used.

The biggest thing is could this be a feature rather than rebuilding a whole product? Could the "data engineering" bit be just a kafka and ES node that spin up next to the sandbox?

The read-only part can be a tool install for the agents to use, most places have a CA that they use to access these servers but if not workarounds for other people that aren't too invasive.

the networking bits figuring out where to allow connections from this is partially already in sandboxing solutions

## Okay so what is the real problem then?

My probelm is that there are my team is small, we have a massive backlog. The things I do can theoretically be done partially by agents. 

I'm trying to solve that problem for my team.

Lets take an example ticket: There is a bad field parsing happening on some of the data, specifically on windows hosts.

Best case we need something that can be installed on a free host that can pull data from the logstashes (via agent or just from GitHub IaC), connect to github, connect to slack, connect to clickup, and we can ask it, hey can you try and figure out what is going on here? 



It would need to be a forward deployed role, deploying into customers envrionments and adapting for what they need which is what I want to do.

I think headless makes sense, we don't need another linear alternative. just hook into what we have and make it something that can be setup incredibly quickly. 

I'm just trying to think what wuld make the most sense for my company and we could quickyl get this setup without too much hassle and what jeffrey would say is not taking too much time to get a good result.

Doesnt want additional delays because of something of new. Needs to show value the very first time it runs.

Honestly if we do the read-only thing and the small agent that pulls data from a directory. that would make sense for this setup, the agent can get the stuff it needs and then reach out to one of us for data to use from elasticsearch/kafka or something and we can give it to them.

I don't think setting it up to use various agent types matter, just a simple harness works that we query, personally i don't think people care. Harnesses do matter but maybe not as much, the tools, just as long as its something where the agents searches fro tools rather than getting demolished by the tool defs. Just managing the sessions and stuff is hard. it would probably need to be some sort fo embedding setup for memory and the skill creation is a good idea too.


What's the simplest thing i can test for this? Docker style setup, config file that sets up a full pipeline for testing with the agent, connector to click up, small daemon to pull files off the various hosts needed. Read only commands for the agents to use on these hosts. Sandbox to run commands, test things in the docker setup, and write files.

Okay now naming I feel like vine for the name of the sandbox manager and then leaf for the
