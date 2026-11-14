# QR Studio - Custom QR Code Generator

A fully functional and visually polished website for generating highly customizable QR codes. Built with Next.js, React, and Tailwind CSS.

## Features

### QR Code Customization
- **Body Shapes**: Square, rounded, dots, diamond, star, heart, hexagon, octagon, cross, classy, vertical/horizontal lines, and more
- **Eye Frame Shapes**: Square, rounded, circle, dotted, leaf, shield, diamond, cushion, hexagon
- **Eye Ball Shapes**: Square, rounded, circle, dot, diamond, star, heart, leaf, hexagon, cross

### Color Options
- Solid colors for body, eye frame, and eye ball
- Gradient support (linear and radial) with customizable direction
- Background color with transparency option
- Color picker with preset colors and custom hex input

### Settings
- Error correction levels (L, M, Q, H)
- Adjustable module size
- Configurable padding
- URL validation

### Export
- PNG export at multiple resolutions (512px, 1024px, 2048px, 4096px)
- SVG export for vector graphics
- High-quality rendering

### UI/UX
- Dark/Light mode toggle
- Responsive design
- Real-time preview
- Tabbed interface for organized controls

## Deployment on Render

### Prerequisites
- Node.js 18+ installed
- A Render account

### Steps to Deploy

1. **Push to GitHub**
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   \`\`\`

2. **Create a New Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - **Name**: qr-studio (or your preferred name)
     - **Environment**: Node
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Instance Type**: Free (or your preferred tier)

3. **Environment Variables** (if needed)
   - No environment variables are required for basic functionality

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application

### Alternative: Manual Deployment

1. **Build the project**
   \`\`\`bash
   npm install
   npm run build
   \`\`\`

2. **Start the production server**
   \`\`\`bash
   npm start
   \`\`\`

## Adding New Shapes

### Body Shapes

1. Open `lib/qr-shapes.ts`
2. Add your shape to the `BodyShape` type
3. Add the shape option to `bodyShapes` array
4. Implement the SVG path in `getBodyShapePath` function

Example:
\`\`\`typescript
// In BodyShape type
export type BodyShape = 
  | 'square'
  | 'your-new-shape'
  // ...

// In bodyShapes array
{ id: 'your-new-shape', name: 'Your New Shape', preview: 'M...' }

// In getBodyShapePath function
case 'your-new-shape':
  return `M${x},${y} ... Z`
\`\`\`

### Eye Frame and Eye Ball Shapes

Follow the same pattern for `EyeFrameShape` and `EyeBallShape` types.

## Modifying Tailwind Configuration

The project uses Tailwind CSS v4 with configuration in `app/globals.css`:

\`\`\`css
@theme inline {
  --font-sans: 'Geist', 'Geist Fallback';
  --font-mono: 'Geist Mono', 'Geist Mono Fallback';
  --color-primary: var(--primary);
  /* Add custom colors here */
}
\`\`\`

### Adding Custom Colors

1. Define CSS variables in `:root` and `.dark` selectors
2. Map them in `@theme inline` block
3. Use with Tailwind classes: `bg-your-color`, `text-your-color`

## Adding Color Presets

Edit `components/color-picker.tsx`:

\`\`\`typescript
const presetColors = [
  "#000000", // Add your colors here
  "#your-color",
  // ...
]
\`\`\`

## Project Structure

\`\`\`
├── app/
│   ├── globals.css      # Tailwind configuration and theme
│   ├── layout.tsx       # Root layout with metadata
│   └── page.tsx         # Main page component
├── components/
│   ├── color-picker.tsx     # Color selection component
│   ├── control-panel.tsx    # Main controls interface
│   ├── gradient-editor.tsx  # Gradient configuration
│   ├── header.tsx           # Site header with dark mode toggle
│   ├── qr-code-generator.tsx # Main generator component
│   ├── qr-preview.tsx       # QR code preview and export
│   └── shape-selector.tsx   # Shape selection grid
├── lib/
│   ├── qr-generator.ts  # QR code generation algorithm
│   ├── qr-renderer.ts   # SVG and Canvas rendering
│   ├── qr-shapes.ts     # Shape definitions and paths
│   └── utils.ts         # Utility functions
└── README.md
\`\`\`

## License

MIT License - feel free to use this project for personal or commercial purposes.
