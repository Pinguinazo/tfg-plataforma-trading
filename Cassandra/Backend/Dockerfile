FROM node:18
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN npm install express cors cassandra-driver
COPY . .
EXPOSE 3002
CMD ["node", "server.js"]