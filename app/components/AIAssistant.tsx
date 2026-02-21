'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Loader2, AlertCircle } from 'lucide-react';
import Icon from '@/app/components/Icon';
import { buildFinancialContext } from '@/lib/ai-context';
import { getCategorySpending } from '@/lib/queries/budgets';
import { useCurrency } from '@/context/CurrencyContext';
import type { IconName } from '@/app/components/Icon';

interface Insight {
  id: number;
  title: string;
  description: string;
  type: 'warning' | 'suggestion' | 'achievement';
  iconName: IconName;
}

export default function AIAssistant() {
  const { symbol, formatAmount } = useCurrency();
  const [messages, setMessages] = useState<
    { id: number; type: 'user' | 'ai'; content: string; timestamp: Date }[]
  >([
    {
      id: 1,
      type: 'ai',
      content:
        "Hello! I'm your AI financial coach. I've analyzed your spending patterns and I'm here to help you make better financial decisions. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [financialContext, setFinancialContext] = useState<string>('');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    'How can I reduce my spending?',
    'Am I on track this month?',
    "What's my biggest expense?",
    'Should I adjust my budgets?',
  ];

  useEffect(() => {
    async function load() {
      try {
        const [context, spending] = await Promise.all([
          buildFinancialContext(symbol),
          getCategorySpending(new Date().getMonth() + 1, new Date().getFullYear()),
        ]);
        setFinancialContext(context);

        const derived: Insight[] = [];
        let id = 1;

        for (const s of spending) {
          if (s.budget > 0 && s.amount > 0) {
            const pct = (s.amount / s.budget) * 100;
            if (pct >= 100) {
              derived.push({
                id: id++,
                title: `${s.category_name} Over Budget`,
                description: `You've spent ₱${formatAmount(s.amount)} (${pct.toFixed(0)}% of budget). Consider cutting back or adjusting your limit.`,
                type: 'warning',
                iconName: 'expense',
              });
            } else if (pct >= 80) {
              derived.push({
                id: id++,
                title: `${s.category_name} Nearing Limit`,
                description: `You've used ${pct.toFixed(0)}% of your ₱${formatAmount(s.budget)} budget. ₱${formatAmount(Math.max(0, s.budget - s.amount))} remaining.`,
                type: 'suggestion',
                iconName: 'budget',
              });
            }
          }
        }

        const totalSpent = spending.reduce((sum, s) => sum + s.amount, 0);
        const totalBudget = spending.reduce((sum, s) => sum + s.budget, 0);
        if (totalBudget > 0 && totalSpent < totalBudget * 0.7 && totalSpent > 0) {
          derived.push({
            id: id++,
            title: 'Great Progress!',
            description: `You're under 70% of your total budget this month. Keep it up!`,
            type: 'achievement',
            iconName: 'savings',
          });
        }

        if (derived.length === 0) {
          derived.push({
            id: 1,
            title: 'Add More Data',
            description: 'Add transactions and set budgets to get personalized insights from your AI coach.',
            type: 'suggestion',
            iconName: 'rocket',
          });
        }

        setInsights(derived);
      } catch {
        setInsights([
          {
            id: 1,
            title: 'Loading Insights',
            description: 'Add transactions and budgets to unlock personalized financial insights.',
            type: 'suggestion',
            iconName: 'chart',
          },
        ]);
      }
    }
    load();
  }, [formatAmount, symbol]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user' as const,
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setError(null);
    setIsLoading(true);

    const conversationHistory = [
      ...messages.filter((m) => m.type === 'ai' || m.type === 'user'),
      userMessage,
    ].map((m) => ({
      role: m.type === 'user' ? ('user' as const) : ('assistant' as const),
      content: m.content,
    }));

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          financialContext: financialContext || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai' as const,
        content: data.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'ai',
          content: 'Sorry, I encountered an error. Please check that GROQ_API_KEY is set and try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  const colors = {
    warning: { bg: '#FEF2F2', text: '#991B1B', icon: '#EF4444' },
    suggestion: { bg: '#EFF6FF', text: '#1E40AF', icon: '#3B82F6' },
    achievement: { bg: '#F0FDF4', text: '#166534', icon: '#10B981' },
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#8ba888] to-[#047857] rounded-xl flex items-center justify-center">
                <Icon name="robotassistant" size={24} />
              </div>
              <div>
                <h1 className="font-semibold text-[#1F2937]">AI Assistant</h1>
                <p className="text-xs text-[#6B7280]">Powered by Groq AI</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-2xl text-[#991B1B]">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Current Insights</h2>
              <div className="space-y-4">
                {insights.map((insight) => {
                  const color = colors[insight.type];
                  return (
                    <div
                      key={insight.id}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E7EB] hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: color.bg }}
                        >
                          <Icon name={insight.iconName} size={20} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#1F2937] text-sm mb-1">{insight.title}</h3>
                          <p className="text-xs text-[#6B7280] leading-relaxed">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#1F2937] mb-3">Quick Questions</h3>
              <div className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleQuickQuestion(question)}
                    disabled={isLoading}
                    className="w-full text-left px-4 py-3 bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#374151] transition-colors disabled:opacity-60"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-[#E5E7EB] flex flex-col h-[calc(100vh-180px)] min-h-[400px]">
              <div className="px-6 py-4 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#8ba888] to-[#047857] rounded-full flex items-center justify-center">
                    <Icon name="robotassistant" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1F2937]">AI Financial Coach</h3>
                    <p className="text-xs text-[#10B981] flex items-center gap-1">
                      <span className="w-2 h-2 bg-[#10B981] rounded-full" />
                      {isLoading ? 'Thinking...' : 'Online'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        message.type === 'user' ? 'bg-[#8ba888] text-white' : 'bg-[#F3F4F6] text-[#1F2937]'
                      } rounded-2xl px-5 py-4`}
                    >
                      {message.type === 'ai' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="darttarget" size={16} />
                          <span className="text-xs font-medium text-[#8ba888]">AI Coach</span>
                        </div>
                      )}
                      <div className="text-sm leading-relaxed whitespace-pre-line [&>strong]:font-semibold">
                        {message.content}
                      </div>
                      <p
                        className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-white/70' : 'text-[#9CA3AF]'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#F3F4F6] rounded-2xl px-5 py-4 flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#8ba888]" />
                      <span className="text-sm text-[#6B7280]">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-6 py-4 border-t border-[#E5E7EB]">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me anything about your finances..."
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8ba888] focus:border-transparent transition-all disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-6 py-3 bg-[#8ba888] text-white rounded-xl font-medium hover:bg-[#047857] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    Send
                  </button>
                </form>
                <p className="text-xs text-[#9CA3AF] mt-3 text-center">
                  Powered by Groq AI. Insights based on your data. Not financial advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
