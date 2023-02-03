import fs from "fs"
import type { Cache as CachifiedCache } from "cachified"
import Database from "better-sqlite3"
import type BetterSqlite3 from "better-sqlite3"
import { env } from "$env/dynamic/private"

declare global {
	var __cacheDb: ReturnType<typeof Database> | undefined
}

const cacheDb = global.__cacheDb ? global.__cacheDb : createDatabase()

function createDatabase(retry = true): BetterSqlite3.Database {
	const db = new Database(env.CACHE_DB_PATH)

	try {
		db.exec(`CREATE TABLE IF NOT EXISTS cache (
            key TEXT PRIMARY KEY,
            metadata TEXT,
            value TEXT
        )`)
	} catch (e: unknown) {
		fs.unlinkSync(env.CACHE_DB_PATH)
		if (retry) {
			console.error(
				`Error creating cache database. Deleting ${env.CACHE_DB_PATH} and retrying.`,
			)
			return createDatabase(false)
		}
		throw e
	}
	return db
}

export const cache: CachifiedCache = {
	name: "SQLite Cache",
	get(key) {
		const result = cacheDb
			.prepare("SELECT value, metadata FROM cache WHERE key = ?")
			.get(key)
		if (!result) return null
		const entry = {
			metadata: JSON.parse(result.metadata),
			value: JSON.parse(result.value),
		}
		if (!entry.metadata) {
			console.error(`entry.metadata is null for ${key}`, { entry, result })
		}
		return entry
	},
	set(key, entry) {
		if (!entry.metadata) {
			console.error(
				new Error(
					`Someone's trying to set entry.metadata to null for "${key}"`,
				),
				{ entry },
			)
			return
		}
		cacheDb
			.prepare(
				"INSERT OR REPLACE INTO cache (key, value, metadata) VALUES (@key, @value, @metadata)",
			)
			.run({
				key,
				value: JSON.stringify(entry.value),
				metadata: JSON.stringify(entry.metadata),
			})
	},
	delete(key) {
		cacheDb.prepare("DELETE FROM cache WHERE key = ?").run(key)
	},
}
