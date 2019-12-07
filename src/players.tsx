import React from 'react'
import { PlayerProps } from './PlayerProps'
import VimeoPlayer from './player/VimeoPlayer'
import YouTubePlayer from './player/YouTubePlayer'
import { vimeoUrlTest, vimeoVendorApiLoader } from './providers/vimeo'
import { youTubeUrlTest, youTubeVendorApiLoader } from './providers/youtube'

interface PlayerDef {
  test: (url: string) => boolean
  render: (props: PlayerProps) => React.ReactElement
}

const players: PlayerDef[] = [
  {
    test: youTubeUrlTest,
    render(props) {
      return <YouTubePlayer youTubeVendorApiLoader={youTubeVendorApiLoader} {...props} />
    },
  },
  {
    test: vimeoUrlTest,
    render(props) {
      return <VimeoPlayer vimeoVendorApiLoader={vimeoVendorApiLoader} {...props} />
    },
  },
]

export default players
