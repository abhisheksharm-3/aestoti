// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { Models } from "node-appwrite";
declare global {
	namespace App {
		interface Locals {
			user: Models.User<Models.Preferences> | undefined;
		  }
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
