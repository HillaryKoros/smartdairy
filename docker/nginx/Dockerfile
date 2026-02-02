FROM nginx:1.25-alpine

# Remove default config and add our own
RUN rm /etc/nginx/nginx.conf
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
