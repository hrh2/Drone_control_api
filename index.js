const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

let commands = {}; // Store commands for each drone
let launchedDrones = []; // Store launched drones

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('New client connected');

  // Send the list of launched drones to the new client
  socket.emit('adminNotification', launchedDrones);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
  
  socket.on('message', (message) => {
    io.emit('new_message',message)
  });
  
  socket.on('clear_launched_drones', () => {
    io.emit('message_clear',"HISTORIES CLEARED")
  });

  socket.on('sendCommand', (data) => {
    const { drone_id, command } = data;
    commands[drone_id] = command;
    console.log(`Command ${command} sent to drone ${drone_id}`);
    io.emit('newCommand', { drone_id, command });
    // io.emit('new_message', `Command '${command}' sent to drone ${drone_id}`);
  });
  socket.on('destination_set', (data) => {
    const { drone_id, district } = data;
    const newDrone = { drone_id, district };
    launchedDrones.push(newDrone);
    console.log(`Drone ${drone_id} is launched automatically to ${district.name}`);
    io.emit('adminNotification', newDrone);
  });

  socket.on('register', (drone_id) => {
    socket.join(drone_id);
    // console.log(`Drone ${drone_id} registered`);
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
