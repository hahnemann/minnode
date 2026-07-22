# 9. Assessment

Assessment evaluates the deployed artifact in real-world use — whether it actually performs as intended once people use it, not just whether it passes tests before release.

## Status at v1.0

This document is written at the moment of v1.0's release, before any real-world usage has occurred. There is, by definition, no usage history yet to assess. What follows is what *would* be assessed once the artifact is in use, and what the framework's feedback mechanism means for `minnode` specifically — not a report of findings, since none exist yet.

## What Would Be Assessed

Stage 1's hypothesis is that graph-based optimization identifies lower-cost meeting destinations than ad hoc selection. Testing that hypothesis in real-world use means comparing what the artifact recommends against what a group would otherwise have chosen — the actual assessment question is not "does Dijkstra work" (validated in Stage 4/6 against the notebook's independent computation) but "does using this tool change which destination gets picked, and does that change save money in practice." That comparison requires real usage over time, which does not exist at release.

Two things the current artifact does support once usage begins:

- The per-origin cost breakdown and ranked-destination table (Stage 7) mean a user can see *why* a recommendation was made, not just accept a number — which makes human evaluation of individual recommendations possible immediately, without waiting for aggregate usage data.
- The test suite (`src/lib/graph.spec.ts`) and the notebook cross-check (Stage 6) mean that if a recommendation looks wrong in practice, the first question — is the algorithm computing correctly — is already answered, isolating any real discrepancy to the data or the scope, not the implementation.

## Feedback Loop: Re-Entry at Stage 1

The framework specifies that a problem found during assessment re-enters at Stage 1, as a new problem to identify. `minnode` already has one scope boundary logged in advance of any assessment finding it: the CONUS-only restriction (Stage 4) means a traveler based in Alaska or Hawaii cannot be entered as an origin. This is a known, pre-documented limitation, not something assessment would discover — but it is exactly the kind of gap that, if it surfaces as a real complaint in use, re-enters the framework at Stage 1 as "should the scope include Alaska and Hawaii," rather than being patched directly at the wrangling or algorithm level.

Other categories of finding that would trigger Stage 1 re-entry: a fare class other than `yca_fare` turning out to matter to real users (Stage 6's decision revisited), or a request to include ground transportation, lodging, or meals in the total cost (already flagged as out of scope in Stage 1/2, and would require expanding the cost function itself).

## Ongoing Monitoring

The framework calls for MLOps practices where assessment becomes continuous monitoring for drift or retraining needs. `minnode`'s algorithm has no fitted parameters to drift or retrain (Stage 6) — the closer analog here is **data freshness**, not model drift: GSA republishes City Pair awards annually (Stage 2), and the artifact's recommendations are only as current as the `data/awards_2026.csv` snapshot it was built from. The Docker build (Stage 8) already automates regenerating the processed dataset from whatever raw CSVs are committed, so refreshing to a new fiscal year's awards is a data update plus a rebuild, not a code change — but someone still has to notice FY 2027 awards were published and commit them. No automated check for upstream data staleness exists in v1.0; this is the most concrete continuous-monitoring gap to flag for a future iteration.

## Conclusion

Real assessment of `minnode` starts after v1.0 ships, not at this document. What this stage establishes now is what to watch for (does the recommendation change real destination choices, does the CONUS scope boundary generate complaints, does the fare-class or cost-function decision need revisiting) and the one concrete operational gap (no automated staleness check on the annual GSA data) worth addressing before this becomes a long-running deployment rather than a v1.0 release.
