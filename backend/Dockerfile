# Используем официальный Node.js образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем все зависимости (включая dev для сборки)
RUN npm install

# Копируем исходный код
COPY . .

# Компилируем TypeScript
RUN npm run build

# Удаляем dev зависимости и исходники
RUN npm prune --production && \
    rm -rf src tsconfig.json

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Меняем владельца файлов
RUN chown -R nodejs:nodejs /app
USER nodejs

# Открываем порт
EXPOSE 5000

# Команда запуска
CMD ["node", "dist/server.js"]
