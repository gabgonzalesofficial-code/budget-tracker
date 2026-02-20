import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const systemPrompt = `You are a friendly, knowledgeable AI financial coach for a personal budget tracker app. You help users understand their spending, suggest ways to save, and provide personalized money advice.

IMPORTANT RULES:
- Be concise and actionable. Use bullet points when listing recommendations.
- Use the user's financial context when provided—reference specific categories, amounts, and trends.
- If no financial data is provided, give general tips and encourage them to add transactions.
- Never give specific investment or legal advice. Frame suggestions as general guidance.
- Use a warm, supportive tone. Celebrate progress when appropriate.
- Format numbers clearly (e.g., "₱5,000" for Philippine Peso when amounts are in that currency).
- Keep responses focused—typically 2–4 short paragraphs or a clear list.`;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service is not configured. Add GROQ_API_KEY to your environment.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { messages, financialContext } = body as {
      messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
      financialContext?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    const groq = new Groq({ apiKey });

    const contextBlock = financialContext
      ? `\n\nHere is the user's current financial snapshot (use this to personalize your response):\n${financialContext}\n`
      : '';

    const fullMessages = [
      {
        role: 'system' as const,
        content: systemPrompt + contextBlock,
      },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: fullMessages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content ?? 'Sorry, I could not generate a response.';
    return NextResponse.json({ content });
  } catch (err) {
    console.error('AI chat error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: message || 'Failed to get AI response' },
      { status: 500 }
    );
  }
}
