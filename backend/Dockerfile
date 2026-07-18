FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Copy prisma schema first to generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code and config
COPY . .

# Build TS files
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/app.js"]
