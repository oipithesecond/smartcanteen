# Frontend Design Governance & Engineering Rules

## 1. Google Stitch Visual Tokens & Aesthetics
- **Canvas Backdrop:** High-clarity neutral canvas (`bg-[#F8FAFC]` or `bg-slate-50`). Avoid dark mud tones.
- **Brand Primary Accent:** Emerald Forest (`#059669` / Tailwind `emerald-600` to `emerald-700`), representing sustainable culinary management and organic food waste avoidance.
- **Card Geometry:** All containers must use rounded corners (`rounded-2xl` or `rounded-3xl`) with thin border lines (`border-slate-200/80`) and soft elevation shadows (`shadow-xs` to `shadow-md`).
- **Floating Rail Navigation:** Left navbar must remain a floating white pill sidebar (`w-20`, `rounded-3xl`, `backdrop-blur-md`) with clear active indicators and popovers.

---

## 2. Security & Role Authorization Rules
- **No Client-Side Role Spoofing:** When transitioning personas via the RBAC selector, `DashboardContext` must strictly synchronize `selectedDistrict` to the manager's assigned branch.
- **Financial Parameter Protection:** Cost per portion (`cost_per_portion`) and penalty margins (`shortage_penalty`) must be treated as authoritative financial inputs; UI components must never allow unauthenticated tampering.
- **State Entry Guard:** All state dispatchers must validate user privileges before executing district switches or operational adjustments.

---

## 3. Low-Literacy Kitchen Floor UI Standards
- **Color-Coded Visual Cues:** Never present numbers without accompanying color indicators:
  - **Green (< 8%):** Safe / Stable / High Efficiency.
  - **Amber (8% – 15%):** Volatile / Weather Shift / Action Needed.
  - **Red (> 15%):** Critical Waste / Imbalance / Expiry Imminent.
- **Dual Units Mandatory:** Every food preparation metric must display both **portion units** AND **physical kitchen batch mass** (e.g., *"495 portions (148.5 kg / 10 Handis)"*).
- **Culinary Action Clarity:** Shelf-life warnings must provide direct cooking recommendations (e.g., *"Re-purpose into Evening Punugulu"*) rather than vague numerical decay indexes.

---

## 4. Recharts & Responsive Layout Safety
- **Mandatory `min-w-0` Class:** Every parent container wrapping a Recharts `<ResponsiveContainer>` must include `min-w-0` to prevent CSS flexbox container overflow and infinite resize loops adjacent to the floating navigation rail.
- **Aspect Ratio Boundaries:** All charts must provide explicit `height` properties (e.g., `h-[280px]` or `h-[300px]`) to prevent layout shift during lazy rendering.

---

## 5. Code Hygiene & Maintenance
- **No Global Mutations:** Never mutate `window` objects, DOM elements, or context state directly outside of designated setters.
- **Zero Secrets / Tokens:** Never hardcode API keys, credentials, or private internal URLs in client-side code.
- **Clean Linting Standard:** All React components must pass `oxlint` and Vite production compilation with zero errors or unhandled exceptions.
