import React, { ComponentProps, forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import { PlayerProps, VideoState } from '../PlayerProps'
import { youTubeUrlTest, YouTubeVendorApi } from '../providers/youtube'
import useVideoState from '../useVideoState'
import { useLoopEffect, usePlaybackEffect, useVolumeMutedEffect } from './effects'
import useCreatePlayer from './private/useCreatePlayer'
import { useLastValueRef, useValidateUrl } from './private/util'
import YouTubePlayerImpl, { YouTubePlayerImperative } from './private/YouTubePlayerImpl'

export interface YouTubePlayerProps extends PlayerProps {
  youTubeVendorApi?: YouTubeVendorApi | null
  youTubeVendorApiLoader?: () => Promise<YouTubeVendorApi>
  youTubePlayerOptions?: YT.PlayerOptions
  youTubePlayerVars?: YT.PlayerVars
  youTubeIframeProps?: ComponentProps<'iframe'>
}

export interface YouTubeOwnPlayerState {
  youTubePlayerOptions: Omit<YT.PlayerOptions, 'playerVars' | 'events'>
  youTubePlayerVars: YT.PlayerVars
}

const useYouTubeOwnState = (args: YouTubePlayerProps): YouTubeOwnPlayerState => {
  return {
    youTubePlayerOptions: args.youTubePlayerOptions || {},
    youTubePlayerVars: args.youTubePlayerVars || {},
  }
}

export interface YouTubePlayerState extends VideoState<YouTubeVendorApi>, YouTubeOwnPlayerState {}

export const useYouTubePlayerState = (args: YouTubePlayerProps): YouTubePlayerState => ({
  ...useVideoState(args, {
    vendorApi: args.youTubeVendorApi,
    vendorApiLoader: args.youTubeVendorApiLoader,
  }),
  ...useYouTubeOwnState(args),
})

const extractVideoId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))(?:\w|-)+/)

  return (match && match[1]) || undefined
}

const playerLifecycle = {
  create(
    state: { current: YouTubePlayerState },
    rootEl: HTMLIFrameElement
  ): [Promise<YouTubePlayerImpl | null>, () => void] {
    let stale = false

    const promise = new Promise<YouTubePlayerImpl | null>((accept, reject) => {
      const init = state.current
      const YT = init.vendorApi!

      // not documented on YouTube API
      const mute = init.muted ? { mute: 1 } : null

      const raw = new YT.Player(rootEl, {
        videoId: extractVideoId(init.url),
        ...init.youTubePlayerOptions,
        playerVars: {
          origin: window.location.origin,
          autoplay: init.playing ? YT.AutoPlay.AutoPlay : YT.AutoPlay.NoAutoPlay,
          controls: init.controls ? YT.Controls.ShowLoadPlayer : YT.Controls.Hide,
          playsinline: init.playsinline ? YT.PlaysInline.Inline : YT.PlaysInline.Fullscreen,
          ...mute,
          ...init.youTubePlayerVars,
        },
        events: {
          onReady: () => {
            if (!stale) {
              raw.addEventListener('onStateChange', onStateChange)
              const api = new YouTubePlayerImpl(raw, onStateChange)
              accept(api)
            } else {
              accept(null)
            }
          },
          onError(event) {
            reject(new Error(`YouTube player error ${event.data}`))
          },
        },
      })

      function onStateChange(ev: YT.OnStateChangeEvent) {
        switch (ev.data) {
          case YT.PlayerState.BUFFERING:
          case YT.PlayerState.PLAYING:
            if (!state.current.playing) {
              state.current.onPlayingChange(true)
            }
            break

          case YT.PlayerState.PAUSED:
          case YT.PlayerState.ENDED:
            if (state.current.playing) {
              state.current.onPlayingChange(false)
            }
            break

          case YT.PlayerState.UNSTARTED:
          case YT.PlayerState.CUED:
          default:
            break
        }
      }
    })

    return [
      promise,
      () => {
        stale = true
      },
    ]
  },

  destroy(api: YouTubePlayerImpl) {
    api.player.removeEventListener('onStateChange', api.onStateChange)
    api.player.stopVideo()
  },
}

const YouTubePlayer = forwardRef<YouTubePlayerImperative | null, YouTubePlayerProps>((props, outerRef) => {
  const state = useYouTubePlayerState(props)
  const rootEl = useRef<HTMLIFrameElement>(null)

  if (typeof window !== 'undefined') {
    const stateRef = useLastValueRef(state)

    const {
      url,
      vendorApi,
      controls,
      playsinline,
      loop,
      playing,
      volume,
      muted,
      youTubePlayerOptions,
      youTubePlayerVars,
    } = state

    const isValidUrl = useValidateUrl(url, youTubeUrlTest, stateRef.current.onError)

    const player = useCreatePlayer(
      {
        shouldExist: isValidUrl && !!vendorApi,
        create: () => playerLifecycle.create(stateRef, rootEl.current!),
        destroy: playerLifecycle.destroy,
        onError: stateRef,
      },
      [url, controls, playsinline, ...Object.values(youTubePlayerOptions), '␃', ...Object.values(youTubePlayerVars)]
    )

    usePlaybackEffect(player, playing)

    useLoopEffect(player, loop)

    useVolumeMutedEffect(player, { muted, volume })

    useImperativeHandle(outerRef, () => player, [player])
  }

  const initialStateRef = useRef(state)

  const iframeUrl = useMemo(() => {
    const init = initialStateRef.current

    try {
      const URL = init.urlConstructor
      const u = new URL(init.url)
      const T = '1'
      const F = '0'

      u.searchParams.set('autoplay', init.playing ? T : F)
      u.searchParams.set('loop', init.loop ? T : F)
      u.searchParams.set('playsinline', init.playsinline ? T : F)
      u.searchParams.set('controls', init.controls ? T : F)
      u.searchParams.set('mute', init.muted ? T : F) // not documented

      // see https://developers.google.com/youtube/player_parameters#loop
      // u.searchParams.set('playlist', videoId)

      u.searchParams.set('modestbranding', T)
      u.searchParams.set('showinfo', F)
      u.searchParams.set('rel', F)
      u.searchParams.set('enablejsapi', T)
      u.searchParams.set('iv_load_policy', T)

      return u.toString()
    } catch {
      return init.url
    }
  }, [])

  const iframeProps = useRef(props.youTubeIframeProps)

  return (
    <iframe
      className={props.className}
      ref={rootEl}
      src={iframeUrl}
      allowFullScreen
      allow="autoplay; fullscreen"
      frameBorder="0"
      {...iframeProps.current}
    />
  )
})

export default YouTubePlayer
