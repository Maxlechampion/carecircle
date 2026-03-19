# CareCircle - Architecture Technique v2.0

## 📋 Vue d'ensemble

Cette architecture conçoit une plateforme complète avec:
- Authentification multi-providers
- Module Témoignages avec modération
- Paiements Mobile Money internationaux

---

## 🔐 SYSTÈME D'AUTHENTIFICATION

### Providers Supportés

#### 1. Authentification Classique
- **Email/Mot de passe** avec validation
- **Confirmation email** obligatoire
- **Réinitialisation mot de passe** par email/SMS

#### 2. OAuth Providers
- **Google** (OAuth 2.0)
- **Facebook** (OAuth 2.0)
- **Apple** (Sign in with Apple) - Important pour iOS

#### 3. Authentification Mobile
- **Téléphone/SMS** (OTP) - Crucial pour Afrique
- **WhatsApp Business API** - Alternative populaire

#### 4. Sécurité
- **2FA** (TOTP/SMS) - Optionnel mais recommandé
- **Sessions multiples** avec gestion
- **Détection d'anomalies** (nouveau device, localisation)

### Implémentation NextAuth.js

```
/providers
├── credentials.ts    # Email/Mot de passe
├── google.ts         # Google OAuth
├── facebook.ts       # Facebook OAuth
├── apple.ts          # Apple Sign In
└── phone.ts          # SMS OTP
```

---

## 💬 MODULE TÉMOIGNAGES

### Fonctionnalités

#### Pour les Utilisateurs
- Soumettre un témoignage (texte + photo optionnelle)
- Catégoriser par type d'aidance
- Noter l'application (1-5 étoiles)
- Partager sur réseaux sociaux
- Voir témoignages approuvés

#### Pour les Admins
- Modération (approuver/rejeter)
- Édition avant publication
- Statistiques de témoignages
- Export pour marketing

### Structure de Données

```typescript
interface Testimonial {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  userLocation: string       // Pays/Ville
  relationshipType: string   // "Père", "Mère", "Conjoint"...
  careDuration: string       // "2 ans", "6 mois"...
  rating: number             // 1-5 étoiles
  title: string
  content: string
  photoUrl?: string
  isAnonymous: boolean
  status: 'pending' | 'approved' | 'rejected'
  featured: boolean          // Mis en avant
  helpful: number            // Nombre de "Utile"
  createdAt: Date
  approvedAt?: Date
  language: string           // 'fr', 'en', 'ar'...
}
```

### Workflow de Modération

```
Utilisateur → Soumission → Status: pending
                              ↓
                    Admin Dashboard
                    /            \
              Approuver        Rejeter
                 ↓                ↓
          Status: approved   Status: rejected
          (visible)          (non visible)
```

---

## 💳 PAIEMENTS MOBILE MONEY MULTI-PAYS

### Stratégie Multi-Fournisseurs

#### 1. Fournisseur Principal: Flutterwave
- Couverture: 40+ pays africains
- Mobile Money: MTN, Orange, Wave, Moov, Airtel, M-Pesa
- Cartes bancaires: Visa, Mastercard
- Virements bancaires

#### 2. Fournisseur Secondaire: Paystack
- Focus: Nigeria, Ghana, Afrique du Sud
- Intégration facile
- Frais compétitifs

#### 3. Fournisseur International: Stripe
- Europe, Amérique, Asie
- Cartes bancaires
- Apple Pay, Google Pay

### Détection Géographique

```typescript
interface PaymentConfig {
  countryCode: string
  currency: string
  methods: PaymentMethod[]
  provider: 'flutterwave' | 'paystack' | 'stripe'
}

const COUNTRY_CONFIG: Record<string, PaymentConfig> = {
  // Afrique de l'Ouest
  'SN': { // Sénégal
    countryCode: 'SN',
    currency: 'XOF',
    methods: ['orange_money', 'wave', 'free_money', 'card'],
    provider: 'flutterwave'
  },
  'CI': { // Côte d'Ivoire
    countryCode: 'CI',
    currency: 'XOF',
    methods: ['orange_money', 'mtn_money', 'moov_money', 'wave', 'card'],
    provider: 'flutterwave'
  },
  'NG': { // Nigeria
    countryCode: 'NG',
    currency: 'NGN',
    methods: ['card', 'bank_transfer', 'ussd', 'mobile_money'],
    provider: 'paystack'
  },
  // Afrique de l'Est
  'KE': { // Kenya
    countryCode: 'KE',
    currency: 'KES',
    methods: ['mpesa', 'card', 'bank_transfer'],
    provider: 'flutterwave'
  },
  // Europe
  'FR': { // France
    countryCode: 'FR',
    currency: 'EUR',
    methods: ['card', 'apple_pay', 'google_pay', 'sepa'],
    provider: 'stripe'
  },
  // ... autres pays
}
```

### Structure des Prix par Région

| Plan | Europe (EUR) | Afrique Ouest (XOF) | Afrique Est (KES) | Nigeria (NGN) |
|------|--------------|---------------------|-------------------|---------------|
| Gratuit | 0€ | 0 FCFA | 0 KES | 0 ₦ |
| Premium | 9.99€/mois | 6 500 FCFA/mois | 1 200 KES/mois | 4 500 ₦/mois |
| Famille | 19.99€/mois | 13 000 FCFA/mois | 2 500 KES/mois | 9 000 ₦/mois |

### Implémentation API

```
/api/payments/
├── flutterwave/
│   ├── route.ts           # Initier paiement
│   ├── verify/route.ts    # Vérifier statut
│   └── webhook/route.ts   # Webhooks
├── paystack/
│   ├── route.ts
│   ├── verify/route.ts
│   └── webhook/route.ts
├── stripe/
│   └── ... (existant)
└── config/route.ts        # Config par pays
```

---

## 🗄️ MODÈLES DE BASE DE DONNÉES

### Nouveaux Modèles Prisma

```prisma
// Utilisateur étendu
model User {
  // ... existant
  phone          String?
  phoneVerified  DateTime?
  emailVerified  DateTime?
  twoFactorEnabled Boolean @default(false)
  twoFactorSecret String?
  authProvider    String   @default("credentials")
  country         String?
  currency        String   @default("EUR")
  
  testimonials    Testimonial[]
  payments        Payment[]
  sessions        Session[]
}

// Session utilisateur
model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  token        String   @unique
  deviceInfo   String?
  ipAddress    String?
  lastActive   DateTime @default(now())
  expiresAt    DateTime
  createdAt    DateTime @default(now())
}

// Témoignage
model Testimonial {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  userName        String
  userAvatar      String?
  userLocation    String
  relationshipType String
  careDuration    String
  rating          Int      // 1-5
  title           String
  content         String   @db.Text
  photoUrl        String?
  isAnonymous     Boolean  @default(false)
  status          String   @default("pending") // pending, approved, rejected
  featured        Boolean  @default(false)
  helpful         Int      @default(0)
  language        String   @default("fr")
  createdAt       DateTime @default(now())
  approvedAt      DateTime?
  
  @@index([status])
  @@index([featured])
}

// Paiement
model Payment {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  amount          Float
  currency        String
  planId          String
  provider        String   // flutterwave, paystack, stripe
  providerRef     String?  @unique
  status          String   @default("pending") // pending, completed, failed, refunded
  paymentMethod   String?  // orange_money, mpesa, card...
  metadata        String?  // JSON
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([userId])
  @@index([status])
}
```

---

## 🎨 INTERFACE UTILISATEUR

### Pages à Créer

1. **Authentification**
   - `/auth/login` - Connexion
   - `/auth/register` - Inscription
   - `/auth/forgot-password` - Mot de passe oublié
   - `/auth/verify-phone` - Vérification téléphone

2. **Témoignages**
   - `/testimonials` - Liste publique
   - `/testimonials/submit` - Soumettre
   - `/testimonials/success` - Confirmation

3. **Paiements**
   - `/pricing` - Tarifs avec détection pays
   - `/checkout/[planId]` - Page de paiement
   - `/payment/success` - Confirmation
   - `/payment/failed` - Échec

4. **Admin** (optionnel pour v1)
   - `/admin/testimonials` - Modération
   - `/admin/payments` - Historique

---

## 🔒 SÉCURITÉ

### Mesures Implémentées

1. **Authentification**
   - Mots de passe hashés (bcrypt)
   - Tokens JWT sécurisés
   - Rate limiting sur les tentatives
   - CAPTCHA sur inscription

2. **Paiements**
   - Webhooks signés
   - Idempotency keys
   - Logs d'audit
   - Conformité PCI DSS (via providers)

3. **Données**
   - Chiffrement en transit (HTTPS)
   - Chiffrement au repos (base)
   - RGPD compliant
   - Export/suppression données

---

## 📊 DIAGRAMME DE FLUX

```
┌─────────────────────────────────────────────────────────────────┐
│                     INSCRIPTION / CONNEXION                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐     │
│  │  Email   │   │  Google  │   │ Facebook │   │  SMS OTP │     │
│  │  + MDP   │   │  OAuth   │   │  OAuth   │   │          │     │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘     │
│       │              │              │              │            │
│       └──────────────┴──────────────┴──────────────┘            │
│                              │                                   │
│                    ┌─────────▼─────────┐                        │
│                    │   NextAuth.js     │                        │
│                    │   Session JWT     │                        │
│                    └─────────┬─────────┘                        │
│                              │                                   │
│                    ┌─────────▼─────────┐                        │
│                    │   Dashboard        │                        │
│                    │   Application      │                        │
│                    └───────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        PAIEMENT MULTI-PAYS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User ──► Détection Pays ──► Affichage Méthodes                  │
│                                   │                              │
│                    ┌──────────────┴──────────────┐              │
│                    │                             │               │
│            ┌───────▼───────┐           ┌────────▼────────┐     │
│            │  Flutterwave  │           │     Stripe      │     │
│            │  (Afrique)    │           │   (Europe/US)   │     │
│            └───────┬───────┘           └────────┬────────┘     │
│                    │                             │               │
│            ┌───────▼───────┐           ┌────────▼────────┐     │
│            │  Mobile Money │           │    Cartes       │     │
│            │  Orange/MTN/  │           │  Apple/Google   │     │
│            │  Wave/M-Pesa  │           │     Pay         │     │
│            └───────────────┘           └─────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 ORDRE D'IMPLÉMENTATION

1. ✅ Architecture et planification
2. 🔄 Schéma base de données (Prisma)
3. 🔄 Authentification (NextAuth)
4. 🔄 Module Témoignages
5. 🔄 Intégration Flutterwave (Mobile Money)
6. 🔄 Page pricing dynamique
7. 🔄 Tests et validation
