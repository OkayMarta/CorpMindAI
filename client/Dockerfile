# Етап збірки (Build stage)
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Аргумент для збірки
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Етап запуску (Production stage)
FROM nginx:alpine

# Копіюємо зібрані файли в папку Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Копіюємо конфіг nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]