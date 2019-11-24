import Player from '@vimeo/player'
import PlayerImperative from '../PlayerImperative'
import PlayerImperativePrivate from './PlayerImperativePrivate'

export interface VimeoPlayerImperative extends PlayerImperative<Player> {}

export default class VimeoPlayerImpl implements VimeoPlayerImperative, PlayerImperativePrivate {
  constructor(private _player: Player, private currentId?: number) {}

  get player() {
    return this._player
  }

  pause() {
    return this.player.getPaused().then((isPaused) => {
      if (!isPaused) return this.player.pause()
      return Promise.resolve()
    })
  }

  play() {
    return this.player.getPaused().then((isPaused) => {
      if (isPaused) return this.player.play()
      return Promise.resolve()
    })
  }

  seekTo(amount: number) {
    return this.player.setCurrentTime(amount)
  }

  setVolume(volume: number) {
    return this.player.setVolume(volume)
  }

  getVolume() {
    return this.player.getVolume()
  }

  setLoop(loop: boolean) {
    return this.player.setLoop(loop)
  }

  setColor(color: string) {
    return this.player.setColor(color)
  }

  loadVideo(id: number): Promise<unknown> {
    if (this.currentId !== id) {
      const oldId = this.currentId
      this.currentId = id

      return this.player.loadVideo(id).catch(() => {
        this.currentId = oldId
      })
    }

    return Promise.resolve()
  }
}
