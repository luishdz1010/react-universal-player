export default interface PlayerImperativePrivate {
  setLoop(loop: boolean): Promise<unknown>
}

export interface PlayerImperativeMuteable {
  setMuted: (muted: boolean) => unknown
}
