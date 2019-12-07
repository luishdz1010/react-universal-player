interface PlayingStatus {
  playing: boolean | null
  error: Error | null
}

interface VolumeStatus {
  volume: number | null
  error: Error | null
}

export interface PlayerProps {
  className?: string
  url: string
  urlConstructor: UniversalURLConstructor
  autoplay?: boolean
  initialMuted?: boolean
  onPlayingChange?: (status: PlayingStatus) => void
  onVolumeChange?: (status: VolumeStatus) => void
  onMuteChange?: (muted: boolean) => void
  loop?: boolean
  controls?: boolean
  playsinline?: boolean
}

export interface PlayerInternalState<VendorApi> {
  url: string
  urlConstructor: UniversalURLConstructor
  vendorApi: VendorApi | null
  playing: boolean | null
  onPlayingChange: (status: Partial<PlayingStatus>) => void
  playbackError: Error | null
  volume: number | null
  volumeError: Error | null
  muted: boolean | null
  onVolumeChange: (status: Partial<VolumeStatus>) => void
  onMuteChange: (muted: boolean) => void
  loop: boolean
  controls: boolean
  playsinline: boolean
}

export interface UniversalURLSearchParams {
  delete(name: string): void

  get(name: string): string | null

  set(name: string, value: string): void
}

export interface UniversalURL {
  readonly searchParams: UniversalURLSearchParams
}

export interface UniversalURLConstructor {
  new (url: string, base?: string): UniversalURL
}
