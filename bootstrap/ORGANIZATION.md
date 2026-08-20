# AI·NT — Organization Model

## The system is an organization, not merely a chatbot

The primary organizational flow is:

```text
DISCUSSION
    │
    ├── observation
    ├── question
    ├── idea
    ├── risk
    └── proposal
             │
             ▼
          OBJECTIVE
             │
             ▼
       PROJECT / EXPERIMENT
             │
             ▼
          EVIDENCE
             │
             ▼
          DECISION
             │
             ▼
     ARTIFACT / SERVICE / POLICY
```

Not every discussion should become an objective. The organization should retain enough history to discover ideas that slipped through the cracks.

Conversation is durable memory. It is **not operational authority**.

## Discussion should happen inside the organization

The long-term human experience should not require opening an external TUI coding session for strategic discussion.

A user should be able to enter the Console and say something imperfect such as:

> "I've been thinking about a disaster-recovery app. Maybe give it $20/month on Cloudflare. Help me explore whether that makes sense."

The organization may involve perspectives such as:

- product,
- architecture,
- economics,
- security,
- research,
- operational reliability.

Those contributions should enrich the same organizational thread. The conversation may later be distilled into formal objectives, decisions, or policy.

## Asynchronous participation

Organization members may add useful insight after the originating human leaves.

A healthy thread may continue while a user sleeps if new evidence or role-relevant insight appears.

However, the organization must avoid recreating a corporate meeting in token form. Agents should contribute only when expected information value justifies inference and attention cost.

A future participation policy may ask:

> Does this role have materially new information or a useful independent evaluation?

If not, remain silent.

## External purpose

Humans are not the only source of ideas. Agents should surface opportunities, risks, missing roadmap items, and new technologies.

However, the system should preserve explicit concepts of:

- objective,
- stakeholder,
- constraint,
- authority,
- success criteria.

An objective should survive longer than the chat message that created it.

Example conceptual record:

```text
Objective: Improve long-term memory
Intent: Retain useful organizational history cheaply
Constraints: remain on current cost tier; preserve security
Success: measurable benchmark improvement
Priority: high
Status: active
```

## Work hierarchy

A seed hierarchy:

```text
Discussion / Inbox
    ↓
Objective
    ↓
Project
    ↓
Experiment / Task / Issue
    ↓
Evidence
    ↓
Decision
    ↓
Change
```

Do not over-formalize this before use. The organization should refine the schema as actual workflows emerge.

## Agent roles

Agents are principals or workers with roles, not human-like employees merely for aesthetic reasons.

Authority belongs to **roles/trust domains**, not to the count of instantiated agents.

Creating another advisory agent should be inexpensive and easy.

Creating a new authority-bearing governance role should itself be a governed change.

Seed evaluation roles may include:

1. Implementer
2. Functional Verifier
3. Security Adversary
4. Cost/Performance Evaluator
5. Architecture Evaluator
6. Charter/Policy Evaluator
7. Independent Critic

The system may recursively identify missing roles, but adding authority requires the active policy process.

## Human contributors

Humans remain first-class contributors.

A user may:

- discuss goals in the Console,
- file or refine an issue,
- pick up a task locally,
- use Codex, Claude Code, Gemini, an IDE, or manual coding,
- submit a pull request.

Human PRs should be evaluated substantially like agent PRs. A local laptop never needs to vanish; it simply becomes one optional contributor among many.

## Attention as a scarce resource

The Console should distinguish:

- work proceeding autonomously,
- interesting developments,
- unresolved disagreements,
- items genuinely requiring user attention.

"Needs your attention" should be rare.

The organization should optimize the **value of human attention consumed** rather than using the human as a default queue consumer.
