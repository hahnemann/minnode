# 4. Data Wrangling

Wrangling is performed in [`notebooks/prepare_data.ipynb`](../notebooks/prepare_data.ipynb) (Section 1), which transforms the two Stage 2 sources into a single denormalized CSV consumed by the SvelteKit dashboard. This stage documents that process against the framework's four wrangling activities: profiling, preparation, linkage, and exploration.

## Profiling

The two inputs were profiled for row counts and structural fit before transformation:

- `data/awards_2026.csv` — 16,073 City Pair award records, spanning U.S. and international markets.
- `data/iata-icao.csv` — 9,158 airport reference records, global coverage.

Both files loaded cleanly with `pandas.read_csv`; no malformed rows or encoding issues were encountered.

## Preparation

Two filters narrow each source to the artifact's scope.

**Awards** are filtered to routes where both `ORIGIN_COUNTRY` and `DESTINATION_COUNTRY` equal `UNITED STATES`, reducing 16,073 records to 11,692 U.S. domestic awards.

**Airport reference data** is filtered to `country_code == 'US'`, excluding Alaska and Hawaii by `region_name`, then restricted to rows with a valid 3-letter IATA code and parsable coordinates. This yields 1,675 CONUS airports with coordinates.

The Alaska/Hawaii exclusion narrows Stage 1's stated scope ("U.S. domestic airport travel") to CONUS specifically. This is a wrangling-stage decision, not a data availability gap — the reference dataset contains Alaska and Hawaii airports; they are deliberately excluded from this iteration. Extending to non-CONUS U.S. territories is a candidate for a future iteration and would require revisiting Stage 1's scope statement.

## Linkage

Awards and airport reference data are joined on IATA code — once for the origin airport, once for the destination — to attach coordinates to each award row. The join is an inner join on both sides, so an award row survives only if both its origin and destination airport have a matching CONUS reference record.

11,692 U.S. domestic awards produce 10,935 airport-pair fare records after the join — a drop of 757 rows. This drop was traced precisely: all 757 rows reference one of the same 23 airport codes excluded from the reference set by the Alaska/Hawaii filter above (18 Alaska codes, 5 Hawaii codes). No award row was dropped for any other reason — there is no missing-coordinate or unmatched-code gap beyond the deliberate CONUS restriction.

The output schema is one row per directed airport pair, with origin and destination coordinates and all four GSA fare columns (`yca_fare`, `ca_fare`, `business_fare`, `cp_fare`), written to `data/processed/airport_pair_fares.csv`.

## Exploration

The 10,935-row output was explored as a graph — 289 unique airport nodes, treating each fare as an undirected edge (a fare from A to B is available for a meeting at either A or B):

- **Connectivity:** the graph is a single connected component. All 289 nodes are reachable from any starting node, confirmed by breadth-first traversal.
- **Hub structure:** connectivity is uneven, as expected for an airline network. DEN, ATL, DCA, DFW, and SEA are the most-connected airports (213–233 distinct direct routes each); several smaller regional airports (e.g., DDC, CDC, BRD) have only one direct route apiece.
- **Fare range:** `yca_fare` ranges from $43 to $1,114 across all 10,935 records, with no zero, negative, or missing values.

This exploration also informed the algorithm design in Section 2 of the notebook (see [Stage 1: Theoretical Grounding](./01-problem-identification.md#theoretical-grounding)): because the graph is fully connected, Dijkstra's algorithm resolves a finite shortest-path cost between any two nodes, even where a direct fare doesn't exist, by routing through intermediate hubs.

## Output

`data/processed/airport_pair_fares.csv` is the artifact produced by this stage. It is not committed to version control — it is a build artifact, reproducible by re-running `notebooks/prepare_data.ipynb` against the committed raw sources in `data/`.
