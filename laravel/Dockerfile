FROM php:8.2-fpm-alpine

RUN apk add --no-linux-headers --no-cache nginx curl git zip unzip libpng-dev libzip-dev \
    && docker-php-ext-install pdo pdo_mysql zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Download & install Skeleton Laravel
RUN composer create-project laravel/laravel . --prefer-dist --no-interaction

# Set permission
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Konfigurasi Nginx minimalis
RUN echo 'server { \
    listen 8080; \
    root /var/www/public; \
    index index.php; \
    location / { try_files $uri $uri/ /index.php?$query_string; } \
    location ~ \.php$ { \
        fastcgi_pass 127.0.0.1:9000; \
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; \
        include fastcgi_params; \
    } \
}' > /etc/nginx/http.d/default.conf

EXPOSE 8080

CMD php-fpm -D && nginx -g 'daemon off;'
