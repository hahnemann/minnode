# 6. Statistical Modeling and Analyses

Stage 1 fixed the method (Dijkstra's algorithm / 1-median) and Stage 4 produced a graph with four candidate edge weights — one per GSA fare class. This stage resolves the one modeling decision Stage 2 deferred: which fare column is the cost function, and confirms the resulting model's validity.

## Fare-Class Selection

`data/awards_2026.csv` carries four fare columns per airport pair (Stage 2, Data Discovery):

| Column | Fare class | Populated (of 16,073 awards) |
| --- | --- | --- |
| `yca_fare` | Unrestricted government coach | 16,073 (100%) |
| `ca_fare` | Capacity-controlled discount coach | 12,484 (77.7%) |
| `business_fare` | Business class | 1,431 (8.9%) |
| `cp_fare` | Capacity-controlled business | 1,502 (9.3%) |

A `0` in this data means the fare class was not awarded for that market, not a free fare — `yca_fare` is the only column with zero zero-values across all 16,073 records; the other three are `0` (i.e., unavailable) for the remainder.

**Decision: `FARE_COLUMN = 'yca_fare'`** (`src/lib/fareCsv.ts:8`), for two reasons:

1. **Coverage.** The other three fare classes are only awarded on a minority of markets — using `business_fare` or `cp_fare` as the cost function would treat most airport pairs as having no fare at all, fragmenting the graph and directly violating the connectivity precondition Stage 5 verified (Dijkstra requires every queried origin/destination pair to lie in one connected component). `yca_fare`'s universal coverage is what makes the 289-node graph a single connected component in the first place.
2. **Entitlement match.** Federal travel regulation entitles travelers to coach-class accommodations unless a specific exception applies (e.g., disability, agency mission need); business-class fares represent an exception case, not the default cost a group of travelers would actually incur. Unrestricted coach (`yca_fare`, as opposed to the capacity-controlled `ca_fare`) is also the fare a traveler can book without availability risk, matching the artifact's use case of a firm cost estimate at the time a meeting is planned, not after seats are confirmed.

This decision is encoded once, in `FARE_COLUMN`, and both `parseFareEdges` (the app) and `notebooks/prepare_data.ipynb` (Section 2) read from it — reconsidering the fare class in a future iteration is a one-line change, not a re-wrangle.

## Model Validation

The artifact's "model" is a deterministic algorithm (Dijkstra's shortest path, composed into the 1-median ranking in `rankDestinations`/`optimalMeetingPoint`), not a statistical estimator fit from data — there are no parameters to train, and no train/test split applies. Validation instead means confirming the implementation computes the specified algorithm correctly:

- The TypeScript port (`src/lib/graph.ts`) is checked against the notebook's independently-computed Python results for a representative input (origins MSP, DCA, LAX → destination ORD, $352 total cost) in `src/lib/graph.spec.ts`, along with unit tests of `dijkstra`, `rankDestinations`, and `optimalMeetingPoint` against known graph topologies.
- A regression test locks in correct handling of repeated origins (e.g., three travelers from the same airport must count three times in the total, not dedupe to one) — a bug caught during Stage 4/5 development where an earlier implementation silently under-weighted duplicate origins.

## AI Governance

[IRM 10.24.1.3.1](https://www.irs.gov/irm/part10/irm_10-024-001r) defines AI to include "machine learning (including deep learning as well as supervised, unsupervised, and semisupervised approaches)." `minnode`'s algorithm is classical and deterministic: Dijkstra's shortest-path computation over edge weights taken directly from published GSA fares, with no fitted parameters, no training data, and no learned behavior — the same input graph always produces the same output ranking by construction. On that basis this artifact does not appear to meet the IRM's definition of AI, and the high-impact pre-deployment testing and impact-assessment requirements of [IRM 10.24.1.4.1](https://www.irs.gov/irm/part10/irm_10-024-001r) would not apply.

This reasoning is offered for the record, not as a self-certified determination — Stage 1 did not document an AI Use Case Inventory entry or an explicit AAO determination on this question, and the framework assigns that determination to the AAO, not to this stage's author. Before deployment (Stage 8), the AAO should confirm this artifact is out of IRM 10.24.1's scope, or make the appropriate inventory entry if it is not.

## Conclusion

`yca_fare` is the cost function for v1.0: it is the only universally-populated fare class, its coverage is what keeps the graph connected, and it best matches the fare a traveler would actually be entitled to book. The algorithm itself is validated by direct comparison to an independent reference implementation rather than by statistical fit metrics, since it is deterministic rather than learned.
