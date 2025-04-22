const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for testing
    methods: ["GET", "POST"]
  }
});

app.get('/', (req, res) => {
  res.send('🎶 Music Sync Server is Running!');
});

// Store the socket id for each user
const users = {};

io.on('connection', (socket) => {
  console.log('🎧 User connected:', socket.id);

  // Store user and their socket id
  socket.on('register_user', (userId) => {
    users[userId] = socket.id; // Associate userId with socket.id
    console.log(`User registered: ${userId} with socket id ${socket.id}`);
  });
 

  // Play audio event
  socket.on('play_audio', (data) => {

    console.log('▶️ Play:', data);
    console.log(users[data.toUser]);
   
      console.log(io.to(users[data.toUser]).emit('play_audio', data));
      io.to(users[data.toUser]).emit('play_audio', data); // Emit to specific user
      });

  // Pause audio event
  socket.on('pause_audio', (data) => {
    console.log('⏸️ Pause:', data);
    if (data.toUser && users[data.toUser]) {
      io.to(users[data.toUser]).emit('pause_audio', data); // Emit to specific user
    }
  });

  // Resume audio event (for resuming after pause)
  socket.on('resume_audio', (data) => {
    console.log('▶️ Resume:', data);
    if (data.toUser && users[data.toUser]) {
      io.to(users[data.toUser]).emit('resume_audio', data); // Emit to specific user
    }
  });

  // Seek audio event
  socket.on('seek_audio', (data) => {
    console.log('⏩ Seek:', data);
    if (data.toUser && users[data.toUser]) {
      io.to(users[data.toUser]).emit('seek_audio', data); // Emit to specific user
    }
  });

  // Sync song info (URL, position, title, etc.)
  socket.on('sync_song', (data) => {
    console.log('🔄 Sync Song Info:', data);
    if (data.toUser && users[data.toUser]) {
      io.to(users[data.toUser]).emit('sync_song', data); // Emit to specific user
    }
  });

  // Listen for incoming messages
  socket.on('send_message', (data) => {
    console.log('Message received:', data);
    // Broadcast the message to all connected clients
    io.emit('message', {
      user: data.user,
      message: data.message,
    });
  });

  socket.on('vibrate-user', (data) => {
    console.log('Vibrate:', data);
    console.log(data.yes);
    if (data.yes) {
      io.emit('vibrate');
    }
  });

  socket.onAny((event, data) => {
    console.log('Connected users:', users);
    console.log(`📡 Event: ${event}`, data);
  });

  // User disconnected, clean up
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    // Remove user from the list when they disconnect
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        console.log(`User ${userId} removed from active users.`);
        break;
      }
    }
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
