# 5. Fitness for Use

This stage assesses whether the wrangled data (Stage 4) is suitable for the optimization method the artifact applies: Dijkstra's shortest-path algorithm over the CONUS City Pair fare graph, to test the Stage 1 hypothesis that graph-based optimization identifies lower-cost meeting destinations than ad hoc selection.

## Constraints Imposed by the Method

Dijkstra's algorithm requires a graph with non-negative edge weights and returns a finite shortest-path cost only between nodes in the same connected component. Both conditions are met:

- **Non-negative weights:** `yca_fare` values range from $43 to $1,114 across all 10,935 airport-pair records (Stage 4), with no zero, negative, or missing fares.
- **Connectivity:** the 289-node graph is a single connected component (Stage 4, Exploration). Every CONUS airport in the dataset is reachable from every other, so the algorithm always returns a finite total cost for any combination of valid origins — there is no scenario within the CONUS scope where the optimization silently fails to find a destination.

## Representativeness of Scope

Stage 1 scoped the problem to "U.S. domestic airport travel." Stage 4 narrowed this during wrangling to CONUS specifically, excluding Alaska and Hawaii. This means the artifact's fitness for use is bounded to travelers whose origin airports are within the contiguous United States — a traveler based in Anchorage or Honolulu cannot currently be entered as an origin. This is a known, documented scope boundary rather than a representativeness defect within the stated scope: the full City Pair awards file spans 645 distinct airport codes (Stage 2), of which 312 belong to U.S. domestic routes; of those, 289 fall within CONUS and form the artifact's graph. The 23-code gap between the two is exactly the Alaska/Hawaii exclusion documented in Stage 4 — no additional, unexplained coverage loss occurs between "U.S. domestic" and "CONUS."

Coverage is uneven across CONUS airports (Stage 4's hub/regional distinction), but this does not threaten fitness for use: the ranking approach (`rankDestinations` in `src/lib/graph.ts`) only surfaces destinations reachable at finite cost from every requested origin, so a lightly-connected regional airport is never presented as a false optimum — it is either reached via a correctly-computed multi-hop itinerary cost, or (if truly unreachable, which does not occur within this connected graph) excluded from the ranked results entirely.

## Information Content of Results

The artifact's output is a ranked list of destinations by total group airfare, headed by the single minimum-cost destination — directly answering Stage 1's problem statement. The TypeScript port (`src/lib/graph.ts`) was validated against the notebook's independently-computed Python results for a representative three-origin input (MSP, DCA, LAX → ORD, $352 total), confirming the ported implementation preserves the information content of the original algorithm exactly (see `src/lib/graph.spec.ts`).

## Conclusion

The wrangled data is fit for use for the artifact's stated hypothesis test at CONUS scope. The one material representativeness boundary — exclusion of Alaska and Hawaii — is documented, deliberate, and traceable to a specific Stage 4 filtering decision, not an unexamined gap in the underlying data.
