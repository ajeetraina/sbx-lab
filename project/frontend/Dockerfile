FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000

# Development server, bound to 0.0.0.0 so published ports can reach it.
CMD ["npm", "run", "dev"]
