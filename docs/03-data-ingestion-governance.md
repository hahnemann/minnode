# 3. Data Ingestion and Governance

This stage describes the processes for data ingestion, applicable governance rules, and required protections for the artifact.

`minnode` operates exclusively on public data, including federal publications and a community-maintained reference dataset. This context informs the documentation in this stage. Whereas the framework's default rules assume protected data and restricted access, `minnode` represents the opposite scenario. Each subsequent section outlines the framework's expectations and then details `minnode`'s corresponding approach.

## Data Classification

The artifact's data is classified as follows:

| Source | Classification | Notes |
|---|---|---|
| GSA City Pair FY 2026 Awards | Public federal publication | Published by GSA for federal travelers and the public; no protected information |
| GSA Per Diem FY 2026 Master Rates | Public federal publication | Same posture; published for federal travelers and the public |
| Airport Reference Data (ip2location) | Public community dataset, CC BY-SA 4.0 | Crowdsourced public reference data; no protected information |

No data used by `minnode` is **Federal Tax Information** (FTI), **Personally Identifiable Information** (PII), **Sensitive But Unclassified** (SBU), **Controlled Unclassified Information** (CUI), or **Law Enforcement Sensitive** (LES) under the definitions in the framework's [glossary](../../docs/reference/glossary.md). The artifact computes optimal meeting destinations from public airfare data; no individuals are represented in the data, and no enforcement-selection logic is implemented.

This classification determines the rest of this stage.

## Ingestion

Data ingestion is the process of bringing data into the artifact.

Each of the three source files identified in [Stage 2](./02-data-discovery.md) is downloaded directly from the respective publishers and stored in the `data/` directory of the repository. For version 1.0, downloads are manual. Future versions may implement automated periodic updates as upstream sources refresh. City Pair awards and Per Diem rates are published annually, while the airport reference dataset updates more frequently. No transformation occurs during ingestion; files are stored in their original published form.

## Access

The framework anticipates that access to data sources is *"defined in consultation with stakeholders and the institutional review board (IRB)"* and that combining sources may raise privacy and confidentiality concerns.

For `minnode`, stakeholder consultation and ethics review are not required:

- The data is public. Access requires no agreement, credentials, or approval.
- Combining the sources (City Pair fares + airport reference data) does not introduce privacy or confidentiality concerns. The data contains no individuals; combining the sources produces enriched airport-pair fare records, not identifying information.

## Dissemination

The framework treats dissemination as one of the three governance dimensions (access, dissemination, destruction).

`minnode` adopts an open dissemination approach:

- **Source code** is licensed under the [MIT License](../LICENSE). The license permits anyone to use, modify, and distribute the code, including for commercial purposes, with attribution to the copyright holder.
- **Airport reference data** carries a CC BY-SA 4.0 attribution requirement from its source, documented in [Stage 2](./02-data-discovery.md). The required attribution is included in the artifact's README.
- **Federal data** (City Pair awards, Per Diem rates) is in the public domain as a U.S. government publication; redistribution alongside the artifact's code is permitted.

The combined artifact, consisting of both code and data, is releasable as open source under the MIT License, with CC BY-SA attribution maintained for the airport reference component.

## Destruction

The framework anticipates destruction rules as part of data governance — typically retention schedules and disposal requirements for sensitive data.

No destruction rule applies to `minnode`. Public data is not subject to retention or disposal requirements. Data files remain in the repository for the artifact's existence, are versioned with the code in Git, and may be replaced when upstream sources release updates. There is no PII or FTI that requires destruction.

## Storage

The framework's Stage 3 calls for storage on *"a secure server accessible only via secured remote access"* — a posture that assumes protected data.

`minnode` uses a **public Git repository** for storage, with source code and data files managed together under version control. This approach suits an open-source artifact based on public data. The repository is hosted on GitHub under a personal account and will be made public at version 1.0. No separate secure storage tier is implemented or required.

## Data Management Plan

The framework anticipates that *"best practices around governance and ingestion are part of team training and captured in formal data management plans."*

A formal data management plan is not maintained for version 1.0. The artifact is developed by a single author for personal and open-source release; therefore, team training and formal data management plan (DMP) processes do not apply. The artifact's documentation (Stages 2 and 3 of this framework, along with the README) serves as the working record of data sources, usage, and licensing.

If the artifact transitions to team or institutional use, implementing a formal data management plan would be appropriate.

## Approval Gate

The framework's Stage 3 names an Approval Gate for protected data: *"When the artifact will use protected data — including Federal Tax Information (FTI) under IRC § 6103 — access requires approval from the relevant data governance authority. In LB&I, this is the [Risk Identification Control Board (RICB)](https://www.irs.gov/irm/part4/irm_04-050-001#id11)..."*

**The Approval Gate is not applicable to `minnode`.** This determination is based on two independent reasons:

1. The artifact uses no protected data. The Approval Gate triggers on FTI and similar protected categories. As documented above, `minnode`'s data is entirely public.
2. The RICB's defined scope is enforcement-selection filters in compliance campaigns. `minnode` is neither — it is a meeting-location optimizer for federal travelers, using public airfare data, with no enforcement-selection logic. Even if its data were protected, RICB would not be the relevant authority.

The framework's own scope note for the RICB anticipates this case: *"Applicability to non-campaign data products is not yet confirmed."* For `minnode`, applicability is confirmed as *not applicable*.