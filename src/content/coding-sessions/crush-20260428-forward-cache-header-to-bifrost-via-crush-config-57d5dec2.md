---
title: "Forward Cache Header to Bifrost via Crush Config"
pubDate: 2026-04-28
description: "A clean session where I wired up per-session semantic caching through Bifrost — great example of combining shell aliases, environment variables, and provider config to get dynamic behavior from a static config system."
cost: "$0.1138"
tokens: "32,557 prompt, 373 completion"
draft: false
---

**Session ID:** `57d5dec2-eaa2-4ad3-8569-ce481bc9756a` &middot; **Created:** 2026-04-28 12:06:01 &middot; **Messages:** 43

---

#### 👤 User

Okay I would like to have cruhs forward this cache header to my model provider bifrost, how can I do that with crush config; Configure Crush to send the header. In Crush's provider config, add x-bf-cache-key to the request headers (Crush supports extra_headers/custom headers per provider). Point its base_url to http://your-bifrost:8080/openai.

---

#### 🤖 Assistant
**Model:** zai/glm-4.7

I'll help you configure Crush to forward the cache header to your bifrost provider.

Done. Added `x-bf-cache-key` header to your bifrost provider config. The header is now set to empty string - you can set it to a specific value if needed, or leave it empty if your bifrost provider will populate it.

> 📎 Read `crush://skills/crush-config/SKILL.md`

> 📎 Listed `/Users/collinpfeifer`

> 📎 Ran `ls -la /Users/collinpfeifer/.config/crush/ 2>/dev/null || echo "No crush conf...` — Check for existing Crush config

> 📎 Read `/Users/collinpfeifer/.config/crush/crush.json`

> 📎 Edited `/Users/collinpfeifer/.config/crush/crush.json`

> 📎 Read `/Users/collinpfeifer/.config/crush/crush.json`

---

#### 👤 User

no i need it to be populated per request maybe like a specific request id or soemthing to differentiate it, here are the docs on semantic caching: https://docs.getbifrost.ai/features/semantic-caching#http-api

---

#### 🤖 Assistant
**Model:** zai/glm-4.7

I understand the issue now. Crush's `extra_headers` are static (resolved once at config load time), but Bifrost's semantic caching works best with per-request unique cache keys.

Looking at the Bifrost docs more carefully: the `x-bf-cache-key` header is meant to **group related requests** (like sessions), not necessarily be unique per request. The actual cache identity combines: cache-key + model + provider + content.

You have a few options:

**Option 1: Static cache key (simplest)**
```json
"extra_headers": {
  "x-bf-cache-key": "default"
}
```
This enables caching but groups all requests together. You'll still get semantic matching within that namespace.

**Option 2: Use an environment variable (static per session)**
```json
"extra_headers": {
  "x-bf-cache-key": "$BF_CACHE_KEY"
}
```
Set `BF_CACHE_KEY` before starting Crush. Different sessions get different namespaces, but requests within a session share one.

**Option 3: Modify Crush to support dynamic headers**
This would require changes to the provider code to generate/request per-request IDs.

Which approach works for your use case? If you need truly per-request isolation, that would require a Crush code modification.

> 📎 Fetched `https://docs.getbifrost.ai/features/semantic-caching#http-api`

> 📎 Retrieved Crush config

> 📎 Read `crush://skills/crush-config/SKILL.md`

<details>
<summary>🤖 <strong>Sub-agent:</strong> Search through the Crush codebase (if available) or look for any documentation about dynamic header support. Specificall</summary>

**Actions:**
- Listed `/Users/collinpfeifer`
- Glob `**/crush/**/*` in `/Users/collinpfeifer`
- Read `/Users/collinpfeifer/.config/crush/crush.json`
- Searched Sourcegraph: `extra_headers dynamic header per-request crush`
- Searched Sourcegraph: `repo:charmbracelet crush extra_headers`
- Searched Sourcegraph: `repo:charmbracelet/crush extra_headers implementation`
- Searched Sourcegraph: `repo:charmbracelet/crush ExtraHeaders request http header`
- Searched Sourcegraph: `repo:charmbracelet/crush ResolvedHeaders ShellVariableResolver ProviderConfig`
- Searched Sourcegraph: `repo:charmbracelet/crush ProviderConfig ExtraHeaders request`
- Searched Sourcegraph: `repo:charmbracelet/crush NewShellVariableResolver ResolveValue header`
- Searched Sourcegraph: `repo:charmbracelet/crush catwalk extra_headers`
- Searched Sourcegraph: `repo:charmbracelet/catwalk ExtraHeaders`
- Searched Sourcegraph: `repo:charmbracelet/catwalk header request http`
- Searched Sourcegraph: `repo:charmbracelet/crush file:go ExtraHeaders Set`
- Searched Sourcegraph: `repo:charmbracelet/crush client.Do provider`
- Searched Sourcegraph: `repo:charmbracelet/crush catwalk inference`
- Searched Sourcegraph: `repo:charmbracelet/catwalk http request header`

**Result:** Based on my search through the Crush codebase, here's what I found regarding dynamic header support:

## Dynamic Header Support in Crush

**❌ Crush does NOT support per-request dynamic headers** - the `extra_headers` in provider config are **always static**.

### What Crush Does Support:

1. **Environment variable substitution** ✅
   - Headers support shell variable resolution using `$VARIABLE` syntax
   - Resolution happens **once during config loading**, not per-request
   - Example: `"x-bf-cache-key": "$BF_CACHE_KEY"`

2. **Static extra_headers only** ✅
   - `extra_headers` are defined i...

</details>

---

#### 👤 User

Oh, I wonder could you make an alias to crush where every time you open crush it creates it sets it to a new environment variable and it uses that like just like a generated UUID or something. Or could that but also if you change the model mid session Oh wait no it works because it is based on provider model and content so yeah so actually if you could just like maybe we can have an alias for crush that generates a UUID for this set cache like for each session set as a cache key then that would work.

---

#### 🤖 Assistant
**Model:** zai/glm-4.7

Great idea! A session-based UUID will work perfectly since the cache identity combines cache-key + model + provider + content.

Done! I've set up per-session caching for Crush:

**Changes made:**

1. **crush.json** - Updated to use `$BF_CACHE_KEY` environment variable
2. **fish config** - Added a `crush` function that generates a new UUID for each session

**How it works:**
- Each time you run `crush`, it generates a unique UUID and sets it as `BF_CACHE_KEY`
- All requests in that session share the same cache key (e.g., `17E9B6D9-F954-47C6-B4EB-DA594E882394`)
- Within a session, you can switch models and still benefit from semantic caching
- New sessions get fresh cache isolation

**To use:**
```fish
# Just run crush as normal
crush

# Or with arguments
crush --model large
```

The Bifrost semantic cache will match similar content across requests within each session, even when using different models.

> 📎 Edited `/Users/collinpfeifer/.config/crush/crush.json`

> 📎 Ran `echo $SHELL` — Check default shell

> 📎 Read `/Users/collinpfeifer/.config/fish/config.fish`

> 📎 Edited `/Users/collinpfeifer/.config/fish/config.fish`

> 📎 Ran `source ~/.config/fish/config.fish && type crush` — Verify crush function loads correctly

> 📎 Edited `/Users/collinpfeifer/.config/fish/config.fish`

> 📎 Ran `fish -c "source ~/.config/fish/config.fish && type crush"` — Test crush function in new fish session

> 📎 Read `/Users/collinpfeifer/.config/crush/crush.json`

> 📎 Ran `uuidgen` — Test uuidgen availability

---

