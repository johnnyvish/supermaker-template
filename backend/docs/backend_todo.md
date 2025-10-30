# Backend Checklist Runbook (LLM INTERNAL — NOT A PRODUCT FEATURE)

This file defines **how** you (the LLM) create and **execute** the per-feature checklist.  
Do **not** build a to-do/task product; this is an **internal runbook**.

## Where to write the plan

-   Create `backend/app/docs/backend_todos_<feature_name>.md` right before implementation.

## Required format (use verbatim)

Wrap with sentinel markers and use this YAML schema:

````markdown
<!-- BEGIN_PLAN -->

```yaml
plan:
  feature: "<feature_name>"
  version: 1
  tasks:
    - id: T1
      desc: "Create/configure Supabase per backend/app/docs/supabase_setup.md"
      verify: "env has SUPABASE_*; SUPABASE_URL reachable"
    - id: T2
      desc: "Generate & apply schema per backend/app/docs/schema_builder.md"
      verify: "tables exist"
    - id: T3
      desc: "Implement CRUD in backend/app/crud/ and register in backend/app/main.py"
      verify: "`/openapi.json` shows endpoints; 200/201 responses"
execution:
  policy:
    continue_after_plan: true
    update_checklist_on_each_task: true
    on_block: "record missing env/inputs under blocked_on; continue others"
status:
  overall: "in_progress"   # in_progress | done | blocked
  updated_at: "<ISO8601>"
<!-- END_PLAN -->

## Execution rules
1. **Immediately** start executing T1…TN after writing the plan.
2. Update each task with `status: done|blocked` and `notes:`.
3. If blocked, write `blocked_on:` (e.g., “need SUPABASE_SERVICE_ROLE_KEY”) and proceed to other tasks.
4. After each task, **verify** artifacts and write/update docs in `backend/app/docs/`.
5. Never hard-code secrets; use env vars.

## CRUD requirements (summary)
- **Supabase**: `backend/app/docs/supabase_setup.md`
- **Schema**: `backend/app/docs/schema_builder.md`
- **CRUD**: implement under `backend/app/crud/`, expose via FastAPI, register in `backend/app/main.py`.

## Integrations (if needed)
- Path: `backend/app/integrations/<integration>/<integration>.py`
- Use env vars for credentials; expose safe endpoints or helpers.
```
````
