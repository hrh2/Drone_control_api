const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let command = '';

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
  
  socket.on('sendCommand', (cmd) => {
    command = cmd;
    io.emit('newCommand', command);
  });
});

app.get('/command', (req, res) => {
  res.send(command);
});

server.listen(4000, () => {
  console.log('.');
});
