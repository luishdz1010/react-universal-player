import PlayerImperative from '../PlayerImperative'
import PlayerImperativePrivate from './PlayerImperativePrivate'

export interface YouTubePlayerImperative extends PlayerImperative<YT.Player> {}

export default class YouTubePlayerImpl implements YouTubePlayerImperative, PlayerImperativePrivate {
  constructor(
    private readonly _player: YT.Player,
    public readonly onStateChange: (ev: YT.OnStateChangeEvent) => void
  ) {}

  get player() {
    return this._player
  }

  pause() {
    return this.player.pauseVideo()
  }

  play() {
    return this.player.playVideo()
  }

  seekTo(amount: number) {
    return this.player.seekTo(amount, true)
  }

  setVolume(volume: number) {
    return this.player.setVolume(volume)
  }

  setMuted(muted: boolean) {
    return muted ? this.player.mute() : this.player.unMute()
  }

  setLoop(loop: boolean) {
    return this.player.setLoop(loop)
  }
}
