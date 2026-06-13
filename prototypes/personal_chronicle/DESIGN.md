---
name: Personal Chronicle
colors:
  surface: '#f8f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f6'
  surface-container: '#edeef0'
  surface-container-high: '#e7e8ea'
  surface-container-highest: '#e1e2e4'
  on-surface: '#191c1e'
  on-surface-variant: '#45464c'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#575e70'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#141b2b'
  on-primary-container: '#7d8497'
  inverse-primary: '#c0c6db'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#25005a'
  on-tertiary-container: '#9863ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce2f7'
  primary-fixed-dim: '#c0c6db'
  on-primary-fixed: '#141b2b'
  on-primary-fixed-variant: '#404758'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#eaddff'
  tertiary-fixed-dim: '#d2bbff'
  on-tertiary-fixed: '#25005a'
  on-tertiary-fixed-variant: '#5a00c6'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e1e2e4'
typography:
  headline-h1:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-h2:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  caption:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  card-padding: 16px
  section-gap: 24px
  container-max-width: 768px
  gutter: 16px
---

## Brand & Style
The design system is built for an intimate, reflective experience, moving away from corporate rigidity toward a "digital common-place book" aesthetic. It balances the utility of a chat interface with the permanence of a personal diary. 

The style is **Warm Minimalism**. It utilizes a soft neutral backdrop to make content-filled white cards feel like physical slips of paper. The interface emphasizes calm focus, using thin accent borders and generous whitespace to organize thoughts without visual noise. The emotional response should be one of clarity, privacy, and ease of expression.

## Colors
The palette is grounded in a soft gray background (`#f3f4f6`) to reduce eye strain. Color is used functionally rather than decoratively:
- **Primary (#111827):** Reserved for high-priority actions and structural elements.
- **Learned / Узнал (#2563eb):** A trust-evoking blue for new information.
- **Remembered / Вспомнил (#7c3aed):** A nostalgic purple for surfacing memories.
- **Todo / Сделать (#059669):** A focused green for actionable items.
- **Surface:** Pure white (#ffffff) is used exclusively for cards and interactive containers to provide maximum contrast against the background.

## Typography
This design system utilizes a systematic grotesque for maximum legibility. 
- **Hierarchy:** H1 is used for view titles, while H2 is reserved for section headers within the timeline.
- **Body:** The 15px base size provides a comfortable reading rhythm for long-form personal entries. 
- **Captions:** Used for metadata (timestamps, counts), consistently rendered in the muted text color.
- **Localization:** Typography must support Cyrillic characters with proper kerning, ensuring the "Inter" variable font is utilized for its superior Russian character set.

## Layout & Spacing
The system follows an **8px linear grid**. 
- **Structure:** Content is centered in a fixed-width container (768px) on desktop to mimic the feel of a handheld notebook and prevent line lengths from becoming too long.
- **Timeline Rhythm:** Vertical spacing between cards is 16px, while distinct day-breaks or thematic sections use a 24px gap.
- **Mobile:** Margins shrink to 16px. Cards should remain full-width or have minimal horizontal margins to maximize the writing area.

## Elevation & Depth
Depth is created through **Tonal Layering** and soft borders rather than heavy shadows.
- **Level 0 (Background):** `#f3f4f6` - The canvas.
- **Level 1 (Cards):** White surface with a 1px border (`#e5e7eb`). No shadow is required in a default state to maintain the minimal aesthetic.
- **Level 2 (Interactive/Hover):** A very subtle, diffused shadow (0 4px 12px rgba(0,0,0,0.05)) is applied when a card is hovered or an input is focused.
- **Separators:** 1px solid lines in `#e5e7eb` are used for internal card divisions.

## Shapes
The shape language is approachable and soft:
- **Cards:** 12px corner radius creates a friendly, modern container.
- **Buttons:** 10px corner radius distinguishes them slightly from the sharper card containers.
- **Badges/Toggles:** Full pill (999px) to signify they are discrete, draggable, or secondary metadata elements.
- **Input Fields:** 8px radius to maintain a clean, structured look.

## Components

**Category Badges**
Pill-shaped containers with a 10% opacity background of the category color and a solid text label.
- *Learned:* Blue text, light blue background.
- *Remembered:* Purple text, light purple background.
- *Todo:* Green text, light green background.

**Entry Card**
A white card with a 12px radius. It features a 4px solid left-border accent corresponding to the entry category (Blue, Purple, or Green). If no category is selected, the border remains a neutral light gray.

**Chat Message Bubble**
For internal reflections or quick notes. Background `#e5e7eb`, 12px radius, aligned to the left. No accent border.

**Structured Textarea Composer**
A clean white container with a minimum height of 8 rows. No visible border until focused (then primary color 1px). Subtle placeholder text: "Что у вас на уме?"

**Vote Button (Полезно)**
An outline pill button. 1px border `#d1d5db`, Inter 13px Semi-bold. On active state, the background fills with a very light gray.

**Public/Private Toggle**
A pill-shaped switcher. Icons (🔒/🌐) are accompanied by text. The active state uses a dark `#111827` background with white text/icon.

**Primary & Secondary Buttons**
- *Primary:* Background `#111827`, Text #ffffff, 10px radius.
- *Secondary:* Background #ffffff, 1px border `#d1d5db`, Text `#1f2937`.

**Day Section Header**
Centered or left-aligned text using H2 style. Text is lowercase for an informal, diary-like feel (e.g., "понедельник, 29 июня").