# Build stage
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# Runtime stage
FROM nginx:alpine AS final
COPY --from=build /app/dist /usr/share/nginx/html

# Handle client-side routing (React Router)
RUN printf 'server {\n  listen 10000;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 10000

CMD ["nginx", "-g", "daemon off;"]
