import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch messages from backend
  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);
      setError('');
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Could not load messages. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !messageText.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    if (messageText.length > 100) {
      setError('Message must be 100 characters or less.');
      return;
    }

    setSubmitLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          message: messageText.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send message');
      }

      // Clear input fields and refresh message list
      setName('');
      setMessageText('');
      setSuccess('Message submitted successfully!');
      fetchMessages();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error submitting message:', err);
      setError(err.message || 'Failed to submit message.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Helper to format date beautifully
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Repeat text helper to create continuous stream for marquee
  const repeatText = (text, count = 20) => {
    return Array(count).fill(text).join(' • ');
  };

  return (
    <div className="portfolio-container">
      {/* Hero Section */}
      <section className="hero-section">
        {/* Upper Strip Bar (moving left-to-right) */}
        <div className="marquee-wrapper top-marquee">
          <div className="marquee-content ltr-scroll">
            <span>{repeatText('Aspiring Writer', 15)}</span>
            <span>{repeatText('Aspiring Writer', 15)}</span>
          </div>
        </div>

        {/* Central Background Image Container */}
        <div className="image-frame-container">
          <div className="image-frame">
            <img src="/bg.jpeg" alt="Portfolio Highlight" className="center-photo" />
            <div className="frame-overlay"></div>
          </div>
        </div>

        {/* Bottom Strip Bar (moving right-to-left) */}
        <div className="marquee-wrapper bottom-marquee">
          <div className="marquee-content rtl-scroll">
            <span>{repeatText('Highly Interested in Iot, IIoT, Cloud computing and Embedded Systems and Applications', 8)}</span>
            <span>{repeatText('Highly Interested in Iot, IIoT, Cloud computing and Embedded Systems and Applications', 8)}</span>
          </div>
        </div>
      </section>

      {/* Main Content (Guestbook and List) */}
      <main className="content-section">
        {/* Message Input Panel */}
        <div className="message-panel-card">
          <h2>Leave a Message</h2>
          <p className="subtitle">Share your thoughts, feedback, or just say hello!</p>

          <form onSubmit={handleSubmit} className="guestbook-form">
            <div className="form-group">
              <label htmlFor="name-input">Your Name</label>
              <input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                maxLength={50}
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="message-input">Message</label>
                <span className={`char-counter ${messageText.length >= 90 ? 'limit-near' : ''}`}>
                  {messageText.length} / 100
                </span>
              </div>
              <textarea
                id="message-input"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Write your message here..."
                required
                maxLength={100}
                rows={3}
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <button 
              type="submit" 
              className={`submit-btn ${submitLoading ? 'btn-loading' : ''}`}
              disabled={submitLoading}
            >
              {submitLoading ? 'Sending...' : 'Submit Message'}
            </button>
          </form>
        </div>

        {/* Messages List Area */}
        <div className="messages-display-area">
          <h3>Guestbook Log</h3>
          
          {loading ? (
            <div className="loader-container">
              <div className="spinner"></div>
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-state">
              <p>No messages yet. Be the first to write one!</p>
            </div>
          ) : (
            <div className="messages-grid">
              {messages.map((msg) => (
                <div key={msg._id} className="message-card">
                  <div className="card-header">
                    <div className="avatar">
                      {msg.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="meta">
                      <span className="user-name">{msg.name}</span>
                      <span className="timestamp">{formatDate(msg.createdAt)}</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <p className="message-text">"{msg.message}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
