## Commenting out the build stage until the full 
## deployment pipeline is ready. For now, the image
## will be built locally and manually transferred
## to the target server.

# FROM node:22-alpine AS build
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci
# COPY . .
# RUN npm run build

FROM nginx:alpine
COPY ./dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80