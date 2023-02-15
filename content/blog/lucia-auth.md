---
title: Lucia Auth with SvelteKit
description: Lucia Auth has quickly became one of my favorite libraries to use when rolling out authentication in my SvelteKit apps. Let's learn how to use it.
date: 2023-02-04
updated: 2023-02-04

draft: true
unpublished: false
---
If you've ever had the need or desire to implement authentication yourself, either because you wanted more control of the auth flow, or just because you can, you probably quickly realized that it can become quite the headache.

Especially when it comes to building the APIs necessary to manage sessions, oauth providers, securely storing passwords, and so on so forth.

Luckily, there are a few libraries out there that can help us out with this. One of my favorites is [Lucia Auth](https://lucia-auth.vercel.app).

I like to think of Lucia as a form of tylenol for rolling your own auth. It takes care of those headaches by providing APIs to handle authentication, but still gives you complete control over how they are used within your application.

In this post, we'll learn how to use Lucia Auth with SvelteKit. We'll be adding Lucia to a simple CRUD application that we built in a previous post using SvelteKit & Prisma. If you haven't read that post, don't worry, it's a very simple setup. Here's the link to the starting repo: [SvelteKit Prisma CRUD](https://github.com/huntabyte/sk-prisma-crud)

## The Mission
As the example app currently stands, anyone can add, edit, and delete articles.

Our goal is to add authentication and authorization to this app, so that only authenticated users can create articles, and only allow the creator of the article to edit or delete it.

We have simple register and login pages already setup, but none of the server-side logic is implemented yet.

## How Lucia Works
Before we dive into the code, I think it's important that you understand what is happening behind the scenes.

### Session-Based Authentication
Lucia uses session-based authentication, which is a method of authentication where the user's session is stored on the server and used to verify the their identity.

This means that when a user logs in, Lucia will create a session for them, and store it in a database. When the user makes a request to the server, Lucia will check the session cookie that is sent with the request, and if it's valid, it will allow the request to continue.

### Lucia's Data Models
Lucia has three core data models: ***Users***, ***Sessions***, and ***Keys***.

#### Users



#### Sessions



#### Keys



## Setup Lucia Auth
Let's start by installing the Lucia Auth packages required for our current stack.

```bash
pnpm i lucia-auth @lucia-auth/sveltekit @lucia-auth/adapter-prisma
```

Next, we'll need to add the necessary auth tables to our database schema, and if we checkout the [Lucia documentation](https://lucia-auth.vercel.app/learn/adapters/prisma), we can see that we need the following models in our prisma schema.

```prisma
model User {
    id        String      @id @unique
	username  String      @unique
	name      String
	session   Session[]
	Key       Key[]
}
```
This is our user model, which we can add our own custom columns to if we'd like, such as name, address, username, etc. In this case, we'll just add the `username` and `name` columns.

We'll be using `username` to login, and `name` to display the user's name in the app.

```prisma
model Session {
  id             String @id @unique
  user_id        String
  active_expires BigInt
  idle_expires   BigInt
  user           User   @relation(references: [id], fields: [user_id], onDelete: Cascade)

  @@index([user_id])
  @@map("session")
}
```
This is our session model, which is used to store the user's session data. We'll be using the `user_id` column to link the session to the user.

```prisma
model Key {
  id              String  @id @unique
  hashed_password String?
  user_id         String
  primary         Boolean
  user            User    @relation(references: [id], fields: [user_id], onDelete: Cascade)

  @@index([user_id])
  @@map("key")
}
```
This is our key model. I like to think of keys as auth strategies, or different ways in which a user can be authenticated. For example, a user could login with a username and password one day, and with GitHub the next, but would still be represented as the same User in our database.

We can then push these schema updates to our database with the following command.

```bash
npx prisma db push
```

Now that we have our database schema setup, we can start configuring Lucia.

## Initialize Lucia
Let's start by creating a new file in our `src/lib/server` directory called `lucia.ts`. This is where we'll initialize Lucia.

```ts
// lib/server/lucia.ts
import lucia from 'lucia-auth'
import prismaAdapter from '@lucia-auth/adapter-prisma'
import { dev } from '$app/environment'
import { prisma } from '$lib/server/prisma'

export const auth = lucia({
	adapter: prismaAdapter(prisma),
	env: dev ? "DEV" : "PROD",
	transformUserData: (userData) => {
		return {
			userId: userData.id,
			username: userData.username,
			name: userData.name
		}
	}
})

export type Auth = typeof auth
```
We're passing our `PrismaClient` into lucia's *prisma adapter*. `Dev` should be true if we are running in *development* mode, so if true we will set lucia's env to *"DEV"*, otherwise we'll set it to *"PROD"*.

*transformUserData* allows us to populate the user object that the *Lucia* functions return. By default, they only return the userId, so if we want to also return the username and name, for example, we'd need to add those here like so.

Now that we've initialized Lucia, we can start to integrate it with our SvelteKit app.

## Add Lucia to SvelteKit
Lucia provides a a function called `handleHooks` that we need to use, which sets some methods in our `locals`  and handles requests to Lucia's endpoints. In the most simple form, it looks like this:

```typescript
// hooks.server.ts
import { auth } from "$lib/server/lucia"
import { handleHooks } from "@lucia-auth/sveltekit"
import type { Handle } from "@sveltejs/kit"

export const handle: Handle = handleHooks(auth)
```

But typescript is yelling at us, and that's because this `handleHooks` function sets `locals` that we have yet to define in our `app.d.ts` file, so let's do that now. If you're not using typescript, you can skip this part entirely.

We first need to set `interface Locals` to the following, which are the three methods that the `handleHooks` function sets on our locals object.

```typescript
interface Locals {
	validate: import("@lucia-auth/sveltekit").Validate
	validateUser: import("@lucia-auth/sveltekit").ValidateUser
	setSession: import("@lucia-auth/sveltekit").SetSession
 }
```

While we're here, we might as well setup the *Lucia* namespace to get typesafety on our Lucia `auth` object.

```typescript
/// <reference types="lucia-auth" />
declare namespace Lucia {
	type Auth = import("$lib/server/lucia").Auth
	type UserAttributes = {
		username: string
		name: string
	}
}
```

The entire `app.d.ts` file should look like this:
```typescript
// app.d.ts
import type { PrismaClient } from "@prisma/client"

declare global {
	namespace App {
        // interface Error {}
        interface Locals {
            validate: import("@lucia-auth/sveltekit").Validate
            validateUser: import("@lucia-auth/sveltekit").ValidateUser
            setSession: import("@lucia-auth/sveltekit").SetSession
        }
        // interface PageData {}
        // interface Platform {}
    }
    var __prisma: PrismaClient
    /// <reference types="lucia-auth" />
	declare namespace Lucia {
        type Auth = import("$lib/server/lucia").Auth
        type UserAttributes = {
            username: string
            name: string
        }
    }
}
export {}
```

Now when we check our `hooks.server.ts` file, we no longer have TypeScript errors, but you now might be wondering - "what if I want to add some other custom stuff to my hooks?". Well, we can take advantage of SvelteKit's `sequence` function, which allows us to pass multiple Handle functions that run in a sequence.

So what I like to do is set this up now so it is here when I need it. Just make sure that `handleHooks(auth)` comes before your custom handle.

```typescript
// hooks.server.ts
import { auth } from "$lib/server/lucia"
import { handleHooks } from "@lucia-auth/sveltekit"
import type { Handle } from "@sveltejs/kit"
import { sequence } from "@sveltejs/kit/hooks"

export const customHandle: Handle = async ({ resolve, event }) => {
    return resolve(event)
}

export const handle = sequence(handleHooks(auth), customHandle)
```

Now that we have our hook setup, let's add the registration functionality to our app.

We'll start in the `routes/register/+page.server.ts` file.

Logged in users shouldn't be able to register for an account, so lets add a check that redirects users with a valid session to the homepage. `locals.validate()` returns a Promise that resolves to either a *Session* or *null*. If session is *not* `null`, we will redirect them.

```typescript
// src/routes/register/+page.server.ts
export const load: PageServerLoad = async ({ locals }) => {
    const session = await locals.validate()
    if (session) {
        throw redirect(302, "/")
    }
}
```
Now let's setup the default *Action*, which will be to register new users.

We'll only need the request here, and we'll destructure the properties from the object we create from the Form Data. The `Record<string, string>` basically says that these will be key/value pairs, with both the key and the value being strings.

You should definitely validate this data using Zod prior to moving forward, but I won't because that's not the focus of this video. I do have a video covering Zod on my channel if you want to check that out.

Now we can open up a `try catch` block where we'll attempt to create the user, using *Lucia's* `auth` we created earlier. This function takes in an object, and we'll start with the key, which requires us to provide a *providerId, providerUserId,* and *password.*