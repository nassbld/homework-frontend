# Étape 1 : Build de l'app React
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
# Installation propre des dépendances
RUN npm ci
COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Compilation (crée le dossier /dist ou /build)
RUN npm run build

# Étape 2 : Serveur Web Nginx (Production)
FROM nginx:alpine
# On copie les fichiers compilés depuis l'étape 1 vers le dossier de Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# (Attention : si votre dossier de sortie est 'build' et pas 'dist', changez la ligne ci-dessus)

# Configuration Nginx personnalisée (on va la créer juste après)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]