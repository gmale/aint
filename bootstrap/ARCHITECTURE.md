# AI·NT — Architecture

## Principle

Begin with the smallest architecture that can bootstrap and measure itself. Add primitives only when evidence shows they earn their complexity.

The architecture is expected to evolve. Interfaces and evidence matter more than preserving specific vendors or patterns forever.

## Execution weights

The initial Cloudflare mental model contains three execution weights:

### 1. Worker

Lightweight event-driven code for:

- HTTP/API ingress,
- orchestration,
- deterministic policy checks,
- small transforms,
- model/tool routing,
- static application integration.

A Worker is not a Linux VM.

### 2. Durable Object / Agent

Persistent logical identity with colocated durable state for:

- agent identity,
- working memory,
- sessions,
- scheduling,
- state machines,
- coordination requiring a single logical owner.

Logical agents should be cheap while idle and wake on demand.

### 3. Isolated Linux execution

Later, when the paid capability tier is justified, use Cloudflare's isolated Linux/container/sandbox primitive for work that genuinely requires:

- shell commands,
- package managers,
- arbitrary Python/Node processes,
- compilation,
- generated-code execution,
- local project workspaces.

Do not give every agent a Linux environment merely because one is available.

## Bootstrap v0 architecture

V0 should be intentionally small:

```text
Public Git repository
       │
       ▼
Cloudflare Git/Build integration
       │
       ▼
Static UI + Worker API
       │
       ├── minimal health/telemetry
       ├── initial Workers AI call
       └── initial policy checks

Optional free primitives are added only as needed:
Durable Objects / D1 / R2 / Vectorize / Queues
```

A frontier coding agent on a local machine is permitted and expected during v0.

### Revised v0 exit condition

V0 does **not** require the human to stop using a laptop or external coding agent.

V0 exits when:

1. GitHub and Cloudflare are sufficiently connected that ordinary repository changes no longer require a local machine to hold unique production deployment credentials.
2. The canonical build/deploy path can execute without a persistent local runner.
3. The system has a cloud-hosted operational surface capable of reporting health and receiving enough organizational state to continue toward v1.
4. Human and agent contributors can submit changes through a common source/evidence path such as pull requests.
5. Remaining manual credentialed bootstrap actions are documented as explicit bootstrap debt.

After v0, a user may still use Codex/Claude Code/Gemini locally to contribute. That is not failure. The success trend is that the proportion of organization-driven work increases and the uniquely privileged role of the external session decreases.

## V1 target architecture

V1 should grow into:

```text
                         CONSOLE
          discussion / objectives / health / evidence
                             │
                             ▼
                        API Worker
                             │
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                 ▼
      Organization       Policy Kernel      Telemetry
      / Agent layer                         / Evidence
           │
        Durable Objects
           │
   ┌───────┼────────┐
   ▼       ▼        ▼
  D1    Vectorize   R2/Git
shared  semantic    docs/files
state   retrieval
           │
           ▼
       Workers AI
           │
           ▼
 model/provider abstraction
```

Source and history remain in Git. Runtime organizational discussion and state may live in purpose-built storage while being periodically distilled into durable documents/decisions.

## Environments / authority zones

Avoid overloading the word "sandbox." Use these conceptual zones:

### Autonomy Cell

Agents may act with broad freedom because the blast radius is mechanically tiny.

Properties:

- no production credentials,
- no production user data,
- no paid usage during Free phase,
- bounded network/tool access,
- disposable/recoverable resources,
- extensive autonomous merging/deployment allowed.

A malicious agent should be able to fully compromise the Cell and still cause little enduring harm.

### Staging

A larger but bounded domain with realistic integrations, synthetic or carefully controlled data, and stronger promotion requirements.

### Production

Minimal ambient authority. Individual actions receive narrowly scoped capabilities. Merge does not inherently equal production deploy.

## Source is not deployment authority

A compromised source repository must not eventually become equivalent to unrestricted production authority.

The mature path is:

```text
source change
    ↓
candidate artifact
    ↓
provenance + deterministic checks
    ↓
evidence quorum
    ↓
promotion policy
    ↓
staged rollout
    ↓
production
```

During v0, simpler Git-triggered deployment may be acceptable bootstrap debt if the blast radius is free-tier and non-sensitive. The debt must be documented.

## Long-term agent fabric

The mature architecture may contain hundreds of logical agents:

```text
Ingress / Console
      ↓
objectives / queues / workflows
      ↓
Durable agent identities × N
      ↓
controlled shared memory + tool broker
      ↓
model router / AI gateway
      ↓
open-weight and frontier inference

Linux execution is rented temporarily only when needed.
```

The number of logical agents should not directly map to the number of paid servers or SaaS seats.

## Failure-domain posture

For the initial experiment, Cloudflare concentration is intentional. The project is explicitly testing how far a Cloudflare-native substrate can go.

Long-term child systems may introduce independent backups or alternate providers according to their own reliability requirements. The root architecture should remain portable enough that Cloudflare is a utility-like execution provider rather than an irreplaceable conceptual dependency.
