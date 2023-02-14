---
title: "New SvelteKit Feature: Snapshots"
description: A new feature was recently added to SvelteKit to enable the preservation of DOM state when navigating away from a page. Let's take a look at how to use it.
date: 2023-02-13
updated: 2023-02-13

draft: false
unpublished: false
---

We've all been there. You've just finished filling out an annoyingly long form. Because you always read the terms and conditions, you click a link to read them. But wait, the link didn't open in a new tab. Instead, you've lost all your form data and have to start over.

SvelteKit's latest feature, Snapshots, solve this exact problem.

If you prefer to watch a video, you can check out the video version of this post here: [SvelteKit Snapshots](https://youtu.be/UJ3JtNIifR8).
## What are Snapshots?
Snapshots are a way to preserve some ephemeral DOM state when a user navigates away from a page.

This is useful for preserving the state of a form, for example, so that when the user navigates back to the page, the form is in the same state as when they left it.

If you're like me and didn't pay attention in English class, ephemeral means "lasting for a short period", so snapshots should not be viewed as a long-term storage solution for your app's state.


## How do I use Snapshots?
### Identifying Data to Preserve
To use snapshots, we first need to identify which data we want to preserve.

Let's say we have the following form:

```html
<form>
    <input type="text" name="firstName" />
    <input type="text" name="lastName" />
    <input type="email" name="email" />
    <button type="submit">Submit</button>
</form>
```

We can preserve the state of this form by defining an object with properties that match the input names, like so:

```html
<script lang="ts">
    let formValues = {
        firstName: '',
        lastName: '',
        email: ''
    }
</script>

<form>
    <input type="text" name="firstName" />
    <input type="text" name="lastName" />
    <input type="email" name="email" />
    <button type="submit">Submit</button>
</form>
```

Then, we can bind the values of the inputs to the properties of the `formValues` object:

```html
<script lang="ts">
    let formValues = {
        firstName: '',
        lastName: '',
        email: ''
    }
</script>

<form>
    <input type="text" name="firstName" bind:value={formValues.firstName} />
    <input type="text" name="lastName" bind:value={formValues.lastName} />
    <input type="email" name="email" bind:value={formValues.email} />
</form>
```
Now, whenever we type into the inputs, the values of the `formValues` object will be updated. But what if we navigate away from the page? Currently, the values of the `formValues` object will be reset to their initial values. To preserve the state of the form, we need to use a snapshot.

### Snapshot Object
The SvelteKit `Snapshot` object looks like this:
```typescript
import type { Snapshot } from './$types'

export const snapshot: Snapshot = {
    create: () => 'some data',
    restore: (value) => 'some action'
}
```
The `create` function is called when the page is navigated away from. This data is stored in memory until a full page reload occurs. Then it is stored in the browser's `sessionStorage`. Because it's stored in `sessionStorage`, the data is only preserved for the current session and must be serializable to JSON.

The `restore` function is called when the page is navigated back to. The value returned from the `create` method is passed to the restore method.

### Using Snapshots
So how do we use snapshots to preserve the state of our form?

We can use the `create` function to return the values of the `formValues` object and the `restore` function to set the values of the `formValues` object to the values returned from the `create` function.

```html
<script lang="ts">
    import type { Snapshot } from './$types'

    let formValues = {
        firstName: '',
        lastName: '',
        email: ''
    }

    export const snapshot: Snapshot = {
        create: () => formValues,
        restore: (value) => (formValues = value)
    }
</script>
<!-- ...form... -->
```
Now, when we navigate away from the page, the values of the `formValues` object will be preserved. When we navigate back to the page, the values of the `formValues` object will be restored.

## Conclusion
Snapshots are a great way to preserve the state of your app's DOM. If you want to check the PR that added this feature, you can find it here: [#8710](https://github.com/sveltejs/kit/pull/8710).