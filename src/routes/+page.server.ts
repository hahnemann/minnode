import { getAirportCodes, getFareGraph } from '$lib/server/fareGraph';
import { optimalMeetingPoint, rankDestinations } from '$lib/graph';
import type { PageServerLoad } from './$types';

const MAX_RANKED_RESULTS = 10;

export const load: PageServerLoad = ({ url }) => {
	const airportCodes = getAirportCodes();

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
			ranked: []
		};
	}

	const graph = getFareGraph();
	const validOrigins = requestedOrigins.filter((code) => graph.has(code));
	const invalidOrigins = Array.from(new Set(requestedOrigins.filter((code) => !graph.has(code))));

	if (validOrigins.length === 0) {
		return { airportCodes, requestedOrigins, validOrigins, invalidOrigins, best: null, ranked: [] };
	}

	const meetingPoint = optimalMeetingPoint(graph, validOrigins);
	const ranked = rankDestinations(graph, validOrigins).slice(0, MAX_RANKED_RESULTS);

	return {
		airportCodes,
		requestedOrigins,
		validOrigins,
		invalidOrigins,
		best: meetingPoint.destination ? meetingPoint : null,
		ranked
	};
};
