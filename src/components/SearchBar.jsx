import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { IoMicOutline, IoSearchOutline } from 'react-icons/io5'
import { useAppContext } from '../context/useAppContext.js'
import useDebounce from '../hooks/useDebounce.js'

function SearchForm({ initialValue }) {
  const { setSearchQuery } = useAppContext()
  const [value, setValue] = useState(initialValue)
  const [listening, setListening] = useState(false)
  const [voiceMessage, setVoiceMessage] = useState('')
  const recognitionRef = useRef(null)
  const navigate = useNavigate()
  const debouncedValue = useDebounce(value, 500)
  const inputIsSettled = value === debouncedValue

  useEffect(() => () => {
    recognitionRef.current?.abort()
  }, [])

  const submit = (event) => {
    event.preventDefault()
    const query = (inputIsSettled ? debouncedValue : value).trim()
    setSearchQuery(query)
    if (query) navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  const startVoiceSearch = () => {
    if (listening) {
      recognitionRef.current?.stop()
      return
    }

    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceMessage('Voice search is not supported in this browser.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = navigator.language || 'en-US'
    recognition.interimResults = true
    recognition.continuous = false
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition

    recognition.onstart = () => {
      setListening(true)
      setVoiceMessage('Listening…')
    }
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join('')
        .trim()
      if (!transcript) return
      setValue(transcript)
      setSearchQuery(transcript)

      const isFinal = event.results[event.results.length - 1]?.isFinal
      if (isFinal) {
        setVoiceMessage(`Searching for “${transcript}”`)
        navigate(`/search?q=${encodeURIComponent(transcript)}`)
      }
    }
    recognition.onerror = (event) => {
      setListening(false)
      if (event.error === 'not-allowed') setVoiceMessage('Microphone permission was denied.')
      else if (event.error === 'no-speech') setVoiceMessage('No speech detected. Try again.')
      else setVoiceMessage('Voice search could not start.')
    }
    recognition.onend = () => {
      setListening(false)
    }

    try {
      recognition.start()
    } catch {
      setListening(false)
      setVoiceMessage('Voice search could not start.')
    }
  }

  return <div className="search-area">
    <form className="search-form" role="search" onSubmit={submit}>
      <input aria-label="Search videos" type="search" placeholder="Search" value={value} onChange={(event) => { setValue(event.target.value); setSearchQuery(event.target.value) }} />
      <button className="search-submit" type="submit" aria-label="Search"><IoSearchOutline /></button>
    </form>
    <button className={`icon-button mic-button ${listening ? 'mic-button--listening' : ''}`} type="button" aria-label={listening ? 'Stop voice search' : 'Start voice search'} title={listening ? 'Listening…' : 'Voice search'} aria-pressed={listening} onClick={startVoiceSearch}><IoMicOutline /></button>
    <span className="visually-hidden" role="status" aria-live="polite">{voiceMessage}</span>
  </div>
}
SearchForm.propTypes = { initialValue: PropTypes.string.isRequired }

function SearchBar() {
  const { searchQuery } = useAppContext()
  const [params] = useSearchParams()
  const location = useLocation()
  const initialValue = location.pathname === '/search' ? params.get('q') ?? '' : searchQuery
  return <SearchForm key={`${location.pathname}${location.search}`} initialValue={initialValue} />
}

export default SearchBar