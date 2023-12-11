'use client'

import { useState, useEffect } from 'react'
import VideoFeedback from './VideoFeedback'

import useTalkToUser from '@/utils/useTalkToUser'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [poses, setPoses] = useState([])
  const [poseIndex, setPoseIndex] = useState(0)

  const {
    talk,
    isTalking,
  } = useTalkToUser()

  const start = async () => {
    try {
      setIsLoading(true)

      const result = await fetch('/api/yoga', {
        method: 'POST',
      })
      console.log(result)
      if (result.ok) {
        setIsStarted(true)
      }

      const data = await result.json()

      setPoseIndex(0)
      setPoses(data.poses)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // countdown each time a pose is started
  useEffect(() => {
    if (isStarted) {
      const pose = poses[poseIndex]

      const interval = setInterval(() => {
        if (pose.poseTimeMs === 0) {
          if (poseIndex === poses.length - 1) {
            // wrap the session tell the user
            talk('Session complete. Namaste. Have a great day.')

            setIsStarted(false)
          } else {
            setPoseIndex(poseIndex + 1)

            const nextPoseElement = document.getElementById(`pose-${poseIndex + 1}`)

            if (nextPoseElement) {
              nextPoseElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              })
            }
          }
        } else {
          setPoses([
            ...poses.slice(0, poseIndex),
            {
              ...pose,
              poseTimeMs: pose.poseTimeMs - 1000,
            },
            ...poses.slice(poseIndex + 1),
          ])
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isStarted, poseIndex, poses, talk])

  // speak the pose name and description each time a pose is started
  useEffect(() => {
    if (isStarted) {
      const pose = poses[poseIndex]

      if (!pose) {
        return
      }

      // skip if the pose has already been read
      if (pose.isRead) {
        return
      }

      // mark the pose as read
      setPoses([
        ...poses.slice(0, poseIndex),
        {
          ...pose,
          isRead: true,
        },
        ...poses.slice(poseIndex + 1),
      ])

      if (poseIndex === 0) {
        talk(`Alright, let's get started. ${pose.pose}`)
      }

      if (!isTalking) {
        talk(pose.pose)
      }
    }
  }, [isStarted, poseIndex, poses, talk, isTalking])

  return (
    <main>
      {isStarted ? (
        <>
          <VideoFeedback
            isStarted
            pose={'downward dog'}
          />

          <div
            // 2 columns
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}
          >
            <ol>
              {poses.map((pose, index) => {
                const isActive = index === poseIndex

                return (
                  <li
                    key={index}
                    id={`pose-${index}`}
                    style={{
                      fontWeight: isActive ? 'bold' : 'normal',
                      opacity: (pose.isRead && !isActive) ? 0.5 : 1,
                    }}
                  >
                    <h2>{pose.pose}</h2>
                    <p>{pose.description}</p>
                    <p>{pose.poseTimeMs}</p>
                  </li>
                )
              })}
            </ol>
          </div>
        </>
      ) : (
        <div>
          <h1>Yoga</h1>
          <button
            onClick={start}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Start'}
          </button>
        </div>
      )}
    </main>
  )
}
