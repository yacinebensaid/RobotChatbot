import { useState, useEffect, useRef } from 'react';
import "./App.css";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; 
      recognitionRef.current.interimResults = false; 
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setInputText((prev) => prev + ' ' + transcript); 
      };

      recognitionRef.current.onerror = (event) => {
        console.error('speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          console.log('speech recognition ended unexpectedly. Restarting...');
          startListening();
        }
      };
    } else {
      console.warn('speech recognition not supported in this browser.');
    }
  }, [isListening]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
      console.log('Started listening...');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      console.log('Stopped listening...');
    }
  };

  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! How can I assist you today?";
    }
    if (lowerMessage.includes('help')) {
      return "I can help with general inquiries. Feel free to ask me anything!";
    }
    if (lowerMessage.includes('thank')) {
      return "You're welcome! Let me know if you need anything else.";
    }
    return "I'm sorry, I didn't understand that. Could you please rephrase?";
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { text: inputText, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    setIsBotTyping(true);
    
    setTimeout(() => {
      const botResponse = { text: getBotResponse(inputText), isUser: false };
      setMessages(prev => [...prev, botResponse]);
      setIsBotTyping(false);
    }, 1500);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <div className={`chat-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="chat-header">
        <h2>RoBot</h2>
        <div className="dark-mode-toggle">
          <span>Dark Mode</span>
          <label className="theme-toggle-button">
            <input 
              type="checkbox" 
              checked={isDarkMode} 
              onChange={toggleDarkMode} 
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="messages-container" aria-live="polite">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.isUser ? 'user' : 'bot'}`}
          >
            <div className="message-content">
              {message.text}
            </div>
          </div>
        ))}
        
        
        {isBotTyping && (
          <div className="message bot">
            <div className="message-content typing-indicator-container">
              <div className="typing-indicator">
                <span className="dot">.</span>
                <span className="dot">.</span>
                <span className="dot">.</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <button 
          onMouseDown={startListening} 
          onMouseUp={stopListening} 
          onTouchStart={startListening} 
          onTouchEnd={stopListening}
          aria-label="start voice recognition"
          className={`mic-button ${isListening ? 'listening' : ''}`}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3zm0 15a5 5 0 005-5v-1h2v1a7 7 0 01-7 7 7 7 0 01-7-7v-1h2v1a5 5 0 005 5z"/>
          </svg>
        </button>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message here..."
          style={{ marginRight: inputText.trim() ? '1rem' : '0' }}
        />
        <button 
          onClick={handleSendMessage} 
          aria-label="Send message"
          style={{
            opacity: inputText.trim() ? '1' : '0',
            transform: inputText.trim() ? 'scale(1)' : 'scale(0)',
            pointerEvents: inputText.trim() ? 'all' : 'none'
          }}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;