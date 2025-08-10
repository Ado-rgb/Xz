FROM debian:bullseye-slim

# Instalar dependencias esenciales
RUN apt-get update &&     apt-get install -y git curl bash build-essential wget cmake libjson-c-dev libwebsockets-dev ca-certificates gnupg

# Instalar Node.js 24
RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - &&     apt-get install -y nodejs

# Instalar ttyd
RUN git clone https://github.com/tsl0922/ttyd.git &&     cd ttyd && mkdir build && cd build &&     cmake .. && make && make install &&     cd / && rm -rf ttyd

# Crear carpeta de trabajo
WORKDIR /root

# Puerto web
EXPOSE 7681

# Ejecutar ttyd sirviendo bash
CMD ["ttyd", "-p", "7681", "bash"]
