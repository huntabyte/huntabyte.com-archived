import express from "express"
import { createServer } from "http"
import { handler } from "../build/handler.js"

const PORT = process.env.PORT
const app = express()

app.use(handler)

const server = createServer(app)

server.listen(PORT)
