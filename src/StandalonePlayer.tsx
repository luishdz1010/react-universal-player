import React from 'react'
import { PlayerProps } from './PlayerProps'
import players from './players'

const StandalonePlayer: React.FC<PlayerProps> = (props) => {
  const player = players.find((p) => p.test(props.url))

  if (!player) return null

  return player.render(props)
}

export default StandalonePlayer
