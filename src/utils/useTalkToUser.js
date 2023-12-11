import { useState } from 'react'

const useTalkToUser = () => {
  const [isTalking, setIsTalking] = useState(false)

  const talk = (text) => {
    setIsTalking(true)

    const utterance = new SpeechSynthesisUtterance()
    utterance.text = text
    utterance.lang = 'en-US'
    
    speechSynthesis.speak(utterance)

    utterance.onend = () => {
      setIsTalking(false)
    }
  }

  return {
    talk,
    isTalking,
  }
}

export default useTalkToUser