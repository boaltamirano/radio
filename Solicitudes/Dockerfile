FROM node:14.17.2
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8002
CMD [ "npm", "start" ]