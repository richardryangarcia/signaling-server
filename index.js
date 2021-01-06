const express = require('express');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const INDEX = '/index.html';
const app = express();

app.get('/healthcheck', function(req, res) {
    res.send("server is working");
});

const server = app
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new WebSocket.Server({ server });

// Broadcast to all.
wss.broadcast = (ws, data) => {
    wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

wss.on('connection', (ws) => {
    console.log(`Client connected. Total connected clients: ${wss.clients.size}`)
    wss.broadcast(ws, `A new client connected: Total connected clients ${wss.clients.size}`);
    
    ws.onmessage = (message) => {
        console.log(message.data + "\n");
        wss.broadcast(ws, message.data);
    }

    ws.onclose = () => {
        wss.broadcast(ws, `A client disconnected. Total connected clients: ${wss.clients.size}`);
        console.log(`Client disconnected. Total connected clients: ${wss.clients.size}`)
    }
});