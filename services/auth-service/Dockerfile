FROM node:18-bookworm
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm i
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
COPY seed.js ./
EXPOSE 4001
CMD ["node","src/server.js"]
