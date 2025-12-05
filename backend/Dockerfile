# Image de base légère
FROM node:22-alpine

# Dossier de travail
WORKDIR /usr/src/app

# Copier les fichiers package pour installer les dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Exposer le port 3000
EXPOSE 3000

# Variable d'environnement (optionnel)
ENV NODE_ENV=development

# Commande pour démarrer le serveur
CMD ["node", "server.js"]
