FROM node:14.17.2
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8004
CMD [ "npm", "start" ]