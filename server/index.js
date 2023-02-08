import express from "express"
import { createServer } from "http"
import { handler } from "../build/handler.js"

const port = 8081
const app = express()
const server = createServer(app)

app.use(handler)

server.listen(port)
