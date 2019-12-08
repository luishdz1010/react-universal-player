import { vimeoVendorApiLoader } from '../../providers/vimeo'
import { youTubeVendorApiLoader } from '../../providers/youtube'
import VimeoPlayer from '../VimeoPlayer'
import YouTubePlayer from '../YouTubePlayer'

const w: any = typeof window !== 'undefined' ? window : global

export const vimeo = {
  Player: VimeoPlayer,
  name: 'VimeoPlayer',
  validUrl: 'https://player.vimeo.com/video/90509568',
  getPlayerType: () => w.Vimeo?.Player,
  vimeoVendorApiLoader,
  toString: () => vimeo.name,
}

export const youTube = {
  Player: YouTubePlayer,
  name: 'YouTubePlayer',
  validUrl: 'https://www.youtube.com/embed/EngW7tLk6R8',
  getPlayerType: () => w.YT?.Player,
  youTubeVendorApiLoader,
  toString: () => youTube.name,
}
