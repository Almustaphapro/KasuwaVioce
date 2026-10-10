import { useCallback, useEffect, useRef, useState } from 'react'
export type RecorderState = 'idle' | 'requesting' | 'recording' | 'recorded' | 'error'
export function useRecorder() {
  const [state, setState] = useState<RecorderState>('idle')
  const [seconds, setSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const recorder = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const generation = useRef(0)
  const started = useRef(0)
  const url = useRef<string | null>(null)
  const release = useCallback(() => {
    if (recorder.current?.state === 'recording') recorder.current.stop()
    stream.current?.getTracks().forEach((track) => track.stop())
    stream.current = null
    if (url.current) URL.revokeObjectURL(url.current)
    url.current = null
  }, [])
  const reset = useCallback(() => {
    generation.current += 1
    release()
    setAudioUrl(null)
    setSeconds(0)
    setError('')
    setState('idle')
  }, [release])
  const stop = useCallback(() => {
    if (recorder.current?.state === 'recording') recorder.current.stop()
    stream.current?.getTracks().forEach((track) => track.stop())
  }, [])
  useEffect(
    () => () => {
      generation.current += 1
      release()
    },
    [release],
  )
  useEffect(() => {
    if (state !== 'recording') return
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - started.current) / 1000)
      setSeconds(Math.min(60, elapsed))
      if (elapsed >= 60) stop()
    }, 200)
    return () => window.clearInterval(timer)
  }, [state, stop])
  async function start() {
    reset()
    const current = generation.current
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Recording is not supported here. Use a supported browser on HTTPS or localhost.')
      setState('error')
      return
    }
    setState('requesting')
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (generation.current !== current) {
        media.getTracks().forEach((track) => track.stop())
        return
      }
      stream.current = media
      const instance = new MediaRecorder(media)
      recorder.current = instance
      const chunks: Blob[] = []
      instance.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data)
      }
      instance.onerror = () => {
        if (generation.current !== current) return
        generation.current += 1
        release()
        setState('error')
        setError('The microphone stopped unexpectedly. Please try again.')
      }
      instance.onstop = () => {
        media.getTracks().forEach((track) => track.stop())
        if (generation.current !== current) return
        const blob = new Blob(chunks, { type: instance.mimeType || 'audio/webm' })
        if (!blob.size) {
          setError('No audio was captured. Check your microphone and try again.')
          setState('error')
          return
        }
        url.current = URL.createObjectURL(blob)
        setAudioUrl(url.current)
        setState('recorded')
      }
      started.current = Date.now()
      instance.start()
      setState('recording')
    } catch (reason) {
      if (generation.current !== current) return
      release()
      const name = reason instanceof DOMException ? reason.name : ''
      setError(
        name === 'NotAllowedError'
          ? 'Microphone permission was denied. Allow access in your browser settings, then retry.'
          : name === 'NotFoundError'
            ? 'No microphone was found. Connect one and try again.'
            : 'We couldn’t start your microphone. Check that it is available and try again.',
      )
      setState('error')
    }
  }
  return { state, seconds, audioUrl, error, start, stop, reset }
}
