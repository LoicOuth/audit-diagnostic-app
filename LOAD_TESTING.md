# Tests de Charge avec Autocannon

Ce guide explique comment utiliser **Autocannon** pour effectuer des tests de charge sur l'API Bookstore et analyser les résultats dans Grafana.

## Qu'est-ce qu'Autocannon ?

[Autocannon](https://github.com/mcollina/autocannon) est un outil de benchmarking HTTP écrit en Node.js, conçu pour tester les performances d'un serveur web en générant une charge importante de requêtes HTTP.

**Pourquoi Autocannon ?**
- ⚡ Très rapide (écrit en Node.js natif)
- 📊 Statistiques détaillées (latence, throughput, erreurs)
- 🎯 Facile à utiliser
- 🔧 Configurable (connexions concurrentes, durée, pipelining)

## Installation

Autocannon est déjà installé dans le projet (`package.json`). Vous pouvez l'utiliser via `npx` sans installation globale.

## Utilisation de base

### Syntaxe générale

```bash
npx autocannon [options] <url>
```

### Options principales

| Option | Description | Exemple |
|--------|-------------|---------|
| `-c` | **Connections** : Nombre de connexions concurrentes | `-c 100` |
| `-d` | **Duration** : Durée du test en secondes | `-d 30` |
| `-p` | **Pipelining** : Nombre de requêtes pipelinées par connexion | `-p 10` |
| `-w` | **Workers** : Nombre de workers (threads) | `-w 4` |
| `-m` | **Method** : Méthode HTTP (GET, POST, etc.) | `-m POST` |
| `-H` | **Header** : Ajouter un header HTTP | `-H "Authorization: token123"` |
| `-b` | **Body** : Corps de la requête (pour POST/PUT) | `-b '{"key":"value"}'` |
| `--json` | Sortie en format JSON | `--json` |

## Exemples de tests pour Bookstore

### 1. Test léger (démarrage)

```bash
npx autocannon -c 10 -d 5 http://localhost:3000/products
```

**Ce que ça fait :**
- 10 connexions simultanées
- Pendant 5 secondes
- Requêtes GET sur `/products`

**Utilité :** Vérifier que tout fonctionne, obtenir une baseline de performance.

---

### 2. Test modéré (charge normale)

```bash
npx autocannon -c 50 -d 10 http://localhost:3000/products
```

**Ce que ça fait :**
- 50 connexions simultanées
- Pendant 10 secondes
- ~500-1000 requêtes générées

**Utilité :** Simuler un trafic moyen, observer les premiers signes de dégradation.

---

### 3. Test intensif (stress test)

```bash
npx autocannon -c 100 -d 30 http://localhost:3000/products
```

**Ce que ça fait :**
- 100 connexions simultanées
- Pendant 30 secondes
- ~3000-10000 requêtes générées

**Utilité :** Mettre en évidence les mauvaises pratiques (connexions DB non poolées, `wasteTime()`, etc.).

---

### 4. Test extrême (saturation)

```bash
npx autocannon -c 200 -d 60 -p 10 http://localhost:3000/products
```

**Ce que ça fait :**
- 200 connexions simultanées
- Pipelining de 10 requêtes par connexion
- Pendant 60 secondes
- Peut générer 50k+ requêtes

**Utilité :** Voir le serveur s'effondrer, générer beaucoup de données pour Grafana.

---

### 5. Test avec POST (ajout au panier)

```bash
npx autocannon \
  -c 20 \
  -d 10 \
  -m POST \
  -H "Content-Type: application/json" \
  -H "Authorization: user@test.com|1234567890" \
  -b '{"productId": 1, "quantity": 1}' \
  http://localhost:3000/cart/add
```

**Ce que ça fait :**
- Test de la route POST `/cart/add`
- Avec authentification
- Body JSON pour ajouter un produit

---

### 6. Test avec sortie JSON (pour automatisation)

```bash
npx autocannon -c 100 -d 10 --json http://localhost:3000/products > results.json
```

**Ce que ça fait :**
- Sauvegarde les résultats au format JSON
- Utile pour comparer plusieurs tests ou automatiser

---

## Depuis le container Docker

Si vous voulez tester depuis l'intérieur du container backend :

```bash
# Entrer dans le container
docker exec -it bookstore-backend sh

# Lancer autocannon
npx autocannon -c 50 -d 10 http://localhost:3000/products
```

Ou en une ligne :

```bash
docker exec -it bookstore-backend npx autocannon -c 50 -d 10 http://localhost:3000/products
```

---

## Interprétation des résultats

Voici un exemple de sortie d'Autocannon :

```
Running 10s test @ http://localhost:3000/products
100 connections

┌─────────┬──────┬──────┬───────┬──────┬─────────┬─────────┬────────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%  │ Avg     │ Stdev   │ Max    │
├─────────┼──────┼──────┼───────┼──────┼─────────┼─────────┼────────┤
│ Latency │ 5 ms │ 8 ms │ 50 ms │ 80 ms│ 12.3 ms │ 15.2 ms │ 120 ms │
└─────────┴──────┴──────┴───────┴──────┴─────────┴─────────┴────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg     │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Req/Sec   │ 500     │ 500     │ 800     │ 900     │ 750     │ 120     │ 500     │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Bytes/Sec │ 2.5 MB  │ 2.5 MB  │ 4 MB    │ 4.5 MB  │ 3.75 MB │ 600 kB  │ 2.5 MB  │
└───────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 10

7.5k requests in 10.02s, 37.5 MB read
```

### Métriques clés

#### 1. **Latency (Latence)**
- **50% (Median)** : Temps de réponse pour 50% des requêtes
  - ✅ **Bon** : < 100ms
  - ⚠️ **Moyen** : 100-500ms
  - ❌ **Mauvais** : > 500ms

- **97.5% (P97.5)** : 97.5% des requêtes sont plus rapides que cette valeur
  - Important pour détecter les pics de latence

- **99% (P99)** : Le "pire cas" pour la plupart des utilisateurs
  - Si cette valeur est élevée, certains utilisateurs ont une mauvaise expérience

- **Max** : Pire temps de réponse observé

#### 2. **Req/Sec (Requêtes par seconde)**
- **Throughput** : Nombre de requêtes traitées par seconde
  - Plus c'est élevé, mieux c'est
  - Permet de comparer les performances avant/après optimisation

#### 3. **Bytes/Sec**
- Bande passante utilisée
- Utile pour détecter les réponses trop volumineuses

#### 4. **Errors**
Si présent, indique le nombre d'erreurs HTTP (timeouts, 500, etc.)

---

## Impact des mauvaises pratiques sur les performances

### Ce que vous allez observer avec Bookstore :

#### 1. **Connexions DB non poolées**
```javascript
// Actuel (MAUVAIS)
const client = getDbConnection(); // Nouvelle connexion à chaque requête
client.connect();
```

**Impact observable :**
- ⬆️ Latence augmente avec la charge
- ⬆️ P99 explose (timeouts de connexion)
- ⬇️ Req/Sec plafonne rapidement
- 💥 Erreurs "too many connections" si > 100 connexions

**Avec un pool (CORRECTION) :**
```javascript
// Avec pool de connexions
pool.query('SELECT * FROM products', ...)
```
- ✅ Latence stable même sous charge
- ✅ 10x plus de Req/Sec

---

#### 2. **Fonction `wasteTime()`**
```javascript
function wasteTime() {
  var result = 0;
  for (var i = 0; i < 10000000; i++) {
    result += Math.sqrt(i);
  }
  return result;
}
```

**Impact observable :**
- ⬆️ Latence augmentée d'environ 50-100ms par requête
- ⬇️ Throughput divisé par 2
- ❌ CPU à 100%

**Test pour le prouver :**
```bash
# Avec wasteTime()
npx autocannon -c 50 -d 10 http://localhost:3000/products
# Résultat : ~500 req/sec

# Commentez wasteTime() dans server.js et relancez
# Résultat : ~1000+ req/sec
```

---

#### 3. **`setTimeout(500)` artificiel**
```javascript
setTimeout(() => {
  res.json(result.rows);
}, 500);
```

**Impact observable :**
- ⬆️ Latence minimale de 500ms
- ⬇️ Max 2 requêtes/sec par connexion
- 📊 Courbe de latence avec un plancher à 500ms

---

## Scénarios de test recommandés

### Scénario 1 : Établir une baseline

```bash
# Test initial
npx autocannon -c 10 -d 10 http://localhost:3000/products > baseline.txt

# Regarder Grafana pour voir les temps de réponse normaux
```

### Scénario 2 : Test de montée en charge progressive

```bash
# 10 connexions
npx autocannon -c 10 -d 10 http://localhost:3000/products

# 50 connexions
npx autocannon -c 50 -d 10 http://localhost:3000/products

# 100 connexions
npx autocannon -c 100 -d 10 http://localhost:3000/products

# 200 connexions (point de rupture ?)
npx autocannon -c 200 -d 10 http://localhost:3000/products
```

**Observer dans Grafana :**
- À quel moment les temps explosent ?
- Combien de connexions avant les erreurs ?

### Scénario 3 : Test d'endurance

```bash
# Charge modérée pendant 5 minutes
npx autocannon -c 50 -d 300 http://localhost:3000/products
```

**Observer :**
- Fuites mémoire ?
- Dégradation progressive ?
- Connexions DB qui s'accumulent ?

### Scénario 4 : Test de toutes les routes

```bash
# Route produits
npx autocannon -c 50 -d 10 http://localhost:3000/products

# Route produit par ID
npx autocannon -c 50 -d 10 http://localhost:3000/products/1

# Route debug (exposition de données sensibles)
npx autocannon -c 50 -d 10 http://localhost:3000/debug
```

---

## Automatisation avec scripts

Créez un fichier `load-test.sh` :

```bash
#!/bin/bash

echo "=== Bookstore Load Testing ==="
echo ""

echo "Test 1/4: Light load (10 connections)"
npx autocannon -c 10 -d 5 http://localhost:3000/products

echo ""
echo "Test 2/4: Moderate load (50 connections)"
npx autocannon -c 50 -d 10 http://localhost:3000/products

echo ""
echo "Test 3/4: Heavy load (100 connections)"
npx autocannon -c 100 -d 10 http://localhost:3000/products

echo ""
echo "Test 4/4: Extreme load (200 connections)"
npx autocannon -c 200 -d 10 http://localhost:3000/products

echo ""
echo "=== Tests terminés ==="
echo "Consultez Grafana sur http://localhost:3001"
```

Exécuter :
```bash
chmod +x load-test.sh
./load-test.sh
```

---

## Visualisation dans Grafana

Après avoir lancé un test Autocannon, allez dans Grafana pour voir :

1. **Graphique des temps de réponse** : Courbe qui monte pendant le test
2. **Nombre de requêtes** : Pic visible au moment du test
3. **Taux d'erreur** : Augmentation si le serveur sature
4. **Distribution des temps** : Histogramme montrant la variabilité

### Requête SQL utile pour analyser un test

```sql
-- Statistiques d'un test récent
SELECT
  COUNT(*) as total_requests,
  AVG(duration_ms) as avg_duration,
  MIN(duration_ms) as min_duration,
  MAX(duration_ms) as max_duration,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) as p50,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms) as p99,
  SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) as errors
FROM request_logs
WHERE created_at > NOW() - INTERVAL '5 minutes'
  AND route = '/products';
```

---

## Bonnes pratiques

### ✅ DO

- Commencer par des tests légers avant d'augmenter la charge
- Laisser le serveur "refroidir" entre 2 tests (30s-1min)
- Surveiller les ressources système (CPU, RAM, connexions DB)
- Comparer les résultats avant/après optimisation
- Documenter les résultats

### ❌ DON'T

- Ne pas tester en production (sauf load testing planifié)
- Ne pas lancer plusieurs tests simultanément
- Ne pas ignorer les erreurs dans les résultats
- Ne pas tirer de conclusions sur un seul test (faire 3-5 runs)

---

## Commandes utiles

### Vérifier l'état de la base de données pendant un test

```bash
# Nombre de connexions actives
docker exec -it bookstore-postgres psql -U bookstore_user -d bookstore -c "SELECT count(*) FROM pg_stat_activity;"

# Connexions par état
docker exec -it bookstore-postgres psql -U bookstore_user -d bookstore -c "SELECT state, count(*) FROM pg_stat_activity GROUP BY state;"
```

### Vérifier les logs en temps réel

```bash
# Logs Pino
docker exec -it bookstore-backend tail -f /app/logs/app.log

# Logs du container
docker logs -f bookstore-backend
```

### Nettoyer les logs de test

```sql
-- Supprimer les logs de test
DELETE FROM request_logs WHERE created_at < NOW() - INTERVAL '1 hour';
```

---

## Ressources

- [Documentation Autocannon](https://github.com/mcollina/autocannon)
- [GRAFANA_SETUP.md](./GRAFANA_SETUP.md) - Configuration Grafana
- [Benchmarking Node.js Applications](https://nodejs.org/en/docs/guides/simple-profiling/)

---

## Résumé des commandes principales

```bash
# Test rapide
npx autocannon -c 50 -d 10 http://localhost:3000/products

# Test intensif
npx autocannon -c 100 -d 30 http://localhost:3000/products

# Depuis Docker
docker exec -it bookstore-backend npx autocannon -c 50 -d 10 http://localhost:3000/products

# Avec sortie JSON
npx autocannon -c 100 -d 10 --json http://localhost:3000/products > results.json
```

**Maintenant, cassez votre serveur ! 💥** (C'est le but, pour apprendre à diagnostiquer 😉)
