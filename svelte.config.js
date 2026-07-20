import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		// adapter-node builds a standalone Node server, deployable via the Dockerfile
		// (see docs/08-deployment.md) to any container host, including internal/offline
		// networks — the app makes no external network requests at runtime.
		adapter: adapter()
	}
};

export default config;
