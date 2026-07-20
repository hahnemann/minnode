import rawCsv from '../../../data/processed/airport_pair_fares.csv?raw';
import { buildGraph, type FareGraph } from '$lib/graph';
import { parseFareEdges } from '$lib/fareCsv';

// `?raw` inlines the CSV into the server bundle at build time, so the graph is
// available regardless of adapter/filesystem access at runtime.
let cachedGraph: FareGraph | undefined;

export function getFareGraph(): FareGraph {
	if (!cachedGraph) {
		cachedGraph = buildGraph(parseFareEdges(rawCsv));
	}
	return cachedGraph;
}
