# 💳 Guide Complet : Configuration des Paiements Stripe

## 📋 Résumé de l'Intégration

J'ai intégré un système de paiement complet avec **Stripe** pour CareCircle.

---

## 🏆 Pourquoi Stripe ?

| Critère | Stripe |
|---------|--------|
| **Commission cartes FR** | 1.75% + 0.25€ |
| **Commission cartes UE** | 2.9% + 0.25€ |
| **Abonnements** | ✅ Natif |
| **Sécurité** | ⭐⭐⭐⭐⭐ (PCI-DSS Niveau 1) |
| **Essai gratuit** | ✅ 14 jours inclus |
| **Webhooks** | ✅ Fiables |
| **Portal client** | ✅ Inclus |
| **Support FR** | ✅ Oui |

---

## 📁 Fichiers Créés

```
src/
├── lib/
│   ├── stripe.ts                    # Configuration Stripe
│   ├── subscription-context.tsx     # Contexte abonnement
│   └── pricing-components.tsx       # Composants UI pricing
│
├── app/api/stripe/
│   ├── checkout/route.ts            # Créer session de paiement
│   ├── webhook/route.ts             # Webhooks Stripe
│   ├── portal/route.ts              # Portal client
│   └── subscription/route.ts        # Gestion abonnement
│
└── .env.example                     # Variables d'environnement
```

---

## 🚀 Configuration en 5 Étapes

### Étape 1 : Créer un compte Stripe

1. Allez sur [stripe.com](https://stripe.com)
2. Cliquez sur **"Start now"**
3. Remplissez les informations :
   - Email
   - Nom
   - Mot de passe
4. Validez votre email

---

### Étape 2 : Obtenir les Clés API

1. Connectez-vous à [dashboard.stripe.com](https://dashboard.stripe.com)
2. Allez dans **Developers** → **API keys**
3. Copiez :
   - **Publishable key** (commence par `pk_test_`)
   - **Secret key** (commence par `sk_test_`)

4. Ajoutez dans `.env` :
```env
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique
```

---

### Étape 3 : Créer les Produits et Prix

1. Allez dans **Products** → **Add product**

#### Produit 1 : Premium
```
Name: CareCircle Premium
Description: Pour les aidants au quotidien
Price: 9.99 €
Billing: Recurring - Monthly
```

#### Produit 2 : Famille
```
Name: CareCircle Famille
Description: Pour partager l'aidance en famille
Price: 19.99 €
Billing: Recurring - Monthly
```

2. Copiez les **Price IDs** (commencent par `price_`)
3. Ajoutez dans `.env` :
```env
STRIPE_PREMIUM_PRICE_ID=price_xxxxxxxxxxxx
STRIPE_FAMILY_PRICE_ID=price_xxxxxxxxxxxx
```

---

### Étape 4 : Configurer les Webhooks

1. Allez dans **Developers** → **Webhooks**
2. Cliquez sur **Add endpoint**
3. URL : `https://votre-domaine.com/api/stripe/webhook`
4. Sélectionnez les événements :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`

5. Copiez le **Signing secret** (commence par `whsec_`)
6. Ajoutez dans `.env` :
```env
STRIPE_WEBHOOK_SECRET=whsec_votre_secret
```

---

### Étape 5 : Tester en Local

1. Installez Stripe CLI :
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
sudo tar -xvf stripe_1.19.4_linux_x86_64.tar.gz -C /usr/local/bin
```

2. Connectez-vous :
```bash
stripe login
```

3. Lancez le tunnel webhook :
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. Démarrez l'app :
```bash
bun run dev
```

---

## 💳 Plans de Tarification

| Plan | Prix | Features |
|------|------|----------|
| **Gratuit** | 0€ | IA limitée (10 msg/jour), 1 personne aidée |
| **Premium** | 9.99€/mois | IA illimitée, 5 personnes, export PDF |
| **Famille** | 19.99€/mois | Tout Premium + 5 comptes famille, hotline 24/7 |

---

## 🔐 Sécurité

### Ce qui est inclus :

- ✅ **PCI-DSS Niveau 1** : Conforme aux standards bancaires
- ✅ **HTTPS obligatoire** : Toutes les communications chiffrées
- ✅ **Tokenisation** : Les données de carte ne touchent jamais vos serveurs
- ✅ **Webhooks signés** : Vérification de l'authenticité
- ✅ **3D Secure** : Authentification forte
- ✅ **SCA Ready** : Conforme Strong Customer Authentication

### Ce que Stripe gère pour vous :
- Détection de fraude
- Mise en conformité PCI
- Gestion des litiges
- Remboursements
- Rapports financiers

---

## 📊 Tableau de Bord Stripe

Accédez à :
- **Paiements** : Tous les transactions
- **Clients** : Gestion des profils
- **Abonnements** : Suivi en temps réel
- **Analytics** : MRR, churn, revenus
- **Rapports** : Export comptable

---

## 🧪 Mode Test vs Production

### Mode Test (Développement)
- Utilisez les clés `pk_test_` et `sk_test_`
- Cartes de test : `4242 4242 4242 4242`
- Aucun vrai paiement

### Mode Production
- Remplacez par `pk_live_` et `sk_live_`
- Vraies transactions
- Activez dans **Settings** → **Account details**

---

## 🆘 Support

- **Documentation** : [stripe.com/docs](https://stripe.com/docs)
- **Support FR** : [support.stripe.com](https://support.stripe.com)
- **Status** : [status.stripe.com](https://status.stripe.com)

---

## ✅ Checklist de Déploiement

- [ ] Compte Stripe créé
- [ ] Clés API configurées
- [ ] Produits créés (Premium, Famille)
- [ ] Price IDs ajoutés au `.env`
- [ ] Webhook configuré en production
- [ ] Tests de paiement réussis
- [ ] Passage en mode live

---

**Le système de paiement est prêt ! 🚀**
