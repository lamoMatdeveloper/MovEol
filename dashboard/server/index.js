const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for MVP
        methods: ["GET", "POST"]
    }
});

// CONFIGURATION
const PORT = 3000;
const SERIAL_PATH = 'COM6'; // Detected USB Port
const BAUD_RATE = 9600;
const SIMULATION_MODE = false; // Using real hardware (USB for now)

let port;

if (!SIMULATION_MODE) {
    try {
        port = new SerialPort({ path: SERIAL_PATH, baudRate: BAUD_RATE });
        const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

        port.on('open', () => {
            console.log(`Serial Port ${SERIAL_PATH} opened at ${BAUD_RATE}`);
        });

        parser.on('data', (data) => {
            try {
                const jsonData = JSON.parse(data);
                console.log('Received:', jsonData);
                io.emit('turbine-data', jsonData);
            } catch (e) {
                console.error('Error parsing JSON:', e.message);
                console.log('Raw data:', data);
            }
        });

        port.on('error', (err) => {
            console.error('Serial Port Error: ', err.message);
        });
    } catch (err) {
        console.error('Failed to open Serial Port:', err.message);
        console.log('Switching to SIMULATION MODE due to error.');
        startSimulation();
    }
} else {
    console.log('Running in SIMULATION MODE');
    startSimulation();
}

function startSimulation() {
    setInterval(() => {
        const voltage = 12.0 + (Math.random() * 2 - 1);
        const current = 2.0 + (Math.random() * 1 - 0.5);
        const rpm = 300 + Math.floor(Math.random() * 100 - 50);
        const power = voltage * current;

        const data = {
            voltage: parseFloat(voltage.toFixed(2)),
            current: parseFloat(current.toFixed(2)),
            power: parseFloat(power.toFixed(2)),
            rpm: rpm
        };

        // console.log('Simulating:', data);
        io.emit('turbine-data', data);
    }, 1000);
}

io.on('connection', (socket) => {
    console.log('Frontend connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Frontend disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`MovEol Backend running on http://localhost:${PORT}`);
});
