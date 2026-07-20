<script lang="ts">
	import type { ProjectedMapPoint } from '$lib/fareCsv';

	// Purely presentational: all projection math (d3-geo, topojson-client, the state
	// topology) happens server-side in $lib/server/usMap, so none of it ships to the
	// client bundle. This component only draws pre-computed paths and coordinates.
	let {
		statePaths,
		points,
		width,
		height
	}: { statePaths: string[]; points: ProjectedMapPoint[]; width: number; height: number } =
		$props();

	let destination = $derived(points.find((p) => p.role === 'destination'));
	let origins = $derived(points.filter((p) => p.role === 'origin'));
</script>

<svg
	viewBox="0 0 {width} {height}"
	role="img"
	aria-label="Origin airports and the meeting destination on a map of the continental United States"
>
	{#each statePaths as d, i (i)}
		<path {d} class="state" />
	{/each}

	{#if destination}
		{#each origins as origin (origin.code)}
			<line x1={origin.x} y1={origin.y} x2={destination.x} y2={destination.y} class="route" />
		{/each}
	{/if}

	{#each origins as origin (origin.code)}
		<circle cx={origin.x} cy={origin.y} r="4" class="origin" />
		<text x={origin.x + 6} y={origin.y - 6} class="label">{origin.code}</text>
	{/each}

	{#if destination}
		<circle cx={destination.x} cy={destination.y} r="6" class="destination" />
		<text x={destination.x + 8} y={destination.y - 8} class="label destination-label">
			{destination.code}
		</text>
	{/if}
</svg>

<style>
	svg {
		width: 100%;
		max-width: 40rem;
		height: auto;
		display: block;
	}

	.state {
		fill: #e2e8f0;
		stroke: #94a3b8;
		stroke-width: 0.5;
	}

	.route {
		stroke: #64748b;
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-dasharray: 0.1 5;
	}

	.origin {
		fill: #2563eb;
		stroke: #fff;
		stroke-width: 1;
	}

	.destination {
		fill: #dc2626;
		stroke: #fff;
		stroke-width: 1;
	}

	.label {
		font-size: 9px;
		fill: #1e293b;
		font-family: system-ui, sans-serif;
	}

	.destination-label {
		font-weight: 700;
	}
</style>
