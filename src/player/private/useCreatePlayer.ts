import { DependencyList, useEffect, useState } from 'react'

interface UseCreatePlayerParams<T> {
  create: () => T | null | Promise<T | null>
  onError: (err: { error: Error }) => void
}

const useCreatePlayer = <T extends { destroy(): void }>(
  getParams: () => UseCreatePlayerParams<T>,
  deps: DependencyList = []
): T | null => {
  const [player, setPlayer] = useState<T | null>(null)

  useEffect(() => {
    const { create, onError } = getParams()

    let stale = false
    let thePlayer: T | null = null

    const onPlayerCreated = (p: T | null) => {
      if (!p) return

      if (!stale) {
        thePlayer = p
        setPlayer(thePlayer)
      } else {
        p.destroy()
      }
    }

    const onPlayerError = (error: Error) => {
      if (!stale) {
        onError({ error })
      }
    }

    try {
      const createHandleRet = create()

      if (createHandleRet && 'then' in createHandleRet) {
        createHandleRet.then(onPlayerCreated).catch(onPlayerError)
      } else {
        onPlayerCreated(createHandleRet)
      }
    } catch (e) {
      onPlayerError(e)
    }

    return () => {
      stale = true

      if (thePlayer) thePlayer.destroy()

      setPlayer(null)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return player
}

export default useCreatePlayer
