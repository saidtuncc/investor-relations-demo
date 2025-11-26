import React, { useState } from 'react';
import { Send, Bot, User, FileText } from 'lucide-react';
import { api } from '../services/api';
import { AssistantResponse } from '../types';

export const Assistant: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ type: 'user' | 'bot', content: AssistantResponse | string }>>([]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const currentQ = question;
    setQuestion('');
    setHistory(prev => [...prev, { type: 'user', content: currentQ }]);
    setLoading(true);

    try {
      const response = await api.askAssistant(currentQ);
      setHistory(prev => [...prev, { type: 'bot', content: response }]);
    } catch (err) {
      setHistory(prev => [...prev, { type: 'bot', content: { answer: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.' } }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-slate-800 p-4 text-white flex items-center space-x-3">
        <Bot className="w-6 h-6" />
        <div>
          <h2 className="font-semibold">Yatırımcı İlişkileri Asistanı</h2>
          <p className="text-xs text-slate-300">TSGYO hakkında sorularınızı sorun</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
        {history.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            <p className="mb-2">Örnek sorular:</p>
            <ul className="text-sm space-y-1">
              <li>"Pendorya ile ilgili son haberler neler?"</li>
              <li>"Şirketin son özkaynak durumu nedir?"</li>
              <li>"Portföy toplam değeri nedir?""</li>
              <li>"Divan Adana Oteli kaç odalı?"</li>
            </ul>
          </div>
        )}

        {history.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.type === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white border border-gray-200 text-slate-800 rounded-tl-none shadow-sm'
            }`}>
              {msg.type === 'user' ? (
                <p>{msg.content as string}</p>
              ) : (
                <div className="space-y-3">
                  <p>{(msg.content as AssistantResponse).answer}</p>
                  {(msg.content as AssistantResponse).sources && (msg.content as AssistantResponse).sources!.length > 0 && (
                    <div className="bg-gray-50 rounded p-2 text-sm border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">İlgili Bildirimler:</p>
                      <ul className="space-y-2">
                        {(msg.content as AssistantResponse).sources!.map(source => (
                          <li key={source.id} className="flex items-start space-x-2">
                            <FileText className="w-3 h-3 mt-1 text-blue-500 shrink-0" />
                            <a href={source.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                              {source.title} <span className="text-gray-400 text-xs">({new Date(source.publish_datetime).toLocaleDateString()})</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleAsk} className="flex space-x-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Sorunuzu buraya yazın..."
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};