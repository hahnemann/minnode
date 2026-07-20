import { geoAlbers, geoPath, type GeoProjection } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import statesTopology from 'us-atlas/states-10m.json';

// Server-only: d3-geo, topojson-client, and the ~110KB state topology never need to
// reach the browser. The map is static, so all projection math happens once here;
// the client receives only pre-computed SVG path strings and pixel coordinates.

export const MAP_WIDTH = 600;
export const MAP_HEIGHT = 400;

// CONUS only, matching the artifact's own scope (docs/04-data-wrangling.md,
// docs/05-fitness-for-use.md): exclude Alaska, Hawaii, and non-state territories.
// A single geoAlbers projection (rather than the composite AlbersUsa) keeps the
// map continuous, consistent with the CONUS-only dataset.
const EXCLUDED_FIPS = new Set(['02', '15', '60', '66', '69', '72', '78']);

const topology = statesTopology as unknown as Topology<{ states: GeometryCollection }>;
const allStates = feature(topology, topology.objects.states);
const conusStates = {
	...allStates,
	features: allStates.features.filter((f) => !EXCLUDED_FIPS.has(String(f.id)))
};

let cachedProjection: GeoProjection | undefined;

function getProjection(): GeoProjection {
	if (!cachedProjection) {
		cachedProjection = geoAlbers().fitSize([MAP_WIDTH, MAP_HEIGHT], conusStates);
	}
	return cachedProjection;
}

let cachedStatePaths: string[] | undefined;

export function getConusStatePaths(): string[] {
	if (!cachedStatePaths) {
		const path = geoPath(getProjection());
		cachedStatePaths = conusStates.features
			.map((f) => path(f))
			.filter((d): d is string => d !== null);
	}
	return cachedStatePaths;
}

export function projectPoint(lon: number, lat: number): [number, number] | null {
	return getProjection()([lon, lat]);
}
