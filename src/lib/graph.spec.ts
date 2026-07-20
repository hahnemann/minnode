import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { buildGraph, dijkstra, optimalMeetingPoint, rankDestinations } from './graph';
import { parseFareEdges } from './fareCsv';

describe('dijkstra', () => {
	// A -1- B -1- C, and A -10- C directly. Shortest A->C is via B (cost 2), not the direct edge (cost 10).
	const graph = buildGraph([
		{ origin: 'A', destination: 'B', fare: 1 },
		{ origin: 'B', destination: 'C', fare: 1 },
		{ origin: 'A', destination: 'C', fare: 10 }
	]);

	it('finds the shortest cost via an indirect path over a cheaper direct edge', () => {
		const costs = dijkstra(graph, 'A');
		expect(costs.get('C')).toBe(2);
	});

	it('assigns zero cost to the start node', () => {
		expect(dijkstra(graph, 'A').get('A')).toBe(0);
	});

	it('leaves unreachable nodes at infinite cost', () => {
		const isolated = buildGraph([{ origin: 'X', destination: 'Y', fare: 5 }]);
		const costs = dijkstra(isolated, 'X');
		expect(costs.get('Y')).toBe(5);
		expect(
			dijkstra(buildGraph([{ origin: 'A', destination: 'B', fare: 1 }]), 'A').get('Z')
		).toBeUndefined();
	});
});

describe('rankDestinations', () => {
	// Three origins (P, Q, S) meet at hub M. With only two origins, every node on the
	// direct path between them ties in total cost (a property of 1-median on a tree path) —
	// a third origin off that path is what makes M a strict, untied winner.
	// X-Y is a separate component, entirely disconnected from the P/Q/S/M component.
	const graph = buildGraph([
		{ origin: 'P', destination: 'M', fare: 3 },
		{ origin: 'Q', destination: 'M', fare: 4 },
		{ origin: 'S', destination: 'M', fare: 5 },
		{ origin: 'X', destination: 'Y', fare: 1 }
	]);

	it('ranks reachable destinations cheapest first', () => {
		const ranked = rankDestinations(graph, ['P', 'Q', 'S']);
		expect(ranked[0]).toEqual({ destination: 'M', totalCost: 12 });
	});

	it('excludes destinations unreachable from any origin', () => {
		const ranked = rankDestinations(graph, ['P', 'Q', 'S']);
		expect(ranked.find((r) => r.destination === 'X' || r.destination === 'Y')).toBeUndefined();
	});

	it('throws when given no origins', () => {
		expect(() => rankDestinations(graph, [])).toThrow();
	});
});

describe('optimalMeetingPoint', () => {
	const graph = buildGraph([
		{ origin: 'P', destination: 'M', fare: 3 },
		{ origin: 'Q', destination: 'M', fare: 4 },
		{ origin: 'S', destination: 'M', fare: 5 }
	]);

	it('returns the cheapest destination with its per-origin cost breakdown', () => {
		const result = optimalMeetingPoint(graph, ['P', 'Q', 'S']);
		expect(result.destination).toBe('M');
		expect(result.totalCost).toBe(12);
		expect(result.perOriginCost.get('P')).toBe(3);
		expect(result.perOriginCost.get('Q')).toBe(4);
		expect(result.perOriginCost.get('S')).toBe(5);
	});

	it('returns a null destination when no common destination is reachable', () => {
		const disconnected = buildGraph([
			{ origin: 'P', destination: 'M', fare: 1 },
			{ origin: 'Q', destination: 'N', fare: 1 }
		]);
		const result = optimalMeetingPoint(disconnected, ['P', 'Q']);
		expect(result.destination).toBeNull();
	});

	it('weights the total by how many times an origin appears (two travelers from the same airport count twice)', () => {
		// Two travelers from P, one from Q: meeting at P (cost 0+0+7=7) beats meeting
		// at hub M (cost 3+3+4=10), since the majority origin pulls the optimum toward it.
		const result = optimalMeetingPoint(graph, ['P', 'P', 'Q']);
		expect(result.destination).toBe('P');
		expect(result.totalCost).toBe(7);
	});
});

describe('optimalMeetingPoint against real City Pair data', () => {
	// Validates the TypeScript port against notebooks/prepare_data.ipynb, whose Section 2
	// computed this exact result independently in Python against the same processed CSV.
	function loadCsv(): string {
		const csvPath = fileURLToPath(
			new URL('../../data/processed/airport_pair_fares.csv', import.meta.url)
		);
		return readFileSync(csvPath, 'utf-8');
	}

	it('matches the notebook-validated result for MSP, DCA, LAX', () => {
		const graph = buildGraph(parseFareEdges(loadCsv()));
		const result = optimalMeetingPoint(graph, ['MSP', 'DCA', 'LAX']);

		expect(result.destination).toBe('ORD');
		expect(result.totalCost).toBe(352);
		expect(result.perOriginCost.get('MSP')).toBe(89);
		expect(result.perOriginCost.get('DCA')).toBe(114);
		expect(result.perOriginCost.get('LAX')).toBe(149);
	});
});
