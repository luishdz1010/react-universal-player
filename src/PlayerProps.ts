export interface PlayerProps {
  url: string
  urlConstructor: UniversalURLConstructor
  playing?: boolean
  onPlayingChange?: (playing: boolean) => void
  volume?: number
  onVolumeChange?: (volume: number) => void
  loop?: boolean
  controls?: boolean
  className?: string
  playsinline?: boolean
  autoplay?: boolean
  muted?: boolean
  onError?: (error: Error) => void
}

export interface VideoState<VendorApi> {
  url: string
  urlConstructor: UniversalURLConstructor
  vendorApi: VendorApi | null
  playing: boolean
  onPlayingChange: (playing: boolean) => void
  volume: number
  onVolumeChange: (volume: number) => void
  loop: boolean
  controls: boolean
  playsinline: boolean
  muted: boolean
  onError: (error: Error) => void
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
