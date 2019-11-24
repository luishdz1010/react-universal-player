import { DependencyList, useEffect, useState } from 'react'
import { useLastValueRef } from './util'

interface UseCreatePlayerParams<T> {
  shouldExist: boolean
  create: () => T | [Promise<T | null>, (() => void) | undefined]
  destroy: (player: T) => void
  onError: { current: { onError: (err: Error) => void } }
}

const useCreatePlayer = <T>(
  { shouldExist, create: c, destroy, onError }: UseCreatePlayerParams<T>,
  deps: DependencyList = []
): T | null => {
  const [player, setPlayer] = useState<T | null>(null)
  const create = useLastValueRef(c)

  useEffect(() => {
    let stale = false
    let thePlayer: T | null = null
    let runOnStale: undefined | (() => void)

    if (shouldExist) {
      const onPlayerCreated = (p: T) => {
        if (!stale) {
          thePlayer = p
          setPlayer(thePlayer)
        } else {
          destroy(p)
        }
      }

      const onPlayerError = (err: Error) => {
        if (!stale) {
          onError.current.onError(err)
          setPlayer(null)
        }
      }

      try {
        const createHandleRet = create.current()

        if (Array.isArray(createHandleRet)) {
          const [createPromise, onStale] = createHandleRet

          runOnStale = onStale

          createPromise
            .then((maybePlayer) => {
              runOnStale = undefined
              if (maybePlayer) onPlayerCreated(maybePlayer)
            })
            .catch((e) => {
              runOnStale = undefined
              onPlayerError(e)
            })
        } else {
          onPlayerCreated(createHandleRet)
        }
      } catch (e) {
        onPlayerError(e)
      }
    }

    return () => {
      stale = true

      if (runOnStale) runOnStale()

      if (thePlayer) {
        destroy(thePlayer)
        setPlayer(null)
      }
    }
  }, [
    shouldExist,
    create,
    destroy,
    onError,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...deps,
  ])

  return shouldExist ? player : null
}

export default useCreatePlayer
