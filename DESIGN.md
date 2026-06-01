---
name: Rocket Lease
description: Marketplace peer-to-peer de alquiler de autos, mobile-first y dark-premium.
colors:
  brand-500: "#7C3AED"
  brand-600: "#6D28D9"
  brand-400: "#9b6bf4"
  brand-300: "#b898f8"
  brand-200: "#d8bfff"
  brand-100: "#ede0ff"
  brand-50:  "#f5f0ff"
  brand-700: "#5521b5"
  brand-800: "#3d1a8a"
  brand-900: "#290f5c"
  brand-950: "#0D0D1A"
  client:    "#06B6D4"
  owner:     "#F59E0B"
  surface-0: "#0D0D1A"
  surface-1: "#13131F"
  surface-2: "#1A1A2E"
  surface-3: "#222238"
  surface-4: "#2C2C48"
  text-primary:   "#FFFFFF"
  text-secondary: "#A0A0B8"
  text-muted:     "#8888A0"
  success: "#10B981"
  warning: "#F59E0B"
  danger:  "#EF4444"
  info:    "#06B6D4"
typography:
  display:
    fontFamily: "Poppins, system-ui, -apple-system, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  sm:   "0.375rem"
  md:   "0.75rem"
  lg:   "1rem"
  xl:   "1.25rem"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.brand-500}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    padding: "0 1.5rem"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "{colors.brand-600}"
  button-secondary:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "0 1.5rem"
    height: "3rem"
  button-ghost:
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: "0 1.5rem"
    height: "3rem"
  card:
    backgroundColor: "{colors.surface-1}"
    rounded: "{rounded.md}"
    padding: "1.25rem"
  input:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "0 1rem"
    height: "3rem"
  badge-client:
    backgroundColor: "{colors.client}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
  badge-owner:
    backgroundColor: "{colors.owner}"
    textColor: "{colors.surface-0}"
    rounded: "{rounded.full}"
---

# Design System: Rocket Lease

## 1. Overview

**Creative North Star: "Noche violeta confiable"**

Rocket Lease es un marketplace peer-to-peer de alquiler de autos. El usuario está casi siempre en el celular, con poca paciencia, decidiendo entre desconocidos. El sistema visual responde a eso siendo **dark-first sin abaratar**: un negro tintado de violeta (#0D0D1A) carga la mayoría de la superficie, el violeta de marca (#7C3AED) marca lo accionable, y la calidez vive en el copy y las fotos del auto, no en la paleta. Es un fondo que no compite con la foto de un Toyota usado.

El sistema rechaza explícitamente tres familias estéticas: el SaaS-gradient con gradient text y eyebrows uppercase ("AI-slop genérico"); el navy-frío bancario que convierte un peer-to-peer en una transacción corporativa; y el clon claro de Airbnb con fondo blanco cálido foto-first. Tomamos los patrones de Airbnb (chrome contextual, switch de rol, foto protagonista), no su paleta. La jerarquía se construye por luminosidad (cinco superficies en escala de gris-violeta) y peso tipográfico, nunca por anidar contenedores.

**Key Characteristics:**
- Dark-first con cinco niveles de superficie por luminosidad (`surface-0` a `surface-4`), no por color.
- Un violeta de marca + dos roles diferenciados (cian para conductor, ámbar para rentador). Sin un cuarto color.
- Una sola familia: Poppins, en pesos 400/600/700. Sin pares.
- Pill (`9999px`) para CTAs primarios y badges; `12px` para inputs/cards de UI; `24px` (`rounded-3xl`) para cards image-led del catálogo (la foto domina, el rounding suave la enmarca).
- Motion con ease-out fuerte (`cubic-bezier(0.23, 1, 0.32, 1)`) y 150-300ms. `prefers-reduced-motion` es obligatorio.
- Touch targets ≥44px. Cualquier interactivo con `active:scale-[0.97]`.

## 2. Colors

Paleta dark-first construida sobre un base near-black tintado de violeta (chroma hacia la marca, no warmth-by-default). Un solo accent saturado carga lo accionable; los semánticos quedan reservados para estado real, no para decoración.

### Primary
- **Violeta de marca** (#7C3AED): CTA primario, links, ring de focus, pin seleccionado en mapa, indicadores de selección activa. Aparece en ≤10% de cualquier pantalla.
- **Violeta hover** (#6D28D9): único estado hover del primario; mantiene la misma identidad.
- **Violeta tints 100-400** (#ede0ff → #9b6bf4): para chips de estado activo y backgrounds tonales (raros). Las versiones 700-900 quedan para casos de profundidad explícita.

### Secondary (role accents)
- **Cian conductor** (#06B6D4): identidad del rol "conductor" (alquila autos). Badges, indicadores de rol, fondo `client-subtle` (`rgba(6,182,212,0.12)`) para chips de filtro activos.
- **Ámbar rentador** (#F59E0B): identidad del rol "rentador" (publica autos). Mismo patrón con `owner-subtle`. Aparece en flujos de hosting (publicar auto, ver reservas como dueño).

### Neutral
- **Surface 0** (#0D0D1A): fondo de pantalla. Casi todo lo que ve el usuario.
- **Surface 1** (#13131F): cards, inputs, drawers, header del mapa. El primer step de elevación.
- **Surface 2** (#1A1A2E): inputs sobre superficies elevadas (input dentro de un drawer), bottom sheets.
- **Surface 3** (#222238): elementos elevados secundarios (pill del handle del drawer, botón "Mapa" flotante).
- **Surface 4** (#2C2C48): scrollbar thumb. Caso extremo, prácticamente único uso.
- **Text primary** (#FFFFFF): titulares, valores, números. Contraste 17.6:1 sobre surface-0.
- **Text secondary** (#A0A0B8): cuerpo, labels, valores secundarios. Contraste 7.4:1 sobre surface-0.
- **Text muted** (#8888A0): metadata, hints, placeholders. Contraste 5.0:1 — por encima de WCAG AA pero el techo del ramp; no bajar más.

### Semantic
- **Success** (#10B981), **Warning** (#F59E0B), **Danger** (#EF4444), **Info** (#06B6D4): cada uno con `-bg` al 12% para fondos tonales. Reservados para estado real (verificación, alerta de pago, error de validación, info contextual). Nunca como acento decorativo.

### Named Rules
**The One Accent Rule.** El violeta de marca carga lo accionable. No hay un segundo "violeta más suave" ni un "azul para destacar otra cosa". Si una pantalla necesita tres jerarquías, dos van con peso/tamaño tipográfico; el violeta es la tercera.

**The Role-Color Locked Rule.** Cian = conductor. Ámbar = rentador. Ese mapeo no se rompe ni "para variar". Un badge cian en una pantalla de rentador es un bug.

**The No-Gray-On-Color Rule.** Texto gris sobre fondo coloreado se lee como apagado. Sobre `client-subtle` o `owner-subtle`, el texto va en el color del fondo en peso alto, no en `text-muted`.

## 3. Typography

**Display + Body Font:** Poppins (system-ui, sans-serif fallback)
**Mono:** sistema (no hay use case que lo justifique todavía)

**Character:** Una sola familia geometric-humanist con tres pesos (400, 600, 700). La jerarquía sale de la combinación scale + peso, no de pares de fuentes. Poppins en 700 con tracking ajustado (`-0.02em`) tiene suficiente peso para liderar una pantalla; en 400 a 0.875rem es legible en denso.

### Hierarchy

- **Display** (700, 1.875rem, line-height 1.1, tracking -0.02em): titulares de modal grande, hero de páginas inmersivas (detalle de auto). Raro en mobile; reservado.
- **Headline** (700, 1.5rem, line-height 1.2, tracking -0.02em): titulares de sección (ej. "Tus reservas"), header de drawers expandidos.
- **Title** (700, 1.125rem, line-height 1.3, tracking -0.01em): nombre de la card (marca + modelo + año), title de un step en un flow.
- **Body** (400, 0.875rem, line-height 1.5): párrafos, descripciones, captions. Las cards las usan en peso 600 cuando son nombres (jerarquía dentro de body size).
- **Label** (600, 0.75rem, line-height 1.3): metadata, badges, contadores. Algunos badges usan uppercase con tracking generoso; el resto sentence-case.

### Named Rules

**The One Family Rule.** Toda la app es Poppins. Si un componente parece pedir un pair (display serif + body sans), está pidiendo otra cosa: peso o jerarquía.

**The No Body Caps Rule.** Uppercase reservado para labels ≤4 palabras y badges. Sentencias en caps son ilegibles a body size.

**The Tight Heading Rule.** Todos los `h1-h6` traen `letter-spacing: -0.02em` por default. No bajar de `-0.04em`; las letras se tocan.

## 4. Elevation

El sistema usa **elevation tonal por luminosidad**, no shadows ambientales pesadas. La diferencia entre `surface-0` (fondo) y `surface-1` (card) es suficiente para "elevar" sin un shadow de 24px de blur. Los shadows existen pero juegan dos roles muy puntuales: definición de borde en superficies grandes (drawer, modal) y feedback de interacción (active state). No decoración.

### Shadow Vocabulary

- **Card** (`0 2px 12px rgba(0,0,0,0.30)`): cards de auto, inputs flotantes, pill de búsqueda. Sutil; complementa el delta tonal entre `surface-0` y `surface-1`.
- **Elevated** (`0 8px 32px rgba(0,0,0,0.50)`): modales, bottom sheets, FAB de "Mapa", botones flotantes sobre el mapa. Reemplaza al border en superficies que se levantan del fondo.
- **Brand** (`0 8px 24px rgba(124,58,237,0.35)`): glow violeta. **Solo en FAB primarios o tooltips de marca**. Nunca en cards ni en hover decorativo.
- **Premium pill** (`0 4px 20px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)`): pill de búsqueda y card de auto. Combina drop shadow profundo (visible en dark mode) con inset highlight superior (efecto glass).

### Named Rules

**The Tonal Elevation Rule.** El primer recurso para elevar algo es subir un step de superficie (`surface-0` → `surface-1`). El shadow se suma cuando el delta tonal no alcanza o cuando el elemento es flotante. Nunca al revés.

**The No Ghost-Card Rule.** Borde sólido **o** shadow blur grande, nunca los dos juntos en la misma card. El patrón "1px border + 24px blur shadow" es un tell de SaaS genérico.

**The Brand Glow Sparing Rule.** El glow violeta (`shadow-brand`) aparece como máximo dos veces en una pantalla. Más de eso es decoración.

## 5. Components

### Buttons
- **Shape:** pill (`9999px`) para primario y outline; `0.75rem` para secondary, ghost, destructive.
- **Primary:** `bg-brand-500 text-white shadow-md`, hover `bg-brand-600`. `h-12 px-6` default; `h-9` para sm; `h-14` para lg.
- **Secondary:** `bg-surface-2 text-text-primary border border-white/8`, hover `bg-surface-3`.
- **Ghost:** sin background ni borde; hover `bg-surface-2 text-text-primary`. Para acciones secundarias en headers.
- **Destructive:** `bg-danger/15 text-danger border border-danger/30`. Tinted, no full-bleed rojo (eso es para alertas).
- **Active:** todos con `active:scale-[0.97]`. Feedback táctil obligatorio en mobile.
- **Focus:** `ring-2 ring-brand-500 ring-offset-2 ring-offset-surface-0`. Visible sobre dark.

### Pill de búsqueda
- **Shape:** pill (`9999px`), `h-11`, padding `px-5`.
- **Background:** `surface-1`, sin border, con el **premium pill shadow** (drop + inset highlight). Es el patrón visual de "elemento confiable, flotante, tappeable" que se usa también en cards del catálogo.

### Cards (catálogo)
- **Shape:** imagen `rounded-3xl` (`24px`), sin border en la imagen. Caption debajo sin contenedor. El radius generoso enmarca la foto y le da el feeling premium; aplica solo a cards image-led (no a cards de UI tipo settings, esas siguen siendo `rounded-xl`).
- **Foto:** `aspect-[4/3]`, `bg-surface-2` (placeholder), premium pill shadow.
- **Badges sobre foto:** `bg-black/70 backdrop-blur-sm`, `h-7 px-2.5 rounded-full`, label en blanco. Promoted lleva ícono de Sparkle ámbar.
- **Auto-aceptar:** badge ámbar (`bg-owner/90 text-black`) bottom-left, con ícono Lightning.
- **Caption:** título en `font-semibold text-sm`, precio alineado a la derecha en `font-semibold text-sm`. Specs en `text-xs text-text-muted` separados por `·` con color `text-white/15`.
- **Favorito:** absolute top-right en `z-10`. Tap target ≥44px.

### Inputs
- **Shape:** `rounded-xl` (`12px`), `h-12`, padding `px-4`.
- **Background:** `surface-2`, border `white/8`.
- **Focus:** `border-brand-600/60 ring-2 ring-brand-600/20`. Glow tenue del violeta.
- **Error:** `border-danger/50`, mensaje debajo en `text-xs text-danger`.
- **Placeholder:** `text-text-muted`.
- **Icon slots:** left/right con `text-text-muted` y `pl-10`/`pr-10` automático.

### Bottom Sheet (drawer)
- **Shape:** `rounded-t-3xl` (`24px` solo top), `bg-surface-1`, `border-t border-white/8`, `shadow-2xl`.
- **Handle:** `h-1.5 w-12 rounded-full bg-surface-3`, centrado, `mt-3`.
- **Snap points:** trío peek (`80px`), mid (`0.6`), full (`1`). Peek deja visible el handle + título; mid muestra ~6 items; full ocupa toda la pantalla.
- **Animación:** ease-out fuerte `cubic-bezier(0.32, 0.72, 0, 1)` 500ms (curva de Vaul, alineada con nuestro ease-out).
- **Bottom nav:** se oculta cuando el drawer está activo (via `useHideNav`), no se superpone.

### Navigation (bottom)
- **Shape:** `fixed bottom-0`, `bg-rgba(19,19,31,0.94) backdrop-blur(20px)`, `border-top white/6`.
- **Tab activa:** ícono filled, color violeta, label en `text-brand-500`.
- **Tab inactiva:** ícono regular, `text-text-muted`.
- **Safe area:** `paddingBottom: max(env(safe-area-inset-bottom), 8px)`.

### Modal overlay (búsqueda)
- **Backdrop:** `bg-black/30 backdrop-blur-xl`. Tap para cerrar.
- **Cards:** acordeón vertical de dos cards (Dónde + Cuándo). La activa expandida, la otra colapsada como pill.
- **Pointer events:** el wrapper del body es `pointer-events-none`; solo las cards y el footer son `pointer-events-auto` para que clicks en el espacio vacío pasen al backdrop.

### Map (búsqueda)
- **Pin precio:** pill `bg-surface-0 text-text-primary` por default; seleccionado `bg-text-primary text-surface-0 scale-110`.
- **Location button:** circle 40px, top-right, `bg-surface-0 shadow-lg border-white/8`. Filled cuando hay geolocalización concedida.

## 6. Do's and Don'ts

### Do:
- **Do** usar `surface-0` como fondo de página y `surface-1` para cards/inputs. La elevación tonal es el primer recurso, antes que shadow.
- **Do** mantener `text-primary` (blanco puro #FFFFFF) sobre `surface-0` para titulares; `text-secondary` (#A0A0B8) para cuerpo; `text-muted` (#8888A0) solo para metadata.
- **Do** poner `active:scale-[0.97]` en cada interactivo. Es el feedback táctil del sistema.
- **Do** usar Vaul para bottom sheets con snap points en string-px (`'80px'`), nunca rem (no lo parsea).
- **Do** ocultar la bottom nav cuando un drawer fullscreen está activo (via `useHideNav(key, hidden)`).
- **Do** importar componentes de `@/ui` (Button, Input, Card) antes de inventar uno nuevo. Si falta una variante, agregarla al `cva` del componente.
- **Do** respetar `prefers-reduced-motion`: el helper en `globals.css` ya neutraliza duraciones, pero si agregás una animación custom, asegurate de que tenga fallback estático.
- **Do** mantener los pines de precio en mapa como pill de fondo claro sobre dark. El contraste contra la foto satelital es lo que los hace legibles.

### Don't:
- **Don't** usar gradient text (`background-clip: text` + gradient). Es la primera bandera de AI-slop SaaS. Esta app es dark-premium, no "AI tool".
- **Don't** poner borders uppercase tracked como eyebrow ("ABOUT", "FILTROS", "RESULTADOS") arriba de cada sección. Ese patrón está prohibido.
- **Don't** anidar cards. Un auto card dentro de un panel card dentro de un sheet card está roto. Aplanar.
- **Don't** crear un cuarto color de identidad. Si una nueva feature "necesita" un verde menta o un rosa, está mal escópica. Reusar violeta-cian-ámbar + semánticos.
- **Don't** customizar scrollbars con colores nuevos. El default ya es `surface-4` thumb / brand on hover, 4px. No tocar.
- **Don't** redondear cards de UI (settings, panel, dashboard) con `rounded-3xl` o `rounded-2xl`. Tope `rounded-xl` (`12px`) ahí. Las cards image-led del catálogo son la excepción documentada: `rounded-3xl` (`24px`) para enmarcar la foto. Pills (`9999px`) solo para CTAs y badges.
- **Don't** combinar `border: 1px solid X` con `box-shadow` de blur ≥16px en la misma card. Es el "ghost card" tell. Elegir uno.
- **Don't** poner el accent violeta en hover de cualquier interactivo. El violeta es para state activo/seleccionado/CTA, no para hint-of-interactivity.
- **Don't** clonar el look claro de Airbnb (fondo blanco cálido, foto-first). Tomamos sus patrones de UX (chrome contextual, switch de rol), no su paleta.
- **Don't** usar `lucide-react` en componentes nuevos. La librería estándar es `@phosphor-icons/react`. (Algunos legacy usan lucide; reemplazar oportunísticamente, no en masa.)
- **Don't** poner texto en inglés visible al usuario. Toda string va en `src/i18n/es.ts`. La app es español rioplatense.
