# AI·NT — Canonical Bootstrap Prompt

The intended bootstrap prompt is deliberately small because the repository must carry its own context.

Use:

> Read the repository root `README.md`, then read `bootstrap/README.md` and execute `bootstrap/BOOTSTRAP.md`. Treat the bootstrap directory as the canonical zero-context seed for AINT. Collaborate with me at explicit bootstrap authority checkpoints or when a material ambiguity cannot be resolved safely from the repository or current official documentation. Continue until the V0 exit conditions in `bootstrap/BOOTSTRAP.md` are satisfied.

The human may shorten this further to:

> Read `bootstrap/README.md` and execute `bootstrap/BOOTSTRAP.md`.

## Authenticity caveat

A future version should provide a stronger way to establish that bootstrap documents are authentic—for example a pinned revision, signed release, provenance record, or trusted manifest. Publicly readable Git content is observable, not intrinsically authoritative merely because it appears at a familiar URL.
