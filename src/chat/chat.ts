import { Client, Message } from 'whatsapp-web.js'
import prisma from '../config/prisma'
import axios from 'axios'
import { verifyLimitChat } from '../helpers/verifyLimitChat'

type ChatToSend = Array<{ role: string; content: string }>

async function loadContext() {
  try {
    const data = await prisma.chatContexts.findFirst({
      where: {
        owner: process.env.CHAT_OWNER,
        name: process.env.CONTEXT_CHAT,
      },
    })
    return data
  } catch (error) {
    console.error('Erro ao carregar o contexto:', error)
    return null
  }
}

async function aiApiCall(chatToSend: ChatToSend) {
  const apiKey = process.env.AI_API_KEY
  const response = await axios.post(
    process.env.AI_URL!,
    {
      model: process.env.AI_MODEL,
      messages: chatToSend,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}

export async function aiChatCall(client: Client, message: Message) {
  const userInput = message.body
  let chatToSend = []
  let chatResponse
  const questionToSend = { role: 'user', content: userInput }

  try {
    const contact = await message.getContact()
    const source = await message.getChat()

    const chatExists = await prisma.chat.findFirst({
      where: {
        contact: contact.id.user,
        location: source.id.user,
      },
    })

    if (chatExists) {
      verifyLimitChat(chatExists, message)
      chatToSend = [...chatExists.chat, questionToSend]

      chatResponse = await aiApiCall(chatToSend as ChatToSend)

      await prisma.chat.update({
        where: {
          id: chatExists.id,
        },
        data: {
          chat: [...chatToSend, chatResponse.choices[0]?.message],
        },
      })
    } else {
      const context = await loadContext()

      if (!context) {
        message.reply('Estamos indisponiveis no momento.')
        return
      }

      chatToSend = [...context.context, questionToSend]
      chatResponse = await aiApiCall(chatToSend as ChatToSend)

      await prisma.chat.create({
        data: {
          contact: contact.id.user,
          chat: [...context.context, questionToSend, chatResponse.choices[0]?.message],
          location: source.id.user || '',
        },
      })
    }

    message.reply(chatResponse.choices[0]?.message.content)
  } catch (error) {
    console.log('error', error)
    message.reply('A IA esta descansando no momento')
  }
}
