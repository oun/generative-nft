FROM node:14-alpine

RUN mkdir -p /app

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . /app

EXPOSE 3000

CMD ["yarn", "dev"]