import * as Vimeo from '@vimeo/player'
import loadScript from '../loadScript'

export type VimeoVendorApi = typeof Vimeo

export const VIMEO_SCRIPT_URL = 'https://player.vimeo.com/api/player.js'

export const vimeoUrlTest = (url: string) => {
  return /^(https?:)?\/\/((player|www)\.)?vimeo\.com(?=$|\/)/.test(url)
}

export const vimeoVendorApiLoader = (): Promise<VimeoVendorApi> => {
  const w = window as any

  if (w.Vimeo) return Promise.resolve(w.Vimeo)

  return loadScript(VIMEO_SCRIPT_URL).then(() => w.Vimeo)
}
