'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Doctor } from '@/lib/types';
import DoctorCard from '@/components/DoctorCard';
import { Send, Loader } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  doctors?: Doctor[];
}

export default function FindSurgeonPage() {
  const t = useTranslations();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: t('findSurgeon.greeting'),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        doctors: data.doctors || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('findSurgeon.error'),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">{t('findSurgeon.title')}</h1>
          <p className="text-primary-100">{t('findSurgeon.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Chat Container */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden flex flex-col h-[600px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-2xl ${
                    message.role === 'user'
                      ? 'bg-primary-500 text-white rounded-lg rounded-tr-none'
                      : 'bg-gray-100 text-gray-900 rounded-lg rounded-tl-none'
                  } px-4 py-3`}
                >
                  <p className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </p>

                  {/* Doctor Cards in Chat */}
                  {message.doctors && message.doctors.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {message.doctors.map((doctor) => (
                        <div
                          key={doctor.id}
                          className="bg-white rounded border border-gray-200 p-3 text-gray-900"
                        >
                          <div className="font-medium text-sm">
                            {doctor.title} {doctor.first_name}{' '}
                            {doctor.last_name}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {doctor.specialty?.name_en || ''}
                          </div>
                          {doctor.city && (
                            <div className="text-xs text-gray-600">
                              {doctor.city}
                            </div>
                          )}
                          <Link
                            href={`/doctors/${doctor.slug}`}
                            className="inline-block mt-2 text-xs px-2 py-1 bg-primary-500 text-white rounded hover:bg-primary-600"
                          >
                            {t('common.viewProfile')}
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 rounded-lg rounded-tl-none px-4 py-3">
                  <Loader size={18} className="animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('findSurgeon.inputPlaceholder')}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <p className="font-medium mb-2">{t('findSurgeon.disclaimerTitle')}</p>
          <p>{t('findSurgeon.disclaimerText')}</p>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/doctors"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <h3 className="font-medium text-gray-900 mb-1">
              {t('findSurgeon.browseDoctors')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('findSurgeon.browseAllDoctors')}
            </p>
          </Link>

          <Link
            href="/specialties"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <h3 className="font-medium text-gray-900 mb-1">
              {t('findSurgeon.bySpecialty')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('findSurgeon.browseBySpecialty')}
            </p>
          </Link>

          <Link
            href="/doctors"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <h3 className="font-medium text-gray-900 mb-1">
              {t('findSurgeon.byLocation')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('findSurgeon.browseByLocation')}
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
