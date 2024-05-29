const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let commands = {};  // Store commands for each drone

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('sendCommand', (data) => {
    const { drone_id, command } = data;
    commands[drone_id] = command;
    io.to(drone_id).emit('newCommand', { drone_id, command });
  });

  socket.on('destination_set', (data) => {
    const { drone_id, district } = data;
    console.log(`Drone ${drone_id} is launched automatically to ${district.name}`);
    io.emit('adminNotification', {
      message: `Drone ${drone_id} is launched automatically to ${district.name}`,
      district: district,
      drone_id: drone_id
    });
  });

  socket.on('register', (drone_id) => {
    socket.join(drone_id);
    console.log(`Drone ${drone_id} registered`);
  });
});

app.get('/command', (req, res) => {
  const { drone_id } = req.query;
  res.send(commands[drone_id] || '');
});
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
