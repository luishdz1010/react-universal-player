import { useEffect } from 'react'
import PlayerImperative from './PlayerImperative'
import PlayerImperativePrivate, { PlayerImperativeMuteable } from './private/PlayerImperativePrivate'

export const usePlaybackEffect = (player: PlayerImperative | null, playing: boolean) => {
  useEffect(() => {
    player?.setPlaying(playing)
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

export const useVolumeEffect = (
  player: (PlayerImperative & PlayerImperativeMuteable) | null,
  { muted, volume }: Volume
) => {
  useEffect(() => {
    player?.setVolume(volume)
  }, [player, volume])

  useEffect(() => {
    player?.setMuted(muted)
  }, [player, muted])
}

export const useVolumeSimulatedMutedEffect = (player: PlayerImperative | null, { muted, volume }: Volume) => {
  useEffect(() => {
    if (!muted) player?.setVolume(volume)
  }, [muted, player, volume])

  useEffect(() => {
    if (muted) player?.setVolume(0)
  }, [muted, player])
}
