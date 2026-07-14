# In-App Purchase Setup (Fiancé Unlimited)

RevenueCat-side config (project `dccab1b7`) is already done: entitlement `Fiancé Unlimited`
(`entl5de980c72d`), product placeholders on the iOS app (`app520962f61f`) and Android app
(`app3b076a2406`), both attached to the `Fiancé Unlimited` entitlement and to the `default`
offering's `$rc_lifetime` package (`pkge4174faa225`). What's left is creating the matching
product on each store.

Product ID used everywhere (RC, iOS, Android — must match exactly):
`software.drakkar.fiance.app.premium.lifetime`

## App Store Connect (iOS)

**Prerequisite**: the app record for bundle ID `software.drakkar.fiance.app` must already exist
in App Store Connect.

1. Go to [App Store Connect](https://appstoreconnect.apple.com) → **Apps** → select **Fiancé**.
2. Sidebar → **Monetization** → **In-App Purchases**.
3. Click **+** → choose **Non-Consumable** (one-time lifetime unlock, not a subscription).
4. Fill in:
   - **Reference Name**: `Lifetime Premium` (internal only, never shown to users, max 64 chars).
   - **Product ID**: `software.drakkar.fiance.app.premium.lifetime` — a Product ID can never be
     reused once set, even if deleted, so double-check before saving.
   - Click **Create**.
5. On the new IAP's detail page:
   - **Availability**: leave all countries selected (or restrict if desired).
   - **Price Schedule**: pick a price tier ≈ **$99.99 USD** base (matches the RevenueCat Test
     Store price already configured) — Apple auto-converts other currencies.
   - **App Store Localization**: add both locales (French — this app is French-first — and
     English), with a display name and description shown in the purchase sheet:

     | Locale | Display Name | Description |
     |--------|-------------|-------------|
     | French (fr-FR) | `Débloquer Premium à vie` | `Débloquez à vie toutes les fonctionnalités premium de Fiancé — synchronisation multi-appareils, sauvegarde chiffrée et plus — en un seul achat, sans abonnement.` |
     | English (U.S.) | `Unlock Lifetime Premium` | `Unlock every premium feature in Fiancé for life — multi-device sync, encrypted backup, and more — with a single purchase, no subscription.` |
6. Click **Save**.
7. Attach a **review screenshot** (Monetization → In-App Purchases → your IAP → Review Information →
   "Choose File"). This is **reviewer-only** — never shown on the App Store, distinct from the optional
   1024×1024 promotional image. No exact pixel size is enforced, but it must be a real PNG/JPG screenshot
   of the actual purchase screen in the app (e.g. the Premium sheet showing the price and "Débloquer"
   button), taken on a simulator or device — not a mockup — so the reviewer can confirm it matches the
   Product ID/price/description entered above.
8. Submit the IAP for review — bundled with your next app binary submission, or standalone via
   "Submit for Review" if the app is already live.

Role needed: Account Holder, Admin, App Manager, Developer, or Marketing.

## Google Play Console (Android)

**Prerequisite**: the app `software.drakkar.fiance.app` must already exist in Play Console (with
at least one internal-testing release uploaded).

1. Go to [Play Console](https://play.google.com/console) → select **Fiancé**.
2. Sidebar → **Monetize with Play** → **Products** → **One-time products**.
3. Click **Create one-time product**.
4. Fill in:
   - **Product ID**: `software.drakkar.fiance.app.premium.lifetime` — immutable once created.
   - **Name** / **Description**: Play Console lets you add multiple language translations for the
     same product (add a translation per locale from the product's detail page):

     | Locale | Name | Description |
     |--------|------|-------------|
     | French (fr-FR) — default | `Premium à vie` | `Débloquez à vie toutes les fonctionnalités premium de Fiancé — synchronisation multi-appareils, sauvegarde chiffrée et plus — en un seul achat, sans abonnement.` |
     | English (U.S.) | `Lifetime Premium` | `Unlock every premium feature in Fiancé for life — multi-device sync, encrypted backup, and more — with a single purchase, no subscription.` |
5. Google's one-time-product model splits price/entitlement into a **purchase option** — when
   prompted, check **"backwards compatible"** for the purchase option. This keeps the plain
   product ID as the purchasable identifier, matching what RevenueCat expects — RC currently
   only auto-imports backwards-compatible one-time products; non-backwards-compatible ones need
   manual re-mapping in RC's dashboard.
   - The **"ID de l'option d'achat" / "Purchase option ID"** field is separate from the Product ID
     and free-typed — format rule: must start with a digit or lowercase letter, then only digits,
     lowercase letters, or hyphens (no dots, so it can't literally match the Product ID). Use e.g.
     `lifetime`. Checking "backwards compatible" is what makes RC auto-import work, independent of
     this ID's text.
6. Set the **price** ≈ **$99.99 USD** base, let Play auto-convert other currencies.
7. Set **availability** (countries) — match iOS.
8. Click **Activate** (product must be Active, not Draft, to be purchasable).

Role needed: an account with **Manage orders and subscriptions** / **Manage store presence**
permission on that app.

## After both are live

No further RevenueCat dashboard changes are needed — the product/entitlement/offering wiring is
already in place. RevenueCat auto-detects and syncs the store side within a few hours; confirm via
the RC dashboard (or `list-products`) that each product's `state` flips from pending to
approved/ready.

## Sources

- [Create consumable or non-consumable In-App Purchases (Apple)](https://developer.apple.com/help/app-store-connect/manage-in-app-purchases/create-consumable-or-non-consumable-in-app-purchases/)
- [Overview of one-time products (Play Console)](https://support.google.com/googleplay/android-developer/answer/16430488?hl=en)
- [Create an in-app product (Play Console)](https://support.google.com/googleplay/android-developer/answer/1153481?hl=en)
- [Google Play Product Setup (RevenueCat)](https://www.revenuecat.com/docs/getting-started/entitlements/android-products)
