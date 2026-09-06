import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Clock, 
  CheckCircle2, 
  Database, 
  ArrowRight,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { ChatMessage, ErpSnapshot } from '../types';
import { ExplainableAiBadge } from './ExplainableAiBadge';

interface Props {
  snapshot: ErpSnapshot | null;
  onSendMessage: (query: string, history: { sender: 'user' | 'assistant'; text: string }[]) => Promise<{
    text: string;
    sources: string[];
    suggestedFollowUps: string[];
  }>;
}

export const AiRiskAssistant: React.FC<Props> = ({ snapshot, onSendMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello, I am **SentinelAI** — your Autonomous Business Risk Intelligence and Decision Support Agent. \n\nI continuously monitor risk indicators across our **Synthetic ERP Data — BigQuery Live** dataset (\`sentinelai_data\`), modeling procurement orders, suppliers, manufacturing lines, open invoices, and customer SLA agreements. \n\n*Note: This prototype utilizes a synthetic ERP dataset hosted on Google Cloud BigQuery, engineered for turnkey future integration with live SAP S/4HANA or Oracle Cloud ERP systems.*\n\nCurrently, I have flagged **${snapshot?.metrics?.activeCriticalRisks || 1} Critical Risk** and **${snapshot?.metrics?.activeHighRisks || 2} High Risks** with an aggregate revenue exposure of **$${(snapshot?.metrics?.totalRevenueAtRisk || 1420000).toLocaleString()}**. How can I assist you with risk assessment or mitigation decisions today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: ['Google Cloud BigQuery — Synthetic ERP Dataset', 'SentinelAI Decision Matrix'],
      suggestedFollowUps: [
        'What are our highest risks today?',
        'Why is Apex Components considered high risk?',
        'Which customers could be affected?',
        'What should we do first?',
        'What happens if this problem continues for 7 days?'
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (queryToSend?: string) => {
    const text = queryToSend || inputQuery.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ sender: m.sender as 'user' | 'assistant', text: m.text }));
      const response = await onSendMessage(text, history);

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources,
        suggestedFollowUps: response.suggestedFollowUps
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat query error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'I encountered an operational error while querying synthetic ERP neural models. Please retry or check server logs.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'init-reset',
        sender: 'assistant',
        text: 'Chat history cleared. How can SentinelAI assist your enterprise risk committee?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: ['Google Cloud BigQuery — Synthetic ERP Dataset'],
        suggestedFollowUps: [
          'What are our highest risks today?',
          'Why is Apex Components considered high risk?',
          'What should we do first?'
        ]
      }
    ]);
  };

  const quickPrompts = [
    'What are our highest risks today?',
    'Why is Apex Components considered high risk?',
    'Which customers could be affected?',
    'What should we do first?',
    'What happens if this problem continues for 7 days?'
  ];

  return (
    <div id="ai-risk-assistant-container" className="bg-slate-900/90 rounded-xl border border-slate-800 shadow-xs flex flex-col h-[740px] overflow-hidden text-slate-100">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                SentinelAI Risk Intelligence Assistant
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Grounded in Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous reasoning over Google Cloud BigQuery synthetic ERP dataset • Enterprise-ready for SAP S/4HANA & Oracle Cloud
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetChat}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompt Bar */}
      <div className="px-4 py-2.5 bg-indigo-950/20 border-b border-indigo-500/20 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          Key Inquiries:
        </span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={isTyping}
            className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-300 rounded-md border border-slate-800 hover:border-indigo-500/40 shadow-2xs whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-950/40">
        {messages.map((msg) => {
          const isAssistant = msg.sender === 'assistant';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white shadow-2xs ${
                  isAssistant ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'
                }`}
              >
                {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 shadow-2xs ${
                  isAssistant
                    ? 'bg-slate-900 border border-slate-800 text-slate-200'
                    : 'bg-indigo-950/80 border border-indigo-500/30 text-white'
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-line font-normal text-slate-200">
                  {msg.text}
                </div>

                {/* Sources & Citations if Assistant */}
                {isAssistant && msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                    <Database className="w-3 h-3 text-slate-400" />
                    <span className="font-semibold text-slate-300">ERP Grounding:</span>
                    {msg.sources.map((src, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 font-mono border border-slate-800">
                        {src}
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggested Follow-Ups */}
                {isAssistant && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Suggested Decision Follow-Ups:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedFollowUps.map((fu, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(fu)}
                          className="px-2 py-1 bg-slate-950 hover:bg-indigo-950 hover:text-indigo-300 text-slate-300 rounded text-[11px] font-medium border border-slate-800 hover:border-indigo-500/40 transition-colors cursor-pointer text-left"
                        >
                          {fu}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-slate-500 text-right">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 max-w-md mr-auto">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>SentinelAI is analyzing synthetic ERP dataset records & synthesizing response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/70">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="chat-input-query"
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask SentinelAI about risks, suppliers, affected customers, or what-if scenarios..."
            className="flex-1 px-4 py-2.5 text-xs text-slate-200 bg-slate-900 border border-slate-800 rounded-xl focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs font-normal placeholder-slate-500"
            disabled={isTyping}
          />
          <button
            id="btn-send-chat"
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
            title="Send inquiry"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
