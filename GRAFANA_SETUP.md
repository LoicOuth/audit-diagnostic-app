# Configuration Grafana pour Bookstore

Ce guide explique comment configurer Grafana pour visualiser les logs de performance de l'application Bookstore.

## Démarrage de Grafana

Grafana est inclus dans `docker-compose.yml` et démarre automatiquement avec les autres services :

```bash
docker-compose up -d
```

Grafana sera accessible sur : **http://localhost:3001**

## Connexion à Grafana

1. Ouvrir **http://localhost:3001** dans votre navigateur
2. Se connecter avec les identifiants par défaut :
   - **Username** : `admin`
   - **Password** : `admin`
3. Grafana vous demandera de changer le mot de passe (vous pouvez le garder à `admin` pour le développement)

## Configuration de la source de données PostgreSQL

### Étape 1 : Ajouter une Data Source

1. Cliquer sur l'icône **⚙️ Configuration** (roue dentée) dans le menu latéral
2. Cliquer sur **Data Sources**
3. Cliquer sur **Add data source**
4. Sélectionner **PostgreSQL**

### Étape 2 : Configurer la connexion

Remplir les champs suivants :

- **Name** : `Bookstore Database`
- **Host** : `postgres:5432`
  _(Important : utiliser `postgres` car c'est le nom du service Docker, pas `localhost`)_
- **Database** : `bookstore`
- **User** : `bookstore_user`
- **Password** : `bookstore_pass`
- **TLS/SSL Mode** : `disable`

Cliquer sur **Save & Test** en bas de la page. Vous devriez voir un message de succès.

## Création d'un Dashboard

### Étape 1 : Créer un nouveau Dashboard

1. Cliquer sur l'icône **+** dans le menu latéral
2. Cliquer sur **Create Dashboard**
3. Cliquer sur **Add visualization**
4. Sélectionner la data source **Bookstore Database**

### Étape 2 : Configurer le panel pour visualiser les temps de réponse

Dans l'éditeur de requête, basculer en mode **SQL** (en bas de l'éditeur) et entrer la requête suivante :

```sql
SELECT
  created_at AS "time",
  duration_ms
FROM request_logs
WHERE route = '/products'
ORDER BY created_at
```

### Configuration du panel :

- **Panel title** : `GET /products - Temps de réponse (ms)`
- **Visualization** : Time series (graphique de ligne)
- Dans l'onglet **Field** :
  - **Unit** : `milliseconds (ms)`

### Étape 3 : Ajouter d'autres panels (optionnel)

#### Panel : Nombre de requêtes par minute

```sql
SELECT
  DATE_TRUNC('minute', created_at) AS "time",
  COUNT(*) as "requests"
FROM request_logs
WHERE route = '/products'
GROUP BY 1
ORDER BY 1
```

- **Panel title** : `GET /products - Requêtes par minute`
- **Visualization** : Bar chart

#### Panel : Taux d'erreur

```sql
SELECT
  DATE_TRUNC('minute', created_at) AS "time",
  SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) as "errors",
  SUM(CASE WHEN status_code < 500 THEN 1 ELSE 0 END) as "success"
FROM request_logs
WHERE route = '/products'
GROUP BY 1
ORDER BY 1
```

- **Panel title** : `GET /products - Erreurs vs Succès`
- **Visualization** : Time series

#### Panel : Distribution des temps de réponse

```sql
SELECT
  duration_ms,
  COUNT(*) as count
FROM request_logs
WHERE route = '/products'
GROUP BY duration_ms
ORDER BY duration_ms
```

- **Panel title** : `GET /products - Distribution des temps`
- **Visualization** : Histogram

### Étape 4 : Sauvegarder le Dashboard

1. Cliquer sur l'icône **💾 Save** en haut à droite
2. Donner un nom : `Bookstore Performance Monitoring`
3. Cliquer sur **Save**

## Génération de données de test

Pour avoir des données à visualiser, utilisez l'application frontend pour charger la liste des produits plusieurs fois, ou utilisez un outil comme `curl` :

```bash
# Générer 50 requêtes
for i in {1..50}; do
  curl http://localhost:3000/products > /dev/null 2>&1
  sleep 0.5
done
```

Ou depuis le container backend :

```bash
docker exec -it bookstore-backend sh -c "for i in \$(seq 1 50); do wget -q -O /dev/null http://localhost:3000/products; sleep 0.5; done"
```

## Vérification des logs

Les logs Pino sont écrits dans `/backend/logs/app.log`. Pour les consulter :

```bash
docker exec -it bookstore-backend cat /app/logs/app.log
```

Ou en temps réel :

```bash
docker exec -it bookstore-backend tail -f /app/logs/app.log
```

## Vérification des données dans PostgreSQL

Pour vérifier que les logs sont bien insérés dans la table `request_logs` :

```bash
docker exec -it bookstore-postgres psql -U bookstore_user -d bookstore -c "SELECT * FROM request_logs ORDER BY created_at DESC LIMIT 10;"
```

## Dashboards recommandés

Pour une vue complète des performances, créez les panels suivants :

1. **Temps de réponse moyen par heure**
2. **P95 et P99 des temps de réponse**
3. **Taux d'erreur (%)**
4. **Nombre total de requêtes**
5. **Durée maximale observée**

## Alertes (optionnel)

Vous pouvez configurer des alertes Grafana pour être notifié quand :
- Le temps de réponse dépasse 2000ms
- Le taux d'erreur dépasse 5%
- Plus de 100 requêtes par minute

Consultez la [documentation Grafana](https://grafana.com/docs/grafana/latest/alerting/) pour plus de détails.

## Remarques

- Les logs sont stockés dans PostgreSQL et dans le fichier `backend/logs/app.log`
- Actuellement, seule la route `GET /products` est instrumentée
- Les mauvaises pratiques du code (connexions DB non poolées, `wasteTime()`, etc.) sont **volontaires** pour montrer l'impact sur les performances
- Ce setup est destiné à l'audit et à l'enseignement, pas à la production
