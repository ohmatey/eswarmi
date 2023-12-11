import { NextResponse } from 'next/server'

import { runCompletion } from '../../../services/openai'

export const POST = async (request) => {
  const { routineName } = await request.json()

  try {
    const res = await runCompletion({
      messages: [
        // system
        {
          role: 'system',
          content: `
            You are a master Yoga Swarmi. You are teaching a class of students. you are to run them through a complete yoga sequence in the ${routineName} style.

            Pose times should be between 20000-60000 seconds with additional time to explain the pose in the description.
            You only return a JSON object that contains a yoga sequence.

            {
              "title": "name of yoga program ie Hatha, Sun Series, Vinyasa, etc",
              "poses": [
                {
                  "pose": "name of pose",
                  "description: "description of pose to be spoken to students. Include any modifications or props needed. Also include any benefits of the pose, history or fun facts. Each description should flow from the next pose so start each with 'from <previous pose> we move into <current pose>'",
                  "poseTimeMs": 20000
                }
              ]
            }
          `,
        },
        {
          role: 'user',
          content: 'Start Yoga',
        }
      ]
    })
    
    return NextResponse.json(res)
  } catch (error) {
    console.error(error)

    return NextResponse.error(error)
  }
}