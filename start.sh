cd /opt/application/backend
pm2 start server.js
/usr/local/nginx/sbin/nginx
tail -f /usr/local/nginx/logs/access.log /usr/local/nginx/logs/error.log
