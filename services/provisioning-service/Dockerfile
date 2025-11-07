FROM node:18-bookworm
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm i
COPY src ./src
EXPOSE 4010
CMD ["node","src/server.js"]
