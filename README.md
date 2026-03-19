# CareCircle - Plateforme d'Aide aux Aidants Familiaux

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4-38bdf8" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

## 🌟 À propos

CareCircle est une plateforme de soutien intelligent pour les aidants familiaux, offrant :
- **Assistant IA Cleo** : Compagnon disponible 24h/24
- **Coordination des soins** : Calendrier, médicaments, rendez-vous
- **Suivi du bien-être** : Stress, sommeil, humeur
- **Communauté** : Échange entre aidants
- **Ressources** : Guides et formations

## 🚀 Déploiement sur Vercel

### Variables d'environnement requises

| Variable | Description | Obligatoire |
|----------|-------------|--------------|
| `DATABASE_URL` | URL de connexion PostgreSQL (Neon) | ✅ |
| `DIRECT_DATABASE_URL` | URL directe PostgreSQL (Neon) | ✅ |
| `NEXTAUTH_SECRET` | Secret pour les sessions | ✅ |
| `NEXTAUTH_URL` | URL de votre app Vercel | ✅ |

### Configuration de la base de données

1. Créez un compte sur [Neon](https://neon.tech)
2. Créez un nouveau projet
3. Copiez les URLs de connexion :
   - `DATABASE_URL` (avec pooling)
   - `DIRECT_DATABASE_URL` (sans pooling, pour migrations)

### Déploiement

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Maxlechampion/carecircle)

## 🛠️ Développement local

```bash
# Cloner le repository
git clone https://github.com/Maxlechampion/carecircle.git
cd carecircle

# Installer les dépendances
bun install

# Configurer l'environnement
cp .env.example .env.local

# Lancer le serveur de développement
bun run dev
```

## 📁 Structure du projet

```
carecircle/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts        # API Assistant IA
│   │   │   └── payments/            # API Paiements
│   │   └── page.tsx                 # Application principale
│   ├── components/
│   │   ├── ui/                      # Composants shadcn/ui
│   │   ├── auth-page.tsx            # Authentification
│   │   ├── testimonials-page.tsx    # Témoignages
│   │   └── pricing-page.tsx         # Tarification
│   └── lib/
│       ├── payment-config.ts        # Configuration paiements
│       └── stripe.ts                 # Intégration Stripe
├── prisma/
│   └── schema.prisma                # Schéma base de données
└── public/
```

## 💳 Paiements

CareCircle supporte les paiements dans 30+ pays :

### Europe
- Carte bancaire, Apple Pay, Google Pay (via Stripe)

### Afrique
- **Mobile Money** : Orange Money, MTN, Wave, M-Pesa, Airtel, Moov
- Carte bancaire (via Flutterwave)

## 🌍 Pays supportés

| Région | Pays |
|--------|------|
| Afrique de l'Ouest | Sénégal, Côte d'Ivoire, Mali, Burkina Faso, Bénin, Nigeria, Ghana |
| Afrique de l'Est | Kenya, Ouganda, Rwanda, Tanzanie |
| Afrique Centrale | Cameroun, RD Congo |
| Europe | France, Belgique, Suisse, Luxembourg |
| International | États-Unis, Canada |

## 📝 Variables d'environnement optionnelles

```env
# Stripe (Europe/International)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Flutterwave (Afrique)
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_live_xxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_live_xxx

# OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

## 📄 License

MIT License - voir [LICENSE](LICENSE)

---

<p align="center">
  Fait avec ❤️ pour les aidants familiaux
</p>
