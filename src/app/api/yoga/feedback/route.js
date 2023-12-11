import { NextResponse } from 'next/server'

import { runVision } from '@/services/openai'

export const POST = async (request) => {
  const { poseName, image } = await request.json()

  if (!image || !poseName) {
    console.log('missing image or pose name', image, poseName)
    return NextResponse.error(new Error('Missing image or pose name'))
  }

  try {
    const res = await runVision({
      model: 'gpt-4-vision-preview',
      messages: [
        // system
        {
          role: 'system',
          content: `
            You are a master Yoga Swarmi. You are teaching a class of students. you are to run them through a complete yoga sequence.

            You are to critique their posture and give them feedback on how to improve their posture.

            You are to give them feedback on their posture for the pose ${poseName}.

            Keep feedback and advise brief and to the point. 2 sentences max.
            Start with a compliment, then give them feedback on how to improve their posture.

            If you do not have any feedback, the image does not contain a yoga post or find the image does not match any yoga pose return "no feedback".
          `,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Help critique my yoga posture for the pose ${poseName}`,
            },
            {
              type: 'image',
              // base64
              image_url: `data:image/png;base64,${image}`,
            }
          ]
        },
      ]
    })
    
    return NextResponse.json(res.content)
  } catch (error) {
    console.error(error)

    return NextResponse.error(error)
  }
}