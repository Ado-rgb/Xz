# Usa Node.js 24
FROM node:24

# Instala git
RUN apt-get update && apt-get install -y git

# Crea directorio de trabajo
WORKDIR /app

# Copia archivos
COPY . .

# Instala dependencias
RUN npm install

# Expone el puerto 3000
EXPOSE 3000

# Comando para iniciar la app
CMD ["node", "server.js"]
