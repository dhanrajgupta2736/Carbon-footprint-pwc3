# CarbonWise – Carbon Footprint Awareness Platform

CarbonWise is a client-side React and Vite-powered application designed to track, analyze, and help users reduce their personal carbon footprints. By utilizing local storage persistence and IPCC/DEFRA conversion factors, it computes real-time metrics across transport, home energy, and lifestyle verticals.

---

## 🌟 Key Features

1. **Precision Calculators**: Real-time estimations for Transport commute (including vehicle types and flight hours), Home Energy (electricity consumption and household split adjustments), and Lifestyle (dietary footprints and recycling practices).
2. **Context-Aware Smart Assistant**: An interactive side panel that evaluates your combined, multi-vertical profile to provide highly specific carbon-saving correlation strategies.
3. **Dynamic Action Plan**: A gamified checklist showing eligible reduction opportunities, visually updating your projected carbon reduction progress ring against your active total emissions.
4. **Interactive Google Services**:
   - **Google Maps Alternatives**: Centered exploration map listing nearby EV charging hubs and transit options.
   - **Google Translate Widget**: Real-time translation to read localized advice.
   - **Google Calendar Reminders**: Instantly schedule repeating reminder loops directly from individual action cards.

---

## 🛠️ Recent Architecture Updates & Code Quality Refactoring

Recently, the codebase was audited and refactored to conform to high-quality industry patterns:

- **Absolute Separation of Concerns**: Inline UI layers were separated out into dedicated components:
  - `Header.jsx`: Manages header layout, simulator toggles, and state resets.
  - `TabBar.jsx`: Modularizes interactive tab selection.
  - `SkipLink.jsx`: Provides accessible keyboard navigation.
  - `FootprintBadge.jsx`: Standardized badge highlighting impact categories.
- **Reusable Form Controls**: Reusable widgets under `src/components/ui/` (`NumberField.jsx`, `RangeInput.jsx`, `FieldError.jsx`) eliminated form-logic duplication across calculator tabs.
- **Custom React Hooks**:
  - `useCarbonData.js`: Central state machine deriving calculations, generating plans, and handling local persistence.
  - `useGoogleAuth.js`: Encapsulates Google GSI client scripts, profile decoding, simulation actions, and session local storage.
- **Polished Visual Empty States**: Added clean, responsive SVG illustrations in `ActionPlan.jsx` and `EmissionsChart.jsx` to guide users prior to data entry.
- **Strict Lint Compliance**: Cleaned all unused imports and variables, satisfying a strict zero-warning policy on ESLint configs.

---

## 🧪 Testing Coverage

The application incorporates a testing framework validating both pure math utilities and user interactions:
- **Unit Checks**: Covering conversion formulas, boundary conditions (such as extreme values and negative inputs), and helper parser exceptions (`src/tests/carbonCalculations.test.js`).
- **Integration Flows**: Utilizing `@testing-library/react` and `@testing-library/user-event` to simulate complete onboarding, calculator changes, tab routing, checking actions, and resetting calculator state (`src/tests/integration.test.jsx`).

---

## 🚀 Commands

### 1. Run Development Server
```bash
npm run dev
```

### 2. Execute Linter (Strict Zero-Warning Check)
```bash
npm run lint
```

### 3. Run Test Suite
```bash
npm run test
```

### 4. Build Production Assets (PWA & Service Workers)
```bash
npm run build
```
