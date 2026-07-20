import { getAirportCodes, getAirportCoordinates, getFareGraph } from '$lib/server/fareGraph';
import { getConusStatePaths, projectPoint, MAP_WIDTH, MAP_HEIGHT } from '$lib/server/usMap';
import { optimalMeetingPoint, rankDestinations } from '$lib/graph';
import type { MapPoint, ProjectedMapPoint } from '$lib/fareCsv';
import type { PageServerLoad } from './$types';

const MAX_RANKED_RESULTS = 10;

function projectMapPoints(points: MapPoint[]): ProjectedMapPoint[] {
	return points.flatMap((point) => {
		const projected = projectPoint(point.lon, point.lat);
		return projected
			? [{ code: point.code, x: projected[0], y: projected[1], role: point.role }]
			: [];
	});
}

export const load: PageServerLoad = ({ url }) => {
	const airportCodes = getAirportCodes();
	const mapStatePaths = getConusStatePaths();

	// Origins are a multiset, not a set: two travelers from the same airport are two
	// fares, so duplicates are preserved and each occurrence counts toward the total.
	const requestedOrigins = (url.searchParams.get('origins') ?? '')
		.split(/[,\s]+/)
		.map((code) => code.trim().toUpperCase())
		.filter((code) => code.length > 0);

	if (requestedOrigins.length === 0) {
		return {
			airportCodes,
			requestedOrigins,
			validOrigins: [],
			invalidOrigins: [],
			best: null,
			ranked: [],
			mapPoints: [] as ProjectedMapPoint[],
			mapStatePaths,
			mapWidth: MAP_WIDTH,
			mapHeight: MAP_HEIGHT
		};
	}

	const graph = getFareGraph();
	const validOrigins = requestedOrigins.filter((code) => graph.has(code));
	const invalidOrigins = Array.from(new Set(requestedOrigins.filter((code) => !graph.has(code))));

	if (validOrigins.length === 0) {
		return {
			airportCodes,
			requestedOrigins,
			validOrigins,
			invalidOrigins,
			best: null,
			ranked: [],
			mapPoints: [] as ProjectedMapPoint[],
			mapStatePaths,
			mapWidth: MAP_WIDTH,
			mapHeight: MAP_HEIGHT
		};
	}

	const meetingPoint = optimalMeetingPoint(graph, validOrigins);
	const ranked = rankDestinations(graph, validOrigins).slice(0, MAX_RANKED_RESULTS);

	const rawMapPoints: MapPoint[] = [];
	if (meetingPoint.destination) {
		const coordinates = getAirportCoordinates();
		const uniqueOrigins = Array.from(new Set(validOrigins)).filter(
			(code) => code !== meetingPoint.destination
		);
		for (const code of uniqueOrigins) {
			const coord = coordinates.get(code);
			if (coord) rawMapPoints.push({ code, ...coord, role: 'origin' });
		}
		const destinationCoord = coordinates.get(meetingPoint.destination);
		if (destinationCoord) {
			rawMapPoints.push({
				code: meetingPoint.destination,
				...destinationCoord,
				role: 'destination'
			});
		}
	}

	return {
		airportCodes,
		requestedOrigins,
		validOrigins,
		invalidOrigins,
		best: meetingPoint.destination ? meetingPoint : null,
		ranked,
		mapPoints: projectMapPoints(rawMapPoints),
		mapStatePaths,
		mapWidth: MAP_WIDTH,
		mapHeight: MAP_HEIGHT
	};
};
