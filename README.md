# Zeno — Influenceurs IA

Plateforme SaaS de création et de gestion d'influenceurs virtuels basés sur l'intelligence artificielle. Génération automatique de vidéos courtes et publication sur TikTok, Instagram et YouTube Shorts.

## Structure du projet

```
zeno/
├── index.html               → Site vitrine public
├── dashboard.html            → Interface utilisateur privée (dashboard)
├── vercel.json                → Config des cron jobs Vercel
├── api/
│   ├── send-report.js        → Envoi des rapports automatiques par email (Stellar)
│   └── delete-account.js     → Suppression de compte utilisateur (cascade + auth)
├── assets/
│   ├── css/
│   │   ├── style.css          → Styles du site vitrine
│   │   ├── dashboard.css      → Styles du dashboard
│   │   └── popup.css          → Popups de confirmation génériques
│   └── js/
│       ├── main.js            → JS du site vitrine
│       ├── videos.js          → Gestion de la section vidéos
│       └── generation.js      → Génération vidéo + planification + sélecteur de scripts
└── docs/
    ├── outils.md               → Récapitulatif des outils/technos envisagés
    └── zeno-recapitulatif.md   → Récapitulatif complet et détaillé du projet
```

## Fonctionnalités principales

- **Création d'influenceur IA** : identité, personnalité, visage, voix, sélection de plusieurs réseaux sociaux
- **Génération de vidéos** (simulation) avec description personnalisée et sélecteur de scripts (par influenceur / bibliothèque)
- **Planification de publication** avec calendrier, blocage des dates et heures déjà passées
- **Dashboard complet** : Tableau Bord, Influenceurs, Vidéos, Planning, Historique, Scripts, Paramètres
- **3 plans d'abonnement** : Starter (gratuit), Nova, Stellar (agence/entreprise)
- **Fonctionnalités Stellar** : analytics avancés avec comparaison de périodes, stats par vidéo, export PDF/Excel, objectifs ROI par influenceur, rapports automatiques par email, dossiers multi-clients, journal d'activité (audit trail)
- **Gestion de compte sécurisée** : modification et suppression d'influenceur (avec gestion des données liées), suppression de compte utilisateur (cascade complète + double confirmation)

## Stack technique

- **Frontend** : HTML / CSS / JavaScript pur (pas de framework)
- **Backend / Auth / Base de données** : Supabase (PostgreSQL + Auth + RLS)
- **Hébergement** : Vercel (fonctions serverless + cron jobs)
- **Email** : Brevo (API)
- **Librairies** : Chart.js, jsPDF + autotable, SheetJS (xlsx), JSZip

## Feuille de route

- [x] Étape 1 — Dossier outils
- [x] Étape 2 — Site web (Accueil, À propos, Créations, Tarifs, Formulaire)
- [x] Étape 3 — Agents IA *(simulation actuelle, intégration API réelle en attente)*
- [x] Étape 4 — Interface utilisateur (dashboard)
- [x] Étape 5 — Base de données sécurisée (Supabase + RLS)
- [x] Étape 6 — Refonte ergonomique du dashboard (navbar + barre latérale)
- [x] Étape 7 — Fonctionnalités plan Stellar (7/7)
- [x] Étape 8 — Sécurisation des données (gestion des orphelins, suppression de compte, édition d'influenceur)
- [x] Étape 9 — Améliorations UX (multi-réseaux, blocage horaire, sélecteur de scripts)
- [ ] Étape 10 — Intégration des vraies APIs IA (DeepSeek, Fish Audio, Kling 3.0, Nanobanana 2, Activepieces)
- [ ] Étape 11 — OAuth réseaux sociaux réel (TikTok, Instagram, YouTube)
- [ ] Étape 12 — Branchement des vraies données Analytics (TikTok API, Meta Graph API, YouTube Data API v3)
- [ ] Budget final

Pour le détail complet de chaque phase de développement, voir `docs/zeno-recapitulatif.md`.

## Contact
contact@zeno.ai
