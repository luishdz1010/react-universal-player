import { BasicScript } from 'script-loading-toolkit'

interface LoadScriptOptions {
  windowCallback?: string
}

let promises: { [url: string]: Promise<unknown> } | undefined

const loadScript = (url: string, opts?: LoadScriptOptions) => {
  if (!promises) promises = {}

  if (!Object.prototype.hasOwnProperty.call(promises, url)) {
    let promise

    const script = new BasicScript(url)

    const windowCallback = opts?.windowCallback
    if (windowCallback) {
      promise = new Promise((resolve, reject) => {
        // eslint-disable-next-line no-undef
        const w = window as any
        const prevCallback = w[windowCallback]

        w[windowCallback] = (...args: any[]) => {
          try {
            if (prevCallback) prevCallback(...args)
          } catch {
            //
          }
          resolve()
        }

        script.load().catch(reject)
      })
    } else {
      promise = script.load()
    }

    promises[url] = promise.finally(() => {
      if (promises) {
        delete promises[url]
        if (Object.keys(promises).length === 0) promises = undefined
      }
    })
  }

  return promises[url]
}

export default loadScript
