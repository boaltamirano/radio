FROM node:14.17.2
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8003
CMD [ "npm", "start" ]