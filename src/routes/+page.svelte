<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let originsInput = $derived(data.requestedOrigins.join(', '));
</script>

<h1>minnode</h1>
<p>Find the airport that minimizes total City Pair airfare for a group of federal travelers.</p>

<form method="GET">
	<label for="origins">Origin airports (IATA codes, comma or space separated)</label>
	<input id="origins" name="origins" bind:value={originsInput} placeholder="MSP, DCA, LAX" />
	<button type="submit">Find meeting point</button>
</form>

{#if data.invalidOrigins.length > 0}
	<p class="warning">Unrecognized airport codes: {data.invalidOrigins.join(', ')}</p>
{/if}

{#if data.best}
	<section>
		<h2>Best meeting point: {data.best.destination}</h2>
		<p>Total cost: ${data.best.totalCost.toLocaleString()}</p>
		<ul>
			{#each data.validOrigins as origin, i (i)}
				<li>
					{origin} → {data.best.destination}: ${data.best.perOriginCost
						.get(origin)
						?.toLocaleString()}
				</li>
			{/each}
		</ul>
	</section>

	<section>
		<h2>Ranked destinations</h2>
		<table>
			<thead>
				<tr>
					<th>Rank</th>
					<th>Destination</th>
					<th>Total cost</th>
				</tr>
			</thead>
			<tbody>
				{#each data.ranked as candidate, i (candidate.destination)}
					<tr>
						<td>{i + 1}</td>
						<td>{candidate.destination}</td>
						<td>${candidate.totalCost.toLocaleString()}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>
{:else if data.validOrigins.length > 0}
	<p>No common destination is reachable from the given origins.</p>
{/if}

<style>
	form {
		display: flex;
		gap: 0.5rem;
		align-items: end;
		margin-block: 1rem;
	}

	label {
		display: block;
		font-size: 0.875rem;
	}

	.warning {
		color: #b45309;
	}

	table {
		border-collapse: collapse;
	}

	th,
	td {
		border: 1px solid #ccc;
		padding: 0.25rem 0.75rem;
		text-align: left;
	}
</style>
