FROM debian:testing

# Install some utils
RUN apt-get update
RUN apt-get install -y curl gnupg unp git

# Install Node.js
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g pm2 brunch bower

# Install database
RUN apt-get install -y mariadb-server

# Compile nginx
RUN apt-get install -y build-essential libtool autoconf automake libpcre3-dev libssl-dev
RUN git clone https://github.com/bagder/libbrotli.git /opt/libbrotli
RUN cd /opt/libbrotli && ./autogen.sh && ./configure --prefix=/usr && make && make install
RUN cd /opt && curl -O https://nginx.org/download/nginx-1.11.4.tar.gz && unp nginx-1.11.4.tar.gz
RUN cd /opt/nginx-1.11.4 && git clone https://github.com/google/ngx_brotli.git && sed -i '/"<hr><center>" NGINX_VER "<\/center>" CRLF/d' src/http/ngx_http_special_response.c && sed -i '/"<hr><center>nginx<\/center>" CRLF/d' src/http/ngx_http_special_response.c && sed -i 's/Server: nginx/Server: Cats with Potatoes/g' src/http/ngx_http_header_filter_module.c && sed -i 's/Server: " NGINX_VER/Server: Cats with Potatoes"/g' src/http/ngx_http_header_filter_module.c && ./configure --with-http_v2_module --without-http_uwsgi_module --with-threads --with-ipv6 --without-http_autoindex_module --with-http_ssl_module --with-http_gzip_static_module --without-http_empty_gif_module --without-http_scgi_module --without-http_fastcgi_module --add-module=ngx_brotli && make && make install

# Generate TLS certificates (TODO: use Let's Encrypt)
RUN openssl ecparam -genkey -name secp256r1 | openssl ec -out /usr/local/nginx/conf/ecdsa.key
RUN openssl req -new -sha256 -key /usr/local/nginx/conf/ecdsa.key -out /usr/local/nginx/conf/ecdsa.csr -subj '/O=Cats with Potatoes/CN=chat.wout.ml'
RUN openssl x509 -req -days 365 -in /usr/local/nginx/conf/ecdsa.csr -signkey /usr/local/nginx/conf/ecdsa.key -out /usr/local/nginx/conf/ecdsa.crt
RUN openssl genrsa -out /usr/local/nginx/conf/rsa.key 2048
RUN openssl req -sha256 -new -key /usr/local/nginx/conf/rsa.key -out /usr/local/nginx/conf/rsa.csr -subj '/O=Cats with Potatoes/CN=chat.wout.ml'
RUN openssl x509 -sha256 -req -days 365 -in /usr/local/nginx/conf/rsa.csr -signkey /usr/local/nginx/conf/rsa.key -out /usr/local/nginx/conf/rsa.crt
RUN openssl dhparam -out /usr/local/nginx/conf/dhparam.pem 2048

# Copy application into container
COPY . /opt/application
COPY nginx.conf /usr/local/nginx/conf

# Compile application
RUN cd /opt/application/frontend && npm install && bower --allow-root install && brunch build --production
RUN cd /opt/application/backend && npm install

# Run application
CMD /opt/application/start.sh

# Expose ports of application
EXPOSE 80 443