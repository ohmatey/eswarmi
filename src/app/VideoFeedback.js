/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react'

import useTalkToUser from '@/utils/useTalkToUser'

const VideoFeedback = ({
  isStarted,
  poseName,
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [video, setVideo] = useState(null)

  const {
    talk,
    isTalking,
  } = useTalkToUser()

  // when isStarted start recording video from webcam
  useEffect(() => {
    const startRecording = async () => {
      setIsRecording(true)

      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })

      const video = document.getElementById('video')

      video.srcObject = cameraStream

      video.play()

      setVideo(video)
    }

    startRecording()
  }, [video])

  // every 5 seconds take a snapshot of the video and send it to the server
  useEffect(() => {
    if (video) {
      const interval = setInterval(() => {
        const canvas = document.createElement('canvas')

        canvas.width = video.videoWidth / 2
        canvas.height = video.videoHeight / 2

        const context = canvas.getContext('2d')

        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)

        const data = canvas.toDataURL('image/png')

        // set img src to data url
        const img = document.createElement('img')

        img.src = data

        // make base64 string
        const base64String = data.replace(/^data:image\/(png|jpg);base64,/, '')

        // send data to server
        const getFeedback = async () => {
          fetch('/api/yoga/feedback', {
            method: 'POST',
            body: JSON.stringify({
              poseName: 'Sun Salutation2',
              image: base64String,
            }),
            headers: {
              'Content-Type': 'application/json'
            }
          })
          .then(response => response.json())
          .then(feedback => {
            if (
              feedback === 'no feedback' ||
              feedback.includes('unable to provide feedback') ||
              feedback.includes('does not show')
            ) {
              return
            }

            if (!isTalking) {
              talk(feedback)
            }
          })
          .catch(error => console.error('Error:', error))
        }

        getFeedback()
      }, 10000)

      return () => {
        clearInterval(interval)
      }
    }
  }, [video, poseName])
  
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 50,
        right: 50,
        border: '1px solid black',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 320,
          height: 240,
        }}
      >
        <video 
          id='video'
          autoPlay 
          muted
          style={{
            width: 320,
            height: 240,
          }}
        ></video>
      </div>
    </div>
  )
}

export default VideoFeedback