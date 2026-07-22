# 7. Communication and Dissemination

This stage covers how `minnode`'s analysis and findings are communicated — to the end user in the running artifact, and to the wider audience through documentation, code, and release.

## Telling the Story in the Artifact

The primary communication surface is the running application itself, not a separate report. For a given set of origins, the UI directly answers Stage 1's question rather than presenting raw output:

- A best-destination panel states the optimal meeting point and its total cost up front.
- A per-origin cost breakdown (`src/routes/+page.svelte`) shows each traveler's individual fare to that destination, so the total is auditable rather than a black-box number.
- A ranked table of all reachable destinations lets a user see the runner-up options and how much more they'd cost, not just the single optimum.
- The map (`src/lib/components/RouteMap.svelte`) shows origins, the chosen destination, and the routes between them geographically, which the numbers alone don't convey.

This design choice follows directly from Stage 1's problem statement: the artifact exists to make a comparison that travel planners currently do by convention, so the output has to make that comparison legible, not just correct.

## Working Papers and Reproducibility

`notebooks/prepare_data.ipynb` is the artifact's working paper. It contains the original exploratory analysis, algorithm validation, and narrative reasoning that `docs/04-data-wrangling.md` through `docs/06-statistical-modeling.md` document more formally; the notebook and the numbered `docs/` stages are cross-referenced from each other so a reader can move between the narrative and the underlying analysis.

Reproducibility does not depend on trusting the notebook's output as a static artifact:

- `scripts/prepare_data.py` is the single source of truth for the data transform: the notebook calls it rather than duplicating logic inline, and the Docker build (`Dockerfile`) regenerates the same output from the same committed raw sources at build time. All three paths — notebook, script, container — produce byte-identical results because they run the same code (verified in Stage 4 development).
- `src/lib/graph.spec.ts` validates the production TypeScript algorithm against the notebook's independently-computed Python results for the same input, so the artifact's live behavior is checked against the working paper, not assumed to match it.

## Dissemination Channels

- **Code and documentation**: the repository is made public on GitHub at version 1.0 (per [Stage 3](./03-data-ingestion-governance.md)'s dissemination determination), under the MIT License, with the numbered `docs/` stages as the primary narrative record of how the artifact was built and why.
- **Data**: the GSA City Pair and Per Diem sources are public federal publications; the airport reference data carries the CC BY-SA 4.0 attribution documented in the README. All three ship alongside the code.
- **Training material**: a separate internal training effort (not part of this repository) uses `minnode`'s Git history and staged documentation as a worked example of applying the standards, SDLC, and version-control frameworks end to end — this is the primary planned mechanism for building a community of practice around the framework itself, rather than around `minnode` specifically.

No conference presentation, publication, or social media dissemination applies — this is an internal federal tool, not a research output intended for external academic or public dissemination beyond the open-source release itself.

## Privacy and Ethical Dimensions

Already established in [Stage 3](./03-data-ingestion-governance.md): all data is public, no individuals are represented, and no enforcement-selection logic exists. Open dissemination of code and data therefore raises no privacy or ethical concern beyond maintaining the CC BY-SA attribution — there is no protected information whose disclosure this stage needs to guard against.
