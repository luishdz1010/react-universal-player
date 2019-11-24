import { Options } from '@vimeo/player'
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { PlayerProps, VideoState } from '../PlayerProps'
import { vimeoUrlTest, VimeoVendorApi } from '../providers/vimeo'
import useVideoState from '../useVideoState'
import { useLoopEffect, usePlaybackEffect, useVolumeMutedUnifiedEffect } from './effects'
import useCreatePlayer from './private/useCreatePlayer'
import { useLastValueRef, useValidateUrl } from './private/util'
import VimeoIframe, { VimeoIframeProps } from './VimeoIframe'
import VimeoPlayerImpl, { VimeoPlayerImperative } from './private/VimeoPlayerImpl'

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

const useVimeoOwnState = (args: VimeoPlayerProps): VimeoOwnPlayerState => {
  return {
    vimeoColor: args.vimeoColor || null,
    vimeoOptions: args.vimeoOptions || {},
  }
}

export interface VimeoPlayerState extends VideoState<VimeoVendorApi>, VimeoOwnPlayerState {}

export const useVimeoPlayerState = (args: VimeoPlayerProps): VimeoPlayerState => ({
  ...useVideoState(args, {
    vendorApi: args.vimeoVendorApi,
    vendorApiLoader: args.vimeoVendorApiLoader,
  }),
  ...useVimeoOwnState(args),
})

const extractVideoId = (url: string) => Number(url.match(/(\d+)\/?(?:[#?].*)?$/)![1])

const playerLifecycle = {
  create(stateRef: { current: VimeoPlayerState }, rootEl: HTMLIFrameElement) {
    const init = stateRef.current
    const Vimeo = init.vendorApi!
    const id = extractVideoId(init.url)

    const raw = new Vimeo.Player(rootEl, {
      id,
      autoplay: init.playing,
      controls: init.controls,
      playsinline: init.playsinline,
      loop: init.loop,
      muted: init.muted,
      ...init.vimeoOptions,
    })

    const api = new VimeoPlayerImpl(raw, id)

    raw.on('play', () => {
      stateRef.current.onPlayingChange(true)
    })

    raw.on('pause', () => {
      stateRef.current.onPlayingChange(false)
    })

    raw.on('volumechange', ({ volume }: { volume: number }) => {
      stateRef.current.onVolumeChange(volume)
    })

    return api
  },

  destroy(api: VimeoPlayerImpl) {
    api.player.off('play')
    api.player.off('pause')
    api.player.off('volumechange')
    api.player.unload()
  },
}

const VimeoPlayer = forwardRef<VimeoPlayerImperative | null, VimeoPlayerProps>((props, outerRef) => {
  const state = useVimeoPlayerState(props)
  const rootEl = useRef<HTMLIFrameElement>(null)

  if (typeof window !== 'undefined') {
    const stateRef = useLastValueRef(state)

    const { url, vendorApi, controls, playsinline, vimeoOptions, loop, playing, volume, muted, vimeoColor } = state

    const [recreate, recreatePlayer] = useState({})

    const isValidUrl = useValidateUrl(url, vimeoUrlTest, stateRef.current.onError)

    const player = useCreatePlayer(
      {
        shouldExist: isValidUrl && !!vendorApi,
        create: () => playerLifecycle.create(stateRef, rootEl.current!),
        destroy: playerLifecycle.destroy,
        onError: stateRef,
      },
      [controls, playsinline, recreate, ...Object.values(vimeoOptions)]
    )

    usePlaybackEffect(player, playing)

    useLoopEffect(player, loop)

    useVolumeMutedUnifiedEffect(player, { muted, volume })

    useEffect(() => {
      let stale = false

      if (isValidUrl)
        player?.loadVideo(extractVideoId(url)).catch((err: Error) => {
          if (!stale) stateRef.current.onError(err)
        })

      return () => {
        stale = true
      }
    }, [isValidUrl, url, player, stateRef])

    useEffect(() => {
      if (vimeoColor) player?.setColor(vimeoColor)
    }, [vimeoColor, player])

    useEffect(() => {
      if (!vimeoColor) recreatePlayer({})
    }, [vimeoColor])

    useImperativeHandle(outerRef, () => player, [player])
  }

  const { current: init } = useRef(state)
  const iframeProps = useRef(props.vimeoIframeProps)

  return (
    <VimeoIframe
      className={props.className}
      urlConstructor={init.urlConstructor}
      url={init.url}
      playing={init.playing}
      controls={init.controls}
      loop={init.loop}
      muted={init.muted}
      playsinline={init.playsinline}
      vimeoOptions={init.vimeoOptions}
      {...iframeProps.current}
      ref={rootEl}
    />
  )
})

export default VimeoPlayer
