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

# Exposer le port 5173 (Vite dev server)
EXPOSE 5173

# Commande pour démarrer le dev server Vite
# --host 0.0.0.0 permet d'accepter les connexions de l'extérieur du container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
