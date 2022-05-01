FROM node:16

WORKDIR /appppp

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5000

CMD ["node","app.js"]