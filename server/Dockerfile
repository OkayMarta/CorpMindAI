FROM node:18-alpine

WORKDIR /app

# Встановлюємо залежності для роботи деяких бібліотек
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

# Створюємо папку для завантажень
RUN mkdir -p uploads

EXPOSE 5000

CMD ["npm", "start"]