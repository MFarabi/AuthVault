<p align="center">
  <img src="public/icon-128.png" alt="AuthVault" width="80" height="80" />
</p>

<h1 align="center">AuthVault</h1>

<p align="center">
  A secure, modern 2FA authenticator Chrome extension with a beautiful UI.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-blue?logo=googlechrome&logoColor=white" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/Built%20with-Nuxt%204-00DC82?logo=nuxt&logoColor=white" alt="Nuxt 4" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
</p>

---

## Features

- **TOTP Code Generation** — Generate time-based one-time passwords (RFC 6238) with live countdown timer
- **One-Click Copy** — Click any account to instantly copy the current code
- **Color-Coded Accounts** — Assign custom gradient colors to each account for quick identification
- **Search** — Quickly filter accounts by name or label
- **Import & Export**
  - JSON file import/export
  - Google Authenticator URI format (`otpauth://totp/...`)
  - QR code export for transferring to mobile authenticator apps
- **Dark Mode** — Automatic dark/light theme with manual toggle
- **Offline** — Works entirely offline with no external requests
- **Privacy First** — All data stored locally in your browser. Nothing is sent to any server.

## Installation

### From Source

1. Clone the repository:
   ```bash
   git clone https://github.com/MFarabi/AuthVault.git
   cd AuthVault
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the extension:
   ```bash
   pnpm build:extension
   ```

4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable **Developer mode** (top right)
   - Click **Load unpacked**
   - Select the `dist` folder

## Development

Start the development server to preview in a browser:

```bash
pnpm dev
```

Then open `http://localhost:3000`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Nuxt 4](https://nuxt.com) (SPA mode) |
| UI | [Nuxt UI](https://ui.nuxt.com) + [Tailwind CSS 4](https://tailwindcss.com) |
| OTP | [otpauth](https://github.com/nicolo-ribaudo/otpauth) |
| QR Codes | [qrcode](https://github.com/soldair/node-qrcode) |
| Icons | [Lucide](https://lucide.dev) + [Simple Icons](https://simpleicons.org) |
| Extension | Chrome Manifest V3 |

## Project Structure

```
app/
├── components/
│   ├── AccountCard.vue       # Account display with code, timer, copy
│   ├── AddAccountModal.vue   # Add new account form
│   ├── ColorPicker.vue       # Color selection grid
│   ├── CountdownRing.vue     # Circular countdown timer
│   └── QrCode.vue            # QR code renderer
├── composables/
│   └── useAuthenticator.ts   # Core logic: TOTP, storage, import/export
├── pages/
│   ├── index.vue             # Main account list
│   └── settings.vue          # Import, export, donations
└── app.vue                   # Root layout with header
public/
├── manifest.json             # Chrome extension manifest
└── icon-*.png                # Extension icons
scripts/
└── fix-extension.cjs         # Post-build script for Chrome compatibility
```

## How It Works

AuthVault generates TOTP codes using the standard RFC 6238 algorithm — the same used by Google Authenticator, Authy, and other authenticator apps. Your secrets are stored in `localStorage` within the extension's sandboxed context and never leave your browser.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

[MIT](LICENSE)
