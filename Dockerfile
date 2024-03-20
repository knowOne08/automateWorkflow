FROM ghcr.io/puppeteer/puppeteer:22.1.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/ur/bin/google-chromium-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci 
COPY . . 

CMD ["node", "index.js"]