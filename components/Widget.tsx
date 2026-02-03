'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './Widget.module.css';
import type { ClientConfig } from '@/lib/types';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface WidgetProps {
  config: ClientConfig;
  isEmbedded?: boolean;
}

export default function Widget({ config, isEmbedded = false }: WidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [isTypingWelcome, setIsTypingWelcome] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [showPopupBubble, setShowPopupBubble] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const popupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic CSS variables based on client config
  const themeStyles = {
    '--primary-color': config.primaryColor,
    '--primary-color-light': `${config.primaryColor}15`,
    '--primary-color-hover': adjustColor(config.primaryColor, -15),
  } as React.CSSProperties;

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show popup bubble after 1.5 seconds, hide after 5 seconds
  useEffect(() => {
    // Don't show if already shown once or chat is open
    if (hasShownPopup || isOpen) return;

    const showTimer = setTimeout(() => {
      setShowPopupBubble(true);
      setHasShownPopup(true);
    }, 1500);

    return () => {
      clearTimeout(showTimer);
    };
  }, [hasShownPopup, isOpen]);

  // Auto-hide popup after 5 seconds
  useEffect(() => {
    if (!showPopupBubble) return;

    popupTimeoutRef.current = setTimeout(() => {
      setShowPopupBubble(false);
    }, 5000);

    return () => {
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
    };
  }, [showPopupBubble]);

  // Hide popup when chat is opened
  useEffect(() => {
    if (isOpen && showPopupBubble) {
      setShowPopupBubble(false);
    }
  }, [isOpen, showPopupBubble]);

  useEffect(() => {
    // Generate or retrieve session ID (per client)
    const sessionKey = `n8n_chat_session_id_${config.id}`;
    let storedSessionId = localStorage.getItem(sessionKey);
    if (!storedSessionId) {
      storedSessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem(sessionKey, storedSessionId);
    }
    setSessionId(storedSessionId);
  }, [config.id]);

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

    // Show welcome message when chat opens for the first time
    if (isOpen && !hasShownWelcome && messages.length === 0) {
      setHasShownWelcome(true);
      setIsTypingWelcome(true);
      
      // Small delay before starting to type
      setTimeout(() => {
        let charIndex = 0;
        const typeSpeed = 25; // milliseconds per character
        
        typingIntervalRef.current = setInterval(() => {
          if (charIndex < config.welcomeMessage.length) {
            setTypingText(config.welcomeMessage.slice(0, charIndex + 1));
            charIndex++;
          } else {
            // Typing complete - add as a proper message
            if (typingIntervalRef.current) {
              clearInterval(typingIntervalRef.current);
            }
            setIsTypingWelcome(false);
            setTypingText('');
            
            const welcomeMsg: Message = {
              id: 'welcome-' + Date.now().toString(),
              text: config.welcomeMessage,
              sender: 'assistant',
              timestamp: new Date(),
            };
            setMessages([welcomeMsg]);
          }
        }, typeSpeed);
      }, 500);
    }

    // Cleanup interval on unmount
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [isOpen, hasShownWelcome, messages.length, config.welcomeMessage]);

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
          clientId: config.id,
          sessionId: sessionId,
          action: 'sendMessage'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Handle different response formats from n8n
      let responseText = '';
      
      if (Array.isArray(data)) {
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

  // On mobile, hide button when chat is open (use header close button instead)
  const showFloatingButton = !isMobile || !isOpen;

  return (
    <div 
      className={`${styles.widgetWrapper} ${isEmbedded ? styles.embedded : ''}`}
      style={themeStyles}
    >
      {/* Toggle button - hidden on mobile when chat is open */}
      {showFloatingButton && (
        <button
          className={`${styles.widgetButton} ${isEmbedded ? styles.embeddedButton : ''} ${isOpen ? styles.widgetButtonOpen : ''}`}
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
            background: config.primaryColor,
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 16px ${config.primaryColor}66`,
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
      )}

      {/* Popup welcome bubble */}
      {showPopupBubble && !isOpen && (
        <div 
          className={`${styles.popupBubble} ${isEmbedded ? styles.popupBubbleEmbedded : ''}`}
          onClick={() => {
            setShowPopupBubble(false);
            setIsOpen(true);
          }}
        >
          <div className={styles.popupContent}>
            <span className={styles.popupEmoji}>👋</span>
            <span className={styles.popupText}>{config.popupMessage}</span>
          </div>
          <button 
            className={styles.popupClose}
            onClick={(e) => {
              e.stopPropagation();
              setShowPopupBubble(false);
            }}
            aria-label="Luk"
          >
            ×
          </button>
        </div>
      )}

      {isOpen && (
        <div 
          className={`${styles.widgetContainer} ${isEmbedded ? styles.embeddedContainer : ''}`}
          style={isEmbedded ? (isMobile ? {
            // MOBILE: Full screen
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            minWidth: '100%',
            background: 'white',
            borderRadius: 0,
            boxShadow: 'none',
            display: 'flex',
            flexDirection: 'column' as const,
            overflow: 'hidden',
            boxSizing: 'border-box' as const,
            zIndex: 10002,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
          } : {
            // DESKTOP: Positioned above button
            position: 'absolute',
            bottom: '90px',
            right: '20px',
            left: 'auto',
            top: 'auto',
            width: '380px',
            maxWidth: '380px',
            minWidth: '380px',
            height: '500px',
            maxHeight: '500px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column' as const,
            overflow: 'hidden',
            boxSizing: 'border-box' as const,
            zIndex: 9999,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
          }) : undefined}
        >
          <div className={styles.widgetHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.avatar}>
                <img 
                  src={config.logoUrl} 
                  alt={config.companyName} 
                  className={styles.avatarImage}
                />
              </div>
              <div className={styles.headerText}>
                <div className={styles.headerTitle}>{config.companyName}</div>
                <div className={styles.headerSubtitle}>
                  {config.subtitle}
                </div>
              </div>
            </div>
            <button
              className={styles.closeHeaderButton}
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className={styles.messagesContainer}>
            {messages.length === 0 && !isTypingWelcome ? (
              <div className={styles.welcomeScreen}>
                <div className={styles.welcomeAvatar}>
                  <img 
                    src={config.logoUrl} 
                    alt={config.companyName} 
                    className={styles.avatarImageLarge}
                  />
                </div>
                <div className={styles.welcomeTitle}>
                  {config.companyName}
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
            ) : messages.length === 0 && isTypingWelcome ? (
              /* Show typing welcome message */
              <div className={`${styles.message} ${styles.assistantMessage}`}>
                <div className={styles.messageAvatar}>
                  <img 
                    src={config.logoUrl} 
                    alt={config.companyName} 
                    className={styles.avatarImageSmall}
                  />
                </div>
                <div className={styles.messageBubble}>
                  <div className={styles.messageText}>
                    {typingText}
                    <span className={styles.typingCursor}>|</span>
                  </div>
                </div>
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
                        <img 
                          src={config.logoUrl} 
                          alt={config.companyName} 
                          className={styles.avatarImageSmall}
                        />
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
            <input
              ref={inputRef}
              type="text"
              className={styles.input}
              placeholder="Skriv en besked..."
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

          <div className={styles.poweredBy}>
            <span className={styles.poweredByIcon}>⚡</span>
            <span className={styles.poweredByText}>Powered by </span>
            <a 
              href="https://håndværker-ai.dk" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.poweredByLink}
            >
              håndværker-ai.dk
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}
