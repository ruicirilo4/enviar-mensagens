const express = require('express');
const twilio = require('twilio');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const app = express();

// Configure suas credenciais da Twilio aqui
const accountSid = 'AC207a9361b590dea1a202e8c3857f3ebf';
const authToken = '292f1677df2ccdd857ae259062e90676';
const client = new twilio(accountSid, authToken);

// Middleware para analisar dados de formulário
app.use(bodyParser.urlencoded({ extended: true }));

// Rota para renderizar o formulário de envio de SMS
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Rota para lidar com o envio de SMS
app.post('/enviar-sms', async (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const message = req.body.message;

  try {
    await client.messages.create({
      body: message,
      from: '+14692094118',
      to: phoneNumber,
    });
    res.send('Mensagem enviada com sucesso!');
  } catch (error) {
    res.status(500).send('Erro ao enviar a mensagem: ' + error.message);
  }
});

// Rota para obter o preço atual do Bitcoin e enviar por SMS
app.get('/enviar-mensagem-bitcoin', async (req, res) => {
  try {
    const bitcoinPrice = await scrapeBitcoinPrice();
    await client.messages.create({
      body: `O preço atual do Bitcoin é de $${bitcoinPrice} USD.`,
      from: '+14692094118',
      to: '+351926812168',
    });
    res.send('Mensagem com o preço do Bitcoin enviada com sucesso!');
  } catch (error) {
    res.status(500).send('Erro ao enviar a mensagem: ' + error.message);
  }
});

async function scrapeBitcoinPrice() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://btcdirect.eu/pt-pt/cotacao-bitcoin');
  await page.waitForSelector('.price', { visible: true });
  const bitcoinPrice = await page.$eval('.price', (element) => element.textContent);
  await browser.close();
  return bitcoinPrice;
}

app.listen(3000, () => {
  console.log('Servidor Express iniciado na porta 3000');
});
