import React, { useEffect, useState } from "react";
import axios from "axios";

const Contacts = ({ activeChat, setActiveChat, contacts, setContacts }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all contacts on component mount
  useEffect(() => {
    fetchContacts();
  }, []); // Run once on component mount

  // Function to fetch contacts for the logged-in user
  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
  
      const response = await axios.get(`http://localhost:5000/api/contacts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      // Ensure it's an array before setting state
      if (Array.isArray(response.data)) {
        setContacts(response.data);
      } else {
        console.error('Expected an array but got:', response.data);
        setContacts([]); // Fallback to an empty array in case of unexpected response
      }
    } catch (error) {
      if (error.response) {
        console.error('Error fetching contacts:', error.response.data);
      } else {
        console.error('Error:', error.message);
      }
    }
  };

  // Function to format time to AM/PM
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes; // Add leading zero if needed
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  // Handle search button click
  const handleSearch = () => {
    if (searchQuery) {
      const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setContacts(filteredContacts); // Update contacts state with filtered contacts
    } else {
      fetchContacts(); // Reset to all contacts if search query is empty
    }
  };

  return (
    <div className="w-1/3 bg-gray-100 p-4">
      <div className="mb-4 flex">
        <input
          type="text"
          placeholder="Search users"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query state
          className="w-full p-2 rounded-md border border-gray-300"
        />
        <button
          onClick={handleSearch}
          className="ml-2 p-2 bg-blue-500 text-white rounded-md"
        >
          Search
        </button>
      </div>
      <ul>
        {Array.isArray(contacts) && contacts.length > 0 ? (
          contacts.map((contact) => (
            <li
              key={contact._id} // Use _id from MongoDB
              onClick={() => setActiveChat(contact)}
              className="p-4 mb-2 cursor-pointer bg-white rounded-md hover:bg-gray-200 flex justify-between"
            >
              <div>
                <div className="font-semibold">{contact.senderName}</div>
                <div className="text-gray-500">{contact.lastMessage || "No messages yet"}</div>
              </div>
              <div className="text-gray-400 text-sm">
                {contact.time ? formatTime(contact.time) : "Just now"}
              </div>
            </li>
          ))
        ) : (
          <li>No contacts available</li>
        )}
      </ul>
    </div>
  );
};

export default Contacts;
