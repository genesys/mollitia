FROM nginx:alpine

COPY ./devops/nginx.conf /etc/nginx/conf.d/default.conf

COPY ./.docs /usr/share/nginx/html
