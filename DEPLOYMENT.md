# 🚀 Guide de Déploiement CareCircle — Vercel + Neon PostgreSQL

## Prérequis
- Compte [Vercel](https://vercel.com)
- Compte [Neon](https://neon.tech) — PostgreSQL serverless
- Repo GitHub avec le code source
- Compte [Stripe](https://stripe.com) pour les paiements
- Projet Google Cloud pour OAuth (optionnel)

---

## 1 — Base de données Neon

1. Sur [console.neon.tech](https://console.neon.tech), créez un projet **CareCircle**
2. Région recommandée : **eu-central-1** (Frankfurt)
3. Copiez la Connection String :
   ```
   postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/carecircle?sslmode=require
   ```

---

## 2 — Variables d'environnement

Copiez `.env.example` en `.env.local` pour le développement local.

**Générer NEXTAUTH_SECRET :**
```bash
openssl rand -base64 32
```

---

## 3 — Migration de la base de données

```bash
npm install
npx prisma db push          # Crée les tables sur Neon
npx prisma db seed          # (Optionnel) Données de test
```

**Build Command pour Vercel :**
```
prisma generate && prisma db push && next build
```

---

## 4 — Google OAuth

1. [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID → Web application
3. Authorized redirect URIs :
   ```
   https://votre-app.vercel.app/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google
   ```

---

## 5 — Stripe

1. Récupérez la Secret Key sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. Créez 2 produits avec prix récurrents :
   - Premium : 9,99€/mois
   - Famille : 19,99€/mois
3. Webhook → `https://votre-app.vercel.app/api/stripe/webhook`
   - Events : `customer.subscription.*`, `checkout.session.completed`

---

## 6 — Déploiement Vercel

### Via Interface (recommandé)
1. [vercel.com/new](https://vercel.com/new) → Importez le repo GitHub
2. Build Command : `prisma generate && next build`
3. Install Command : `npm install`
4. Ajoutez toutes les variables d'environnement (voir tableau ci-dessous)
5. Deploy

### Via CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## 7 — Variables sur Vercel

| Variable | Description |
|---|---|
| `DATABASE_URL` | Connection string Neon |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://votre-app.vercel.app` |
| `NEXT_PUBLIC_BASE_URL` | `https://votre-app.vercel.app` |
| `GOOGLE_CLIENT_ID` | ID OAuth Google |
| `GOOGLE_CLIENT_SECRET` | Secret OAuth Google |
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `STRIPE_PREMIUM_PRICE_ID` | `price_...` (Premium 9.99€) |
| `STRIPE_FAMILY_PRICE_ID` | `price_...` (Famille 19.99€) |

---

## 8 — Comptes de test (après seed)

| Email | Mot de passe | Rôle |
|---|---|---|
| aidant@demo.fr | demo1234 | Aidant familial |
| medecin@demo.fr | demo1234 | Professionnel de santé |
| famille@demo.fr | demo1234 | Famille |

---

## Commandes utiles

```bash
npx prisma studio          # Interface graphique de la BD
npx prisma db push         # Synchroniser le schéma
npx prisma db seed         # Insérer des données de test
vercel logs --follow       # Voir les logs en temps réel
```
