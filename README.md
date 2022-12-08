# cantoo-client

This package will help you make your app compatible with Cantoo Scribe.

## Getting started

Add the package to your project:

`npm install cantoo@cantoo-client`

Alternatively, you can download the latest version [here](), but you will have to manually update it when needed.

Then, you will have to create a CantooClient instance:

```js
const CantooClient = require('cantoo@cantoo-client')
const cantoo = new CantooClient()
```

Now, here are the main instructions that you will have to handle:

---

## Cantoo Scribe API

The methods that you should call:

### loaded

When the app is ready, you must call this method.

```js
initMyApp().then(() => cantoo.loaded())
```

### changed

Cantoo Scribe needs to be aware when a change is available in your app. Call this method each time a change occurs that the user might want to save. Be aware that an internal debounce will happen to avoid flood, so don't worry about it.

```js
doSomethingThatWillUpdateTheState()
cantoo.updated()
```

### destroy

When you want to clear all listeners set and free the memory hold by the CantooClient object, call the `destroy()` method.

```js
cantoo.destroy()
```

---

## Cantoo Scribe requests handlers



### onDocumentRequest

Cantoo Scribe sometimes needs the current document. You need to register a listener to that event, and it should return a string containing the data you would need to recreate the document, and an image (svg or png) that can best represent the current work of the user.

```js
const generateDocument = async () => {
  return {
    doc: await gatherTheDataOfMyApp()
    svg: await generatePicture()
  }
}
cantoo.onDocumentRequest(generateDocument)
```

### onClearRequest

Cantoo Scribe might ask your app to clean up and be ready to generate a new document. Don't worry, the user would have had the chance to save the data if they needed to. There is nothing else to do but to clear the current document state.

```js
const clearAll = async () => {
  // Don't forget to await, or to return a promise so Cantoo Scribe knows when the document is ready
  await flush()
}
cantoo.onClearRequest(clearAll)
```

### onLoadDocumentRequest

Cantoo Scribe might ask your app to load a new document. You will receive, as a string, the document data you provided in the `onDocumentRequest` method. This is your responsability to maintain retro-compatibility of those data accross versions of your app.

```js
const loadDocument = async (data: string) => {
  // Don't forget to await, or to return a promise so Cantoo Scribe knows when the document is ready
  await loadTheDataInTheApp(data)
}
cantoo.onLoadDocumentRequest(loadDocument)
```

---

## Methods summary

### Cantoo Scribe API

| Method | Parameters | Return value | Description |
|:---|:---:|:---:|:---|
| loaded | `void` | `void` | Call this method when the app is ready and fully loaded |
| changed | `void` | `void` | Call this method each time your app state changed<br>and would now be represented by a different document.<br> This will be used to indicate the user that new data need saving |
| destroy | `void` | `void` | Call this method when you want to free the memory and remove the listeners |

### Cantoo Scribe Requests handlers

| Method | Event | Return value | Description |
|---|---|---|---|
| onDocumentRequest | `void` | <code>Promise<<br>&nbsp;&nbsp;&#124; { doc: string; svg: string }<br>&nbsp;&nbsp;&#124; { doc: string; png: string }<br>></code> | Cantoo Scribe needs to save the current document.<br>Provide a method that will return the data<br>you will need to reconstruct the current state of your app,<br>and an illustration for the user, as png or svg. |
| onClearRequest | `void` | `Promise<void>` | Cantoo Scribe wants to reset the document.<br>Provide a method that will clear the current state. |
| onLoadDocumentRequest | `void` | `Promise<void>` | Cantoo Scribe want to load the provided data into your app.<br> Provide a method that will take that data and load it. |
