import type { FareEdge } from './graph';

/**
 * Government coach fare (unrestricted). The fare-class choice among
 * `yca_fare` / `ca_fare` / `business_fare` / `cp_fare` is a modeling decision;
 * see docs/06-statistical-modeling.md.
 */
export const FARE_COLUMN = 'yca_fare';

/** Parses `data/processed/airport_pair_fares.csv` (see notebooks/prepare_data.ipynb) into fare edges. */
export function parseFareEdges(csv: string): FareEdge[] {
	const lines = csv.trim().split('\n');
	const header = lines[0].split(',');
	const originIdx = header.indexOf('origin');
	const destinationIdx = header.indexOf('destination');
	const fareIdx = header.indexOf(FARE_COLUMN);

	return lines.slice(1).map((line) => {
		const cols = line.split(',');
		return {
			origin: cols[originIdx],
			destination: cols[destinationIdx],
			fare: Number(cols[fareIdx])
		};
	});
}

export interface AirportCoordinate {
	lat: number;
	lon: number;
}

export interface MapPoint extends AirportCoordinate {
	code: string;
	role: 'origin' | 'destination';
}

/** A MapPoint after server-side projection to SVG pixel coordinates (see $lib/server/usMap). */
export interface ProjectedMapPoint {
	code: string;
	x: number;
	y: number;
	role: 'origin' | 'destination';
}

/** Airport code -> coordinates, read from the same CSV's origin/destination lat/lon columns. */
export function parseAirportCoordinates(csv: string): Map<string, AirportCoordinate> {
	const lines = csv.trim().split('\n');
	const header = lines[0].split(',');
	const idx = {
		origin: header.indexOf('origin'),
		originLat: header.indexOf('origin_lat'),
		originLon: header.indexOf('origin_lon'),
		destination: header.indexOf('destination'),
		destinationLat: header.indexOf('destination_lat'),
		destinationLon: header.indexOf('destination_lon')
	};

	const coordinates = new Map<string, AirportCoordinate>();
	for (const line of lines.slice(1)) {
		const cols = line.split(',');
		if (!coordinates.has(cols[idx.origin])) {
			coordinates.set(cols[idx.origin], {
				lat: Number(cols[idx.originLat]),
				lon: Number(cols[idx.originLon])
			});
		}
		if (!coordinates.has(cols[idx.destination])) {
			coordinates.set(cols[idx.destination], {
				lat: Number(cols[idx.destinationLat]),
				lon: Number(cols[idx.destinationLon])
			});
		}
	}

	return coordinates;
}
