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
