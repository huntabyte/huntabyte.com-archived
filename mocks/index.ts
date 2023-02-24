import { rest } from "msw"
import { setupServer } from "msw/node"
import { githubHandlers } from "./github"

const server = setupServer(...githubHandlers)

server.listen({ onUnhandledRequest: "warn" })
console.info("Mock server running")

process.once("SIGINT", () => server.close())
process.once("SIGTERM", () => server.close())
