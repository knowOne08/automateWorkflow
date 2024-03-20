const Imap = require('node-imap');
const simpleParser = require('mailparser').simpleParser;
const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const express = require('express');
dotenv.config();

const imap = new Imap({
  user: process.env.USER_EMAIL,
  password: process.env.USER_PASSWORD,
  host: 'imap.gmail.com',
  port: 993,
  tls: {
    rejectUnauthorized: false // Ignore SSL certificate verification errors
  }
});

const browser_verification = async (link) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(link);


  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await browser.close();
}

imap.once('ready', () => {
  console.log("Chale che");
  imap.openBox('INBOX', false, (err, box) => {
    if (err) throw err;
    imap.on('mail', async (numNewMsgs) => {
      const fetch = imap.seq.fetch(box.messages.total + ':' + (box.messages.total - numNewMsgs + 1), {
        bodies: ''
      });

      fetch.on('message', async (msg) => {
        msg.on('body', async (stream) => {
          const parsed = await simpleParser(stream);
          const { from, subject, text } = parsed;
          if (from.value[0].address == 'info@account.netflix.com' && subject == 'Important: How to update your Netflix household') {

            const linkRegex = /https:\/\/www\.netflix\.com\/account\/update-primary-location\?[^'"\s]+/;
            const matches = text.match(linkRegex);

            if (matches) {
              await browser_verification(matches[0]);
            } else {
              console.log('No matching link found.');
            }
          }
        });
      });

      fetch.once('error', (err) => {
        console.error('Fetch error:', err);
      });
    });
  });
});

imap.once('error', (err) => {
  console.error('IMAP error:', err);
});

imap.connect();


const app = express()


app.all("/", (req,res)=>{
    res.send("Working");
})
const keepAlive = () => {  
    app.listen(3000, ()=>{
        console.log("Sever running on port 3000")
    });
}

keepAlive();


