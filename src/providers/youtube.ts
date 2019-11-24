import loadScript from '../loadScript'

// eslint-disable-next-line no-undef
export type YouTubeVendorApi = typeof YT

export const YOUTUBE_SCRIPT_URL = 'https://www.youtube.com/iframe_api'

export const youTubeUrlTest = (url: string) => {
  return /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))(?:\w|-)+|youtube\.com\/playlist\?list=/.test(
    url
  )
}

export const youTubeVendorApiLoader = (): Promise<YouTubeVendorApi> => {
  // window.YT.Player only gets set after 'onYouTubePlayerAPIReady', so this is a somewhat reliable way of detecting
  // if the script was already loaded (by us or anyone else)
  if (typeof window.YT === 'object' && typeof window.YT.Player === 'function') return Promise.resolve(window.YT)

  return loadScript(YOUTUBE_SCRIPT_URL, {
    windowCallback: 'onYouTubePlayerAPIReady',
  }).then(() => window.YT)
}
