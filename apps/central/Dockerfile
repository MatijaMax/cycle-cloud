FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install node-fetch
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]