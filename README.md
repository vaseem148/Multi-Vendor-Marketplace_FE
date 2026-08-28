# MVM Frontend — Multi-Vendor Marketplace

React + TypeScript storefront for a multi-vendor marketplace. One catalog spanning many independent
sellers, a single cart and checkout across them, plus a seller dashboard and an admin console.

Backend lives in [Multi-Vendor-Marketplace_BE](https://github.com/vaseem148/Multi-Vendor-Marketplace_BE).

## Stack

| Piece | Choice |
| --- | --- |
| Build | Vite 8 |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`) |
| Routing | React Router v7 |
| State | Zustand (auth, cart, toasts/theme) |
| HTTP | Axios with a JWT refresh interceptor |
| Icons | lucide-react |

## Quick start

Start the Django API on port 8010 first, then:

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Vite proxies `/api` and `/media` to `http://127.0.0.1:8010`, so
there is nothing to configure for local development.

To point at a deployed API instead, set `VITE_API_URL`:

```bash
echo "VITE_API_URL=https://your-api.example.com/api" > .env.local
```

### Demo accounts

| Role | Email | Password | Lands on |
| --- | --- | --- | --- |
| Customer | `customer@mvm.com` | `customer123` | Storefront, cart, orders |
| Vendor | `vendor@mvm.com` | `vendor123` | `/vendor` seller dashboard |
| Admin | `admin@mvm.com` | `admin123` | `/admin` console |

The login screen has one-tap buttons that fill these in.

## Routes

**Storefront** — `/` home · `/shop` catalog with filters · `/product/:slug` · `/vendors` seller
directory · `/shop/:slug` a seller's storefront · `/cart` · `/checkout` · `/orders` ·
`/orders/:orderNumber` · `/wishlist` · `/account` · `/sell` seller signup · `/login` · `/register`

**Seller** (`/vendor`, approved vendors only) — overview · products · product form ·
orders · earnings · shop settings

**Admin** (`/admin`, staff only) — overview · sellers · products · orders · categories · customers

## Structure

```
src/
  api/          axios client (JWT refresh), typed endpoints, API types
  components/
    ui/         Button, Input, Select, Badge, Card, Modal, Toaster, Tabs, StatTile…
    layout/     Navbar, Footer, route guards, dashboard shells
    product/    ProductCard, ProductGrid
  pages/        storefront pages, plus vendor/ and admin/ dashboards
  store/        auth, cart+wishlist, ui (toasts, theme)
  lib/          cn(), currency/date formatting, API error parsing, constants
  index.css     design tokens + Tailwind v4 theme
```

## Design system

Colours are CSS custom properties defined twice — light values on `:root`, dark overrides on
`.dark` — so every token has one definition per theme and nothing borrows from the other. The theme
toggle in the navbar writes to `localStorage` and falls back to `prefers-color-scheme`; all reads
are wrapped so private-mode browsers still render correctly.

Tailwind v4 needs no config file: the `@theme` block in `index.css` declares the fonts, brand ramp,
shadows and animations, and a `@custom-variant dark` wires the class-based dark mode.

## Notes on behaviour

**Filters live in the URL.** `/shop` reads every filter from search params, so results are
shareable and the back button works as expected.

**The cart is server-side.** It is fetched on sign-in and every mutation returns the full cart, so
totals (shipping threshold, GST) always come from the backend rather than being recomputed here.

**Token refresh is queued.** A 401 triggers one refresh call; parallel requests wait on the same
promise instead of each firing their own, then retry with the new token.

**Optimistic quantity updates roll back.** Changing a cart quantity keeps the previous cart and
restores it if the request fails.

## Scripts

```bash
npm run dev       # dev server on :5173 with API proxy
npm run build     # type-check then production build to dist/
npm run preview   # serve the production build
npm run lint      # eslint
```
