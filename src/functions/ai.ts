import axios from 'axios'
import { Client, Message } from 'whatsapp-web.js'
import prisma from '../config/prisma'

export async function aiCall(client: Client, message: Message) {
  const apiKey = process.env.AI_API_KEY

  const userInput = message.body.substring(message.body.indexOf(' ')).trim()
  if (!userInput || !userInput.length) {
    message.reply('Tem que escrever algo')
    return
  }

  try {
    const contact = await message.getContact()
    const group = await message.getChat()

    const chatExists = await prisma.chat.findFirst({
      where: {
        contact: contact.id.user,
        location: group.id.user,
      },
    })

    const questionToSend = { role: 'user', content: userInput }

    console.log('chatExists:', chatExists)

    const chatToSend = chatExists ? [...chatExists.chat, questionToSend] : [questionToSend]

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

    const chatResponse: Array<{ index: number; message: any }> = response.data.choices

    if (!chatResponse || !chatResponse.length) {
      message.reply('Chat Indisponivel')
      return
    }

    if (chatExists) {
      await prisma.chat.update({
        where: {
          id: chatExists.id,
        },
        data: {
          chat: [...chatExists.chat, questionToSend, chatResponse[0].message],
        },
      })
    }

    if (!chatExists) {
      await prisma.chat.create({
        data: {
          contact: contact.id.user,
          chat: [questionToSend, chatResponse[0].message],
          location: group.id.user || '',
        },
      })
    }

    console.log('message choices', chatResponse)
    message.reply(chatResponse[0].message.content)
  } catch (error: any) {
    console.log('error', error)
    message.reply('A IA esta descansando no momento')
  }
}

export async function chatReset(message: Message) {
  const contact = await message.getContact()
  const group = await message.getChat()

  const chatExists = await prisma.chat.findFirst({
    where: {
      contact: contact.id.user,
      location: group.id.user,
    },
  })

  if (chatExists) {
    await prisma.chat.delete({
      where: {
        id: chatExists.id,
      },
    })
    message.reply('Chat devidamente resetado, ja pode começar uma nova conversa com AI se quiser')
  } else {
    message.reply('chat nem existe')
  }
}
