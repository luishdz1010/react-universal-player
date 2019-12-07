import { Options } from '@vimeo/player'
import React, { ComponentProps, forwardRef, memo, Ref } from 'react'
import { UniversalURLConstructor } from '../PlayerProps'

export interface VimeoIframeProps extends ComponentProps<'iframe'> {
  urlConstructor: UniversalURLConstructor
  url: string
  autoplay?: boolean
  controls?: boolean
  loop?: boolean
  muted?: boolean
  playsinline?: boolean
  vimeoOptions?: Options
}

const VimeoIframe = forwardRef(
  (
    {
      url,
      autoplay,
      controls,
      loop,
      muted,
      playsinline,
      vimeoOptions,
      urlConstructor: URL,
      ...iframeProps
    }: VimeoIframeProps,
    ref: Ref<any>
  ) => {
    let iframeUrl

    try {
      const u = new URL(url)
      const T = '1'
      const F = '0'

      u.searchParams.set('autoplay', autoplay ? T : F)
      u.searchParams.set('controls', controls ? T : F)
      u.searchParams.set('loop', loop ? T : F)
      u.searchParams.set('muted', muted ? T : F)
      u.searchParams.set('playsinline', playsinline ? T : F)

      if (vimeoOptions) {
        Object.keys(vimeoOptions).forEach((key) => {
          u.searchParams.set(key, String(vimeoOptions[key as keyof typeof vimeoOptions]))
        })
      }

      iframeUrl = u.toString()
    } catch (e) {
      iframeUrl = url
    }

    return (
      <iframe ref={ref} src={iframeUrl} allowFullScreen allow="autoplay; fullscreen" frameBorder="0" {...iframeProps} />
    )
  }
)

export default memo(VimeoIframe)
