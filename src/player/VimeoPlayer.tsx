import { Options } from '@vimeo/player'
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { PlayerInternalState, PlayerProps } from '../PlayerProps'
import { vimeoUrlTest, VimeoVendorApi } from '../providers/vimeo'
import { useLoopEffect } from './effects'
import useCreatePlayer from './private/useCreatePlayer'
import usePlayerInternalState from './private/usePlayerInternalState'
import { useLastValueRef, useValidateUrl } from './private/util'
import VimeoPlayerImpl, { VimeoImplStateRef, VimeoPlayerImperative } from './private/VimeoPlayerImpl'
import VimeoIframe, { VimeoIframeProps } from './VimeoIframe'

export interface VimeoPlayerProps extends PlayerProps {
  vimeoVendorApi?: VimeoVendorApi | null
  vimeoVendorApiLoader?: () => Promise<VimeoVendorApi>
  vimeoColor?: string
  vimeoOptions?: Options
  vimeoIframeProps?: VimeoIframeProps
}

export interface VimeoOwnPlayerState {
  vimeoColor: string | null
  vimeoOptions: Options
}

const useVimeoOwnState = (args: VimeoPlayerProps): VimeoOwnPlayerState => ({
  vimeoColor: args.vimeoColor || null,
  vimeoOptions: useMemo(
    () => args.vimeoOptions || {},
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(args.vimeoOptions)]
  ),
})

export interface VimeoPlayerState extends PlayerInternalState<VimeoVendorApi>, VimeoOwnPlayerState {}

export const useVimeoPlayerState = (args: VimeoPlayerProps): VimeoPlayerState => ({
  ...usePlayerInternalState(args, {
    vendorApi: args.vimeoVendorApi,
    vendorApiLoader: args.vimeoVendorApiLoader,
  }),
  ...useVimeoOwnState(args),
})

const VimeoPlayer = forwardRef<VimeoPlayerImperative | null, VimeoPlayerProps>((props, outerRef) => {
  const state = useVimeoPlayerState(props)
  const rootEl = useRef<HTMLIFrameElement>(null)

  const initialMuted = useRef(!!props.initialMuted)
  const autoplay = useRef(!!props.autoplay)

  if (typeof window !== 'undefined') {
    const { url, vendorApi, controls, playsinline, vimeoOptions, loop, vimeoColor, onPlayingChange } = state

    const validUrl = useValidateUrl(url, vimeoUrlTest, onPlayingChange)

    const nonDepState = useLastValueRef<VimeoImplStateRef>(state)

    const player = useCreatePlayer(
      () => ({
        create: () => {
          if (!validUrl || !vendorApi) return null

          return new Promise<VimeoPlayerImpl>((accept, reject) => {
            // eslint-disable-next-line no-new
            new VimeoPlayerImpl(
              vendorApi,
              rootEl.current!,
              {
                autoplay: autoplay.current,
                playsinline,
                controls,
                vimeoOptions,
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
      [controls, nonDepState, onPlayingChange, playsinline, validUrl, vendorApi, vimeoOptions]
    )

    useLoopEffect(player, loop)

    useEffect(() => {
      if (validUrl) player?.loadUrl(validUrl)
    }, [player, validUrl])

    useEffect(() => {
      if (vimeoColor) player?.setColor(vimeoColor)
      // else we dont handle color change to default
    }, [vimeoColor, player])

    useImperativeHandle(outerRef, () => player, [player])
  }

  const { current: initial } = useRef(state)

  return (
    <VimeoIframe
      className={props.className}
      urlConstructor={initial.urlConstructor}
      url={initial.url}
      autoplay={autoplay.current}
      controls={initial.controls}
      loop={initial.loop}
      muted={initialMuted.current}
      playsinline={initial.playsinline}
      vimeoOptions={initial.vimeoOptions}
      {...props.vimeoIframeProps}
      ref={rootEl}
    />
  )
})

export default VimeoPlayer
