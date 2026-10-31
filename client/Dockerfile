ARG VERSION=24-alpine

FROM node:${VERSION}

WORKDIR /client

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
