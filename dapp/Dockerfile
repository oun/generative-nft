# Use Alpine when this issue fixed: https://github.com/prisma/prisma/issues/8478
FROM node:14

RUN mkdir -p /app

WORKDIR /app

COPY package.json yarn.lock ./
COPY prisma ./prisma

RUN yarn install
RUN yarn prisma generate

COPY . /app

EXPOSE 3000

CMD ["yarn", "dev"]