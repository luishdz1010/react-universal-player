import { render, wait } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from '../../__tests__/jest'
import * as allPlayers from './players'
import { commonPlayersTests } from './players.jest'

commonPlayersTests(URL)

describe.each(Object.values(allPlayers))('%s jsdom', ({ Player }) => {
  const sharedPlayerProps = {
    urlConstructor: URL,
  }

  it('returns an error unrecognizable url', async () => {
    let err: Error | null = null

    render(
      <Player
        url="http://example.com/123"
        {...sharedPlayerProps}
        onPlayingChange={({ error }) => {
          err = error
        }}
      />
    )

    await wait(() => {
      expect(err).toBeInstanceOf(Error)
      expect(err).toMatchSnapshot()
    })
  })
})
