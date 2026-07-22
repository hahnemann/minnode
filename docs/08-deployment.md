# 8. Deployment

Deployment is the release of the artifact into real-world use. `minnode` is a data-product branch artifact (per the framework's stage split, [Stage 6](./06-statistical-modeling.md) and Stage 7 are data-product-specific; this stage is shared), so the agent-specific decommissioning requirement below does not apply.

## Deployment Target

`minnode` builds to a standalone Node server via [`@sveltejs/adapter-node`](https://svelte.dev/docs/kit/adapter-node) (`svelte.config.js`), packaged as a self-contained, multi-stage Docker image (`Dockerfile`). The image makes no external network requests at runtime — the fare graph, airport coordinates, and CONUS map outline are all inlined into the server bundle at build time — so it runs identically on an internal or air-gapped network.

For version 1.0, the deployment target is **self-hosted**: an individual runs `docker build` and `docker run` on infrastructure of their own choosing (a personal machine, or an internally-hosted container host they control). This is *not* deployment to an IT-owned production system in the framework's sense, and no Authority to Operate (ATO) applies at this stage. If `minnode` moves to an officially IT-owned production system for broader internal IRS use, that transition requires coordinating an ATO through the appropriate IT channels before it can be treated as complete — this is future work, not something v1.0 claims to have satisfied.

## Privacy Compliance

Privacy compliance documentation (PCLTA/PCLIA) attaches when an artifact handles Sensitive But Unclassified (SBU) data, or — per [IRM 10.5.2.2.13](https://www.irs.gov/irm/part10/irm_10-005-002), which declares AI to be information technology in its own right — when the artifact is AI, regardless of hosting.

- **SBU data:** [Stage 3](./03-data-ingestion-governance.md) already determined `minnode` handles no FTI, PII, SBU, CUI, or LES data — all three data sources are public. No PCLTA/PCLIA trigger on data-handling grounds.
- **AI status:** [Stage 6](./06-statistical-modeling.md) reasoned that `minnode`'s deterministic Dijkstra/A* shortest-path computation — no fitted parameters, no training data, no learned behavior — likely does not meet IRM 10.24.1.3.1's machine-learning-scoped definition of AI. If that determination holds, the AI PCLIA requirement (submitted at least 30 business days before deployment, per IRM 10.5.2.2.13) does not attach either.

As in Stage 6, this is the reasoning for the record, not a self-certified conclusion — the AAO determination on AI status is the same determination this stage's privacy-compliance question depends on. It should be confirmed once before any deployment beyond self-hosted, individual use, rather than re-derived separately at Stage 6 and Stage 8.

## Controlled Release and Versioning

Releases follow [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`) per the project's version-control standards, satisfying [IRM 2.150.2.2.3.9.1](https://www.irs.gov/irm/part2/irm_02-150-002)'s requirement for standardized version identifiers. Version 1.0.0 is tagged in Git at the commit this documentation set describes; the Docker image is built from that tagged commit and can be tagged to match (e.g. `minnode:1.0.0`) for anyone building it themselves.

Git history is the release record: every deployed version corresponds to a tagged commit, and GitHub Flow (feature branch → PR → merge to `main`) means `main` always reflects what's actually releasable.

## Rollback

Rollback to a previous version means running the Docker image built from an earlier Git tag — the multi-stage build is fully reproducible from the raw source data committed at that tag (see [Stage 4](./04-data-wrangling.md)), so an earlier tag can always be rebuilt and run without depending on artifacts from the newer version.

## Agent Decommissioning

Not applicable. This requirement is scoped to agent artifacts (persistent processes with logs, memory, or model state to retire); `minnode` is a stateless data-product artifact — each request is computed fresh from the same static, versioned fare graph, with no logs, memory, or model artifacts that require a disposal plan.

## Reference

- [IRM 10.24.1, IRS Policy for Artificial Intelligence (AI) Governance](https://www.irs.gov/irm/part10/irm_10-024-001r)
- [IRM 10.5.1.6.22, Privacy for Artificial Intelligence (AI)](https://www.irs.gov/irm/part10/irm_10-005-001)
- [IRM 10.5.2, Privacy Compliance and Assurance (PCA) Program](https://www.irs.gov/irm/part10/irm_10-005-002)
- [IRM 2.150.2, Software Configuration Management](https://www.irs.gov/irm/part2/irm_02-150-002)
