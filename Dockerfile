FROM node:18-alpine
# Installing libvips-dev for sharp compatibility
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev

WORKDIR /opt/app

COPY ./package.json ./
COPY ./yarn.lock ./

RUN yarn config set network-timeout 600000 -g && \
    yarn install

COPY . .

ENV NODE_ENV production

RUN yarn build

EXPOSE 1337

CMD ["yarn", "start"]
