import { useEffect } from 'react'
import PlayerImperativePrivate, { PlayerImperativeMuteable } from './private/PlayerImperativePrivate'

export const usePlaybackEffect = (player: PlayerImperativePrivate | null, playing: boolean) => {
  useEffect(() => {
    if (playing) player?.play()
    else player?.pause()
  }, [playing, player])
}

export const useLoopEffect = (player: PlayerImperativePrivate | null, loop: boolean) => {
  useEffect(() => {
    player?.setLoop(loop)
  }, [loop, player])
}

export interface Volume {
  volume: number
  muted: boolean
}

export const useVolumeMutedEffect = (
  player: (PlayerImperativePrivate & PlayerImperativeMuteable) | null,
  { muted, volume }: Volume
) => {
  useEffect(() => {
    player?.setVolume(volume)
  }, [player, volume])

  useEffect(() => {
    player?.setMuted(muted)
  }, [player, muted])
}

export const useVolumeMutedUnifiedEffect = (player: PlayerImperativePrivate | null, { muted, volume }: Volume) => {
  useEffect(() => {
    if (!muted) player?.setVolume(volume)
  }, [muted, player, volume])

  useEffect(() => {
    if (muted) player?.setVolume(0)
  }, [muted, player])
}
