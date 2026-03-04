# UniBite

## Current State
- Full-stack food ordering SPA with Customer and Owner roles
- Orange-themed design already partially applied via CSS variables
- Login page has a hidden admin panel trigger (5 logo clicks) with password "unibite@123"
- Admin panel (ApprovalPanel) only handles coin subscription requests; does NOT handle owner account approvals
- Menu items use a generic food placeholder image for all items
- No visible Admin button on login page — admin access is hidden/obscure
- Password is "unibite@123" already but this is from previous version

## Requested Changes (Diff)

### Add
- Visible "Admin" button on the login page that opens the admin password gate
- Owner account approval section inside the Admin panel (ApprovalPanel) — list pending owners and allow approve/reject
- AI-generated realistic images for each menu item (Veg Burger, Masala Fries, Cold Coffee, Paneer Wrap) and both combos (Desi Feast, Veg Delight)
- New hero banner image for customer dashboard

### Modify
- Admin panel password changed to "admin@unibite" (from "unibite@123")
- ApprovalPanel: extend to show two tabs — "Owner Approvals" and "Coin Requests" — so both workflows are visible
- menuStore default images: replace food-placeholder.png URLs with the new AI-generated specific images per item
- combosStore default images: replace with combo-specific generated images
- Login page: add a clearly visible "Admin" button (below the login card or as a link) that opens the admin gate — do not remove the existing 5-click trigger

### Remove
- Nothing removed from functionality

## Implementation Plan
1. Update ADMIN_PASSWORD constant in Login.tsx to "admin@unibite"
2. Add a visible "Admin" button on the login page that triggers setShowAdminGate(true)
3. Extend ApprovalPanel to include owner account approvals: query authStore.getPendingOwners(), allow approve via authStore.approveOwner()
4. Add two-tab UI to ApprovalPanel: "Owner Approvals" tab and "Coin Requests" tab
5. Update menuStore DEFAULT_MENU image URLs to per-item AI-generated images
6. Update combosStore DEFAULT_COMBOS image URLs to combo-specific AI-generated images
7. Clear stale localStorage on first load so updated default images are reflected (version bump in storage key or conditional migration)
8. Verify TypeScript compiles without errors
