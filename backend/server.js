const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config(); // Ensure your .env file is properly configured

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend's URL
  credentials: true // Allow cookies to be sent if needed
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("\x1b[32mConnected to MongoDB\x1b[0m"))
  .catch((err) => console.error("\x1b[31mFailed to connect to MongoDB: \x1b[0m", err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// User Model
const User = mongoose.model('User', userSchema);

const contactSchema = new mongoose.Schema({
  senderId: { type: String, required: true }, 
  senderName: { type: String, required: true }, 
  lastMessage: { type: String, default: '' },   
  time: { type: String, default: '' },
  userId: { type: String, required: true }, 
  userName: { type: String, required: true },
  chatId: { type: String, required: true },
});


// Contact Model
const Contact = mongoose.model('Contact', contactSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
  chatId: { type: String, required: true }, // Either unique chat room ID or user1_user2
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Message Model
const Message = mongoose.model('Message', messageSchema);

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Extract token from 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.user = decoded; // Save user ID (decoded from token) to request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Generate JWT function
const generateToken = (userId) => {
  const payload = { userId };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Send back the token and user ID in the response
    res.json({ token, _id: user._id }); // Include the user ID here
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Signup route
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validate input fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Error during signup:', err);

    // Handle specific Mongoose errors (e.g., duplicate email)
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Profile route (requires JWT authentication)
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password'); // Fetch user by ID from token, exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ name: user.name, email: user.email }); // Return user profile data
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch contacts
app.get('/api/contacts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('User ID:', userId);

    const contacts = await Contact.find({ userId: userId });
    console.log('Number of contacts:', contacts.length);
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).send('Server error');
  }
});


// Add new contact
app.post('/api/contacts', authenticateToken, async (req, res) => {
  const { senderName, lastMessage, time, userId, userName, senderId, chatId } = req.body;

  try {
    const newContact = new Contact({
      senderName: senderName,
      lastMessage: lastMessage,
      time: time,
      userId: userId,
      userName: userName,
      senderId: senderId,
      chatId: chatId
    });

    await newContact.save();
    res.json({ message: 'Contact added successfully' });
  } catch (err) {
    console.error('Error adding contact:', err);
    res.status(500).json({ message: 'Server error adding contact' });
  }
});


// Fetch messages for a chat
app.get('/api/messages/:chatId', authenticateToken, async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({ chatId }).sort({ timestamp: 1 }); // Sort by timestamp to display in order
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

// Send Messages
app.post('/api/messages', authenticateToken, async (req, res) => {
  const { chatId, recipient, message, name} = req.body; // Added name to request body

  try {
    // Validate fields
    if (!chatId || !recipient || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create and save the new message
    const newMessage = new Message({
      chatId: chatId,
      sender: req.user.userId, // Sender is the authenticated user
      recipient: recipient,
      message: message,
      timestamp: new Date().toISOString(), // Add a timestamp in ISO format
    });

    await newMessage.save();

    // Check and add/update contact for the sender
    await Contact.findOneAndUpdate(
      { userId: req.user.userId, chatId },
      { 
        userName: name,  // Sender's name (userName represents contact for the sender)
        lastMessage: message, 
        time: newMessage.timestamp 
      },
      { upsert: true, new: true } // Create a new contact if it doesn't exist
    );

    // Check and add/update contact for the recipient
    await Contact.findOneAndUpdate(
      { userId: recipient, chatId }, // Here recipient becomes the 'user' in their own contact list
      { 
        userName: req.user.name, // Store sender's name in recipient's contact list
        lastMessage: message, 
        time: newMessage.timestamp 
      },
      { upsert: true, new: true } // Create a new contact if it doesn't exist
    );

    // Respond with the newly created message including its timestamp
    res.status(201).json({
      chatId: newMessage.chatId,
      sender: newMessage.sender,
      recipient: newMessage.recipient,
      message: newMessage.message,
      timestamp: newMessage.timestamp,
    });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Server error sending message' });
  }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));