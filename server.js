const express = require('express');
const WebSocket = require('ws');
const app = express();

// Явно раздаем index.html для корневого пути
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Обработка для любого другого пути (опционально, чтобы избежать ошибок)
app.get('*', (req, res) => {
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// Создаём WebSocket сервер
const wss = new WebSocket.Server({ server });

// Хранилище подключённых пользователей: { "t1": wsClient1, "t2": wsClient2 }
const users = {};

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);

      // Обработка регистрации
      if (data.type === 'register') {
        const username = data.username;
        if (username === 't1' || username === 't2') {
          users[username] = ws;
          ws.username = username;
          console.log(`User ${username} registered`);
          sendTo(ws, { type: 'register_success', username });
        }
      }

      // Обработка предложения звонка (offer)
      if (data.type === 'offer' || data.type === 'answer' || data.type === 'candidate') {
        const targetUser = data.target;
        if (users[targetUser]) {
          console.log(`Sending ${data.type} to ${targetUser}`);
          sendTo(users[targetUser], data);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    if (ws.username) {
      delete users[ws.username];
    }
  });
});

function sendTo(connection, message) {
  connection.send(JSON.stringify(message));
}
