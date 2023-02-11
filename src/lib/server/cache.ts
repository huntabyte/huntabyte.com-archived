import fs from "fs"
import type { Cache as CachifiedCache } from "cachified"
import Database from "better-sqlite3"
import type BetterSqlite3 from "better-sqlite3"
import { env } from "$env/dynamic/private"
import { logger } from "$lib/logger"

declare global {
	var __cacheDb: ReturnType<typeof Database> | undefined
}

export const cacheDb = global.__cacheDb ? global.__cacheDb : createDatabase()

// Create the database if it doesn't exist
function createDatabase(retry = true): BetterSqlite3.Database {
	logger.info("Creating new database")
	const db = new Database(env.CACHE_DB_PATH)

	try {
		db.exec(`CREATE TABLE IF NOT EXISTS cache (
            key TEXT PRIMARY KEY,
            metadata TEXT,
            value TEXT
        )`)
		logger.info("Successfully created cache database")
	} catch (e: unknown) {
		fs.unlinkSync(env.CACHE_DB_PATH)
		if (retry) {
			logger.error(
				`Error creating cache database. Deleting ${env.CACHE_DB_PATH} and retrying.`,
			)
			return createDatabase(false)
		}
		throw e
	}
	return db
}

// Cache interface
export const cache: CachifiedCache = {
	name: "SQLite Cache",
	get(key) {
		logger.debug(`Getting key: ${key} from cache.`)
		const result = cacheDb
			.prepare("SELECT value, metadata FROM cache WHERE key = ?")
			.get(key)
		if (!result) return null
		const entry = {
			metadata: JSON.parse(result.metadata),
			value: JSON.parse(result.value),
		}
		if (!entry.metadata) {
			logger.error(`entry.metadata is null for ${key}`, { entry, result })
		}
		return entry
	},
	set(key, entry) {
		logger.debug(`Setting key: ${key} with entry: ${entry} to cache.`)
		if (!entry.metadata) {
			logger.error(
				`Someone's trying to set entry.metadata to null for "${key}"`,
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
		logger.debug(`Deleting ${key} from cache.`)
		cacheDb.prepare("DELETE FROM cache WHERE key = ?").run(key)
	},
}
