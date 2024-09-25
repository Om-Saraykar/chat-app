import React, { useCallback, useEffect, useRef } from 'react';
import axios from 'axios';

// Memoizing the InputBox component
const InputBox = React.memo(({ activeChat, setActiveChat, contacts, setContacts, message, setMessage }) => {
  
  const lastMessageTimeRef = useRef(null); // Reference to store the last message timestamp

  // Function to retrieve the token
  const getToken = useCallback(() => {
    return localStorage.getItem('token'); // Assuming the token is stored in local storage
  }, []);

  // Function to update contacts in UI
  const updateContactsUI = useCallback((chatId, lastMessage, time) => {
    setContacts((prevContacts) => {
      return prevContacts.map(contact =>
        contact.chatId === chatId 
          ? { ...contact, lastMessage, time } // Update contact's lastMessage and time
          : contact
      );
    });
  }, [setContacts]);

  // Fetch new messages from the server
  const fetchNewMessages = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/messages/${activeChat.chatId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const newMessages = response.data; // Assuming the API returns the new messages array
      if (newMessages.length > 0) {
        const latestMessage = newMessages[newMessages.length - 1];

        // Check if the latest message is newer than the last message we have seen
        if (!lastMessageTimeRef.current || new Date(latestMessage.timestamp) > lastMessageTimeRef.current) {
          lastMessageTimeRef.current = new Date(latestMessage.timestamp); // Update the last message time reference
          
          // Update the active chat with the new message
          setActiveChat((prevChat) => ({
            ...prevChat,
            lastMessage: latestMessage.message,
            time: latestMessage.timestamp,
          }));

          // Update the contact list in UI
          updateContactsUI(activeChat.chatId, latestMessage.message, latestMessage.timestamp);
        }
      }
    } catch (error) {
      console.error('Error fetching new messages:', error.response?.data?.message || error.message);
    }
  }, [activeChat.chatId, getToken, setActiveChat, updateContactsUI]);

  // Handle sending new messages
  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!message.trim()) return; // Prevent sending empty messages

    try {
      const response = await axios.post('http://localhost:5000/api/messages', {
        chatId: activeChat.chatId,  // Use the active chat's ID
        recipient: activeChat.senderId, // Send the recipient's ID
        message: message,
        name: activeChat.senderName       
      }, {
        headers: {
          Authorization: `Bearer ${getToken()}`, // Add the token to the headers
          'Content-Type': 'application/json', // Specify the content type
        },
      });

      console.log('Message sent:', response.data);

      // Update the activeChat to reflect the new message and timestamp
      setActiveChat((prevChat) => ({
        ...prevChat,
        lastMessage: message, // Update lastMessage only
        time: new Date().toISOString(), // Optionally update the timestamp
      }));

      // Update the contact list in UI
      updateContactsUI(activeChat.chatId, message, new Date().toISOString());

      setMessage(''); // Clear the input
    } catch (error) {
      console.error('Error sending message:', error.response?.data?.message || error.message);
    }
  }, [activeChat, message, setActiveChat, setContacts, getToken, updateContactsUI]);

  // Set up polling for new messages every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(fetchNewMessages, 5000);
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [fetchNewMessages]);

  return (
    <div>
      <form onSubmit={handleSendMessage} className="flex mt-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)} // Update message state
          placeholder="Type a message..."
          className="border border-gray-300 rounded-md p-2 flex-grow"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md ml-2">Send</button>
      </form>
    </div>
  );
});

export default InputBox;
