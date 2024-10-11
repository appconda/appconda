FROM nginx:stable-alpine

WORKDIR /app

COPY . .

RUN cp -r /app/dist/* /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80