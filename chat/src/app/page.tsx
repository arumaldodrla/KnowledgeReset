'use client';

import { useState, useRef, useEffect, FormEvent, useCallback } from 'react';
import styles from './chat.module.css';
import ModeSelector from '../components/ModeSelector';
import ConversationContextDisplay from '../components/ConversationContext';
import KnowledgeDraftPreview from '../components/KnowledgeDraft';
import { useConversation } from '../hooks/useConversation';

type TaskType = 'knowledge_ingestion' | 'query' | 'extraction' | 'summarization' | 'verification';

interface Source {
  id: string;
  title: string;
  content: string;
  source_url: string;
  similarity: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  searchType?: 'knowledge_base' | 'web' | 'none';
}

const taskLabels: Record<TaskType, { emoji: string; label: string }> = {
  knowledge_ingestion: { emoji: '📥', label: 'Ingestion' },
  query: { emoji: '💬', label: 'Query' },
  extraction: { emoji: '📊', label: 'Extraction' },
  summarization: { emoji: '📝', label: 'Summary' },
  verification: { emoji: '✓', label: 'Verification' },
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState<TaskType>('query');
  const [currentModel, setCurrentModel] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Conversation state management
  const conversation = useConversation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content,
          })),
          conversationContext: conversation.context,
        }),
      });

      // Get metadata from headers
      const taskType = response.headers.get('X-Task-Type') as TaskType;
      const model = response.headers.get('X-Model-Used');
      const searchType = response.headers.get('X-Search-Type') as 'knowledge_base' | 'web' | 'none';
      const sourcesHeader = response.headers.get('X-Sources');
      const sources: Source[] = sourcesHeader ? JSON.parse(sourcesHeader) : [];

      if (taskType) setCurrentTask(taskType);
      if (model) setCurrentModel(model);

      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        sources,
        searchType,
      };
      setMessages(prev => [...prev, assistantMsg]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          assistantContent += chunk;

          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMsg.id
                ? { ...m, content: assistantContent }
                : m
            )
          );
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, an error occurred. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userMessage = input.trim();
    if (!userMessage) return;
    setInput('');
    sendMessage(userMessage);
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
  };

  return (
    <div className={styles.chatContainer}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🧠</div>
          <span className={styles.logoText}>Knowledge Reset</span>
        </div>

        <div className={styles.headerRight}>
          <ModeSelector
            currentMode={conversation.mode}
            onModeChange={conversation.switchMode}
          />
          <div className={styles.modelSelector}>
            <span className={styles.taskBadge}>
              {taskLabels[currentTask]?.emoji} {taskLabels[currentTask]?.label}
            </span>
            {currentModel && (
              <span className={styles.modelBadge}>{currentModel}</span>
            )}
          </div>
        </div>
      </header>

      {/* Conversation Context Display */}
      {conversation.mode === 'knowledge_capture' && (
        <ConversationContextDisplay context={conversation.context} />
      )}

      {messages.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>💡</div>
          <h2 className={styles.emptyTitle}>Intelligent Knowledge Assistant</h2>
          <p className={styles.emptyDescription}>
            I automatically select the best AI model for your task.
          </p>
          <div className={styles.suggestions}>
            <button
              className={styles.suggestionButton}
              onClick={() => handleSuggestion('Add to knowledge base: ClientSync supports OAuth 2.0. Source: https://docs.clientsync.io/auth')}
            >
              📥 Add knowledge
            </button>
            <button
              className={styles.suggestionButton}
              onClick={() => handleSuggestion('What authentication methods does ClientSync support?')}
            >
              💬 Ask a question
            </button>
            <button
              className={styles.suggestionButton}
              onClick={() => handleSuggestion('Summarize the key features of InsightPulse Analytics')}
            >
              📝 Summarize
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.messages}>
          {messages.map((message) => {
            const isPendingApproval = message.content.includes('requires your approval');

            return (
              <div key={message.id} className={styles.message}>
                <div className={`${styles.avatar} ${message.role === 'user' ? styles.userAvatar : styles.assistantAvatar}`}>
                  {message.role === 'user' ? '👤' : '🧠'}
                </div>
                <div className={styles.messageContent}>
                  <div className={styles.messageMeta}>
                    <span className={styles.messageRole}>
                      {message.role === 'user' ? 'You' : 'Knowledge Reset'}
                    </span>
                    {isPendingApproval && (
                      <span className={styles.approvalBadge}>⏳ Pending Approval</span>
                    )}
                  </div>
                  <div className={styles.messageText}>
                    {message.content.split('\n').map((line: string, i: number) => (
                      <p key={i}>{line || '\u00A0'}</p>
                    ))}
                  </div>
                  {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                    <div className={styles.sources}>
                      <p className={styles.sourcesLabel}>
                        {message.searchType === 'web' ? '🌐 Web Sources:' : '📚 Knowledge Base:'}
                      </p>
                      <div className={styles.sourcesList}>
                        {message.sources.map((source, idx) => (
                          <a
                            key={idx}
                            href={source.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.sourceLink}
                            title={source.content.slice(0, 200)}
                          >
                            <span className={styles.sourceNumber}>[{idx + 1}]</span>
                            <span className={styles.sourceTitle}>{source.title}</span>
                            <span className={styles.sourceSimilarity}>
                              {Math.round(source.similarity * 100)}%
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {isPendingApproval && (
                    <div className={styles.approvalActions}>
                      <button className={styles.approveButton} onClick={() => handleSuggestion('✅ Approve')}>
                        ✅ Approve
                      </button>
                      <button className={styles.editButton} onClick={() => handleSuggestion('✏️ Edit')}>
                        ✏️ Edit
                      </button>
                      <button className={styles.rejectButton} onClick={() => handleSuggestion('❌ Reject')}>
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className={styles.message}>
              <div className={`${styles.avatar} ${styles.assistantAvatar}`}>🧠</div>
              <div className={styles.messageContent}>
                <div className={styles.loading}>
                  <div className={styles.loadingDot} />
                  <div className={styles.loadingDot} />
                  <div className={styles.loadingDot} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      <div className={styles.inputArea}>
        <form onSubmit={onSubmit} className={styles.inputWrapper}>
          <textarea
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question, add knowledge, or request data extraction..."
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e as unknown as FormEvent<HTMLFormElement>);
              }
            }}
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={isLoading || !input.trim()}
          >
            ↑
          </button>
        </form>
      </div>
    </div>
  );
}
