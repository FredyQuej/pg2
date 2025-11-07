
FROM node:18-bookworm
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm i
COPY src ./src
EXPOSE 4020
CMD ["node","src/index.js"]
