# Vibe Code Rules — Python

Persistent rules for Python development. AI-first: optimized for AI code generation, not human convenience patterns.

## System
- macOS with Homebrew. If a brew install is needed, state the command and wait for approval.
- Python 3.11+. Use `python3` and `pip3` explicitly.

## Architecture
Functional core, imperative shell. Pure logic in `pure_*` modules, side effects isolated in `effect_*` modules, data shapes in `schema_*` dataclasses. Classes are fine for Web Components and dataclasses — just not for organizing business logic.

## Stack
- Vanilla Python. Standard library first, always.
- FastAPI for HTTP APIs. Uvicorn as server.
- Virtual environment per project (`venv/`). No global installs.
- Minimal dependencies. Every pip package is context the AI must read.

## Banned
- Class inheritance chains (max 1 level deep — base → child, never deeper)
- Metaclasses
- Monkey patching
- Dynamic attribute access (`__getattr__`, `setattr`, `getattr` as logic)
- `**kwargs` as a primary interface (acceptable only for forwarding to external libraries)
- `*args` without type hints
- Mutable default arguments
- Global mutable state outside of designated state modules
- `utils.py` or `helpers.py`
- Commented-out code
- Bare `except:` or `except Exception:`
- Hardcoded secrets in any file

## Security
- All secrets in `.env`. If a hardcoded secret is detected, remove it, move to `.env`, warn user.
- `.env` in `.gitignore`.
- Redact sensitive data from error log output.
- Never log full request bodies in production — they may contain credentials.

## Git
- Local only. Commit prefixes: `FEAT:`, `FIX:`, `REVERT:`, `CHORE:`, `DOCS:`.
- Commit after every working feature.
- Check for new directories needing `.gitignore` before committing.

## AI Behavior
- Implement incrementally. Never multiple risky phases at once.
- Test before reporting complete.
- Git commit frequently for rollback.
- No documentation unless asked.
- Present options, wait for user choice before coding.

---

## Type Hints (NON-NEGOTIABLE)

Every function, every method, every variable where the type isn't obvious from assignment. No exceptions.

- All function parameters: typed.
- All return values: typed. Use `-> None` explicitly.
- Use `list[str]`, `dict[str, int]`, `tuple[str, ...]` — not `List`, `Dict`, `Tuple` from `typing` (3.11+ syntax).
- Complex types: define with `TypeAlias` or `TypedDict`.
- Optional values: `str | None`, not `Optional[str]`.
- Callables: `Callable[[int, str], bool]`.

```python
def process_users(raw: list[dict[str, str]], limit: int = 100) -> list[User]:
```

Type hints are how the AI reads your code without reading your code. They are the contract.

---

## Data Structures

- **Dataclasses** for all structured data. Not dicts. Not tuples. Not plain classes.
- **Frozen dataclasses** (`frozen=True`) by default. Mutable only when explicitly needed.
- **NamedTuple** for lightweight immutable records.
- **TypedDict** for typed dictionary interfaces (e.g., JSON payloads from external APIs).
- **Enums** for fixed sets of values. Never magic strings.

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class User:
    id: str
    name: str
    email: str
    active: bool = True
```

Raw dicts are allowed only at boundaries — parsing JSON from an API, reading config. Convert to a dataclass immediately.

---

## Functional Programming

Functional core, imperative shell. Pure logic in `pure_*`, side effects isolated in `effect_*`, data shapes in `schema_*` dataclasses. Classes are fine for dataclasses — not for organizing business logic.

- Pure functions preferred. Input in, output out. No side effects.
- No shared mutable state. No in-place mutation of arguments.
- Use `tuple` over `list` when the collection won't change.
- Use `frozenset` over `set` when the collection won't change.
- List comprehensions and generator expressions over `map`/`filter` with lambdas.
- No multi-line lambdas. If it needs multiple lines, it's a named function.

---

## Module Organization

### Flat Directory with Prefixes
Same pattern as JS. Every Python file is one of:

- `effect_*.py` — side effects (HTTP, filesystem, database, external APIs)
- `pure_*.py` — deterministic (no side effects, no I/O)
- `schema_*.py` — dataclasses, TypedDicts, Enums (data shape definitions)
- `config.py` — constants, env vars, feature flags
- `main.py` — entry point

### Naming
- Files: snake_case with underscore prefixes (`effect_api.py`, `pure_validate.py`, `schema_user.py`).
- Code: snake_case for variables and functions. PascalCase for classes (dataclasses, Enums) only.
- Constants: UPPER_SNAKE_CASE.

---

## Error Handling

- All errors through a centralized `effect_error.py`. No scattered try/except. No raw `print()` or `logging.error()`.
- Structured error dicts with: timestamp, severity, module, function, error message, input context, stack trace.
- Severity levels: `FATAL`, `ERROR`, `WARN`, `INFO`.
- Required on: all effect modules, all API endpoints, all async operations.
- Not needed on: pure modules, schema definitions, config.
- Boundary rule: error handling where code meets outside world. Pure trusts input. Effect trusts nothing.
- Use specific exceptions: `ValueError`, `KeyError`, `ConnectionError` — never bare `except:`.

---

## Config

- Single `config.py`. Frozen dataclass for config values.
- Environment values from `os.environ` or `python-dotenv`.
- No magic numbers or strings elsewhere.

```python
from dataclasses import dataclass
import os

@dataclass(frozen=True)
class Config:
    APP_NAME: str = "Project Name"
    API_BASE: str = os.environ.get("API_BASE", "")
    PORT: int = int(os.environ.get("PORT", "8000"))
    DEV_MODE: bool = os.environ.get("DEV_MODE", "false").lower() == "true"

CONFIG = Config()
```

---

## Dependencies

- Standard library first. Always. Check if stdlib can do it before reaching for pip.
- `requirements.txt` with pinned versions. No unpinned dependencies.
- Separate `requirements-dev.txt` for dev-only tools (pytest, ruff, etc.).
- `venv/` in `.gitignore`.

---

## Testing

- pytest. No unittest classes — use plain functions.
- Test files mirror source files: `pure_validate.py` → `test_pure_validate.py`.
- Pure modules get unit tests. Effect modules get integration tests.
- No mocking pure functions. If you need to mock it, it's an effect, not pure.

---

## Commenting

- Every file has a module docstring header: module name, type, purpose, depends on, used by, side effects.
- Function docstrings only on non-obvious functions. Use Google-style format.
- Inline comments only for non-obvious decisions. Why, not what.
- Never comment what code mechanically does, commented-out code, or anything the name already says.

```python
"""
Module: pure_validate.py
Type: Pure module
Purpose: Input validation for user data

Depends on:
  - schema_user.py (User dataclass)

Used by:
  - effect_api.py (endpoint validation)

Side effects: None
"""
```

---

## Python ↔ JS Boundary Rules

Python serves data. JS renders it. The boundary is HTTP. They never share files, never import each other, never share state.

### Contract
- All communication over HTTP (REST). No shared filesystem, no shared memory, no shared imports.
- JSON is the wire format. Always.
- Shared data shapes defined in `schemas/*.schema.json` — one source of truth, both sides reference it.
- Python validates outgoing JSON against the schema. JS validates incoming JSON against the same schema.

### Error Format
One error shape across the wire. Both sides produce and consume this format:
```json
{
  "error": true,
  "code": "NOT_FOUND",
  "message": "User not found",
  "status": 404
}
```
- `code`: machine-readable UPPER_SNAKE_CASE string.
- `message`: human-readable description.
- `status`: HTTP status code.
- Python returns this from all error responses. JS expects this from all error responses.

### Responsibilities
- Python: data, logic, persistence, external API calls, AI agent execution.
- JS: presentation, DOM, user interaction, client-side state, routing.
- Python never serves HTML. No Jinja, no server-side templates, no SSR.
- JS never calls databases directly. No ORM in the browser. No direct file system access.

### Endpoints
- RESTful. Resource-based URLs. Standard HTTP methods.
- Versioned: `/api/v1/resource`.
- Python documents every endpoint with request/response types using FastAPI's built-in OpenAPI.
- CORS configured in Python for the JS dev server origin.
