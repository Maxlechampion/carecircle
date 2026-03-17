# 🚀 Guide de Déploiement Gratuit - CareCircle

Ce guide vous explique comment mettre en ligne **CareCircle gratuitement** pour que les utilisateurs puissent la tester.

---

## 📋 Prérequis

- Un compte **GitHub** (gratuit)
- Un compte **Vercel** (gratuit)
- Le code de l'application

---

## 🔹 Étape 1 : Créer un compte GitHub

1. Allez sur [github.com](https://github.com)
2. Cliquez sur **"Sign up"** (S'inscrire)
3. Remplissez le formulaire :
   - Email
   - Mot de passe
   - Nom d'utilisateur
4. Validez votre email
5. Votre compte GitHub est prêt !

---

## 🔹 Étape 2 : Créer un nouveau repository

1. Connectez-vous à GitHub
2. Cliquez sur le **+** en haut à droite
3. Sélectionnez **"New repository"**
4. Remplissez :
   - **Repository name** : `carecircle`
   - **Description** : `Plateforme de soutien pour aidants familiaux`
   - **Visibility** : Public (gratuit)
5. Cliquez sur **"Create repository"**

---

## 🔹 Étape 3 : Pousser le code sur GitHub

### Option A : Via l'interface GitHub (le plus simple)

1. Dans votre repository GitHub, cliquez sur **"uploading an existing file"**
2. Glissez-déposez tous les fichiers du projet
3. Cliquez sur **"Commit changes"**

### Option B : Via la ligne de commande

```bash
# Dans le dossier du projet
git remote add origin https://github.com/VOTRE-USERNAME/carecircle.git
git branch -M main
git push -u origin main
```

---

## 🔹 Étape 4 : Déployer sur Vercel (GRATUIT)

### 4.1 Créer un compte Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Sign Up"**
3. Choisissez **"Continue with GitHub"**
4. Autorisez Vercel à accéder à vos repositories

### 4.2 Importer le projet

1. Sur le dashboard Vercel, cliquez sur **"Add New..."**
2. Sélectionnez **"Project"**
3. Trouvez `carecircle` dans la liste
4. Cliquez sur **"Import"**

### 4.3 Configurer le déploiement

| Paramètre | Valeur |
|-----------|--------|
| **Framework Preset** | Next.js (auto-détecté) |
| **Root Directory** | `./` |
| **Build Command** | `bun run build` |
| **Output Directory** | `.next` |

### 4.4 Variables d'environnement (optionnel)

Cliquez sur **"Environment Variables"** et ajoutez :

```
DATABASE_URL = file:./db/carecircle.db
```

### 4.5 Déployer

1. Cliquez sur **"Deploy"**
2. Attendez 2-3 minutes
3. 🎉 **Votre app est en ligne !**

---

## 🔹 Étape 5 : Obtenir votre URL

Après le déploiement, Vercel vous donne une URL comme :

```
https://carecircle-votre-username.vercel.app
```

**Cette URL est gratuite et accessible publiquement !**

---

## 🔧 Personnalisation (Optionnel)

### Changer le domaine

1. Allez dans **Settings** > **Domains**
2. Ajoutez votre domaine personnalisé
3. Ou utilisez le domaine Vercel gratuit

### Variables d'environnement

Pour ajouter des variables après déploiement :
1. **Settings** > **Environment Variables**
2. Ajoutez vos variables
3. Redéployez

---

## 📊 Monitoring

Vercel offre gratuitement :
- Analytics (visites, performance)
- Logs en temps réel
- Déploiements automatiques à chaque push

---

## 🔄 Mises à jour

Pour mettre à jour l'app :

```bash
git add .
git commit -m "Mise à jour"
git push
```

**Vercel redéploie automatiquement !**

---

## ✅ Résumé des URLs Gratuites

| Service | URL |
|---------|-----|
| **GitHub** | `https://github.com/VOTRE-USERNAME/carecircle` |
| **Vercel** | `https://carecircle-votre-username.vercel.app` |

---

## 🆘 Besoin d'aide ?

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)
- [Support GitHub](https://support.github.com)

---

**Bon déploiement ! 🚀**
