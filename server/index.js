import express from "express"
import { createServer } from "http"
import { handler } from "../build/handler.js"

const port = process.env.NODE_ENV === "development" ? 5173 : process.env.PORT
const app = express()
const server = createServer(app)

app.use(handler)

server.listen(port)
