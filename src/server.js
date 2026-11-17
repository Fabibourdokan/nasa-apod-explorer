const path = require('node:path');
const dotenv = require('dotenv');
const express = require('express');

dotenv.config({
  path: path.join(__dirname, '..', '.env'),
  quiet: true,
});

const app = express();
const port = Number(process.env.PORT ?? '3000');
const host = '127.0.0.1';

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('Configure PORT com um número inteiro entre 1 e 65535.');
  process.exit(1);
}

app.disable('x-powered-by');
app.use(express.static(path.join(__dirname, '..', 'public')));

const server = app.listen(port, host, () => {
  console.log(`Servidor disponível em http://${host}:${port}`);
});

server.on('error', () => {
  console.error('Não foi possível iniciar o servidor. Verifique se a porta está disponível.');
  process.exitCode = 1;
});
