import { useEffect, useMemo, useRef } from 'react'

export const useLastValueRef = <T>(val: T) => {
  const ref = useRef(val)

  useEffect(() => {
    ref.current = val
  })

  return ref
}

export const useValidateUrl = (
  url: string,
  validator: (url: string) => boolean,
  onError: (e: { error: Error }) => void
): string | false => {
  const isValid = useMemo(() => validator(url), [url, validator])

  useEffect(() => {
    if (!isValid) onError({ error: new Error(`provided url(${url}) isn't supported by this player`) })
  }, [url, isValid, onError])

  return url
}
