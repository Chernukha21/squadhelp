ARG VERSION=24-alpine

FROM node:${VERSION}

WORKDIR /server

RUN mkdir -p /public/images /var/www/html/images

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
