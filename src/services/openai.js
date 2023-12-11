const OpenAI = require('openai')

const defaultModel = 'gpt-3.5-turbo-1106'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runCompletion = async ({
  model = defaultModel,
  prompt,
  messages = [],
  maxTokens = 100,
}) => {
  const chatCompletion = await openai.chat.completions.create({
    model,
    messages: messages.length > 0 ? messages : [
      {
        role: 'user', 
        content: prompt
      }
    ],
    response_format: {
      type: 'json_object'
    },
    max_tokens: maxTokens,
  })

  const reply = chatCompletion.choices[0].message

  const jsonReply = JSON.parse(reply.content)

  return jsonReply
}

export const runVision = async ({
  model = defaultModel,
  prompt,
  messages = [],
}) => {
  const chatCompletion = await openai.chat.completions.create({
    model,
    messages: messages.length > 0 ? messages : [
      {
        role: 'user', 
        content: prompt
      }
    ],
    max_tokens: 100,
  })
  console.log(chatCompletion.choices[0])
  const reply = chatCompletion.choices[0].message

  return reply
}