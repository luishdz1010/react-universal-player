import { render, wait } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from '../../__tests__/jest'
import * as allPlayers from './players'
import { commonPlayersTests } from './players.jest'

commonPlayersTests(URL)

describe.each(Object.values(allPlayers))('%s jsdom', ({ Player, name }) => {
  const sharedPlayerProps = {
    urlConstructor: URL,
  }

  it('calls onError on unrecognizable url', async () => {
    let err: Error | null = null
    const onError = (e: Error) => {
      err = e
    }

    render(<Player url="http://example.com/123" {...sharedPlayerProps} onError={onError} />)

    await wait(() => {
      expect(err).toMatchSnapshot()
    })
  })
})
