import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import InputBox from "./InputBox";

const ChatWindow = ({ activeChat, setActiveChat, contacts, setContacts, message, setMessage }) => {
  const [messages, setMessages] = useState([]); // Initialize messages as an empty array
  const [loading, setLoading] = useState(true); // State for loading
  const loggedInUserId = localStorage.getItem('userId'); // Get the logged-in user's ID
  const messagesEndRef = useRef(null); // Ref for scrolling

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChat || !activeChat.chatId) return; // Prevent unnecessary fetches

      setLoading(true); // Start loading
      try {
        const response = await axios.get(
          `http://localhost:5000/api/messages/${activeChat.chatId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (Array.isArray(response.data)) {
          setMessages(response.data); // Update messages
        } else {
          console.error('Expected an array, but got:', response.data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchMessages(); // Fetch messages immediately on mount

  }, [activeChat]); // Only depend on activeChat

  // Scroll to the bottom of the messages immediately after loading
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" }); // Set scroll to bottom without animation
    }
  }, [messages]); // Run this effect when messages change

  // Function to handle sending a new message
  const handleSendMessage = useCallback((newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]); // Append new message
  }, []);

  // Function to format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes; // Add leading zero if needed
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  // Function to format date (without the day)
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="w-2/3 flex flex-col p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{activeChat?.name || 'Chat'}</h2>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-md">Call</button>
      </div>
      <div className="flex-grow overflow-y-auto space-y-4 scrollbar-hidden">
        {loading ? (
          <div className="text-gray-500 text-center">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-500 text-center">No messages yet</div>
        ) : (
          messages.map((msg, index) => {
            const showDateHeader =
              index === 0 || new Date(msg.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();

            return (
              <div key={msg._id || msg.timestamp} className="space-y-1">
                {showDateHeader && (
                  <div className="text-center text-gray-500 font-semibold my-2">
                    {formatDate(msg.timestamp)}
                  </div>
                )}
                <div
                  className={`p-4 rounded-lg w-max max-w-xs ${
                    msg.sender === loggedInUserId ? "ml-auto bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  <div>{msg.message}</div>
                  <div className="text-sm text-gray-500">{formatTime(msg.timestamp)}</div> {/* Display formatted time */}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} /> {/* Scroll target */}
      </div>
      <InputBox 
        activeChat={activeChat} setActiveChat={setActiveChat} 
        onSendMessage={handleSendMessage} 
        contacts={contacts} setContacts={setContacts}
        message={message} setMessage={setMessage}
      />
    </div>
  );
};

export default ChatWindow;
