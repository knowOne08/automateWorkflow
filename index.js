const Imap = require('node-imap');
const simpleParser = require('mailparser').simpleParser;
const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const keepAlive = require('./server.js')
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

          // console.log(from.value[0].address)
          // console.log(subject)
          // if (from.text === 'info@account.netflix.com' && subject === 'Important: How to update your Netflix household') {
          if (from.value[0].address == 'info@account.netflix.com' && subject == 'Important: How to update your Netflix household') {

            const linkRegex = /https:\/\/www\.netflix\.com\/account\/update-primary-location\?[^'"\s]+/;
            const matches = text.match(linkRegex);
            // const linkRegex = /https:\/\/youtube\.com/; // Example regex

            console.log(matches)


            if (matches) {
              const link = matches[0];
              console.log('Complete Link:', link);
              const browser = await puppeteer.launch({ headless: true });
              const page = await browser.newPage();
              await page.goto(link); //goto verification page

              await page.waitForSelector('button');
              console.log("here")
              // Click the button with the text "Update Netflix Household"
              await page.evaluate(() => {
                try {
                  console.log("here");
                  const buttons = document.querySelectorAll('button');
                  let buttonClicked = false;
              
                  buttons.forEach(button => {
                    if (button.innerText.trim() === 'Update Netflix Household') {
                      button.click();
                      console.log("Button clicked");
                      buttonClicked = true;
                    }
                  });
              
                  if (!buttonClicked) {
                    console.log("Button not found or not clicked");
                  }
                } catch (error) {
                  console.error('Error in page.evaluate:', error);
                }
              
              });
                await Promise.race([
                  page.waitForNavigation({ timeout: 5000 }),
                  new Promise(resolve => setTimeout(resolve, 5000)) // Timeout after 5 seconds
                ]);                
                
                await browser.close();
              } else {
                console.log('No matching link found.');
              }

            // Example: Click on the first link containing "verification link"
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

keepAlive();
imap.connect();
