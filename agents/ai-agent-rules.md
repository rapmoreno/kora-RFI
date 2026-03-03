# AI Agent Rules

Use these rules when a project includes AI agents. Add agent directories to the base project structure only when needed.

## Non-Negotiable
- Every agent must be registered in `agents/registry.yaml`. No unregistered agents.
- Every agent prompt must be in a `.md` file inside `prompts/`. Never in JS. Never in JSON.
- Every AI call in code must include a comment noting: agent used, model used, where called from.

## Directory Structure
Add these to the base project when agents are needed:
```
agents/
  registry.yaml

schemas/
  *.schema.json

prompts/
  *.md

orchestrator/
  pipeline.*        — pipeline coordination
  agent_executor.*   — generic agent caller, handles provider translation
  registry_loader.*  — load and validate registry
```
Orchestrator language is a project decision. Python is typical (stronger AI/ML ecosystem). JS is valid for lightweight use cases. Pick one per project.

## Agent Registry
- `agents/registry.yaml` is source of truth.
- Optional: generate `agents/registry.json` at runtime.
- Every agent registered before use in code.
- Functions reference agents by `agent_id` from registry.

### Required fields per agent:
- `id` (snake_case)
- `name`
- `version`
- `enabled`
- `provider`
- `model`
- `description`
- `tags`
- `prompt_file`
- `output_schema`
- `params` (temperature, max_tokens)
- `guardrails`

### Registry Template
See `agents/agents-registry.yaml` for the boilerplate. Copy an entry and modify for each new agent.

## Orchestrator
- `pipeline` — pipeline coordination
- `agent_executor` — generic agent caller, handles provider translation
- `registry_loader` — load and validate registry

## Schemas
- `schemas/*.schema.json` — output schemas for agents
- `schemas/database.sql` — database schema if needed

## Error Handling
Agent API calls go through `effect.error.js` from the base project rules. Agent calls are another effect module boundary. Retry logic or fallback models are project-specific.

## Provider
- Provider choice decided per project, per use case.
- All prompts use the same format regardless of provider. `agent_executor` translates at runtime.

---

## Prompts

All prompts in `prompts/`. Snake_case file names matching function names. Example: `transcribeSlide()` maps to `prompts/transcribe_slide.md`.

### Prompt File Header (REQUIRED)
Every prompt starts with metadata:
```markdown
# Prompt: [Name]

| Field       | Value                      |
|-------------|----------------------------|
| agent_id    | [from registry]            |
| version     | [matches registry]         |
| model       | [model name]               |
| provider    | [openrouter or openai]     |
| purpose     | [one-line description]     |

---
```

### Default Format
Most agent prompts are linear: system instructions + task + constraints + output format. Use plain markdown with XML sections. No pseudo-lang needed.

### Chatbot / Avatar Prompts Only: Two Layers
For chatbot or avatar agents that require conversational branching, use the two-layer format:
- XML tags hold content (what to say/do).
- Pseudo-lang controls flow (when/how).
- `activate <tag_name>` bridges pseudo-lang to XML blocks.

### When to Use Pseudo-Lang
- Only for chatbot/avatar agents with conversational branching.
- Never for extraction, processing, analysis, or other linear agents.
- No branching needed: XML tags only.
- Branching, loops, reusable logic: add pseudo-lang.

### XML Tags
```
<tag_name>
- Instructions here
</tag_name>
```

### Pseudo-Lang Syntax
- `func name { }` — reusable block
- `if / else if / else` — branching
- `say "text"` — static response
- `activate <tag_name>` — hand off to XML block
- Custom helpers allowed: name descriptively

### Pseudo-Lang Structure
```
func function_name {
  if condition {
    action
  }
  else if condition {
    action
  }
  else {
    default action
  }
}
```

### Relationship
- XML = content. Pseudo-lang = flow.
- Pseudo-lang calls XML via `activate`. Never reverse.

### Full Example
```markdown
# Prompt: Greeting Handler

| Field       | Value                      |
|-------------|----------------------------|
| agent_id    | greeting_handler           |
| version     | 0.1.0                      |
| model       | anthropic/claude-3.5-sonnet|
| provider    | openrouter                 |
| purpose     | Handle initial greetings   |

---

<system>
- You are a friendly assistant.
- Always respond warmly on first interaction.
</system>

<greetings>
- Activate greetings() on first interaction.
</greetings>

<fallback_prompt>
- Ask the user: "What do you need?"
</fallback_prompt>

func greetings {
  if user == "hi" {
    say "Hi there friend"
  }
  else if user == "hello" {
    say "Oh hello there"
  }
  else if is_question(user) {
    activate <fallback_prompt>
  }
  else {
    say "Good day"
  }
}
```

### Provider Standardization
One format for all providers. `agent_executor` translates to provider-specific format at runtime. Prompt authors never think about provider differences.
