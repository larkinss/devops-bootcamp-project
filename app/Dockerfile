# =============================================================================
# STAGE 1: Build
# =============================================================================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm test
RUN npm run build

# =============================================================================
# STAGE 2: Serve (lightweight, production image)
# =============================================================================
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
