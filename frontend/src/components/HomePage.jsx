import React, { useState } from "react";
import Contacts from "./Contacts";
import ChatWindow from "./ChatWindow";

const HomePage = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [message, setMessage] = useState('');

  return (
    <div className="flex h-screen">
      <Contacts activeChat={activeChat} setActiveChat={setActiveChat} contacts={contacts} setContacts={setContacts} />
      {activeChat ? (
        <ChatWindow 
          activeChat={activeChat} setActiveChat={setActiveChat} 
          contacts={contacts} setContacts={setContacts}
          message={message} setMessage={setMessage}
        />
      ) : (
        <div className="flex flex-grow items-center justify-center text-gray-500">
          Select a conversation
        </div>
      )}
    </div>
  );
};

export default HomePage;
