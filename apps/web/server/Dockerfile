FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Expose port 3001 for Express
EXPOSE 3001
CMD ["npm", "run", "dev"]