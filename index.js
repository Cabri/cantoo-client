// @ts-check
/** @typedef {{ doc: string } & ({ svg: string } | { png: string })} CantooDocumentData */

module.exports = class CantooClient {

  /** @type {() => void} */
  _postMessageListener

  /** @type {() => Promise<CantooDocumentData>} */
  _onDocumentRequestListener

  /** @type {() => Promise<void>} */
  _onClearRequestListener

  /** @type {(data: string) => Promise<void>} **/
  _onLoadDocumentRequestListener

  constructor() {
    this.postMessageListener = () => {
      window.addEventListener('message', (event) => {
        if (!event.origin || !event.origin.replace(/https:\/\/(develop.|preprod.)?/g, '').startsWith("cantoo.fr")) return
        if (!event.data || !event.data.name) console.error(new Error('Malformed message from Cantoo.\n' + event.data))
        const name = event.data.name
        /** @type {Promise<unknown>} */
        let promise
        if (name === 'openDocument') promise = this._onLoadDocumentRequestListener(event.data.doc)
        else if (name === 'wantDocument') promise = this._onDocumentRequestListener()
        else if (name === 'clear') promise = this._onClearRequestListener()
        else return console.error(new Error(`We received unknown ${name} event from ${event.origin}`))
        if (event.source) {
          const source = event.source
          promise.then(result => source.postMessage({ name: 'done', source: event.data, result }))
        }
      }, false);
    }
  }

  /**
   * Register a listener that will generate the document and the illustration of the current app state
   * when Cantoo Scribe needs it. The listener should return an object with the document and the image.
   * @param {() => Promise<CantooDocumentData>} listener 
   */
  onDocumentRequest(listener) {
    this._onDocumentRequestListener = listener
  }

  /**
   * Register a listener that will clear the current app state and prepare a new empty one. It should
   * resolve when the new document is ready.
   * @param {() => Promise<void>} listener 
   */
  onClearRequest(listener) {
    this._onClearRequestListener = listener
  }

  /**
   * Register a listener that will load a document in the app. The data will be of the same type as what
   * was provided by the documentRequest listener. It should resolve when the document is fully loaded.
   * @param {(data: string) => Promise<void>} listener 
   */
  onLoadDocumentRequest(listener) {
    this._onLoadDocumentRequestListener = listener
  }

  /**
   * Free up the memory and remove the listeners set on the window object
   */
  destroy() {
    window.removeEventListener('message', this.postMessageListener)
    window.postMessage({ name: 'destroyed' })
  }

  /**
   * Call this whenever a change happened in the app state that the user might want to save
   */
  changed() {
    window.postMessage({ name: 'documentChange' })
  }

  /**
   * Call this method when your app is fully loaded
   */
  loaded() {
    window.postMessage({ name: 'loaded' })
  }

}