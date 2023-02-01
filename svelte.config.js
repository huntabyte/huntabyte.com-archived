import preprocess from "svelte-preprocess"
import adapter from "@sveltejs/adapter-node"
import { vitePreprocess } from "@sveltejs/kit/vite"
// import cspDirectives from "./csp-directives.mjs"

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		vitePreprocess(),
		preprocess({
			postcss: true,
		}),
	],

	kit: {
		adapter: adapter(),
		// csp: {
		// 	mode: "hash",
		// 	directives: cspDirectives,
		// },
	},
}

export default config
