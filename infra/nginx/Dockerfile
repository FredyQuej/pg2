FROM nginx:1.25-alpine

# Elimina cualquier configuración previa de Nginx
RUN rm -rf /etc/nginx/conf.d/*

# Copia nuestra plantilla personalizada
COPY conf.d/app.conf.template /etc/nginx/templates/app.conf.template


#FROM nginx:1.25-alpine
#COPY conf.d/ /etc/nginx/conf.d/
