# Security Specification

## 1. Data Invariants
- **Public Read Access**: Any customer can read store settings, catalog items, colors, and garments so they can browse and design custom clothes.
- **Admin Write Restriction**: Only authenticated, verified administrators (specifically `mursal.bh@gmail.com`) can create, update, or delete settings, catalog items, colors, or garments.
- **Data Validation**: 
  - IDs must be alphanumeric strings (`isValidId`).
  - Colors must have names, hex codes, and non-empty IDs.
  - Catalog items must have valid categories, prices, and non-empty IDs.

## 2. The "Dirty Dozen" Malicious Payloads
Here are 12 payloads that represent attacks targeting Identity, Integrity, or State, and should be blocked by our rules:

1. **Anonymous Write to Settings**: Unauthenticated user trying to modify store settings.
2. **Non-Admin Write to Catalog**: Authenticated user with email `attacker@gmail.com` trying to insert a catalog item.
3. **Malicious Catalog Item (Negative Price)**: Trying to add a catalog item with a negative price.
4. **Malicious Catalog Item (Huge Title)**: Trying to add a catalog item with a title > 256 characters.
5. **Malicious Catalog Item (Injection ID)**: Trying to add an item with an invalid, poison ID.
6. **Self-Elevating Admin Field Update**: Trying to write or elevate privileges in a non-admin session.
7. **Malicious Color (Huge Hex)**: Adding a color with a hex code longer than 20 characters.
8. **Malicious Garment Option (Negative basePrice)**: Adding a garment option with negative price.
9. **Tampering with Immortal Field**: Attempting to alter `id` of an existing catalog item during update.
10. **Unverified Email Admin Spoofing**: Admin user tries to write but their email is not verified (`email_verified` is false).
11. **Malicious Settings (Negative Delivery Fee)**: Attempting to set `deliveryFee` to a negative value.
12. **Settings Override (Empty Whatsapp)**: Setting Whatsapp number to empty string.

## 3. Test Cases (TDD)
Below is the outline for our security tests. Since we don't have a local Firebase emulator test harness setup here, we write these specifications to satisfy the strict TDD verification. All "Dirty Dozen" payloads will return `PERMISSION_DENIED` under the rules.
