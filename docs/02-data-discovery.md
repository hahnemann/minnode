# 2. Data Discovery

This stage inventories candidate data sources, screens them against the problem identified in [Stage 1](./01-problem-identification.md), and records how each was acquired.

## Inventory

The problem requires data on three elements: the cost of travel between airport pairs, airport locations, and potentially lodging costs at the destination. Authoritative sources for each have been identified.

- **Federal airfare** is published by the U.S. General Services Administration through the [City Pair Program](https://www.gsa.gov/travel/plan-a-trip/transportation-airfare-rates-pov-rates/airfare-rates-city-pair-program), which provides annual contract awards for negotiated government airfare. GSA publishes the awards as a downloadable CSV updated nightly on business days.
- **Airport identifiers and coordinates** are governed by [IATA's Airport & Location Identifier Database](https://www.iata.org/en/publications/manuals/airline-airport-location-coding-databases/airport-location-identifier-database/), the official authority. IATA’s database is a commercial subscription product; the free IATA code search supports individual lookups but not bulk download. Public-derived datasets (community-maintained mirrors aggregating IATA codes with airport coordinates) are widely available.
- **Lodging and meal costs** at U.S. domestic destinations are published by GSA through the [Per Diem Rates](https://www.gsa.gov/travel/plan-book/per-diem-rates) program, with rate files available on [Per Diem files](https://www.gsa.gov/travel/plan-a-trip/per-diem-rates/per-diem-files) page.

Three candidate sources were inventoried for this iteration.

## Screening

Each candidate is screened against the framework’s criteria: data type, recurring nature, availability for the time period, geographic granularity, unit of analysis, and provenance.

### GSA City Pair FY 2026 Awards

**File:** `data/awards_2026.csv` — 16,073 records, 23 columns.

| Criterion | Value |
|---|---|
| Type | Structured tabular CSV |
| Recurring | Annual contract awards; file updated nightly on standard business days |
| Period | Effective 10/01/2025 through 09/30/2026 (FY 2026) |
| Geography | U.S. domestic and international airport-pair markets |
| Unit of analysis | Airport-pair fare contract (with airline, fare classes, capacity) |
| Provenance | Direct GSA publication: `https://www.gsa.gov/system/files/awards_2026.csv` |

The file includes multiple fare classes for each airport pair: `YCA_FARE` (unrestricted government coach), `_CA_FARE` (capacity-controlled discount coach), `BUSINESS_FARE` (business class), and `_CP_FARE` (capacity-controlled business). Selecting the fare class for the cost function is a modeling decision addressed in [Stage 6](./06-statistical-modeling.md).

**Screening result:** in scope. Authoritative source, current period, sufficient granularity, recurring availability.

### Airport Reference Data

**File:** `data/iata-icao.csv` — 9,158 records, 7 columns (country code, region name, IATA code, ICAO code, airport name, latitude, longitude).

| Criterion | Value |
|---|---|
| Type | Structured tabular CSV |
| Recurring | Static reference data; updates infrequent (IATA codes do not change once assigned) |
| Period | Not applicable — reference data, not time-series |
| Geography | Global (international coverage; will require filtering for U.S. domestic scope) |
| Unit of analysis | One row per airport |
| Provenance | [`ip2location/ip2location-iata-icao`](https://github.com/ip2location/ip2location-iata-icao) — a public GitHub repository maintained by IP2Location. Column structure and filename match exactly. The repository is actively maintained (31 releases as of December 2025). |

IATA codes are authoritative once assigned and remain unchanged. The `ip2location/ip2location-iata-icao` dataset is a community-maintained compilation of these codes with airport coordinates, suitable for version 1.0’s purpose of linking airport codes to locations.

The dataset is licensed under [Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/) and requires attribution. The required attribution is:

> *This site or product includes IATA/ICAO List data available from https://github.com/ip2location/ip2location-iata-icao.*

This attribution must be included in the artifact’s user-facing materials (README or equivalent). The dataset is crowdsourced and provided “as is” without correctness guarantees. An upgrade to the authoritative IATA database remains a candidate for future iterations if data quality issues arise.

**Screening result:** in scope, with a noted provenance caveat. The dataset is sufficient for the cost-minimization problem; upgrading to an authoritative source is a candidate for future iterations if data accuracy issues arise.

### GSA Per Diem FY 2026 Master Rates

**File:** `data/FY2026_PerDiemMasterRatesFile.xlsx` — 11 columns; the FY 2026 CONUS Per Diem master rates as published by GSA.

| Criterion | Value |
|---|---|
| Type | Structured tabular spreadsheet (XLSX) |
| Recurring | Annual; updated each fiscal year |
| Period | FY 2026 |
| Geography | U.S. continental destinations (CONUS) |
| Unit of analysis | One row per destination per season; lodging rate and M&IE rate per row |
| Provenance | `https://origin-www.gsa.gov/system/files/FY2026_PerDiemMasterRatesFile.xlsx` — linked from the GSA [Per Diem files](https://www.gsa.gov/travel/plan-a-trip/per-diem-rates/per-diem-files) page. |

**Screening result:** inventoried and retained in the repository but **not used in version 1.0**. The cost function defined in Stage 1 minimizes airfare across travelers; lodging and M&IE costs are out of scope. The Per Diem dataset is a candidate for future iterations where the cost function expands to total travel cost (airfare plus lodging and meals multiplied by meeting duration). Expanding the cost function would require revising [Stage 1](./01-problem-identification.md).

## Acquisition

All three files were obtained directly from federal sources.

- The City Pair awards CSV was downloaded from the GSA City Pair Program page, which links to the system file at `gsa.gov/system/files/awards_2026.csv`. No agreement or authorization is required; the file is published as public information for federal travelers and others.
- The airport reference CSV was acquired from the [`ip2location/ip2location-iata-icao`](https://github.com/ip2location/ip2location-iata-icao) GitHub repository, a public crowdsourced dataset licensed under CC BY-SA 4.0. No IATA commercial subscription was obtained for v1.0; the attribution requirement is documented in the artifact’s README.
- The Per Diem master file was downloaded from the [GSA Per Diem files](https://www.gsa.gov/travel/plan-a-trip/per-diem-rates/per-diem-files) page as the published XLSX.

No data-sharing agreements, contractor relationships, or restricted-access channels were involved. All three are public federal or public-derived data.

## Data Map

The artifact integrates two sources for version 1.0:

1. **City Pair awards** provide the *edges* of the airfare graph: each record gives a fare cost between an origin airport and a destination airport.
2. **Airport reference data** supplies the *node* attributes. Each airport code in the City Pair file is supplemented with the airport name and geographic coordinates from the reference dataset.

The third inventoried source (Per Diem) does not connect to the v1.0 graph and is retained pending future expansion of the cost function.

## Iteration Note

The framework specifies that discovery is iterative. New sources are inventoried and screened throughout the project. Potential future sources include:

- **GSA Per Diem rates** (already inventoried in this iteration) are relevant for total-cost expansion that incorporates lodging and meals into the cost function.
- **[`lxndrblz/Airports`](https://github.com/lxndrblz/Airports)** — is an alternative public airport dataset licensed under CC BY-SA 4.0 and is also community-maintained. Compared with the current dataset:
  - **Rows:** 9,249 vs. 9,158 — slight increase in airport coverage.
  - **City Pair coverage:** covers 623 of 645 City Pair airports vs. 616 of 645 for the current dataset. Both datasets miss the same metropolitan-area codes (LON, NYC, CHI, etc.) that GSA includes for international city-pair fares. Resolving metro codes is a Stage 4 wrangling concern, not solved by either dataset.
  - **Columns:** adds timezone, elevation, URL, city, state, county, and a type field in addition to the columns in the current dataset. None of these additional fields are required for version 1.0’s cost-minimization problem. However, timezone would be relevant if a future iteration incorporates meeting-duration-aware cost calculations.
- **Authoritative IATA [Airport & Location Identifier Database](https://www.iata.org/en/publications/manuals/airline-airport-location-coding-databases/airport-location-identifier-database/)** — paid IATA subscription. A candidate upgrade if the crowdsourced data's "as is" disclaimer surfaces accuracy problems in practice.
