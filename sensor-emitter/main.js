const axios = require('axios');

const sensors = [
  { id: '1', data: { type: 'temperature', min: 1, max: 100, alertRegex: '^(6[1-9]|[7-9][0-9]|[1-9][0-9]{2,})$', alertProbability: 0.0075 } },
  { id: '1', data: { type: 'humidity', min: 1, max: 100, alertRegex: '^(8[1-9]|[9-9][0-9]|[1-9][0-9]{2,})$', alertProbability: 0.0075 } },
  { id: '2', data: { type: 'presence', min: 0, max: 2, alertRegex: '1', alertProbability: 0.002 } }
];

const baseUrl = 'http://localhost:3000'
const requestsPerMinute = 6000

function raisesAlert(value, alertRegex) {
  const regex = new RegExp(alertRegex);
  return regex.test(String(value));
}

function generateRandomNumber(min, max) {
  return `${parseInt(Math.random() * (max - min) + min)}`;
}

function shouldRaiseAlert(probability) {
  return Math.random() < probability;
}

async function emitSensorData() {
  const randomSensor = sensors[Math.floor(Math.random() * sensors.length)];
  const { id, data } = randomSensor;
  const { type, min, max, alertProbability } = data;

  value = generateRandomNumber(min, max);
  while (raisesAlert(value, data.alertRegex)) {
    if (shouldRaiseAlert(alertProbability)) {
      console.log(`RAISE ALERT: ${type}: ${value} for sensor ${id}`)
      break
    }
    value = generateRandomNumber(min, max);
  }

  const url = `${baseUrl}/sensors/signal`;
  try {
    await axios.post(url, { sensorId: id, [type]: value });
    console.log(`Emitted sensor data: ${type}=${value}`);
  } catch (error) {
    console.error(`Failed to emit sensor data: ${error.message}`);
  }
}

console.log(`Starting sensor emitter at ${requestsPerMinute} requests per minute...`);

const interval = 60 * 1000 / requestsPerMinute;

const intervalId = setInterval(emitSensorData, interval);

setTimeout(() => {
  clearInterval(intervalId);
  console.log('Sensor emitter stopped.');
}, 10 * 60 * 1000);