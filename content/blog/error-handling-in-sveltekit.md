---
title: Error Handling in SvelteKit
description: Considering that errors are every developers favorite thing to deal with, let's learn how to handle errors in SvelteKit & Sentry.
date: 2023-02-12
updated: 2023-02-12

draft: true
unpublished: false
---

Considering that errors are every developers favorite thing to handle, let's learn how to handle errors in SvelteKit.

We'll start by going over the two types of errors that SvelteKit recognizes, and then we'll dive a bit deeper into how we can handle each.

I also decided to add a bit of extra fun at the end where we'll use Sentry to monitor exceptions that occur within our app.

If you prefer to watch a video, you can check out the video version of this post here: [Error Handling in SvelteKit](https://youtu.be/UJ3JtNIifR8).

## Two Types of Errors
SvelteKit recognizes two types of errors: ***Expected*** and ***Unexpected***.

### Expected Errors
Expected errors are ones that you create with the `error` helper that SvelteKit provides.

```ts
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = () => {
    throw error(404, 'Not found!')
}
```
It's expected because you're explicitly telling SvelteKit that you want to throw an error.

For example, let's say we have a user profile page with a `[username]` route param. If someone tries to access the profile of a user that doesn't exist, we can throw a 404 error.

```ts title="src/routes/[username]/+page.server.**ts**"

import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { getUser } from '$lib/users'

export const load: PageServerLoad = async ({ params }) => {
    const { username } = params
    const user = await getUser(username)

    if (!user) {
        throw error(404, 'User not found')
    }

    return {
        user
    }
}
```

Alternatively, we can add additional metadata to the error object that we throw.

```ts
throw error(404, { message: 'User not found', code: 'NOT_FOUND' })
```

However, if we decide to add additional properties to the error object that we throw, we'll need to add type defintions for those properties.

```ts title="src/app.d.ts"
declare global {
	namespace App {
		interface Error {
            code?: string;
        }
	}
}
```
Now when this error is throw, SvelteKit will take the error we just defined, apply it to the `page` store's error object, and render the nearest error boundary.

We'll cover error boundaries in a bit, but for now, let's take a look at **Unexpected** errors.

### Unexpected Errors
Unexpected errors are any other exceptions that occur while handling a request.

These could possibly be thrown by some 3rd party package you're using, and you didn't expect it to throw an error. Or maybe you forgot to handle a case in your code, and it threw an error.

Regardless, since the information these errors provide is out of your control, SvelteKit throws a generic error object with a status of 500 and message of "Internal Error".

The reason for this is that the error message may contain sensitive information that you don't want to expose to the user, but the original error message is still available in the server logs.

So now that you have an understanding of the two types of errors that SvelteKit recognizes, let's take a look at how we can handle them more gracefully, using error boundaries/pages.

## Error Pages & Boundaries

### Customizing the Default Error Page
By default, when an error occurs, SvelteKit renders a default error page, which displays the status code and message.

We can customize the appearance of this page by creating a `+error.svelte` file at the top of the *routes* directly.

```html title="src/routes/+error.svelte"
<script lang="ts">
    import { page } from '$app/stores'
</script>

{#if page.error.status === 404}
    <h1>Page not found</h1>
{:else}
    <h1>Oops! Something went wrong</h1>
{/if}
```

In this example, we're using the `page` store to access the error object, and then we're using the status code to determine what to display to the user.

### Error Boundaries
We now know that when an error occurs, SvelteKit will render the nearest error boundary, and you can think of an error boundary as a blast radius of the error, or how much of our app the error impacts.

For example, let's say that we have a standard layout that includes a navbar and a container for our page content.

{% img src="https://res.cloudinary.com/dgytdtcft/image/upload/v1677283513/error-boundary.png" alt="Diagram demonstrating an error boundary" %}

If an error occurs within the page, our layout will remain in tact. So the purple box here is the error boundary.

## Other Error Scenarios
There are a few different scenarios where the error pages aren't rendered as you might expect them to be.

### Root Layout Load Errors
If you recall from the example above, the root `+error` page is rendered *inside* of the root layout. Therefore, if an error occurs within the root layout's `load` function, the error page will not be rendered.

Instead, SvelteKit renders what is called a "fallback page", which is a generic error page that displays the status code and message.

If you're anything like me, you've probably seen this fallback page a time or two while failing to execute a simple fetch request inside your root layout's `load` function.

Well we can also customize this page, by creating an `error.html` file within the `src` directly.

This is the example that SvelteKit provides us with to customize this page:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>%sveltekit.error.message%</title>
  </head>
  <body>
    <h1>My custom error page</h1>
    <p>Status: %sveltekit.status%</p>
    <p>Message: %sveltekit.error.message%</p>
  </body>
</html>
```

### Non-Root Layout Errors
If an error occurs within a non-root layout, SvelteKit will walk up the tree until it finds the nearest `+error` page, and then render that page.

The `+error` page *beside* the layout that the error occurred in will not be rendered. This is again due to the fact that the error page is rendered *inside* of the layout.

### Endpoint & Handle Hook Errors
If an error occurs within an endpoint or handle hook, SvelteKit will render the fallback/error.html page we just discussed. 

However, if the request's `Accept` header is set to `application/json`, then SvelteKit will return a JSON response with the status code and message.


## HandleError Hooks
At the beginning of this article, we went over how SvelteKit handles ***unexpected*** errors, by rendering a generic error page with a status of 500 and message of "Internal Error".

But ideally, we'd like to know when these errors occur, so we can fix them. That's where the `handleError` hook comes in.

The `handleError` hook is a function that is called whenever an unexpected error occurs within our app. It receives the error object and request event as parameters, and we can use it to log the error to a service like Sentry.

We can add the `handleError` hook to both the client and server, by adding it to the `hooks.server.ts` & `hooks.client.ts` files.

```ts title="src/hooks.server.ts"
import type { HandleServerError } from '@sveltejs/kit'

export const handleError: HandleServerError = async ({ error, event }) => {}
```

```ts title="src/hooks.client.ts"
import type { HandleClientError } from '@sveltejs/kit'

export const handleError: HandleClientError = async ({ error, event }) => {}
```

## Monitoring Errors with Sentry

### Creating A Sentry Project
To start logging our exceptions to Sentry, we'll need to first create a new project in Sentry. Sentry recommends creating a new project for each environment, but I'll just create one for brevity.

![Sentry Project](/images/sentry-project.png)

We'll also want to copy the DSN, which we'll need to configure Sentry in our app.


### Installing Sentry Packages
Once we've created our project, we'll need to install the `@sentry/node` and `@sentry/svelte` packages. Node will be for our server-side, and Svelte will be for our client-side.

```bash
npm install @sentry/node @sentry/svelte
```

### Configuring Sentry
Now that those packages are installed, we are ready to initialize Sentry in both the `hooks.server.ts` and `hooks.client.ts` files.

```ts title="src/hooks.server.ts"
import * as SentryNode from '@sentry/node'
import crypto from 'crypto'
import type { HandleServerError } from '@sveltejs/kit'

const SENTRY_DSN = '<DSN_HERE>'

SentryNode.init({
    dsn: SENTRY_DSN,
})

export const handleError: HandleServerError = ({ error, event }) => {
    const errorId = crypto.randomUUID()
    SentryNode.captureException(error, {
        contexts: {
            sveltekit: {
                event,
                errorId
            }
        },
    })

    return {
        message: "An unexpected error occurred. We're investigating it.",
        errorId
    }
}
```

```ts title="src/hooks.client.ts"
import * as SentryNode from '@sentry/node'
import type { HandleClientError } from '@sveltejs/kit'

const SENTRY_DSN = '<DSN_HERE>'

SentryNode.init({
    dsn: SENTRY_DSN,
})

export const handleError: HandleClientError = ({ error, event }) => {
    const errorId = crypto.randomUUID()
    SentryNode.captureException(error, {
        contexts: {
            sveltekit: {
                event,
                errorId
            }
        },
    })

    return {
        message: "An unexpected error occurred. We're investigating it.",
        errorId
    }
}
```

The reason we're generating a random `errorId` and returning it from these functions, is so that we can provide the user with a unique identifier. This way, if they contact us about the error, we can easily find it in Sentry.

### Testing Sentry
