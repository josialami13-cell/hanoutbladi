# Fichiers d’origine conservés en sauvegarde

Les fichiers de configuration présents ici existaient dans l’archive originale en plus des versions actives. Ils sont renommés `.backup` pour ne pas être chargés automatiquement par Next.js ou PostCSS. Garder `next.config.js` et `postcss.config.js` à la racine comme configurations actives.

`package-lock copy.json.backup` est une copie historique; utiliser uniquement `package-lock.json` à la racine pour `npm install`.

Les deux fichiers de route suivants étaient vides dans l’archive originale, sans code ni export, et ont été omis des routes actives parce qu’ils bloquaient le build Next.js :

- `src/app/api/client/login/route.ts`
- `src/app/api/client/login/[id]/route.ts`

L’authentification existante est gérée par NextAuth. Ces fichiers vides ne contenaient aucune fonctionnalité à restaurer.

Les anciens `CatalogView.tsx`, `ProductCard.tsx` et `SearchBar.tsx` sont également sauvegardés dans `legacy-originals/components/`. Ils n’étaient pas importés dans le site actif; deux d’entre eux utilisent une ancienne signature du panier (sans champ `stock`) et ne doivent pas être déplacés vers `src/components` sans adaptation.
