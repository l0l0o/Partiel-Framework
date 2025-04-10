# Plateforme de Location de Véhicules Électriques

Cette application web moderne permet aux utilisateurs de trouver, réserver et utiliser des véhicules électriques disponibles à proximité. Construite avec Next.js, Prisma, MapBox et Tailwind CSS, elle offre une expérience utilisateur fluide et réactive.

## 📋 Fonctionnalités

- **Cartographie interactive** : Visualisation en temps réel des véhicules disponibles
- **Recherche géolocalisée** : Trouvez des véhicules autour de votre position actuelle
- **Itinéraires personnalisés** : Calcul d'itinéraires avec estimation de temps et distance
- **Regroupement intelligent** : Clusters interactifs pour une meilleure visibilité des zones denses
- **Sélection intuitive** : Interface visuelle pour choisir votre véhicule préféré
- **Option sans péage** : Possibilité d'éviter les routes à péage
- **Responsive design** : Adapté à tous les appareils (desktop, tablette, mobile)

## 🚀 Démarrage

### Prérequis

- Node.js (v16+)
- NPM ou Yarn
- Une clé API MapBox (gratuite pour les usages limités)
- Une base de données PostgreSQL (ou SQLite pour le développement)

### Installation

1. Clonez le dépôt

   ```bash
   git clone https://github.com/votre-nom/nom-du-projet.git
   cd nom-du-projet
   ```

2. Installez les dépendances

   ```bash
   npm install
   # ou
   yarn install
   ```

3. Configurez les variables d'environnement

   - Créez un fichier `.env.local` à la racine du projet
   - Ajoutez les variables requises (voir `.env.example`)

4. Préparez la base de données

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. Chargez les données de test

   ```bash
   npx ts-node --esm prisma/seed.ts
   ```

6. Lancez le serveur de développement

   ```bash
   npm run dev
   # ou
   yarn dev
   ```

7. Accédez à l'application à l'adresse [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env.local` avec les variables suivantes :

```
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="votre_clé_api_mapbox"
```

### Prisma

Le schéma de base de données est défini dans `prisma/schema.prisma`. Pour mettre à jour votre base de données après modification du schéma:

```bash
npx prisma migrate dev
```

## 📱 Utilisation

1. **Page d'accueil** : Visualisation de la carte avec les véhicules disponibles
2. **Recherche** : Entrez une adresse de départ et de destination
3. **Sélection de véhicule** : Cliquez sur un véhicule pour le sélectionner
4. **Itinéraire** : Obtenez automatiquement le meilleur itinéraire
5. **Options** : Configurez votre trajet (évitement des péages, etc.)

## 🏗️ Structure du projet

```
├── public/                # Fichiers statiques
├── prisma/                # Configuration de la base de données
│   ├── schema.prisma      # Schéma de la base de données
│   └── seed.ts            # Script de peuplement
├── src/
│   ├── app/               # Routes de l'application (Next.js App Router)
│   │   ├── api/           # Routes API
│   │   └── ...            # Pages de l'application
│   ├── components/        # Composants React
│   │   ├── app/           # Composants spécifiques à l'application
│   │   │   ├── map/       # Composants liés à la carte
│   │   │   └── ...        # Autres composants
│   │   └── ui/            # Composants UI réutilisables
│   ├── lib/               # Utilitaires et fonctions
│   ├── providers/         # Providers React (Context API)
│   └── styles/            # Styles globaux
└── ...
```

## 🧪 Tests

Pour exécuter les tests:

```bash
npm test
# ou
yarn test
```

## 🔄 CI/CD

Ce projet utilise GitHub Actions pour:

- Vérifier le formatage du code
- Exécuter les tests
- Construire l'application
- Déployer sur l'environnement approprié

## 🧩 Technologies utilisées

- **Frontend**:

  - [Next.js](https://nextjs.org/) - Framework React avec rendu côté serveur
  - [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitaire
  - [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) - Bibliothèque de cartographie interactive

- **Backend**:
  - [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) - API serverless
  - [Prisma](https://www.prisma.io/) - ORM pour TypeScript
  - [PostgreSQL](https://www.postgresql.org/) - Base de données relationnelle

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

1. Forkez le projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

```bash
# mount containers
docker-compose up -d
# install dependencies
npm install
# push db
npx prisma db push
# seed database
npx ts-node --esm prisma/seed.ts
# start app
npm run dev
```
