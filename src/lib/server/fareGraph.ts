import rawCsv from '../../../data/processed/airport_pair_fares.csv?raw';
import { buildGraph, type FareGraph } from '$lib/graph';
import { parseAirportCoordinates, parseFareEdges, type AirportCoordinate } from '$lib/fareCsv';

// `?raw` inlines the CSV into the server bundle at build time, so the graph is
// available regardless of adapter/filesystem access at runtime.
let cachedGraph: FareGraph | undefined;
let cachedCoordinates: Map<string, AirportCoordinate> | undefined;

export function getFareGraph(): FareGraph {
	if (!cachedGraph) {
		cachedGraph = buildGraph(parseFareEdges(rawCsv));
	}
	return cachedGraph;
}

export function getAirportCodes(): string[] {
	return Array.from(getFareGraph().keys()).sort();
}

export function getAirportCoordinates(): Map<string, AirportCoordinate> {
	if (!cachedCoordinates) {
		cachedCoordinates = parseAirportCoordinates(rawCsv);
	}
	return cachedCoordinates;
}
