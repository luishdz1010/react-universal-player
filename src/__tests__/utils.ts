import { queries as defaultQueries, render as testingLibRender, RenderOptions, wait } from '@testing-library/react'
import { ReactElement, RefObject } from 'react'
import { renderToString } from 'react-dom/server'

const customQueries = {}

const queries = { ...defaultQueries, ...customQueries }

export const render = (ui: ReactElement, options?: RenderOptions<typeof queries>) =>
  testingLibRender<typeof queries>(ui, { queries, ...options })

export const universalRender = (element: ReactElement) => {
  if (typeof window !== 'undefined') {
    const { asFragment } = render(element)

    return {
      asSnapshot() {
        return asFragment()
      },
    }
  }

  const rendered = renderToString(element)

  return {
    asSnapshot() {
      return rendered
    },
  }
}

export const waitForRef = async <T>(ref: RefObject<T | null>): Promise<T> => {
  await wait(() => {
    if (!ref.current) throw new Error('ref was never set')
  })

  return ref.current!
}

export const waitForResult = async <T>(callback: () => T | null | undefined): Promise<T> => {
  let ret: T | undefined

  await wait(
    () => {
      const t = callback()
      if (t === undefined || t === null) throw new Error('waitForResult: empty result')
      ret = t
    },
    { timeout: 3000 }
  )

  return ret!
}
