'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './Widget.module.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface WidgetProps {
  webhookUrl?: string;
  isEmbedded?: boolean;
}

export default function Widget({ webhookUrl, isEmbedded = false }: WidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Generate or retrieve session ID
    let storedSessionId = localStorage.getItem('n8n_chat_session_id');
    if (!storedSessionId) {
      storedSessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('n8n_chat_session_id', storedSessionId);
    }
    setSessionId(storedSessionId);
    
    // Optional: Load previous session if needed (action=loadPreviousSession)
    // For now, we start fresh or relying on local state, but we could fetch history here.
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    
    // Notify parent window (if in iframe) about open/close state
    if (typeof window !== 'undefined' && window.parent !== window) {
      window.parent.postMessage(
        { type: isOpen ? 'widget-open' : 'widget-close' },
        '*'
      );
    }
  }, [isOpen]);

  const sendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputValue.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          webhookUrl: webhookUrl || process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
          sessionId: sessionId,
          action: 'sendMessage'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Handle different response formats from n8n
      // If n8n returns an array of messages (common in chat implementations) or a single object
      let responseText = '';
      
      if (Array.isArray(data)) {
         // If it's an array, join text responses
         responseText = data.map(item => item.text || item.output || '').join('\n');
      } else {
         responseText = data.response || data.text || data.output || data.message || 'Received response';
      }

      if (!responseText && typeof data === 'string') {
          responseText = data;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText || 'Sorry, I could not process your request.',
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, there was an error processing your message. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`${styles.widgetWrapper} ${isEmbedded ? styles.embedded : ''}`}>
      {/* Toggle button - shows chat icon when closed, chevron down when open */}
      <button
        className={`${styles.widgetButton} ${isEmbedded ? styles.embeddedButton : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        style={isEmbedded ? {
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          left: 'auto',
          top: 'auto',
          width: '56px',
          height: '56px',
          background: '#8b5cf6',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
          zIndex: 10000,
          padding: 0
        } : undefined}
      >
        {isOpen ? (
          /* Chevron Down Icon when open */
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          /* Chat Icon when closed */
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
              fill="white"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <div 
          className={`${styles.widgetContainer} ${isEmbedded ? styles.embeddedContainer : ''}`}
          style={isEmbedded ? {
            // Positioning - must match main page exactly
            position: 'absolute',
            bottom: '90px',
            right: '20px',
            left: 'auto',
            top: 'auto',
            // Dimensions - exact match
            width: '380px',
            maxWidth: '380px',
            minWidth: '380px',
            height: '500px',
            maxHeight: '500px',
            // Visual properties - MUST include to match main page
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            // Layout
            display: 'flex',
            flexDirection: 'column' as const,
            overflow: 'hidden',
            boxSizing: 'border-box' as const,
            zIndex: 9999,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
          } : undefined}
        >
          <div className={styles.widgetHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.avatar}>
                <div className={styles.avatarPixel}></div>
              </div>
              <div className={styles.headerText}>
                <div className={styles.headerTitle}>Wedsgaard Ejendomme</div>
                <div className={styles.headerSubtitle}>
                  Digital Svend
                </div>
              </div>
            </div>
            <button
              className={styles.newChatButton}
              onClick={() => {
                setMessages([]);
                setIsOpen(false);
              }}
              aria-label="New chat"
            >
              +
            </button>
          </div>

          <div className={styles.messagesContainer}>
            {messages.length === 0 ? (
              <div className={styles.welcomeScreen}>
                <div className={styles.welcomeAvatar}>
                  <div className={styles.avatarPixelLarge}></div>
                </div>
                <div className={styles.welcomeTitle}>
                  Wedsgaard Ejendomme
                </div>
                <button 
                  className={styles.demoButton}
                  onClick={() => sendMessage('Få et tilbud')}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 0L10.5 5.5L16 8L10.5 10.5L8 16L5.5 10.5L0 8L5.5 5.5L8 0Z"
                      fill="currentColor"
                    />
                  </svg>
                  Få et tilbud
                </button>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`${styles.message} ${
                      message.sender === 'user'
                        ? styles.userMessage
                        : styles.assistantMessage
                    }`}
                  >
                    {message.sender === 'assistant' && (
                      <div className={styles.messageAvatar}>
                        <div className={styles.avatarPixelSmall}></div>
                      </div>
                    )}
                    <div className={styles.messageBubble}>
                      <div className={styles.messageText}>{message.text}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className={styles.loadingIndicator}>
                    <div className={styles.loadingDot}></div>
                    <div className={styles.loadingDot}></div>
                    <div className={styles.loadingDot}></div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className={styles.inputContainer}>
            <button className={styles.attachButton} aria-label="Attach file">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.5 2.5L7.5 7.5C6.95 8.05 6.95 8.95 7.5 9.5C8.05 10.05 8.95 10.05 9.5 9.5L14.5 4.5C15.6 3.4 15.6 1.6 14.5 0.5C13.4 -0.6 11.6 -0.6 10.5 0.5L5.5 5.5C3.7 7.3 3.7 10.2 5.5 12C7.3 13.8 10.2 13.8 12 12L17 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <input
              ref={inputRef}
              type="text"
              className={styles.input}
              placeholder="Write something..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button 
              className={styles.sendButton}
              onClick={() => sendMessage()}
              disabled={isLoading || !inputValue.trim()}
              aria-label="Send message"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Close button removed - using the main button to toggle instead */}
    </div>
  );
}


