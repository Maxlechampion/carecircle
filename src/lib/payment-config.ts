// CareCircle - Payment Configuration by Country
// Supports Mobile Money across Africa and international payments

export type PaymentProvider = 'flutterwave' | 'paystack' | 'stripe'
export type PaymentMethod = 
  | 'card' 
  | 'mobile_money' 
  | 'bank_transfer' 
  | 'ussd'
  | 'apple_pay' 
  | 'google_pay'
  | 'sepa'

export interface MobileMoneyProvider {
  id: string
  name: string
  countries: string[]
  logo?: string
}

export interface CountryPaymentConfig {
  countryCode: string
  countryName: string
  currency: string
  currencySymbol: string
  provider: PaymentProvider
  methods: PaymentMethod[]
  mobileMoneyProviders?: MobileMoneyProvider[]
  minAmount: number
  maxAmount: number
}

// Mobile Money Providers
export const MOBILE_MONEY_PROVIDERS: MobileMoneyProvider[] = [
  { id: 'orange_money', name: 'Orange Money', countries: ['SN', 'CI', 'ML', 'BF', 'GN', 'SN'] },
  { id: 'mtn_money', name: 'MTN Mobile Money', countries: ['CI', 'GH', 'UG', 'RW', 'CM', 'BJ'] },
  { id: 'wave', name: 'Wave', countries: ['SN', 'CI'] },
  { id: 'moov_money', name: 'Moov Money', countries: ['BJ', 'BF', 'CI', 'TG', 'NE'] },
  { id: 'airtel_money', name: 'Airtel Money', countries: ['KE', 'UG', 'RW', 'TZ', 'ZM', 'MW'] },
  { id: 'mpesa', name: 'M-Pesa', countries: ['KE', 'TZ', 'CD', 'GH', 'MZ'] },
  { id: 'free_money', name: 'Free Money', countries: ['SN'] },
  { id: 'wizall', name: 'Wizall Money', countries: ['SN', 'CI', 'ML', 'BF'] },
  { id: 'celtic_money', name: 'Celtic Money', countries: ['CF'] },
]

// Country Payment Configurations
export const COUNTRY_CONFIGS: Record<string, CountryPaymentConfig> = {
  // === AFRIQUE DE L'OUEST (Zone XOF) ===
  'SN': {
    countryCode: 'SN',
    countryName: 'Sénégal',
    currency: 'XOF',
    currencySymbol: 'FCFA',
    provider: 'flutterwave',
    methods: ['mobile_money', 'card'],
    mobileMoneyProviders: [
      { id: 'orange_money', name: 'Orange Money', countries: ['SN'] },
      { id: 'wave', name: 'Wave', countries: ['SN'] },
      { id: 'free_money', name: 'Free Money', countries: ['SN'] },
      { id: 'wizall', name: 'Wizall Money', countries: ['SN'] },
    ],
    minAmount: 100,
    maxAmount: 10000000,
  },
  'CI': {
    countryCode: 'CI',
    countryName: 'Côte d\'Ivoire',
    currency: 'XOF',
    currencySymbol: 'FCFA',
    provider: 'flutterwave',
    methods: ['mobile_money', 'card'],
    mobileMoneyProviders: [
      { id: 'orange_money', name: 'Orange Money', countries: ['CI'] },
      { id: 'mtn_money', name: 'MTN Mobile Money', countries: ['CI'] },
      { id: 'wave', name: 'Wave', countries: ['CI'] },
      { id: 'moov_money', name: 'Moov Money', countries: ['CI'] },
    ],
    minAmount: 100,
    maxAmount: 10000000,
  },
  'ML': {
    countryCode: 'ML',
    countryName: 'Mali',
    currency: 'XOF',
    currencySymbol: 'FCFA',
    provider: 'flutterwave',
    methods: ['mobile_money', 'card'],
    mobileMoneyProviders: [
      { id: 'orange_money', name: 'Orange Money', countries: ['ML'] },
    ],
    minAmount: 100,
    maxAmount: 10000000,
  },
  'BF': {
    countryCode: 'BF',
    countryName: 'Burkina Faso',
    currency: 'XOF',
    currencySymbol: 'FCFA',
    provider: 'flutterwave',
    methods: ['mobile_money', 'card'],
    mobileMoneyProviders: [
      { id: 'orange_money', name: 'Orange Money', countries: ['BF'] },
      { id: 'moov_money', name: 'Moov Money', countries: ['BF'] },
    ],
    minAmount: 100,
    maxAmount: 10000000,
  },
  'BJ': {
    countryCode: 'BJ',
    countryName: 'Bénin',
    currency: 'XOF',
    currencySymbol: 'FCFA',
    provider: 'flutterwave',
    methods: ['mobile_money', 'card'],
    mobileMoneyProviders: [
      { id: 'mtn_money', name: 'MTN Mobile Money', countries: ['BJ'] },
      { id: 'moov_money', name: 'Moov Money', countries: ['BJ'] },
    ],
    minAmount: 100,
    maxAmount: 10000000,
  },
  'TG': {
    countryCode: 'TG',
    countryName: 'Togo',
    currency: 'XOF',
    currencySymbol: 'FCFA',
    provider: 'flutterwave',
    methods: ['mobile_money', 'card'],
    mobileMoneyProviders: [
      { id: 'moov_money', name: 'Moov Money', countries: ['TG'] },
    ],
    minAmount: 100,
    maxAmount: 10000000,
  },
  'NE': {
    countryCode: 'NE',
    countryName: 'Niger',
    currency: 'XOF',
    currencySymbol: 'FCFA',
    provider: 'flutterwave',
    methods: ['mobile_money', 'card'],
    mobileMoneyProviders: [
      { id: 'moov_money', name: 'Moov Money', countries: ['NE'] },
    ],
    minAmount: 100,
    maxAmount: 10000000,
  },
  'GN': {
    countryCode: 'GN',
    countryName: 'Guinée',
    currency: 'GNF',
    currencySymbol: 'GNF',
    provider: 'flutterwave',
    methods: ['mobile_money', 'card'],
    mobileMoneyProviders: [
      { id: 'orange_money', name: 'Orange Money', countries: ['GN'] },
    ],
    minAmount: 1000,
    maxAmount: 100000000,
  },

  // === AFRIQUE DE L'OUEST (Autres devises) ===
  'NG': {
    countryCode: 'NG',
    countryName: 'Nigeria',
    currency: 'NGN',
    currencySymbol: '₦',
    provider: 'paystack',
    methods: ['card', 'bank_transfer', 'ussd', 'mobile_money'],
    minAmount: 100,
    maxAmount: 10000000,
  },
  'GH': {
    countryCode: 'GH',
    countryName: 'Ghana',
    currency: 'GHS',
    currencySymbol: 'GH₵',
    provider: 'paystack',
    methods: ['mobile_money', 'card'],
    mobileMoneyProviders: [
      { id: 'mtn_money', name: 'MTN Mobile Money', countries: ['GH'] },
      { id: 'mpesa', name: 'Vodafone Cash', countries: ['GH'] },
    ],
    minAmount: 1,
    maxAmount: 100000,
  },

  // === AFRIQUE CENTRALE (Zone XAF) ===
  'CM': {
    countryCode: 'CM',
    countryName: 'Cameroun',
    currency: 'XAF',
    currencySymbol: 'FCFA',
    provider: 'flutterwave',
    methods: ['mobile_money', 'card'],
    mobileMoneyProviders: [
      { id: 'mtn_money', name: 'MTN Mobile Money', countries: ['CM'] },
      { id: 'orange_money', name: 'Orange Money', countries: ['CM'] },
    ],
    minAmount: 100,
    maxAmount: 10000000,
  },
  'CD': {
    countryCode: 'CD',
    countryName: 'RD Congo',
    currency: 'CDF',
    currencySymbol: 'FC',
    provider: 'flutterwave',
    methods: ['mobile_money', 'card'],
    mobileMoneyProviders: [
      { id: 'mpesa', name: 'M-Pesa', countries: ['CD'] },
      { id: 'airtel_money', name: 'Airtel Money', countries: ['CD'] },
    ],
    minAmount: 100,
    maxAmount: 10000000,
  },

  // === AFRIQUE DE L'EST ===
  'KE': {
    countryCode: 'KE',
    countryName: 'Kenya',
    currency: 'KES',
    currencySymbol: 'KSh',
    provider: 'flutterwave',
    methods: ['mobile_money', 'card', 'bank_transfer'],
    mobileMoneyProviders: [
      { id: 'mpesa', name: 'M-Pesa', countries: ['KE'] },
      { id: 'airtel_money', name: 'Airtel Money', countries: ['KE'] },
    ],
    minAmount: 10,
    maxAmount: 500000,
  },
  'UG': {
    countryCode: 'UG',
    countryName: 'Ouganda',
    currency: 'UGX',
    currencySymbol: 'USh',
    provider: 'flutterwave',
    methods: ['mobile_money', 'card'],
    mobileMoneyProviders: [
      { id: 'mtn_money', name: 'MTN Mobile Money', countries: ['UG'] },
      { id: 'airtel_money', name: 'Airtel Money', countries: ['UG'] },
    ],
    minAmount: 500,
    maxAmount: 5000000,
  },
  'RW': {
    countryCode: 'RW',
    countryName: 'Rwanda',
    currency: 'RWF',
    currencySymbol: 'FRw',
    provider: 'flutterwave',
    methods: ['mobile_money', 'card'],
    mobileMoneyProviders: [
      { id: 'mtn_money', name: 'MTN Mobile Money', countries: ['RW'] },
      { id: 'airtel_money', name: 'Airtel Money', countries: ['RW'] },
    ],
    minAmount: 100,
    maxAmount: 1000000,
  },
  'TZ': {
    countryCode: 'TZ',
    countryName: 'Tanzanie',
    currency: 'TZS',
    currencySymbol: 'TSh',
    provider: 'flutterwave',
    methods: ['mobile_money', 'card'],
    mobileMoneyProviders: [
      { id: 'mpesa', name: 'M-Pesa', countries: ['TZ'] },
      { id: 'airtel_money', name: 'Airtel Money', countries: ['TZ'] },
    ],
    minAmount: 1000,
    maxAmount: 10000000,
  },
  'ZM': {
    countryCode: 'ZM',
    countryName: 'Zambie',
    currency: 'ZMW',
    currencySymbol: 'ZK',
    provider: 'flutterwave',
    methods: ['mobile_money', 'card'],
    mobileMoneyProviders: [
      { id: 'airtel_money', name: 'Airtel Money', countries: ['ZM'] },
      { id: 'mtn_money', name: 'MTN Mobile Money', countries: ['ZM'] },
    ],
    minAmount: 1,
    maxAmount: 50000,
  },
  'MW': {
    countryCode: 'MW',
    countryName: 'Malawi',
    currency: 'MWK',
    currencySymbol: 'MK',
    provider: 'flutterwave',
    methods: ['mobile_money', 'card'],
    mobileMoneyProviders: [
      { id: 'airtel_money', name: 'Airtel Money', countries: ['MW'] },
    ],
    minAmount: 100,
    maxAmount: 1000000,
  },
  'MZ': {
    countryCode: 'MZ',
    countryName: 'Mozambique',
    currency: 'MZN',
    currencySymbol: 'MT',
    provider: 'flutterwave',
    methods: ['mobile_money', 'card'],
    mobileMoneyProviders: [
      { id: 'mpesa', name: 'M-Pesa', countries: ['MZ'] },
    ],
    minAmount: 10,
    maxAmount: 100000,
  },

  // === AFRIQUE DU SUD ===
  'ZA': {
    countryCode: 'ZA',
    countryName: 'Afrique du Sud',
    currency: 'ZAR',
    currencySymbol: 'R',
    provider: 'paystack',
    methods: ['card', 'bank_transfer'],
    minAmount: 10,
    maxAmount: 500000,
  },

  // === AFRIQUE DU NORD ===
  'MA': {
    countryCode: 'MA',
    countryName: 'Maroc',
    currency: 'MAD',
    currencySymbol: 'DH',
    provider: 'flutterwave',
    methods: ['card', 'bank_transfer'],
    minAmount: 10,
    maxAmount: 100000,
  },
  'TN': {
    countryCode: 'TN',
    countryName: 'Tunisie',
    currency: 'TND',
    currencySymbol: 'DT',
    provider: 'flutterwave',
    methods: ['card'],
    minAmount: 1,
    maxAmount: 10000,
  },
  'DZ': {
    countryCode: 'DZ',
    countryName: 'Algérie',
    currency: 'DZD',
    currencySymbol: 'DA',
    provider: 'flutterwave',
    methods: ['card'],
    minAmount: 100,
    maxAmount: 1000000,
  },
  'EG': {
    countryCode: 'EG',
    countryName: 'Égypte',
    currency: 'EGP',
    currencySymbol: 'E£',
    provider: 'flutterwave',
    methods: ['card', 'mobile_money'],
    minAmount: 10,
    maxAmount: 500000,
  },

  // === EUROPE ===
  'FR': {
    countryCode: 'FR',
    countryName: 'France',
    currency: 'EUR',
    currencySymbol: '€',
    provider: 'stripe',
    methods: ['card', 'apple_pay', 'google_pay', 'sepa'],
    minAmount: 1,
    maxAmount: 100000,
  },
  'BE': {
    countryCode: 'BE',
    countryName: 'Belgique',
    currency: 'EUR',
    currencySymbol: '€',
    provider: 'stripe',
    methods: ['card', 'apple_pay', 'google_pay', 'sepa'],
    minAmount: 1,
    maxAmount: 100000,
  },
  'CH': {
    countryCode: 'CH',
    countryName: 'Suisse',
    currency: 'CHF',
    currencySymbol: 'CHF',
    provider: 'stripe',
    methods: ['card', 'apple_pay', 'google_pay'],
    minAmount: 1,
    maxAmount: 100000,
  },
  'LU': {
    countryCode: 'LU',
    countryName: 'Luxembourg',
    currency: 'EUR',
    currencySymbol: '€',
    provider: 'stripe',
    methods: ['card', 'apple_pay', 'google_pay', 'sepa'],
    minAmount: 1,
    maxAmount: 100000,
  },
  'MC': {
    countryCode: 'MC',
    countryName: 'Monaco',
    currency: 'EUR',
    currencySymbol: '€',
    provider: 'stripe',
    methods: ['card', 'apple_pay', 'google_pay'],
    minAmount: 1,
    maxAmount: 100000,
  },
  'DE': {
    countryCode: 'DE',
    countryName: 'Allemagne',
    currency: 'EUR',
    currencySymbol: '€',
    provider: 'stripe',
    methods: ['card', 'apple_pay', 'google_pay', 'sepa'],
    minAmount: 1,
    maxAmount: 100000,
  },
  'GB': {
    countryCode: 'GB',
    countryName: 'Royaume-Uni',
    currency: 'GBP',
    currencySymbol: '£',
    provider: 'stripe',
    methods: ['card', 'apple_pay', 'google_pay'],
    minAmount: 1,
    maxAmount: 100000,
  },

  // === AMÉRIQUE ===
  'US': {
    countryCode: 'US',
    countryName: 'États-Unis',
    currency: 'USD',
    currencySymbol: '$',
    provider: 'stripe',
    methods: ['card', 'apple_pay', 'google_pay'],
    minAmount: 1,
    maxAmount: 100000,
  },
  'CA': {
    countryCode: 'CA',
    countryName: 'Canada',
    currency: 'CAD',
    currencySymbol: 'CA$',
    provider: 'stripe',
    methods: ['card', 'apple_pay', 'google_pay'],
    minAmount: 1,
    maxAmount: 100000,
  },

  // === AUTRES ===
  'OTHER': {
    countryCode: 'OTHER',
    countryName: 'Autre pays',
    currency: 'USD',
    currencySymbol: '$',
    provider: 'stripe',
    methods: ['card'],
    minAmount: 1,
    maxAmount: 100000,
  },
}

// Pricing by plan and currency
export const PLAN_PRICING = {
  free: {
    name: 'Gratuit',
    description: 'Pour découvrir CareCircle',
    prices: {
      EUR: 0, XOF: 0, XAF: 0, KES: 0, NGN: 0, GHS: 0, USD: 0, GBP: 0, CHF: 0,
      CAD: 0, ZAR: 0, MAD: 0, TND: 0, DZD: 0, EGP: 0, UGX: 0, RWF: 0, TZS: 0,
      ZMW: 0, MWK: 0, MZN: 0, GNF: 0, CDF: 0,
    },
    features: [
      'Assistant IA Cleo (10 messages/jour)',
      'Calendrier médical basique',
      'Suivi de 1 personne aidée',
      'Accès à la communauté',
      'Ressources éducatives',
    ],
    limitations: ['10 messages/jour', '1 personne aidée'],
    popular: false,
    maxRecipients: 1,
    maxAiMessages: 10,
    trialDays: 0,
  },
  premium: {
    name: 'Premium',
    description: 'Pour les aidants au quotidien',
    prices: {
      EUR: 999,      // 9.99€ in cents
      XOF: 6500,     // ~10€
      XAF: 6500,     // ~10€
      KES: 1200,     // ~9€
      NGN: 4500,     // ~5€ (prix ajusté pour le marché)
      GHS: 80,       // ~9€
      USD: 1099,     // $10.99
      GBP: 899,      // £8.99
      CHF: 1199,     // CHF 11.99
      CAD: 1499,     // CA$ 14.99
      ZAR: 18000,    // ~9€
      MAD: 110,      // ~10€
      TND: 35,       // ~10€
      DZD: 1500,     // ~10€
      EGP: 300,      // ~9€
      UGX: 40000,    // ~9€
      RWF: 12000,    // ~9€
      TZS: 25000,    // ~9€
      ZMW: 280,      // ~10€
      MWK: 15000,    // ~9€
      MZN: 700,      // ~9€
      GNF: 100000,   // ~10€
      CDF: 25000,    // ~9€
    },
    features: [
      'Assistant IA Cleo illimité',
      'Calendrier médical avancé avec rappels',
      'Suivi de 5 personnes aidées',
      'Journal de santé détaillé',
      'Export PDF des données médicales',
      'Alertes et notifications intelligentes',
      'Accès prioritaire aux webinaires',
      'Support par email prioritaire',
    ],
    limitations: [],
    popular: true,
    maxRecipients: 5,
    maxAiMessages: -1, // unlimited
    trialDays: 14,
  },
  family: {
    name: 'Famille',
    description: 'Pour partager l\'aidance en famille',
    prices: {
      EUR: 1999,     // 19.99€
      XOF: 13000,    // ~20€
      XAF: 13000,    // ~20€
      KES: 2400,     // ~18€
      NGN: 9000,     // ~10€
      GHS: 160,      // ~18€
      USD: 2199,     // $21.99
      GBP: 1799,     // £17.99
      CHF: 2399,     // CHF 23.99
      CAD: 2999,     // CA$ 29.99
      ZAR: 36000,    // ~18€
      MAD: 220,      // ~20€
      TND: 70,       // ~20€
      DZD: 3000,     // ~20€
      EGP: 600,      // ~18€
      UGX: 80000,    // ~18€
      RWF: 24000,    // ~18€
      TZS: 50000,    // ~18€
      ZMW: 560,      // ~20€
      MWK: 30000,    // ~18€
      MZN: 1400,     // ~18€
      GNF: 200000,   // ~20€
      CDF: 50000,    // ~18€
    },
    features: [
      'Tout Premium inclus',
      'Comptes familiaux (jusqu\'à 5)',
      'Coordination partagée des soins',
      'Suivi illimité de personnes aidées',
      'Historique médical complet',
      'Vidéos avec professionnels',
      'Ligne d\'écoute prioritaire 24/7',
      'Support téléphonique dédié',
      'Accompagnement personnalisé',
    ],
    limitations: [],
    popular: false,
    maxRecipients: -1, // unlimited
    maxAiMessages: -1, // unlimited
    trialDays: 14,
  },
}

// Helper functions
export function getCountryConfig(countryCode: string): CountryPaymentConfig {
  return COUNTRY_CONFIGS[countryCode] || COUNTRY_CONFIGS['OTHER']
}

export function formatPrice(amount: number, currency: string): string {
  const config = Object.values(COUNTRY_CONFIGS).find(c => c.currency === currency)
  const symbol = config?.currencySymbol || currency
  
  // Convert from cents to actual amount
  const actualAmount = amount / 100
  
  if (['XOF', 'XAF'].includes(currency)) {
    return `${actualAmount.toLocaleString('fr-FR')} ${symbol}`
  }
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(actualAmount)
}

export function getMobileMoneyProviders(countryCode: string): MobileMoneyProvider[] {
  const config = COUNTRY_CONFIGS[countryCode]
  return config?.mobileMoneyProviders || []
}

export function getSupportedCountries(): { code: string; name: string }[] {
  return Object.entries(COUNTRY_CONFIGS)
    .filter(([code]) => code !== 'OTHER')
    .map(([code, config]) => ({ code, name: config.countryName }))
    .sort((a, b) => a.name.localeCompare(b.name))
}
