/**
 * CareCircle — Script de seed de la base de données
 * Usage: npx prisma db seed
 * Crée des données initiales pour les tests et le développement
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Démarrage du seed...')

  // ─── Compte admin / démo ────────────────────────────────────
  const hashedPassword = await bcrypt.hash('demo1234', 12)

  const caregiver = await db.user.upsert({
    where: { email: 'aidant@demo.fr' },
    update: {},
    create: {
      email: 'aidant@demo.fr',
      name: 'Marie Dupont',
      password: hashedPassword,
      role: 'caregiver',
      country: 'FR',
      subscriptionPlan: 'free',
      authProvider: 'credentials',
      emailVerified: new Date(),
    },
  })
  console.log('✅ Aidant démo créé:', caregiver.email)

  const doctor = await db.user.upsert({
    where: { email: 'medecin@demo.fr' },
    update: {},
    create: {
      email: 'medecin@demo.fr',
      name: 'Dr. Sophie Martin',
      password: hashedPassword,
      role: 'doctor',
      country: 'FR',
      subscriptionPlan: 'premium',
      authProvider: 'credentials',
      emailVerified: new Date(),
    },
  })
  console.log('✅ Médecin démo créé:', doctor.email)

  const familyUser = await db.user.upsert({
    where: { email: 'famille@demo.fr' },
    update: {},
    create: {
      email: 'famille@demo.fr',
      name: 'Pierre Dupont',
      password: hashedPassword,
      role: 'family',
      country: 'FR',
      subscriptionPlan: 'family',
      authProvider: 'credentials',
      emailVerified: new Date(),
    },
  })
  console.log('✅ Famille démo créée:', familyUser.email)

  // ─── Personne aidée pour l'aidant démo ─────────────────────
  const recipient = await db.careRecipient.upsert({
    where: { id: 'demo-recipient-001' },
    update: {},
    create: {
      id: 'demo-recipient-001',
      caregiverId: caregiver.id,
      name: 'Jean Dupont',
      dateOfBirth: new Date('1946-03-15'),
      conditions: JSON.stringify(["Maladie d'Alzheimer", 'Hypertension artérielle']),
      notes: 'Attention aux chutes. Préfère les repas légers le soir.',
    },
  })
  console.log('✅ Personne aidée démo créée:', recipient.name)

  // ─── Rendez-vous démo ───────────────────────────────────────
  await db.appointment.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'demo-apt-001',
        userId: caregiver.id,
        recipientId: recipient.id,
        title: 'Consultation Dr. Martin - Neurologue',
        date: new Date(Date.now() + 86400000),
        duration: 30,
        location: 'Cabinet Médical République, Paris 11e',
        doctorName: 'Dr. Sophie Martin',
        type: 'medical',
        status: 'scheduled',
      },
      {
        id: 'demo-apt-002',
        userId: caregiver.id,
        recipientId: recipient.id,
        title: 'Séance de kinésithérapie',
        date: new Date(Date.now() + 172800000),
        duration: 45,
        location: 'Centre de Rééducation Saint-Maurice',
        doctorName: 'Mme. Leroy',
        type: 'therapy',
        status: 'scheduled',
      },
    ],
  })
  console.log('✅ Rendez-vous démo créés')

  // ─── Médicaments démo ───────────────────────────────────────
  await db.medication.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'demo-med-001',
        userId: caregiver.id,
        recipientId: recipient.id,
        name: 'Aricept (Donépézil)',
        dosage: '10 mg',
        frequency: 'Une fois par jour',
        times: JSON.stringify(['08:00']),
        instructions: 'À prendre au petit-déjeuner',
        active: true,
      },
      {
        id: 'demo-med-002',
        userId: caregiver.id,
        recipientId: recipient.id,
        name: 'Lasilix (Furosémide)',
        dosage: '40 mg',
        frequency: 'Une fois par jour',
        times: JSON.stringify(['08:00']),
        instructions: 'À prendre le matin',
        active: true,
      },
      {
        id: 'demo-med-003',
        userId: caregiver.id,
        recipientId: recipient.id,
        name: 'Kardegic',
        dosage: '75 mg',
        frequency: 'Une fois par jour',
        times: JSON.stringify(['20:00']),
        instructions: 'À prendre au dîner',
        active: true,
      },
    ],
  })
  console.log('✅ Médicaments démo créés')

  // ─── Tâches démo ────────────────────────────────────────────
  await db.task.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'demo-task-001',
        userId: caregiver.id,
        title: "Préparer le pilulier de la semaine",
        completed: true,
        priority: 'high',
        category: 'medical',
      },
      {
        id: 'demo-task-002',
        userId: caregiver.id,
        title: "Appeler l'infirmière",
        completed: false,
        priority: 'medium',
        category: 'care',
      },
      {
        id: 'demo-task-003',
        userId: caregiver.id,
        title: "Renouveler l'ordonnance",
        completed: false,
        priority: 'urgent',
        category: 'medical',
      },
      {
        id: 'demo-task-004',
        userId: caregiver.id,
        title: 'Promenade au parc',
        completed: false,
        priority: 'low',
        category: 'care',
      },
    ],
  })
  console.log('✅ Tâches démo créées')

  // ─── Posts communauté démo ──────────────────────────────────
  const communityUsers = [
    { email: 'claire@demo.fr', name: 'Claire M.' },
    { email: 'pierre@demo.fr', name: 'Pierre L.' },
    { email: 'sophie@demo.fr', name: 'Sophie D.' },
  ]

  for (const cu of communityUsers) {
    await db.user.upsert({
      where: { email: cu.email },
      update: {},
      create: {
        email: cu.email,
        name: cu.name,
        password: hashedPassword,
        role: 'caregiver',
        country: 'FR',
        subscriptionPlan: 'free',
        authProvider: 'credentials',
      },
    })
  }

  const claireUser = await db.user.findUnique({ where: { email: 'claire@demo.fr' } })
  const pierreUser = await db.user.findUnique({ where: { email: 'pierre@demo.fr' } })
  const sophieUser = await db.user.findUnique({ where: { email: 'sophie@demo.fr' } })

  if (claireUser && pierreUser && sophieUser) {
    await db.communityPost.createMany({
      skipDuplicates: true,
      data: [
        {
          id: 'demo-post-001',
          authorId: claireUser.id,
          title: 'Comment gérez-vous les troubles du sommeil ?',
          content: "Mon père a beaucoup de difficultés à dormir depuis quelques semaines. J'ai essayé plusieurs approches mais sans grand succès. Avez-vous des conseils ?",
          category: 'alzheimer',
          likes: 24,
          views: 89,
        },
        {
          id: 'demo-post-002',
          authorId: pierreUser.id,
          title: "Mon expérience avec l'orthophoniste",
          content: "Après 6 mois de séances, je vois une vraie amélioration. Je partage mon retour d'expérience pour ceux qui hésitent encore...",
          category: 'temoignage',
          likes: 45,
          views: 212,
        },
        {
          id: 'demo-post-003',
          authorId: sophieUser.id,
          title: 'Aides financières disponibles en 2025',
          content: "J'ai compilé toutes les aides auxquelles vous pouvez prétendre en tant qu'aidant familial : APA, PCH, congé proche aidant...",
          category: 'ressources',
          likes: 89,
          views: 467,
        },
      ],
    })
    console.log('✅ Posts communauté démo créés')
  }

  // ─── Notification de bienvenue ──────────────────────────────
  await db.notification.upsert({
    where: { id: 'demo-notif-001' },
    update: {},
    create: {
      id: 'demo-notif-001',
      userId: caregiver.id,
      title: 'Bienvenue sur CareCircle ! 🎉',
      message: 'Votre compte démo est prêt. Explorez toutes les fonctionnalités.',
      type: 'success',
      read: false,
    },
  })
  console.log('✅ Notifications démo créées')

  // ─── Plans d'abonnement ─────────────────────────────────────
  await db.subscriptionPlan.upsert({
    where: { planId: 'free' },
    update: {},
    create: {
      planId: 'free',
      name: 'Gratuit',
      description: 'Pour découvrir CareCircle',
      pricing: JSON.stringify({ EUR: 0, XOF: 0, KES: 0, NGN: 0 }),
      features: JSON.stringify([
        'Assistant IA Cleo (10 messages/jour)',
        'Calendrier médical basique',
        '1 personne aidée',
        'Accès communauté',
        'Ressources éducatives',
      ]),
      maxRecipients: 1,
      maxAiMessages: 10,
      maxFamilyMembers: 1,
      trialDays: 0,
      sortOrder: 0,
    },
  })

  await db.subscriptionPlan.upsert({
    where: { planId: 'premium' },
    update: {},
    create: {
      planId: 'premium',
      name: 'Premium',
      description: 'Pour les aidants au quotidien',
      pricing: JSON.stringify({ EUR: 9.99, XOF: 6500, KES: 1200, NGN: 4500 }),
      features: JSON.stringify([
        'Assistant IA illimité',
        'Calendrier avancé avec rappels',
        '5 personnes aidées',
        'Journal de santé détaillé',
        'Export PDF',
        'Alertes intelligentes',
        'Support email',
      ]),
      maxRecipients: 5,
      maxAiMessages: 100,
      maxFamilyMembers: 1,
      trialDays: 14,
      sortOrder: 1,
    },
  })

  await db.subscriptionPlan.upsert({
    where: { planId: 'family' },
    update: {},
    create: {
      planId: 'family',
      name: 'Famille',
      description: "Pour partager l'aidance en famille",
      pricing: JSON.stringify({ EUR: 19.99, XOF: 13000, KES: 2400, NGN: 9000 }),
      features: JSON.stringify([
        'Tout Premium inclus',
        "Jusqu'à 5 comptes famille",
        'Personnes aidées illimitées',
        'Coordination partagée',
        'Ligne prioritaire 24/7',
        'Accompagnement personnalisé',
      ]),
      maxRecipients: -1,
      maxAiMessages: 500,
      maxFamilyMembers: 5,
      trialDays: 14,
      sortOrder: 2,
    },
  })
  console.log('✅ Plans d\'abonnement créés')

  console.log('\n🎉 Seed terminé avec succès !')
  console.log('\n📋 Comptes de test:')
  console.log('  aidant@demo.fr     / demo1234  (Aidant familial — plan Free)')
  console.log('  medecin@demo.fr    / demo1234  (Professionnel — plan Premium)')
  console.log('  famille@demo.fr    / demo1234  (Famille — plan Family)')
}

main()
  .catch((e) => {
    console.error('❌ Erreur de seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
