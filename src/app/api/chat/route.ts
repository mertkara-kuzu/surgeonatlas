import { NextRequest, NextResponse } from 'next/server';
import { MOCK_DOCTORS } from '@/lib/mock-data';
import type { Doctor } from '@/lib/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are a helpful medical surgeon matching assistant for SurgeonAtlas.com, a directory of surgeons in Turkey. Your role is to help patients find the right surgeon for their needs.

When a patient describes their medical condition, symptoms, or surgical needs, you should:
1. Ask clarifying questions if needed (location preference, specialty needed, etc.)
2. Understand their requirements and preferences
3. Provide personalized recommendations based on their needs
4. Be empathetic and professional

When you have enough information to recommend surgeons, include specific specialty keywords that can be used to search for doctors in the system. Keep your responses concise and helpful.

Never provide medical advice or act as a doctor. Always encourage patients to consult with healthcare professionals for medical decisions.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      );
    }

    // If Claude API key is not set, return a demo response
    if (!process.env.ANTHROPIC_API_KEY) {
      const specialtyKeywords = extractSpecialtyKeywords(message);
      const doctors = searchMockDoctors(specialtyKeywords);

      return NextResponse.json({
        message: `Thank you for your question. This is a demo mode response — the AI chatbot requires an Anthropic API key to provide personalized recommendations. In production, I would analyze your needs and suggest the best surgeons from our directory. ${doctors.length > 0 ? 'Here are some doctors that may be relevant:' : 'Please browse our directory to find specialists.'}`,
        doctors: doctors.length > 0 ? doctors : undefined,
      });
    }

    // Dynamic import of Anthropic SDK (only when API key exists)
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Build messages for Claude
    const messages = history
      .filter((msg: Message) => msg.role === 'user' || msg.role === 'assistant')
      .map((msg: Message) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    messages.push({
      role: 'user' as const,
      content: message,
    });

    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages,
    });

    const assistantMessage =
      response.content[0].type === 'text' ? response.content[0].text : '';

    const specialtyKeywords = extractSpecialtyKeywords(assistantMessage);
    const doctors = searchMockDoctors(specialtyKeywords);

    return NextResponse.json({
      message: assistantMessage,
      doctors: doctors.length > 0 ? doctors : undefined,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}

function searchMockDoctors(keywords: string[]): Doctor[] {
  if (keywords.length === 0) return [];

  return MOCK_DOCTORS.filter((doc) => {
    const specName = doc.specialty?.name_en?.toLowerCase() || '';
    return keywords.some((kw) => specName.includes(kw));
  }).slice(0, 3);
}

function extractSpecialtyKeywords(text: string): string[] {
  const specialties = [
    'cardiac', 'cardiology', 'cardiothoracic',
    'neurosurgery', 'neuro',
    'orthopedic', 'orthopedics',
    'general surgery',
    'gastroenterology', 'gi',
    'urology',
    'oncology', 'cancer',
    'vascular',
    'transplant',
    'spine',
    'pediatric',
    'trauma',
    'plastic', 'cosmetic', 'reconstructive', 'aesthetic',
    'thoracic',
    'hepatic', 'liver',
    'kidney', 'renal',
    'minimally invasive', 'laparoscopic', 'robotic',
    'ophthalmology', 'eye',
    'dentistry', 'dental',
    'dermatology', 'skin',
    'hair transplant', 'hair',
  ];

  const found: string[] = [];
  const lowerText = text.toLowerCase();

  specialties.forEach((specialty) => {
    if (lowerText.includes(specialty) && !found.includes(specialty)) {
      found.push(specialty);
    }
  });

  return found;
}
