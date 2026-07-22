# minnode

A meeting-location optimizer for federal travelers. Given a group of travelers' origin airports, `minnode` computes the destination airport that minimizes total group airfare, using published GSA City Pair Program fares and classical graph optimization (Dijkstra's algorithm / the 1-median problem).

Federal travel is a multi-billion-dollar annual expense, and the City Pair Program already negotiates reduced government airfares — but the choice of *where* a group should meet is typically made by convention or convenience, not by calculating which destination is actually cheapest for everyone involved. `minnode` answers that question directly: enter a list of origin airports, get back a ranked list of destinations by total group cost.

See [`docs/01-problem-identification.md`](docs/01-problem-identification.md) for the full problem statement and theoretical grounding.

## Using it

Enter a comma- or space-separated list of origin airport codes (e.g. `MSP, DCA, LAX`) — duplicates are allowed and are weighted correctly (three travelers from the same airport count three times). The app returns the single cheapest destination with a per-traveler cost breakdown, a ranked table of all reachable destinations, and a map of the requested origins, the optimal destination, and the routes between them.

## How it works

- **Graph**: airports are nodes; a City Pair fare between two airports is an edge, weighted by the unrestricted government coach fare (`yca_fare`). See [`docs/06-statistical-modeling.md`](docs/06-statistical-modeling.md) for why that fare class was chosen over the other three available in the raw data.
- **Algorithm**: Dijkstra's algorithm computes the shortest-path (cheapest-fare) cost from each origin to every other airport; those per-origin costs are summed per candidate destination to solve the 1-median problem — the destination minimizing total cost across all origins. See [`src/lib/graph.ts`](src/lib/graph.ts).
- **Scope**: contiguous United States (CONUS) only for v1.0 — Alaska and Hawaii are excluded. See [`docs/04-data-wrangling.md`](docs/04-data-wrangling.md) for why, and [`docs/05-fitness-for-use.md`](docs/05-fitness-for-use.md) for what that means for coverage.

## Developing

Install dependencies, then start a dev server:

```sh
npm install
npm run dev -- --open
```

Run the test suite (Vitest — unit tests for the graph algorithms, plus an integration test validated against the notebook's independently-computed results):

```sh
npm run test
```

Type-check and lint:

```sh
npm run check
npm run lint
```

### Regenerating the underlying data

`data/processed/airport_pair_fares.csv` (the CSV the app reads at build time) is a build artifact, not committed to version control. Regenerate it from the committed raw sources with:

```sh
uv run python scripts/prepare_data.py
```

The same script is called from `notebooks/prepare_data.ipynb` (Section 1), which also contains the original exploratory analysis and algorithm validation (Section 2) that this app is a production port of. The notebook's Python environment is pinned via `.python-version` (3.10.18) and `requirements.txt`.

## Building for production / deployment

The app builds to a standalone Node server via [`@sveltejs/adapter-node`](https://svelte.dev/docs/kit/adapter-node), and is packaged as a multi-stage Docker image suitable for internal or air-gapped networks — it makes no external network requests at runtime; the fare graph, airport coordinates, and CONUS map outline are all inlined into the server bundle at build time.

```sh
docker build -t minnode:latest .
docker run -p 3000:3000 minnode:latest
```

The image regenerates `data/processed/airport_pair_fares.csv` from the raw source CSVs during the build (rather than relying on a pre-run notebook), so it stays reproducible and correct even after the underlying award or airport data changes. See [`docs/08-deployment.md`](docs/08-deployment.md) *(forthcoming)* for details.

## Data sources and attribution

- **Airfare**: [GSA City Pair Program](https://www.gsa.gov/travel/plan-a-trip/transportation-airfare-rates-pov-rates/airfare-rates-city-pair-program) FY 2026 awards, a direct public GSA publication.
- **Airport coordinates**: [`ip2location/ip2location-iata-icao`](https://github.com/ip2location/ip2location-iata-icao), licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

  > This site or product includes IATA/ICAO List data available from https://github.com/ip2location/ip2location-iata-icao.

Full provenance, screening, and licensing detail for all data sources is in [`docs/02-data-discovery.md`](docs/02-data-discovery.md).

## Documentation

This project follows a staged data-product SDLC framework. Each stage's reasoning and evidence is documented under [`docs/`](docs):

1. [Problem Identification](docs/01-problem-identification.md)
2. [Data Discovery](docs/02-data-discovery.md)
3. [Data Ingestion & Governance](docs/03-data-ingestion-governance.md)
4. [Data Wrangling](docs/04-data-wrangling.md)
5. [Fitness for Use](docs/05-fitness-for-use.md)
6. [Statistical Modeling](docs/06-statistical-modeling.md)
7. Communication and Dissemination *(forthcoming)*
8. Deployment *(forthcoming)*
9. Assessment *(forthcoming)*

## License

Code is MIT-licensed (see [`LICENSE`](LICENSE)). Airport coordinate data is CC BY-SA 4.0 per the attribution above; GSA fare data is public federal information.
