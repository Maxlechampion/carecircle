# ============================================
# Guide Configuration Base de Données - CareCircle
# ============================================

## OPTION 1: NEON (Recommandé - Gratuit)
## ==========================================

### Étapes:

1. **Créer un compte Neon**
   - Allez sur: https://neon.tech
   - Cliquez "Sign up" (connexion GitHub possible)
   - Confirmez votre email

2. **Créer un projet**
   - Cliquez "Create a project"
   - Nom: carecircle-db
   - Région: EU (Frankfurt) ou US selon votre audience
   - Cliquez "Create project"

3. **Récupérer la connexion**
   - Après création, copiez la "Connection string"
   - Format: postgresql://username:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require

4. **Ajouter dans Vercel**
   - Variable: DATABASE_URL
   - Valeur: votre chaîne de connexion copiée

### Avantages Neon:
- ✅ 0.5 GB gratuit
- ✅ Branching (branches de DB comme Git)
- ✅ Auto-scaling
- ✅ Point-in-time recovery
- ✅ Interface très simple

---

## OPTION 2: SUPABASE (Plus de fonctionnalités)
## ==========================================

### Étapes:

1. **Créer un compte Supabase**
   - Allez sur: https://supabase.com
   - Cliquez "Start your project"
   - Connectez-vous avec GitHub

2. **Créer un projet**
   - Organisation: votre compte
   - Nom: carecircle
   - Mot de passe DB: (générez un mot de passe fort, gardez-le!)
   - Région: West Europe (Ireland) pour France/Afrique
   - Cliquez "Create new project"

3. **Récupérer la connexion**
   - Allez dans Settings → Database
   - Trouvez "Connection string" → "URI"
   - Format: postgresql://postgres.[project-ref]:[password]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres

4. **Ajouter dans Vercel**
   - Variable: DATABASE_URL
   - Valeur: votre chaîne de connexion

### Avantages Supabase:
- ✅ 500 MB gratuit
- ✅ Authentification intégrée
- ✅ Storage pour fichiers
- ✅ Real-time subscriptions
- ✅ Edge Functions
- ✅ Tableau de bord complet

---

## OPTION 3: VERCEL POSTGRES (Intégré Vercel)
## ==========================================

### Étapes:

1. **Dans Vercel Dashboard**
   - Allez sur votre projet CareCircle
   - Cliquez "Storage" dans le menu
   - Cliquez "Create Database"
   - Sélectionnez "Postgres"

2. **Configuration**
   - Nom: carecircle-db
   - Région: Washington, D.C., USA (iad1) ou Paris si dispo
   - Cliquez "Create"

3. **Variables auto-ajoutées**
   - POSTGRES_URL
   - POSTGRES_PRISMA_URL
   - POSTGRES_URL_NON_POOLING
   - etc.

### Modifier schema.prisma pour Vercel:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}
```

### Avantages Vercel Postgres:
- ✅ Intégration native Vercel
- ✅ Variables auto-configurées
- ✅ Logs intégrés
- ✅ 256 MB gratuit (Hobby plan)

---

## COMPARAISON RAPIDE
## ==========================================

| Critère | Neon | Supabase | Vercel Postgres |
|---------|------|----------|-----------------|
| Stockage gratuit | 0.5 GB | 500 MB | 256 MB |
| Simplicité | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Fonctionnalités | Basique | Complet | Basique |
| Authentification | ❌ | ✅ | ❌ |
| Storage fichiers | ❌ | ✅ | ❌ |
| Région Europe | ✅ | ✅ | Limité |
| Pour production | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## APRÈS CONFIGURATION - Commandes à Exécuter
## ==========================================

Une fois la DB configurée, exécutez ces commandes localement ou dans Vercel:

```bash
# Générer le client Prisma
npx prisma generate

# Pousser le schéma vers la base
npx prisma db push

# (Optionnel) Voir les données
npx prisma studio
```

### Dans Vercel (Build Settings):

Ajoutez dans package.json scripts:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "db:push": "prisma db push"
  }
}
```

Ou ajoutez une commande dans Vercel Build:
```
prisma generate && prisma db push && next build
```

---

## DÉPLOIEMENT FINAL
## ==========================================

1. Configurez la DB (Neon/Supabase/Vercel)
2. Ajoutez DATABASE_URL dans Vercel Environment Variables
3. Ajoutez NEXTAUTH_SECRET (générez avec: openssl rand -base64 32)
4. Ajoutez NEXTAUTH_URL (votre URL Vercel)
5. Déployez!

Vercel détectera automatiquement Next.js et configurera le build.
