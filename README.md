# microservices de formation

Le projet comprend deux API Node.js indépendantes, conformément au sujet :

- `course-service` gère les formations dans MongoDB (`course_db`) sur le port `5001`.
- `enrollment-service` récupère les formations par HTTP avec Axios, calcule le total et stocke les inscriptions dans MongoDB (`enrollment_db`) sur le port `5002`.

Le dossier de remise est nommé `M214_Elhabchi_Mohammed`, selon le modèle demandé dans le sujet.

## Prérequis

- Node.js et npm
- MongoDB démarré localement (par défaut `mongodb://127.0.0.1:27017`)
- Une clé JWT connue pour signer et vérifier les tokens

## Configuration et lancement

Dans deux terminaux, depuis le dossier du projet :

```powershell
Copy-Item course-service\.env.example course-service\.env
Copy-Item enrollment-service\.env.example enrollment-service\.env
```

Définir la même valeur `JWT_SECRET` que celle utilisée pour créer le token dans `course-service\.env`. Les valeurs MongoDB et l’URL du service formations sont configurables dans chaque fichier `.env`.

Terminal 1 :

```powershell
cd course-service
npm install
npm start
```

Terminal 2 :

```powershell
cd enrollment-service
npm install
npm start
```

Le serveur attend une connexion MongoDB avant d'écouter son port. Les erreurs de configuration ou de connexion sont affichées et empêchent le démarrage silencieux d'un service incomplet.

## Créer un token de démonstration

Dans le terminal du service formations, après avoir renseigné `.env` :

```powershell
$env:JWT_SECRET = "la-cle-configuree-dans-course-service-env"
node -e "console.log(require('jsonwebtoken').sign({ id: 'test' }, process.env.JWT_SECRET, { expiresIn: '2h' }))"
```

Envoyer le token dans l'en-tête `Authorization: Bearer <token>`. Le secret n'est pas stocké dans le dépôt.

## API

| Service | Méthode | Route | Réponse |
|---|---|---|---|
| Formations | `GET` | `/courses` | `200`, liste des formations |
| Formations | `GET` | `/courses/:id` | `200`, formation ; `404` si absente |
| Formations | `POST` | `/courses` | `201`, formation créée ; `400` si données invalides ; `401` sans token valide |
| Inscriptions | `POST` | `/enrollments` | `201`, inscription calculée et créée ; `400` si données invalides ; `404` si une formation est absente ; `503` si le service formations est indisponible |

Exemple de création d'une formation (avec le token généré) :

```json
{
  "title": "Node.js et microservices",
  "price": 250,
  "hours": 20
}
```

Exemple de demande d'inscription :

```json
{
  "userId": "test",
  "courses": ["ID_MONGODB_DE_LA_FORMATION"]
}
```

Le champ `courses` contient des identifiants MongoDB (24 caractères hexadécimaux). Le champ `total` est calculé par le service et n'est pas fourni par le client.

## Vérifications de démonstration

1. `GET http://localhost:5001/courses` doit répondre `200`.
2. `POST http://localhost:5001/courses` sans en-tête Authorization doit répondre `401`.
3. Créer une formation avec un token, copier son `_id`, puis envoyer un `POST http://localhost:5002/enrollments` avec cet identifiant : réponse `201` et `total` égal au prix de la formation.
4. Arrêter `course-service` et répéter la demande d'inscription : réponse `503` avec un message explicite.

Les réponses aux questions de compréhension et le compte rendu détaillé sont dans [rapport.md](./rapport.md) et [rapport illustré en PDF](./rapport-postman.pdf).

## Collection Postman

Importer la [collection Postman](./postman/M214_API.postman_collection.json) et l'[environnement local](./postman/M214_Local.postman_environment.json). Après avoir démarré les deux services, renseigner la variable secrète `token` de l'environnement avec un JWT signé par la clé `JWT_SECRET`, puis lancer le dossier **Tests avec les services démarrés**. Il vérifie `200`, `401`, `201` (création de formation et inscription avec total `250`), `404` et `400`.

Le dossier **Test 503 séparé** est à exécuter uniquement lorsque `course-service` est arrêté et `enrollment-service` reste actif. Redémarrer le service formations après le test. Ne pas enregistrer ni exporter un jeton réel dans les fichiers du projet.

## Démonstration visuelle

Ces illustrations montrent les routes, exemples de JSON et statuts HTTP. Ce sont des maquettes avec des données fictives ; le projet livré est composé d'API, sans interface web.

- [Liste des formations — GET /courses](./demo-images/01-formations.png)
- [Création d'inscription — POST /enrollments](./demo-images/02-inscriptions.png)
- [Erreurs HTTP — 401, 404 et 503](./demo-images/03-erreurs-http.png)
- [Postman — GET /courses (200 OK)](./demo-images/postman-01-get-courses.png)
- [Postman — POST /courses (401 Unauthorized)](./demo-images/postman-02-post-course-401.png)
- [Postman — POST /enrollments (201 Created, total 250)](./demo-images/postman-03-post-enrollment-201.png)
- [Postman — formation absente (404 Not Found)](./demo-images/postman-04-enrollment-404.png)
- [Postman — données invalides (400 Bad Request)](./demo-images/postman-05-enrollment-400.png)
- [Postman — service formations indisponible (503)](./demo-images/postman-06-enrollment-503.png)
