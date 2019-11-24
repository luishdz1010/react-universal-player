import { useEffect, useMemo, useRef, useState } from 'react'
import warning from 'warning'
import { PlayerProps, VideoState } from './PlayerProps'

export interface VendorApi<T> {
  vendorApi?: T | null
  vendorApiLoader?: () => Promise<T>
}

const useVideoState = <T>(params: PlayerProps, { vendorApi, vendorApiLoader }: VendorApi<T>): VideoState<T> => {
  const [ucPlaying, ucOnPlayingChange] = useState(params.autoplay || false)
  const [ucVolume, ucOnVolumeChange] = useState(1)

  const playingControlled = typeof params.playing === 'boolean'

  const onPlayingChange = useMemo(() => {
    if (playingControlled) {
      warning(!params.onPlayingChange, '`onPlayingChange` must be defined when also specifying `playing`')
      return params.onPlayingChange || (() => {})
    }

    if (params.onPlayingChange) {
      return (p: boolean) => {
        ucOnPlayingChange(p)
        params.onPlayingChange!(p)
      }
    }

    return ucOnPlayingChange
  }, [playingControlled, params.onPlayingChange])

  const volumeControlled = typeof params.volume === 'number' && Number.isFinite(params.volume)

  const onVolumeChange = useMemo(() => {
    if (volumeControlled) {
      warning(!params.onVolumeChange, '`onVolumeChange` must be defined when also specifying `volume`')
      return params.onVolumeChange || (() => {})
    }

    if (params.onVolumeChange) {
      return (v: number) => {
        ucOnVolumeChange(v)
        params.onVolumeChange!(v)
      }
    }

    return ucOnVolumeChange
  }, [volumeControlled, params.onVolumeChange])

  const onError = useMemo(
    () =>
      params.onError ||
      ((err: Error) => {
        warning(false, 'unhandled player error thrown: %s', err)
      }),
    [params.onError]
  )

  const onErrorRef = useRef(onError)
  useEffect(() => {
    onErrorRef.current = onError
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
            onErrorRef.current(err)
          }
        })
    }

    return () => {
      stale = true
    }
  }, [vendorApi, vendorApiLoader])

  return {
    url: params.url,
    urlConstructor: params.urlConstructor,
    // eslint-disable-next-line no-nested-ternary
    vendorApi: vendorApi !== undefined ? vendorApi : vendorApiLoader ? vendorApiResult : null,
    controls: typeof params.controls === 'boolean' ? params.controls : true,
    loop: !!params.loop,
    playing: playingControlled ? params.playing! : ucPlaying,
    onPlayingChange,
    volume: volumeControlled ? params.volume! : ucVolume,
    muted: !!params.muted,
    onVolumeChange,
    playsinline: !!params.playsinline,
    onError,
  }
}

export default useVideoState
