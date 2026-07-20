/**
 * Airport-pair fare graph and shortest-path meeting-point optimization.
 *
 * Ported from `notebooks/prepare_data.ipynb` (Section 2: Algorithm Validation).
 * Edges are undirected: a fare between two airports applies in either direction.
 */

export interface FareEdge {
	origin: string;
	destination: string;
	fare: number;
}

export type FareGraph = Map<string, { node: string; fare: number }[]>;

export function buildGraph(edges: FareEdge[]): FareGraph {
	const graph: FareGraph = new Map();

	const addEdge = (from: string, to: string, fare: number) => {
		let neighbors = graph.get(from);
		if (!neighbors) {
			neighbors = [];
			graph.set(from, neighbors);
		}
		neighbors.push({ node: to, fare });
	};

	for (const { origin, destination, fare } of edges) {
		addEdge(origin, destination, fare);
		addEdge(destination, origin, fare);
	}

	return graph;
}

/** Binary min-heap keyed by priority, used for Dijkstra's frontier. */
class MinHeap<T> {
	private items: { priority: number; value: T }[] = [];

	get size(): number {
		return this.items.length;
	}

	push(priority: number, value: T): void {
		this.items.push({ priority, value });
		let i = this.items.length - 1;
		while (i > 0) {
			const parent = (i - 1) >> 1;
			if (this.items[parent].priority <= this.items[i].priority) break;
			[this.items[parent], this.items[i]] = [this.items[i], this.items[parent]];
			i = parent;
		}
	}

	pop(): { priority: number; value: T } | undefined {
		const top = this.items[0];
		const last = this.items.pop();
		if (top === undefined) return undefined;
		if (this.items.length > 0 && last !== undefined) {
			this.items[0] = last;
			let i = 0;
			const n = this.items.length;
			while (true) {
				const left = 2 * i + 1;
				const right = 2 * i + 2;
				let smallest = i;
				if (left < n && this.items[left].priority < this.items[smallest].priority) smallest = left;
				if (right < n && this.items[right].priority < this.items[smallest].priority)
					smallest = right;
				if (smallest === i) break;
				[this.items[smallest], this.items[i]] = [this.items[i], this.items[smallest]];
				i = smallest;
			}
		}
		return top;
	}
}

/** Shortest-path cost from `start` to every reachable node in `graph`. */
export function dijkstra(graph: FareGraph, start: string): Map<string, number> {
	const costs = new Map<string, number>();
	for (const node of graph.keys()) costs.set(node, Infinity);
	costs.set(start, 0);

	const queue = new MinHeap<string>();
	queue.push(0, start);

	while (queue.size > 0) {
		const current = queue.pop();
		if (!current) break;
		const { priority: currentCost, value: currentNode } = current;
		if (currentCost > (costs.get(currentNode) ?? Infinity)) continue;

		for (const { node: neighbor, fare } of graph.get(currentNode) ?? []) {
			const newCost = currentCost + fare;
			if (newCost < (costs.get(neighbor) ?? Infinity)) {
				costs.set(neighbor, newCost);
				queue.push(newCost, neighbor);
			}
		}
	}

	return costs;
}

export interface RankedDestination {
	destination: string;
	totalCost: number;
}

/** Every reachable destination ranked by total cost across all `origins`, cheapest first. */
export function rankDestinations(graph: FareGraph, origins: string[]): RankedDestination[] {
	if (origins.length === 0) {
		throw new Error('rankDestinations requires at least one origin');
	}

	const costMaps = new Map(origins.map((origin) => [origin, dijkstra(graph, origin)]));

	const ranked: RankedDestination[] = [];
	for (const candidate of graph.keys()) {
		let total = 0;
		for (const origin of origins) {
			total += costMaps.get(origin)?.get(candidate) ?? Infinity;
		}
		if (Number.isFinite(total)) {
			ranked.push({ destination: candidate, totalCost: total });
		}
	}

	ranked.sort((a, b) => a.totalCost - b.totalCost);
	return ranked;
}

export interface MeetingPointResult {
	destination: string | null;
	totalCost: number;
	perOriginCost: Map<string, number>;
}

/** The single cheapest meeting destination for `origins`, with the per-origin cost breakdown. */
export function optimalMeetingPoint(graph: FareGraph, origins: string[]): MeetingPointResult {
	const ranked = rankDestinations(graph, origins);
	if (ranked.length === 0) {
		return { destination: null, totalCost: Infinity, perOriginCost: new Map() };
	}

	const { destination, totalCost } = ranked[0];
	const costMaps = new Map(origins.map((origin) => [origin, dijkstra(graph, origin)]));
	const perOriginCost = new Map(
		origins.map((origin) => [origin, costMaps.get(origin)?.get(destination) ?? Infinity])
	);

	return { destination, totalCost, perOriginCost };
}
