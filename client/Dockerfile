# The Builder
FROM node:10.16.3-alpine AS builder
MAINTAINER Greg Taschuk
WORKDIR /usr/src/app
RUN apk add --no-cache git 
COPY package.json .
COPY yarn.lock .
RUN yarn install
COPY . .
RUN npm run build

# The App
FROM nginx:1.17.4-alpine AS app
COPY nginx-site.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
