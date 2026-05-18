import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: Request) {
  try {
    const { messages, conversationId } = await req.json()

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    // System prompt for the AI stakeholder
    const systemPrompt = `You are a senior stakeholder in a software company. You're in a negotiation with a project manager who is requesting a deadline extension. 

Your character:
- Initially skeptical but open to discussion
- Concerned about business impact and timeline
- Interested in hearing the project manager's reasoning
- Can be persuaded with good arguments about risk, team capacity, or quality
- Values clear communication and honest assessment
- May ask probing questions about risks, resources, and alternatives

Your role is to simulate a realistic negotiation. After about 5-7 exchanges (when you feel you have enough information), make a decision to either:
1. Agree to the extension (score: 70-90 depending on how well they negotiated)
2. Propose a compromise (score: 60-80)
3. Remain firm but acknowledge their concerns (score: 40-60)

When making your final decision, end your message with a special marker: [NEGOTIATION_COMPLETE] followed by a suggested score like [SCORE:75]

Evaluate the user on:
- Clarity of explanation (do they explain their needs clearly?)
- Empathy (do they acknowledge business concerns?)
- Problem-solving (do they propose solutions?)
- Active listening (do they address your concerns?)
- Honesty (are they realistic about the situation?)`

    // Prepare messages for the AI
    const aiMessages = messages.map((msg: Message) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))

    // Call Claude via AI SDK
    const response = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: aiMessages,
      temperature: 0.7,
      maxTokens: 500,
    })

    const aiResponse = response.text

    // Check if negotiation is complete
    let completed = false
    let score = 0

    if (aiResponse.includes('[NEGOTIATION_COMPLETE]')) {
      completed = true
      const scoreMatch = aiResponse.match(/\[SCORE:(\d+)\]/)
      score = scoreMatch ? parseInt(scoreMatch[1]) : 75

      // Clean up the response by removing the markers
      return Response.json({
        message: aiResponse.replace(/\[NEGOTIATION_COMPLETE\].*$/s, '').trim(),
        completed,
        score,
      })
    }

    return Response.json({
      message: aiResponse,
      completed: false,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
