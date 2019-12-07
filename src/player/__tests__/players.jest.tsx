import React from 'react'
import { describe, expect, it } from '../../__tests__/jest'
import { universalRender } from '../../__tests__/utils'
import { UniversalURLConstructor } from '../../PlayerProps'
import * as allPlayers from './players'

// eslint-disable-next-line import/prefer-default-export
export const commonPlayersTests = (urlConstructor: UniversalURLConstructor) => {
  describe.each(Object.values(allPlayers))('%s universal', ({ Player }) => {
    it.each(['', 'notaurl', 'video.com', 'http://example.com'])('renders with url=%s', (url) => {
      const { asSnapshot } = universalRender(<Player url={url} urlConstructor={urlConstructor} />)
      expect(asSnapshot()).toMatchSnapshot()
    })
  })
}
