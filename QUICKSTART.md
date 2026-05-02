# 🚀 PocketPrint® — Démarrage Rapide

## Lancer le site en 30 secondes

### Méthode 1 — Le plus simple
Double-clique sur `index.html`. Le site s'ouvre dans ton navigateur. C'est fini.

### Méthode 2 — Serveur local
```bash
# Dans le terminal, à la racine du dossier :
python3 -m http.server 8000

# Puis ouvre :
http://localhost:8000
```

### Méthode 3 — Avec npx (Node.js)
```bash
npx serve
```

---

## Déployer en ligne (gratuit)

### Vercel (recommandé)
1. Crée un compte sur [vercel.com](https://vercel.com)
2. Glisse-dépose le dossier complet
3. Site en ligne en 20 secondes ✨

### Netlify
1. Va sur [app.netlify.com/drop](https://app.netlify.com/drop)
2. Glisse-dépose le dossier
3. URL générée immédiatement

### Cloudflare Pages
1. Crée un compte [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connecte un repo Git ou upload direct
3. Déploiement automatique

---

## Convertir en thème Shopify

Le fichier `index.html` est un prototype HTML. Pour en faire un vrai thème Shopify :

1. **Crée une boutique de développement** sur [shopify.dev](https://shopify.dev)
2. **Installe Shopify CLI** : `npm install -g @shopify/cli @shopify/theme`
3. **Bootstrap un thème** : `shopify theme init`
4. **Découpe le HTML** en sections `.liquid` :
   - `sections/hero.liquid`
   - `sections/buy-block.liquid`
   - `sections/reviews.liquid`
   - etc.
5. **Remplace les données statiques** par les variables Shopify :
   - `€39.90` → `{{ product.price | money }}`
   - `"PocketPrint Mini"` → `{{ product.title }}`
   - etc.
6. **Connecte le panier** à l'API Shopify : `/cart/add.js`
7. **Push** : `shopify theme push`

---

## Personnaliser

### Changer le nom de la marque
Cherche `pocketprint` dans `index.html` et remplace.

### Changer les couleurs
En haut du `<style>`, modifie les variables CSS :
```css
--blush: #ff8fb1;        /* Rose principal */
--blush-deep: #e85a85;   /* Rose accent */
--ink: #0a0a0c;          /* Noir mat */
--bone: #f4f1ec;         /* Blanc os */
```

### Changer les prix
Cherche `€39.90` et `data-price="39.90"` dans le HTML.

### Changer le produit (SVG)
Le produit est dessiné en SVG dans le `.hero-product` et `#productHero`. Tu peux le remplacer par une image PNG/JPG si tu préfères :
```html
<img src="ton-produit.png" class="product-svg" />
```

---

## Structure du projet

```
pocketprint-store/
├── index.html          ← Le site complet (HTML + CSS + JS)
├── README.md           ← Documentation complète
├── QUICKSTART.md       ← Ce fichier
├── package.json        ← Métadonnées npm
├── vercel.json         ← Config déploiement Vercel
├── netlify.toml        ← Config déploiement Netlify
└── .gitignore          ← Fichiers à ignorer en Git
```

---

**Fait pour passer pour une vraie startup financée. Pas un dropshipping.**
