import React, { ComponentProps, forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import { PlayerInternalState, PlayerProps } from '../PlayerProps'
import { youTubeUrlTest, YouTubeVendorApi } from '../providers/youtube'
import { useLoopEffect } from './effects'
import useCreatePlayer from './private/useCreatePlayer'
import usePlayerInternalState from './private/usePlayerInternalState'
import { useLastValueRef, useValidateUrl } from './private/util'
import YouTubePlayerImpl, { YouTubePlayerImperative } from './private/YouTubePlayerImpl'
import YouTubeIframe from './YouTubeIframe'

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

const useYouTubeOwnState = (args: YouTubePlayerProps): YouTubeOwnPlayerState =>
  useMemo(
    () => ({
      youTubePlayerOptions: args.youTubePlayerOptions || {},
      youTubePlayerVars: args.youTubePlayerVars || {},
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(args.youTubePlayerOptions), JSON.stringify(args.youTubePlayerVars)]
  )

export interface YouTubePlayerState extends PlayerInternalState<YouTubeVendorApi>, YouTubeOwnPlayerState {}

export const useYouTubePlayerState = (args: YouTubePlayerProps): YouTubePlayerState => ({
  ...usePlayerInternalState(args, {
    vendorApi: args.youTubeVendorApi,
    vendorApiLoader: args.youTubeVendorApiLoader,
  }),
  ...useYouTubeOwnState(args),
})

const YouTubePlayer = forwardRef<YouTubePlayerImperative | null, YouTubePlayerProps>((props, outerRef) => {
  const state = useYouTubePlayerState(props)
  const rootEl = useRef<HTMLIFrameElement>(null)

  const initialMuted = useRef(!!props.initialMuted)
  const autoplay = useRef(!!props.autoplay)

  if (typeof window !== 'undefined') {
    const {
      url,
      vendorApi,
      controls,
      playsinline,
      loop,
      onPlayingChange,
      youTubePlayerOptions,
      youTubePlayerVars,
    } = state

    const validUrl = useValidateUrl(url, youTubeUrlTest, onPlayingChange)

    const nonDepState = useLastValueRef(state)

    const player = useCreatePlayer(
      () => ({
        create: () => {
          if (!validUrl || !vendorApi) return null

          return new Promise<YouTubePlayerImpl>((accept, reject) => {
            // eslint-disable-next-line no-new
            new YouTubePlayerImpl(
              vendorApi,
              rootEl.current!,
              {
                url: validUrl,
                autoplay: autoplay.current,
                playsinline,
                controls,
                youTubePlayerOptions,
                youTubePlayerVars,
              },
              nonDepState,
              {
                onReady: (self) => accept(self),
                onError: reject,
              }
            )
          })
        },
        onError: onPlayingChange,
      }),
      [
        onPlayingChange,
        validUrl,
        vendorApi,
        playsinline,
        controls,
        youTubePlayerOptions,
        youTubePlayerVars,
        nonDepState,
      ]
    )

    useLoopEffect(player, loop)

    useImperativeHandle(outerRef, () => player, [player])
  }

  const { current: initial } = useRef(state)

  return (
    <YouTubeIframe
      className={props.className}
      urlConstructor={initial.urlConstructor}
      url={initial.url}
      autoplay={autoplay.current}
      controls={initial.controls}
      loop={initial.loop}
      muted={initialMuted.current}
      playsinline={initial.playsinline}
      {...props.youTubeIframeProps}
      ref={rootEl}
    />
  )
})

export default YouTubePlayer
