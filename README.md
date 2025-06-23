# SVG Color Editor 🎨

Ein leistungsstarker, webbasierter SVG-Editor, der es ermöglicht, SVG-Dateien zu laden, zu bearbeiten und herunterzuladen. Entwickelt mit Next.js, TypeScript und Tailwind CSS.

![SVG Editor Preview](public/preview.png)

## ✨ Funktionalitäten

### 🎯 Kern-Features

- **📁 Datei-Upload**: Drag & Drop oder Klick-Upload für SVG-Dateien
- **🖱️ Element-Auswahl**: Klicke auf beliebige SVG-Elemente zur Bearbeitung
- **🌲 Element-Struktur**: Hierarchische Darstellung aller SVG-Elemente
- **📱 Responsive Design**: Funktioniert auf Desktop und mobilen Geräten

### 🎨 Farb-Editor

- **🎨 Fill Color**: Bearbeitung der Füllfarbe von SVG-Elementen
- **🖊️ Stroke Color**: Anpassung der Umrandungsfarbe
- **📏 Stroke Width**: Einstellung der Linienstärke (0-50px mit Slider und Zahleneingabe)
- **🌈 Gradient Support**:
  - Lineare und radiale Gradienten
  - Anpassbare Start- und Endfarben
  - Gradient-Winkel für lineare Gradienten
  - Separate Gradient-Modi für Fill und Stroke

### 👁️ Sichtbarkeits-Kontrolle

- **👁️ Element Visibility**: Ein-/Ausblenden einzelner Elemente
- **📁 Group Visibility**: Steuerung ganzer Elementgruppen
- **🔍 Visual Feedback**: Sofortige Vorschau der Änderungen

### 🔍 Zoom & Navigation

- **🔍 Zoom In/Out**: Präzise Betrachtung von Details
- **🔄 Reset Transform**: Zurücksetzen der Ansicht
- **📱 Pan & Pinch**: Touch-Unterstützung für mobile Geräte

### 📥 Export-Funktionen

- **📄 SVG Download**: Export als bearbeitete SVG-Datei
- **🖼️ PNG Export**: Konvertierung und Download als PNG-Bild
- **🧹 Clean Export**: Automatische Entfernung von Editor-Artefakten

### 🖥️ Benutzeroberfläche

- **📱 Mobile Sidebar**: Optimierte Bedienung für Smartphones
- **⚡ Real-time Preview**: Sofortige Vorschau aller Änderungen
- **🎯 Element Selection**: Visuelle Hervorhebung ausgewählter Elemente
- **🔄 Refresh Function**: Aktualisierung der Element-Struktur

## 🚀 Getting Started

### Voraussetzungen

- Node.js 18+
- npm, yarn, pnpm oder bun

### Installation

1. **Repository klonen**:

```bash
git clone <repository-url>
cd svg-color-editor
```

2. **Dependencies installieren**:

```bash
npm install
# oder
yarn install
# oder
pnpm install
# oder
bun install
```

3. **Development Server starten**:

```bash
npm run dev
# oder
yarn dev
# oder
pnpm dev
# oder
bun dev
```

4. **Browser öffnen**: [http://localhost:3000](http://localhost:3000)

## 🛠️ Technologie-Stack

- **Frontend Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Sprache**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Zoom/Pan**: [react-zoom-pan-pinch](https://github.com/prc5/react-zoom-pan-pinch)

## 📁 Projekt-Struktur

```
svg-color-editor/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Haupt-Editor-Seite
│   ├── layout.tsx         # Root Layout
│   └── globals.css        # Globale Styles
├── components/            # React Komponenten
│   ├── ui/               # Basis UI Komponenten
│   ├── ColorPicker.tsx   # Farbauswahl-Komponente
│   ├── ElementEditor.tsx # Element-Bearbeitungs-Panel
│   ├── ElementStructureTree.tsx # Baum-Ansicht
│   ├── FileUpload.tsx    # Datei-Upload-Komponente
│   ├── GradientEditor.tsx # Gradient-Editor
│   ├── SVGPreview.tsx    # SVG-Vorschau mit Zoom
│   ├── DownloadDropdown.tsx # Export-Dropdown
│   └── ZoomControls.tsx  # Zoom-Steuerung
├── hooks/                # Custom React Hooks
│   ├── useSVGEditor.ts   # Haupt-Editor-Logic
│   └── useElementUpdates.ts # Element-Update-Logic
├── lib/                  # Utility-Funktionen
│   └── utils.ts          # Allgemeine Hilfsfunktionen
└── public/               # Statische Dateien
```

## 🎯 Verwendung

### 1. SVG-Datei laden

- Ziehe eine SVG-Datei in den Upload-Bereich oder klicke zum Auswählen
- Die Datei wird sofort in der Vorschau angezeigt

### 2. Elemente bearbeiten

- Klicke auf beliebige Elemente in der SVG-Vorschau oder Element-Struktur
- Verwende das Editor-Panel zum Anpassen von:
  - Füllfarbe (solid oder Gradient)
  - Umrandungsfarbe (solid oder Gradient)
  - Linienstärke
  - Sichtbarkeit

### 3. Gradienten erstellen

- Aktiviere den Gradient-Modus für Fill oder Stroke
- Wähle zwischen linearen und radialen Gradienten
- Definiere Start- und Endfarben
- Stelle den Winkel für lineare Gradienten ein

### 4. Navigation

- Verwende die Zoom-Kontrollen für Details
- Pan durch Ziehen in der Vorschau
- Reset für Standardansicht

### 5. Export

- Klicke auf das Download-Dropdown
- Wähle zwischen SVG oder PNG Format
- Die Datei wird automatisch heruntergeladen

## 🔧 Build & Deployment

### Production Build erstellen:

```bash
npm run build
npm run start
```

### Linting:

```bash
npm run lint
```

## 🤝 Contributing

Beiträge sind willkommen! Bitte erstelle ein Issue oder Pull Request.

## 📄 Lizenz

Dieses Projekt steht unter der [MIT Lizenz](LICENSE).

## 🙏 Danksagungen

- [Next.js](https://nextjs.org/) für das Framework
- [Tailwind CSS](https://tailwindcss.com/) für das Styling
- [Radix UI](https://www.radix-ui.com/) für die UI-Komponenten
- [Lucide](https://lucide.dev/) für die Icons
