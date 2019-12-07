import React, { ComponentProps, forwardRef, memo, Ref } from 'react'
import { UniversalURLConstructor } from '../PlayerProps'

export interface YouTubeIframeProps extends ComponentProps<'iframe'> {
  urlConstructor: UniversalURLConstructor
  url: string
  autoplay?: boolean
  controls?: boolean
  loop?: boolean
  muted?: boolean
  playsinline?: boolean
  // youTubePlayerVars?: YT.PlayerVars
}

const YouTubeIframe = forwardRef(
  (
    { url, autoplay, controls, loop, muted, playsinline, urlConstructor: URL, ...iframeProps }: YouTubeIframeProps,
    ref: Ref<any>
  ) => {
    let iframeUrl

    try {
      const u = new URL(url)
      const T = '1'
      const F = '0'

      u.searchParams.set('autoplay', autoplay ? T : F)
      u.searchParams.set('loop', loop ? T : F)
      u.searchParams.set('playsinline', playsinline ? T : F)
      u.searchParams.set('controls', controls ? T : F)
      u.searchParams.set('mute', muted ? T : F) // not documented

      // see https://developers.google.com/youtube/player_parameters#loop
      // u.searchParams.set('playlist', videoId)

      u.searchParams.set('modestbranding', T)
      u.searchParams.set('showinfo', F)
      u.searchParams.set('rel', F)
      u.searchParams.set('enablejsapi', T)
      u.searchParams.set('iv_load_policy', T)

      iframeUrl = u.toString()
    } catch {
      iframeUrl = url
    }

    return (
      <iframe ref={ref} src={iframeUrl} allowFullScreen allow="autoplay; fullscreen" frameBorder="0" {...iframeProps} />
    )
  }
)

export default memo(YouTubeIframe)
