"""Wrangles GSA City Pair fare data into the denormalized CSV the minnode app consumes.

This is the single source of truth for that transform. notebooks/prepare_data.ipynb
Section 1 calls this same script (rather than duplicating the logic inline) so the
notebook's narrative documentation and the Docker build can never drift out of sync.
"""

from pathlib import Path

import pandas as pd

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = REPO_ROOT / "data"
OUTPUT_PATH = DATA_DIR / "processed" / "airport_pair_fares.csv"


def main() -> None:
    awards = pd.read_csv(DATA_DIR / "awards_2026.csv")
    airports = pd.read_csv(DATA_DIR / "iata-icao.csv")
    print(f"City Pair awards: {len(awards):,} records")
    print(f"Airport reference: {len(airports):,} records")

    awards_us = awards[
        (awards["ORIGIN_COUNTRY"] == "UNITED STATES")
        & (awards["DESTINATION_COUNTRY"] == "UNITED STATES")
    ].copy()
    print(f"U.S. domestic awards: {len(awards_us):,} records")

    airports_conus = airports[
        (airports["country_code"] == "US") & (~airports["region_name"].isin(["Alaska", "Hawaii"]))
    ].copy()
    airports_conus = airports_conus[
        airports_conus["iata"].notna() & (airports_conus["iata"].str.len() == 3)
    ]
    airports_conus["latitude"] = pd.to_numeric(airports_conus["latitude"], errors="coerce")
    airports_conus["longitude"] = pd.to_numeric(airports_conus["longitude"], errors="coerce")
    airports_conus = airports_conus.dropna(subset=["latitude", "longitude"])
    airports_conus = (
        airports_conus[["iata", "latitude", "longitude"]]
        .drop_duplicates(subset="iata")
        .rename(columns={"iata": "code", "latitude": "lat", "longitude": "lon"})
    )
    print(f"CONUS airports with coordinates: {len(airports_conus):,}")

    fare_columns = ["YCA_FARE", "_CA_FARE", "BUSINESS_FARE", "_CP_FARE"]
    pairs = awards_us[["ORIGIN_AIRPORT_ABBREV", "DESTINATION_AIRPORT_ABBREV", *fare_columns]].rename(
        columns={
            "ORIGIN_AIRPORT_ABBREV": "origin",
            "DESTINATION_AIRPORT_ABBREV": "destination",
            "YCA_FARE": "yca_fare",
            "_CA_FARE": "ca_fare",
            "BUSINESS_FARE": "business_fare",
            "_CP_FARE": "cp_fare",
        }
    )

    pairs = pairs.merge(
        airports_conus.rename(columns={"code": "origin", "lat": "origin_lat", "lon": "origin_lon"}),
        on="origin",
        how="inner",
    )
    pairs = pairs.merge(
        airports_conus.rename(
            columns={"code": "destination", "lat": "destination_lat", "lon": "destination_lon"}
        ),
        on="destination",
        how="inner",
    )
    pairs = pairs[
        [
            "origin",
            "origin_lat",
            "origin_lon",
            "destination",
            "destination_lat",
            "destination_lon",
            "yca_fare",
            "ca_fare",
            "business_fare",
            "cp_fare",
        ]
    ]
    print(f"Airport-pair fare records: {len(pairs):,}")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    pairs.to_csv(OUTPUT_PATH, index=False)
    print(f"Wrote {OUTPUT_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
