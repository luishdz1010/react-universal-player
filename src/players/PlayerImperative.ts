export default interface PlayerImperative<T> {
  readonly player: T

  seekTo(amount: number): void
}
