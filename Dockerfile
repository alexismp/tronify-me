# Stage 1: Build the application
FROM node:20-slim AS build
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY
ARG UPLOAD_API_KEY
ENV UPLOAD_API_KEY=$UPLOAD_API_KEY
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production image
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY README.md /usr/share/nginx/html/README.md
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]