export default interface PlayerImperative<T = unknown> {
  readonly player: T

  setPlaying(playing: boolean): Promise<unknown>

  setVolume(volume: number): Promise<unknown>

  setMuted(muted: boolean): Promise<unknown>

  seekTo(amount: number): void
}
