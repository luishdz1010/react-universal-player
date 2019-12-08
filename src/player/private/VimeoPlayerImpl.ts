import Player from '@vimeo/player'
import { VimeoVendorApi } from '../../providers/vimeo'
import PlayerImperative from '../PlayerImperative'
import { VimeoPlayerState } from '../VimeoPlayer'
import PlayerImperativePrivate from './PlayerImperativePrivate'

export interface VimeoPlayerImperative extends PlayerImperative<Player> {}

const urlToId = (url: string) => Number(url.match(/(\d+)\/?(?:[#?].*)?$/)![1])

type VimeoImplSingleUse = Readonly<
  Pick<VimeoPlayerState, 'controls' | 'playsinline' | 'vimeoOptions'> & {
    autoplay: boolean
  }
>

export type VimeoImplStateRef = Readonly<
  Pick<
    VimeoPlayerState,
    'url' | 'playing' | 'loop' | 'muted' | 'volume' | 'onPlayingChange' | 'onVolumeChange' | 'onMuteChange'
  >
>

export default class VimeoPlayerImpl implements VimeoPlayerImperative, PlayerImperativePrivate {
  private readonly _player: Player

  private currentUrl: string

  private alive = true

  constructor(
    Vimeo: VimeoVendorApi,
    rootEl: HTMLElement,
    { controls, playsinline, vimeoOptions, autoplay }: VimeoImplSingleUse,
    private readonly state: { readonly current: VimeoImplStateRef },
    { onReady, onError }: { onReady: (p: VimeoPlayerImpl) => void; onError: (e: Error) => void }
  ) {
    this.currentUrl = state.current.url

    const player = new Vimeo.Player(rootEl, {
      id: urlToId(this.currentUrl),
      autoplay: autoplay && state.current.playing === undefined,
      controls,
      playsinline,
      loop: state.current.loop,
      muted: state.current.muted === null ? undefined : state.current.muted,
      ...vimeoOptions,
    })

    // eslint-disable-next-line no-console
    console.error(`Vimeo calling ready`)

    player
      .ready()
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`Vimeo ready error`, err)
        onError(err)
      })
      .then(() => {
        // eslint-disable-next-line no-console
        console.error(`Vimeo ready OK`)
        onReady(this)
      })

    player.on('play', () => {
      this.state.current.onPlayingChange({ playing: true, error: null })
    })

    player.on('pause', () => {
      this.state.current.onPlayingChange({ playing: false, error: null })
    })

    player.on('ended', () => {
      this.state.current.onPlayingChange({ playing: false })
    })

    player.on('volumechange', ({ volume }: { volume: number }) => {
      this.state.current.onMuteChange(volume === 0)

      if (volume > 0) this.state.current.onVolumeChange({ volume, error: null })
      else this.state.current.onVolumeChange({ error: null })
    })

    this._player = player
  }

  private syncState() {
    this.player.getPaused().then((paused) => {
      if (this.alive) this.state.current.onPlayingChange({ playing: !paused })
    })
  }

  destroy() {
    this.alive = false
    this.player.off('play')
    this.player.off('pause')
    this.player.off('ended')
    this.player.off('volumechange')
    this.player.unload()
  }

  get player() {
    return this._player
  }

  setPlaying(playing: boolean) {
    return this.acceptIfStale(() => {
      const promise = playing ? this.player.play() : this.player.pause()

      return promise.catch((error) => {
        if (this.alive) this.state.current.onPlayingChange({ error })

        return error
      })
    })
  }

  setVolume(volume: number) {
    return this.acceptIfStale(() =>
      this.player.setVolume(volume).catch((error) => {
        if (this.alive) this.state.current.onVolumeChange({ error })

        return error
      })
    )
  }

  setMuted(muted: boolean) {
    return this.setVolume(muted ? 0 : this.state.current.volume || 1)
  }

  seekTo(amount: number) {
    return this.rejectIfStale(() => this.player.setCurrentTime(amount))
  }

  setLoop(loop: boolean) {
    return this.rejectIfStale(() => this.player.setLoop(loop))
  }

  setColor(color: string) {
    return this.rejectIfStale(() => this.player.setColor(color))
  }

  loadUrl(url: string): Promise<void | Error> {
    return this.acceptIfStale(() => {
      const newVideoId = urlToId(url)

      if (urlToId(this.currentUrl) !== newVideoId) {
        const oldUrl = this.currentUrl
        this.currentUrl = url

        return this.player
          .loadVideo(newVideoId)
          .then(() => {
            if (this.alive) this.syncState()
          })
          .catch((error: Error) => {
            if (this.alive) {
              this.state.current.onPlayingChange({ error })
              this.currentUrl = oldUrl
            }

            return error
          })
      }

      return Promise.resolve()
    })
  }

  private acceptIfStale<T>(cb: () => Promise<T>) {
    if (this.alive) return cb()

    return Promise.resolve(new Error('stale player'))
  }

  private rejectIfStale<T>(cb: () => Promise<T>) {
    if (this.alive) return cb()

    return Promise.reject(new Error('stale player'))
  }
}
