import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import './App.css';

const About = () => (
  <div className="page-container">
    <h2>About</h2>
    <p>This is the about page content.</p>
  </div>
);

const Contact = () => (
  <div className="page-container">
    <h2>Contact</h2>
    <p>This is the contact page content.</p>
  </div>
);

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
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

    const welcomeMessage = {
      text: `I am RoBOT, your digital assistant for the city of Rosenheim. I look forward to assisting you with general questions related to citizen services.\n\nPlease understand that I may not be able to assist with very extensive or personal matters. The answers are AI-based and non-binding, and therefore do not represent official statements from the city of Rosenheim. How can I help you?`,
      isUser: false
    };
    setMessages([welcomeMessage]);
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

    if (lowerMessage.includes('markdown')) {
      return `""""Note""" this example is taken from the internet!!!


Here's an example of Markdown formatting:

**Bold text**
*Italic text*
~~Strikethrough~~

# Heading 1
## Heading 2
### Heading 3

* Unordered list item 1
* Unordered list item 2

1. Ordered list item 1
2. Ordered list item 2

[Link to Google](https://www.google.com)

\`Inline code\`

\`\`\`javascript
function myFunction() {
  console.log("Hello, world!");
}
\`\`\`

> A block quote.
      `;
    }

    return "I'm sorry, I didn't understand that. Could you please rephrase?";
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const streamBotResponse = async (userMessage) => {
    const response = getBotResponse(userMessage);
    const words = response.split(' ');
    let chunk = '';

    for (let i = 0; i < words.length; i++) {
      chunk += words[i] + ' ';
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && !lastMessage.isUser) {
          return [...prev.slice(0, -1), { text: chunk, isUser: false }];
        }
        return [...prev, { text: chunk, isUser: false }];
      });
      await new Promise((resolve) => setTimeout(resolve, 100)); 
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { text: inputText, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    setShowTypingIndicator(true);

    await delay(1000);

    setShowTypingIndicator(false);
    await streamBotResponse(inputText);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const toggleMoreMenu = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className={`chat-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="chat-header">
        <h2>RoBot</h2>
        <div className="header-buttons">
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
                <button className="hamburger-button" onClick={toggleMoreMenu}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="gray">
                    <path d="M3 6h18M3 12h18M3 18h18" stroke="gray" strokeWidth="2" strokeLinecap="square" />
                  </svg>
                </button>
              </div>
            </div>
            {showMoreMenu && (
  <div className={`more-menu-dropdown ${showMoreMenu ? 'show' : ''}`}>
    
    <div className="more-menu-items">
      <Link to="/about" className="more-menu-item">About</Link>
      <Link to="/contact" className="more-menu-item">Contact</Link>
    </div>
  </div>
)}

<div className="messages-container" aria-live="polite">
  {messages.map((message, index) => (
    <div key={index} className={`message ${message.isUser ? 'user' : 'bot'}`}>
      {!message.isUser && (
        <div className="profile-circle">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="2" fill="#4CAF50" />
            <path d="M8 7H16C16.5523 7 17 7.44772 17 8V16C17 16.5523 16.5523 17 16 17H8C7.44772 17 7 16.5523 7 16V8C7 7.44772 7.44772 7 8 7Z" fill="white" />
            <path d="M12 9C11.4477 9 11 9.44772 11 10C11 10.5523 11.4477 11 12 11C12.5523 11 13 10.5523 13 10C13 9.44772 12.5523 9 12 9Z" fill="black" />
            <path d="M15 12C14.4477 12 14 12.4477 14 13C14 13.5523 14.4477 14 15 14C15.5523 14 16 13.5523 16 13C16 12.4477 15.5523 12 15 12Z" fill="black" />
            <path d="M9 12C8.44772 12 8 12.4477 8 13C8 13.5523 8.44772 14 9 14C9.55229 14 10 13.5523 10 13C10 12.4477 9.55229 12 9 12Z" fill="black" />
          </svg>
        </div>
      )}
      <div className="message-content">
        {message.isUser ? message.text : <ReactMarkdown>{message.text}</ReactMarkdown>}
      </div>
    </div>
  ))}

  {/* Typing indicator */}
  {showTypingIndicator && (
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
        <div
  className={`mic-button-container ${isListening ? 'listening' : ''}`}
>
  <button
    onMouseDown={startListening}
    onMouseUp={stopListening}
    onTouchStart={startListening}
    onTouchEnd={stopListening}
    aria-label="Start voice recognition"
    className={`mic-button ${isListening ? 'listening' : ''}`}
  >
    <svg viewBox="0 0 24 24" width="24" height="24">
      <path d="M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3zm0 15a5 5 0 005-5v-1h2v1a7 7 0 01-7 7 7 7 0 01-7-7v-1h2v1a5 5 0 005 5z" />
    </svg>
  </button>
</div>
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
            pointerEvents: inputText.trim() ? 'all' : 'none',
          }}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
    } />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
  </Routes>
</Router>
  );
};


export default ChatInterface;