import { YouTubeVendorApi } from '../../providers/youtube'
import PlayerImperative from '../PlayerImperative'
import { YouTubePlayerState } from '../YouTubePlayer'
import PlayerImperativePrivate from './PlayerImperativePrivate'

export interface YouTubePlayerImperative extends PlayerImperative<YT.Player> {}

const urlToId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))(?:\w|-)+/)

  return (match && match[1]) || undefined
}

type YouTubeImplSingleUse = Readonly<
  Pick<YouTubePlayerState, 'url' | 'controls' | 'playsinline' | 'youTubePlayerOptions' | 'youTubePlayerVars'> & {
    autoplay: boolean
  }
>

export type YouTubeImplStateRef = Readonly<
  Pick<
    YouTubePlayerState,
    'url' | 'playing' | 'loop' | 'muted' | 'volume' | 'onPlayingChange' | 'onVolumeChange' | 'onMuteChange'
  >
>

export default class YouTubePlayerImpl implements YouTubePlayerImperative, PlayerImperativePrivate {
  private readonly _player: YT.Player

  private readonly onStateChange: (ev: YT.OnStateChangeEvent) => void

  constructor(
    YTVendor: YouTubeVendorApi,
    rootEl: HTMLElement,
    { url, controls, playsinline, youTubePlayerOptions, youTubePlayerVars, autoplay }: YouTubeImplSingleUse,
    private readonly state: { readonly current: YouTubeImplStateRef },
    { onReady, onError }: { onReady: (self: YouTubePlayerImpl) => void; onError: (e: Error) => void }
  ) {
    this.onStateChange = (ev: YT.OnStateChangeEvent) => {
      switch (ev.data) {
        case YT.PlayerState.BUFFERING:
        case YT.PlayerState.PLAYING:
          if (!state.current.playing) {
            this.state.current.onPlayingChange({ playing: true, error: null })
          }
          break

        case YT.PlayerState.PAUSED:
        case YT.PlayerState.ENDED:
          if (state.current.playing) {
            this.state.current.onPlayingChange({ playing: false, error: null })
          }
          break

        case YT.PlayerState.UNSTARTED:
        case YT.PlayerState.CUED:
        default:
          break
      }
    }

    // not documented on YouTube API
    const mute = state.current.muted ? { mute: 1 } : null

    this._player = new YTVendor.Player(rootEl, {
      videoId: urlToId(url),
      ...youTubePlayerOptions,
      playerVars: {
        origin: window.location.origin,
        autoplay: autoplay && state.current.playing === undefined ? 1 : 0,
        controls: controls ? 1 : 0,
        playsinline: playsinline ? 1 : 0,
        ...mute,
        ...youTubePlayerVars,
      },
      events: {
        onReady: () => {
          onReady(this)
        },
        onError(event) {
          onError(new Error(`YouTube player error ${event.data}`))
        },
        onStateChange: this.onStateChange,
      },
    })
  }

  destroy() {
    this.player.removeEventListener('onStateChange', this.onStateChange)
    this.player.stopVideo()
  }

  get player() {
    return this._player
  }

  setPlaying(playing: boolean) {
    if (playing) this.player.playVideo()
    else this.player.pauseVideo()

    return Promise.resolve()
  }

  seekTo(amount: number) {
    return this.player.seekTo(amount, true)
  }

  setVolume(volume: number) {
    this.player.setVolume(volume)
    return Promise.resolve()
  }

  setMuted(muted: boolean) {
    if (muted) this.player.mute()
    else this.player.unMute()

    return Promise.resolve()
  }

  setLoop(loop: boolean) {
    this.player.setLoop(loop)
    return Promise.resolve()
  }
}
