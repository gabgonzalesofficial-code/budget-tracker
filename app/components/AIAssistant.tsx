'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import Icon from '@/app/components/Icon';

export default function AIAssistant() {
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

  const insights = [
    {
      id: 1,
      title: 'Food Spending Alert',
      description:
        'You spent 18% more on food this month than last month. Most of this increase came from food delivery services.',
      type: 'warning' as const,
      iconName: 'expense' as const,
    },
    {
      id: 2,
      title: 'Budget Prediction',
      description:
        "You're likely to exceed your entertainment budget in 5 days based on current spending velocity.",
      type: 'warning' as const,
      iconName: 'income' as const,
    },
    {
      id: 3,
      title: 'Savings Opportunity',
      description:
        'Reducing food delivery by $500/month would increase your savings rate from 29% to 36%.',
      type: 'suggestion' as const,
      iconName: 'chart' as const,
    },
    {
      id: 4,
      title: 'Great Progress!',
      description:
        "You've stayed under budget for Transport for 3 months in a row. Keep up the good work!",
      type: 'achievement' as const,
      iconName: 'savings' as const,
    },
  ];

  const quickQuestions = [
    'How can I reduce my spending?',
    'Am I on track this month?',
    "What's my biggest expense?",
    'Should I adjust my budgets?',
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user' as const,
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'ai' as const,
        content: generateAIResponse(inputMessage),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);

    setInputMessage('');
  };

  const generateAIResponse = (question: string): string => {
    const q = question.toLowerCase();

    if (q.includes('reduce') || q.includes('save')) {
      return "Based on your spending patterns, here are my top recommendations:\n\n1. **Food Delivery**: Review delivery spending and consider meal planning.\n\n2. **Subscriptions**: Audit entertainment subscriptions for unused services.\n\n3. **Small habits**: Coffee, dining out—small cuts add up.\n\nTrack regularly for personalized suggestions.";
    }

    if (q.includes('track') || q.includes('doing')) {
      return "You're doing well overall! Check your dashboard for:\n\n✅ Budget usage by category\n⚠️ Categories near limits\n✅ Savings rate\n\nContinue adding transactions for richer AI insights.";
    }

    if (q.includes('biggest') || q.includes('expense')) {
      return "Your biggest expenses are visible in the Budget Usage section on the dashboard. Housing, Food, and Transport typically lead. Use the Transactions page to see exactly where your money goes.";
    }

    if (q.includes('budget') || q.includes('adjust')) {
      return "Go to Budget Management to set or edit category limits. Based on a few months of data, the AI can suggest adjustments. Add transactions consistently for better recommendations.";
    }

    return "I'm here to help! I can analyze spending patterns, predict budget overruns, suggest ways to save, and help you understand where your money goes. What would you like to explore?";
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
              <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-xl flex items-center justify-center">
                <Icon name="chart" size={24} invert />
              </div>
              <div>
                <h1 className="font-semibold text-[#1F2937]">AI Assistant</h1>
                <p className="text-xs text-[#6B7280]">Your financial coach</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    className="w-full text-left px-4 py-3 bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#374151] transition-colors"
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
                  <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center">
                    <Icon name="chart" size={20} invert />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1F2937]">AI Financial Coach</h3>
                    <p className="text-xs text-[#10B981] flex items-center gap-1">
                      <span className="w-2 h-2 bg-[#10B981] rounded-full" />
                      Online
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
                        message.type === 'user' ? 'bg-[#6366F1] text-white' : 'bg-[#F3F4F6] text-[#1F2937]'
                      } rounded-2xl px-5 py-4`}
                    >
                      {message.type === 'ai' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="chart" size={16} />
                          <span className="text-xs font-medium text-[#6366F1]">AI Coach</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
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
              </div>

              <div className="px-6 py-4 border-t border-[#E5E7EB]">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me anything about your finances..."
                    className="flex-1 px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="px-6 py-3 bg-[#6366F1] text-white rounded-xl font-medium hover:bg-[#4F46E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send
                  </button>
                </form>
                <p className="text-xs text-[#9CA3AF] mt-3 text-center">
                  AI insights are based on your transaction history and spending patterns. Not financial advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
