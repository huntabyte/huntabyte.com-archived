import express from "express"
import { createServer } from "http"
import { handler } from "../build/handler.js"
const port = 8081
const app = express()
const server = createServer(app)

app.use((req, res, next) => {
	if (req.query.region) {
		console.log("Requested region:", req.query.region)
		res.setHeader("fly-replay", `region=${req.query.region}`)
	} else {
		res.removeHeader("fly-replay")
	}
	next()
})

app.use(handler)

server.listen(port)
