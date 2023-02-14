import fs from "fs"
import readline from "readline"

// takes in a filename and creates a markdown file with that name in the content/blog directory
export async function main() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	})

	rl.question("What is the name of your blog post? ", (title) => {
		const today = new Date()
		const date = today.toISOString().split("T")[0]

		// convert the filename to kebab case
		let filename = `${title.toLowerCase().split(" ").join("-")}.md`

		const path = `content/blog/${filename}`
		const content = `---
title: ${title}
description: 
date: ${date}
updated: ${date}

draft: true
unpublished: false
---
`
		fs.appendFile(path, content, function (err) {
			if (err) throw err
			console.log("Saved!")
		})
		rl.close()
	})
	// get todays date in YYYY-MM-DD format
}

main()
