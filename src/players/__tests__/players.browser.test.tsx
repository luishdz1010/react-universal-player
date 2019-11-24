import { fireEvent, wait } from '@testing-library/react'
import React, { createRef } from 'react'
import { render, waitForRef } from '../../__tests__/utils'
import PlayerImperative from '../PlayerImperative'
import { VimeoPlayerImperative } from '../private/VimeoPlayerImpl'
import { YouTubePlayerImperative } from '../private/YouTubePlayerImpl'
import { vimeo, youTube } from './players'

const getIframe = (container: HTMLElement) => {
  const firstChild = container.firstChild as HTMLIFrameElement

  if (!firstChild) throw new Error('getIframe: container.firstChild is empty')
  if (firstChild.nodeName !== 'IFRAME') throw new Error('getIframe: container.firstChild is not an iframe')

  return firstChild.contentDocument?.body
}

const allPlayers = [
  {
    ...vimeo,
    async isPlaying(api: VimeoPlayerImperative, should: any) {
      const isPlaying = !(await api.player.getPaused())

      return isPlaying === should
    },
    rootNode: getIframe,
    getPlayButton(root: HTMLElement) {
      return getIframe(root)?.querySelector('.play.state-paused')
    },
  },
  {
    ...youTube,
    isPlaying(api: YouTubePlayerImperative, should: any) {
      const s = api.player.getPlayerState()

      if (should) return s === YT.PlayerState.PLAYING

      return s === YT.PlayerState.PAUSED || s === YT.PlayerState.ENDED || s === YT.PlayerState.CUED
    },
    rootNode: getIframe,
    getPlayButton(root: HTMLElement) {
      return getIframe(root)?.querySelector('.ytp-play-button')
    },
  },
]

Object.values(allPlayers).forEach(
  ({ Player, name, validUrl, getPlayerType, isPlaying, getPlayButton, rootNode, ...baseProps }) => {
    describe(`${name} browser`, () => {
      const props = {
        url: validUrl,
        muted: true,
        urlConstructor: URL,
        ...baseProps,
      }

      const waitForPlaying = async (api: any, playing: boolean) => {
        await wait(async () => {
          if (!(await isPlaying(api, playing)))
            throw new Error(`player status is not ${playing ? 'playing' : 'paused'}`)
        })
      }

      it('sets ref on valid url', async () => {
        const api = createRef<PlayerImperative<any> | null>()

        render(<Player {...props} ref={api} />)

        const { player } = await waitForRef(api)

        expect(player).toBeInstanceOf(getPlayerType())
      })

      it('starts paused', async () => {
        const ref = createRef<any>()
        render(<Player {...props} ref={ref} />)

        await waitForPlaying(await waitForRef(ref), false)
      })

      it('autoplays videos', async () => {
        const ref = createRef<any>()
        render(<Player {...props} autoplay ref={ref} />)

        await waitForPlaying(await waitForRef(ref), true)
      })

      it('plays video when playing=true', async () => {
        const ref = createRef<any>()
        const { rerender } = render(<Player {...props} ref={ref} />)

        await waitForRef(ref)

        await waitForPlaying(ref.current, false)

        rerender(<Player {...props} ref={ref} playing />)

        await waitForPlaying(ref.current, true)
      })

      it('stops playing when playing=false', async () => {
        const ref = createRef<any>()
        const { rerender } = render(<Player {...props} ref={ref} playing />)

        await waitForRef(ref)

        await waitForPlaying(ref.current, true)

        rerender(<Player {...props} ref={ref} playing={false} />)

        await waitForPlaying(ref.current, false)
      })

      it('preserves class after playing', async () => {
        const clazz = 'C__TEST__'
        const clazzQuery = `.${clazz}`

        const ref = createRef<any>()
        const { container } = render(<Player {...props} ref={ref} className={clazz} playing />)

        expect(container.querySelector(clazzQuery)).toBeTruthy()

        await waitForPlaying(await waitForRef(ref), true)

        expect(container.querySelector(clazzQuery)).toBeTruthy()
      })

      it('detects user play action', async () => {
        const ref = createRef<any>()

        const spy = jasmine.createSpy()
        const { container } = render(<Player {...props} onPlayingChange={spy} ref={ref} />)

        await waitForRef(ref)

        if (!rootNode(container)) pending('no root container')

        if (spy.calls.count() !== 0) throw new Error('')

        await wait(() => {
          const playButton = getPlayButton(container)

          if (playButton) fireEvent.click(playButton!)

          if (spy.calls.count() !== 1) throw new Error(`onPlayingChange called ${spy.calls.count()} times, expected 1`)

          const arg = spy.calls.mostRecent().args[0]
          if (arg !== true) throw new Error(`onPlayingChange called with ${arg}, expected true`)
        })
      })
    })
  }
)
