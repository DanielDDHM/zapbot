import { Client, Message } from 'whatsapp-web.js'
import prisma from '../config/prisma'
import axios from 'axios'
import fs from 'fs/promises'

async function loadContext(contextFile: string) {
  try {
    const data = await fs.readFile(`./src/chat/contexts/${contextFile}.json`, 'utf-8')
    const context = JSON.parse(data)
    return context.context
  } catch (error) {
    console.error('Erro ao carregar o contexto:', error)
    return null
  }
}

export async function aiChatCall(client: Client, message: Message, ctx: string) {
  const apiKey = process.env.AI_API_KEY

  const userInput = message.body

  try {
    const contact = await message.getContact()
    const source = await message.getChat()

    const chatExists = await prisma.chat.findFirst({
      where: {
        contact: contact.id.user,
        location: source.id.user,
      },
    })

    if (chatExists && chatExists.chat.length > Number(process.env.QTD_MAX_CHAT)) {
      message.reply('Limite atingido, caso queira continuar entre em contato com responsavel')
    }

    const questionToSend = { role: 'user', content: userInput }

    const context = await loadContext(ctx)

    if (!context) {
      message.reply('Estamos indisponiveis no momento.')
      return
    }

    const chatToSend = chatExists
      ? [...chatExists.chat, questionToSend]
      : [...context, questionToSend]

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
          chat: [...context, questionToSend, chatResponse[0].message],
          location: source.id.user || '',
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
