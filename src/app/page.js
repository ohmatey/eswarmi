'use client'

import { useState, useEffect } from 'react'
import VideoFeedback from './VideoFeedback'

import useTalkToUser from '@/utils/useTalkToUser'

const yogaRoutines = [
  {
    name: 'Hatha Yoga',
    description: 'This is often considered a great starting point for beginners. Hatha Yoga focuses on basic postures at a comfortable pace, helping in building a foundation in yoga practice.',
  },
  {
    name: 'Vinyasa Yoga',
    description: `Known for its fluid, movement-intensive practices, Vinyasa Yoga synchronizes breath with movement. It's dynamic and athletic, often appealing to those who prefer a more vigorous workout.`,
  },
  {
    name: 'Ashtanga Yoga',
    description: `This is a rigorous style of yoga that follows a specific sequence of postures and is similar to Vinyasa Yoga in its flow and movement. It's a physically demanding practice, often suited for experienced yogis.`,
  },
  {
    name: 'Kundalini Yoga',
    description: `Known for its focus on awakening the kundalini energy at the base of the spine, this style of yoga combines postures, breathing exercises, and the chanting of mantras. It's as much a spiritual practice as a physical one.`,
  }
]

export default function Home() {
  const [selectedRoutine, setSelectedRoutine] = useState(yogaRoutines[0])
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
        body: JSON.stringify({
          routineName: selectedRoutine.name,
        }),
      })

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

  const stop = () => {
    setIsStarted(false)

    setPoseIndex(0)
    setPoses([])
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

            const posesListElement = document.getElementById('poses-list')
            const nextPoseElement = document.getElementById(`pose-${poseIndex + 1}`)

            // move the next pose into view
            if (posesListElement && nextPoseElement) {
              posesListElement.scrollTo({
                top: nextPoseElement.offsetTop,
                behavior: 'smooth',
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
            <div>
              <h1>{selectedRoutine.name}</h1>

              <h2>{poses[poseIndex]?.pose}</h2>

              <p>{poses[poseIndex]?.description}</p>

              <p>{poses[poseIndex]?.poseTimeMs}</p>

              <button
                onClick={stop}
              >
                Stop
              </button>
            </div>

            <div
              id='poses-list'
              style={{
                overflowY: 'scroll',
                height: '100vh',
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
          </div>
        </>
      ) : (
        <div>
          <h1>E-Swarmi</h1>

          <h2>Select a Yoga Routine</h2>

          <select
            value={selectedRoutine.name}
            onChange={(event) => {
              const selectedRoutine = yogaRoutines.find((routine) => routine.name === event.target.value)

              setSelectedRoutine(selectedRoutine)
            }}
            style={{
              marginBottom: 8,
            }}
          >
            {yogaRoutines.map((routine, index) => (
              <option
                key={index}
                value={routine.name}
              >
                {routine.name}
              </option>
            ))}
          </select>

          <p
            style={{
              maxWidth: 300,
            }}
          >{selectedRoutine.description}</p>

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
