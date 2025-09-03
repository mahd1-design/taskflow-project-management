# Frontend Dockerfile - React App (Vite)
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the React app with Vite
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built app to nginx (Vite builds to 'dist' folder)
COPY --from=build /app/dist /usr/share/nginx/html

# Simple nginx config for React SPA
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]