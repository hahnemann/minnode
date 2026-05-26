# 1. Problem Identification

## Context

Federal travel is a substantial and rising governmentwide expense. The most recent budget data reports $17.790 billion in FY 2025 obligations for "Travel and transportation of persons," rising to an estimated $19.448 billion in FY 2026 and $20.604 billion in FY 2027, according to the [OMB FY 2027 Object Class Analysis](https://www.whitehouse.gov/wp-content/uploads/2026/04/objclass_fy2027.pdf).

The federal government operates significant cost-control mechanisms for travel. The [General Services Administration establishes per diem rates](https://www.gsa.gov/travel/plan-book/per-diem-rates) agencies use to reimburse employees for lodging, meals, and incidental expenses on official travel within the continental United States. GSA's [City Pair Program](https://www.gsa.gov/travel/plan-a-trip/transportation-airfare-rates-pov-rates/airfare-rates-city-pair-program) negotiates governmentwide airfare contracts. For FY 2026, the program is expected to save taxpayers $1.89 billion, with City Pair fares 49.1% below comparable commercial fares. GSA is also implementing [GO.gov, a modernized federal travel and expense platform](https://www.gsa.gov/about-gsa/newsroom/news-releases/gsa-unveils-gogov-a-new-era-for-federal-travel-management-07292025) expected to save about $131 million annually in travel costs and $2 billion in administrative efficiencies over the contract's life.

Within that context, this artifact addresses a specific class of travel decision that the existing mechanisms do not directly optimize for.

## The Problem

When federal employees from multiple locations must meet in person, the meeting destination significantly influences total travel costs. Although the City Pair Program offers reduced fares once a destination is selected, the choice is generally based on convention, convenience, or subjective judgment rather than systematic optimization. For a group of *n* travelers from *n* different locations, the destination that minimizes aggregate airfare is not readily apparent and is seldom calculated.

The artifact addresses the following problem: **given a group of travelers with known origin airports, determine the destination airport that minimizes the total airfare for all travelers, utilizing GSA City Pair Program fare data**.

This is a specific and well-defined optimization problem. The objective is not to decrease federal travel volume, renegotiate fare agreements, or replace existing cost-control mechanisms. Instead, the artifact operates within the current system, leveraging existing fare data to inform meeting location decisions, which are currently made without quantitative cost optimization.

## Hypothesis

Graph-based optimization using published GSA City Pair fares can identify meeting destinations that yield lower aggregate costs compared to ad hoc destination selection for groups of federal travelers who must convene in person.

## Theoretical Grounding

The artifact applies classical shortest-path algorithms to an airfare graph where nodes represent airports and edges correspond to City Pair fares between airport pairs. The objective is to identify the destination node that minimizes the total path cost from the set of origin nodes.

- **Dijkstra's algorithm** ([Dijkstra, E. W. 1959. "A note on two problems in connexion with graphs." *Numerische Mathematik*, 1(1), 269–271](https://doi.org/10.1007/BF01386390)) computes shortest paths from a single source to all other nodes in a non-negatively-weighted graph. The initial implementation uses Dijkstra.
- **A\* search** ([Hart, P. E., Nilsson, N. J., & Raphael, B. 1968. "A formal basis for the heuristic determination of minimum cost paths." *IEEE Transactions on Systems Science and Cybernetics*, 4(2), 100–107](https://doi.org/10.1109/TSSC.1968.300136)) extends Dijkstra's algorithm by incorporating an admissible heuristic to prune the search space. Implementation of A\* is planned for a subsequent iteration, contingent upon the identification of an appropriate heuristic for fare-graph search.

This problem is also related to the operations research literature on **facility location**, specifically the *1-median problem* on a graph, which involves selecting a node to minimize the sum of distances from a fixed set of source nodes. In the context of airport fares, the "facility" corresponds to the meeting destination, and the "distance" is defined as the City Pair fare from each origin.

## Data Sources

The primary data source is the GSA City Pair Program fare table, listing negotiated fares for federal travel between airport pairs. The [FY 2026 program covers more than 16,000 markets](https://www.gsa.gov/about-gsa/newsroom/news-releases/gsas-city-pair-program-announces-awards-07082025), with 98% of solicited non-stop markets awarded. Airport coordinates and metadata come from public IATA/ICAO airport reference data.

Detailed data discovery and provenance are documented in [Stage 2: Data Discovery](./02-data-discovery.md).

## Scope

Stage 1 defines the problem within the artifact's initial scope: U.S. domestic airport travel, single-destination optimization, and the group meeting use case. While the underlying engine uses graph optimization for minimum-cost node selection and could be generalized to other domains, such extensions are potential future directions rather than current commitments.