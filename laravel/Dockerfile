FROM php:8.2-fpm-alpine

RUN apk add --no-cache nginx curl git zip unzip libpng-dev libzip-dev \
    && docker-php-ext-install pdo pdo_mysql zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install Laravel ke folder temporary lalu pindahkan ke /var/www
RUN composer create-project laravel/laravel /tmp/laravel --prefer-dist --no-interaction \
    && cp -rn /tmp/laravel/. /var/www/ \
    && rm -rf /tmp/laravel

WORKDIR /var/www

# Set permission
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Konfigurasi Nginx minimalis
RUN echo 'server { \
    listen 5000; \
    root /var/www/public; \
    index index.php; \
    location / { try_files $uri $uri/ /index.php?$query_string; } \
    location ~ \.php$ { \
        fastcgi_pass 127.0.0.1:9000; \
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; \
        include fastcgi_params; \
    } \
}' > /etc/nginx/http.d/default.conf

EXPOSE 5000

CMD php-fpm -D && nginx -g 'daemon off;'
