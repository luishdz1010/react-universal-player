import { wait } from '@testing-library/react'
import React, { createRef } from 'react'
import { render, waitForRef } from '../../__tests__/utils'
import { VimeoPlayerImperative } from '../private/VimeoPlayerImpl'
import { vimeo } from './players'

const { Player, validUrl, vimeoVendorApiLoader } = vimeo
const props = { vimeoVendorApiLoader, url: validUrl, urlConstructor: URL }

describe('Vimeo browser', () => {
  // it('plays video after update', async () => {
  //   const api = createRef<VimeoPlayerImperative>()
  //   const { rerender } = render(<Player {...props} ref={api} muted />)
  //   const { player } = await waitForRef(api)
  //
  //   rerender(<Player {...props} ref={api} playing muted />)
  //
  //   await wait(async () => {
  //     const isPaused = await player.getPaused()
  //
  //     if (isPaused) throw new Error('player is paused')
  //
  //     expect(isPaused).toBeFalse()
  //   })
  // })
})
