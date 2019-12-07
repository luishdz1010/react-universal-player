import { useEffect, useRef, useState } from 'react'
import { PlayerInternalState, PlayerProps } from '../../PlayerProps'
import { useLastValueRef } from './util'

export interface VendorApiSource<T> {
  vendorApi?: T | null
  vendorApiLoader?: () => Promise<T>
}

const useStableCallback = <T extends (...args: any[]) => any>(cb: T): T => {
  const lastCallback = useLastValueRef(cb)

  return useRef((...args: any[]) => lastCallback.current(...args)).current as T
}

const usePlayerInternalState = <T>(
  params: PlayerProps,
  { vendorApi, vendorApiLoader }: VendorApiSource<T>
): PlayerInternalState<T> => {
  const [playing, setPlaying] = useState<boolean | null>(null)
  const [playbackError, setPlaybackError] = useState<Error | null>(null)
  const [volume, setVolume] = useState<number | null>(null)
  const [muted, setMuted] = useState<boolean | null>(null)
  const [volumeError, setVolumeError] = useState<Error | null>(null)

  const onPlaybackError = useStableCallback((error: Error) => {
    setPlaybackError(error)
    params.onPlayingChange?.({ playing: false, error })
  })

  const [vendorApiResult, setVendorApiResult] = useState<T | null>(null)

  useEffect(() => {
    let stale = false

    if (vendorApi === undefined && vendorApiLoader) {
      vendorApiLoader()
        .then((api) => {
          if (!stale) {
            setVendorApiResult(api)
          }
        })
        .catch((err: Error) => {
          if (!stale) {
            setVendorApiResult(null)
            onPlaybackError(err)
          }
        })
    }

    return () => {
      stale = true
    }
  }, [onPlaybackError, vendorApi, vendorApiLoader])

  return {
    url: params.url,
    urlConstructor: params.urlConstructor,
    // eslint-disable-next-line no-nested-ternary
    vendorApi: vendorApi !== undefined ? vendorApi : vendorApiLoader ? vendorApiResult : null,
    controls: typeof params.controls === 'boolean' ? params.controls : true,
    loop: !!params.loop,
    playing,
    onPlayingChange: useStableCallback((p) => {
      if (typeof p.playing !== 'undefined') setPlaying(p.playing)
      if (typeof p.error !== 'undefined') setPlaybackError(p.error)
      params.onPlayingChange?.({ playing, error: playbackError, ...p })

      if (process.env.NODE_ENV !== 'production') {
        if (!params.onPlayingChange && p.error) console.error('Unhandled player playback error', p.error)
      }
    }),
    playbackError,
    volume,
    onVolumeChange: useStableCallback((v) => {
      if (typeof v.volume !== 'undefined') setVolume(v.volume)
      if (typeof v.error !== 'undefined') setVolumeError(v.error)
      params.onVolumeChange?.({ volume, error: volumeError, ...v })

      if (process.env.NODE_ENV !== 'production') {
        if (!params.onVolumeChange && v.error) console.error('Unhandled player volume error', v.error)
      }
    }),
    volumeError,
    muted,
    onMuteChange: useStableCallback((isMuted) => {
      setMuted(isMuted)
      params.onMuteChange?.(isMuted)
    }),
    playsinline: !!params.playsinline,
  }
}

export default usePlayerInternalState
