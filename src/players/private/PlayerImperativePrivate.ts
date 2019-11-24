export default interface PlayerImperativePrivate {
  play(): void | Promise<unknown>

  pause(): unknown

  setVolume(volume: number): unknown

  setLoop(loop: boolean): unknown
}

export interface PlayerImperativeMuteable {
  setMuted: (muted: boolean) => unknown
}
