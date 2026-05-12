# Rocket Lease — Brand Guidelines

Documento de referencia para la implementación de UX/UI del frontend.
Toda decisión visual debe poder trazarse a estos lineamientos.

---

## 1. Identidad de Marca

### Arquetipo
**Explorador + Héroe.** Velocidad, ambición, confianza, movilidad sin límites.
El nombre _Rocket_ ancla la identidad: audaz, hacia adelante, sin frenos.

### Personalidad
- Audaz pero confiable
- Moderno sin ser frío
- Inclusivo sin ser genérico
- Premium sin ser inalcanzable

### Tono de Voz
**Directo + confiable con leve calidez.**

- Imperativo claro para acciones: _"Reservá"_, _"Publicá tu auto"_, _"Explorá la flota"_
- Lenguaje humano sin ser informal en mensajes de soporte y error
- Sin tecnicismos innecesarios para clientes finales
- Más preciso y orientado a datos para rentadoras

| Contexto | Ejemplo correcto | Evitar |
|---|---|---|
| CTA cliente | "Encontrá tu auto ideal" | "Buscar vehículos disponibles" |
| CTA rentadora | "Gestioná tu flota" | "Administrar inventario de vehículos" |
| Error | "Algo salió mal. Intentá de nuevo." | "Error 500: Internal Server Error" |
| Éxito | "¡Reserva confirmada!" | "La operación se completó exitosamente" |

---

## 2. Sistema de Color

### Paleta Base

| Token | Hex | Uso |
|---|---|---|
| `--color-bg-base` | `#0D0D1A` | Fondo principal (dark mode) |
| `--color-bg-raised` | `#13131F` | Cards, inputs (un nivel sobre base) |
| `--color-bg-overlay` | `#1A1A2E` | Modales, bottom sheets (dos niveles) |
| `--color-text-primary` | `#FFFFFF` | Texto principal |
| `--color-text-secondary` | `#A0A0B8` | Texto secundario, placeholders |
| `--color-text-disabled` | `#4A4A62` | Estados deshabilitados |
| `--color-border-subtle` | `rgba(255,255,255,0.08)` | Bordes de cards en dark mode |

### Color de Marca

| Token | Hex | Uso |
|---|---|---|
| `--color-brand` | `#7C3AED` | Color primario de marca |
| `--color-brand-hover` | `#6D28D9` | Hover state del primario |
| `--color-brand-subtle` | `rgba(124,58,237,0.15)` | Fondos con tinte de marca |
| `--color-shadow-brand` | `rgba(124,58,237,0.35)` | Sombra en elementos flotantes |

### Colores por Rol

El violeta unifica la marca. Cada rol tiene su propio acento para diferenciación visual.

| Rol | Token | Hex | Uso |
|---|---|---|---|
| Clientes | `--color-client` | `#06B6D4` | Acentos, tabs activos, highlights en flujo cliente |
| Rentadoras | `--color-owner` | `#F59E0B` | Acentos, tabs activos, highlights en flujo rentadora |

### Colores Semánticos

| Token | Hex | Uso |
|---|---|---|
| `--color-success` | `#10B981` | Confirmaciones, reservas exitosas, estados OK |
| `--color-warning` | `#F59E0B` | Advertencias (comparte con color rentadora) |
| `--color-error` | `#EF4444` | Errores, cancelaciones, alertas destructivas |
| `--color-info` | `#06B6D4` | Información (comparte con color cliente) |

### Modo Claro (flujos funcionales)

Para pantallas de búsqueda avanzada, formularios largos y configuración se usa una base clara:

| Token | Hex |
|---|---|
| `--color-bg-base-light` | `#F8F8FC` |
| `--color-bg-raised-light` | `#FFFFFF` |
| `--color-text-primary-light` | `#0D0D1A` |
| `--color-text-secondary-light` | `#6B6B8A` |

---

## 3. Tipografía

**Fuente única: Poppins** (Google Fonts)

```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```css
font-family: 'Poppins', sans-serif;
```

### Escala

| Nivel | Tamaño | Peso | Token |
|---|---|---|---|
| Display | 32px | Bold 700 | `--text-display` |
| H1 | 24px | Bold 700 | `--text-h1` |
| H2 | 20px | SemiBold 600 | `--text-h2` |
| H3 | 16px | SemiBold 600 | `--text-h3` |
| Body | 14px | Regular 400 | `--text-body` |
| Caption | 12px | Medium 500 | `--text-caption` |

### Reglas
- Line height base: `1.5` para body, `1.2` para headings
- Letter spacing en Display/H1: `−0.02em`
- No usar pesos fuera de 400, 500, 600, 700
- No usar itálica como estilo de marca (solo para citas o énfasis puntual)

---

## 4. Logo

### Concepto
Símbolo geométrico abstracto: flecha apuntando 45° arriba-derecha con dos aletas simétricas en la base que evocan un cohete. Lee simultáneamente como flecha de dirección y cohete estilizado.

### Versión actual
`/logos-iteration/v4.png` — símbolo standalone (sin wordmark).

### Variantes pendientes de producir
- **Positivo** — símbolo violeta `#7C3AED` sobre fondo oscuro `#0D0D1A`
- **Negativo** — símbolo blanco sobre fondo violeta
- **Outline** — solo contorno, sin relleno
- **Monocromático oscuro** — para documentos e impresión
- **Con wordmark** — símbolo + "Rocket Lease" en Poppins Bold, layout horizontal

### Reglas de uso
- Respetar zona de exclusión: margen mínimo igual al ancho del símbolo en todos los lados
- No rotar, distorsionar ni recolorear el símbolo fuera de las variantes oficiales
- No agregar efectos (sombras, gradientes, strokes) sobre el logo

---

## 5. Componentes

### Border Radius

| Elemento | Valor | Token |
|---|---|---|
| Botones primarios | 9999px (píldora) | `--radius-pill` |
| Cards | 12px | `--radius-card` |
| Inputs | 12px | `--radius-input` |
| Badges / chips | 9999px | `--radius-pill` |
| Modales / bottom sheets | 20px (solo arriba) | `--radius-modal` |

### Espaciado — 8pt Grid

Toda medida de spacing debe ser múltiplo de 8 (o 4 para micro-espaciados).

```
4px   → micro (gap entre ícono y label)
8px   → xs
16px  → sm
24px  → md
32px  → lg
48px  → xl
64px  → 2xl
```

### Densidad por contexto
- **Flujo cliente** (búsqueda, detalle, reserva): aireado — padding generoso, pocas cards por pantalla, scroll respirable
- **Flujo rentadora** (dashboard, flota, métricas): balanceado — más información por pantalla, tablas más compactas

### Elevación (Dark Mode)

La elevación se comunica por luminosidad, no por sombras negras.

| Nivel | Fondo | Uso |
|---|---|---|
| Base | `#0D0D1A` | Pantalla principal |
| Raised (+1) | `#13131F` | Cards, inputs |
| Overlay (+2) | `#1A1A2E` | Modales, bottom sheets |
| Floating | `#13131F` + sombra `rgba(124,58,237,0.35)` | FAB, tooltips, dropdowns |

La sombra violeta se usa **solo** en elementos flotantes sobre la UI — nunca en cards estáticas.

---

## 6. Iconografía

**Librería: Phosphor Icons** para React

```bash
pnpm add @phosphor-icons/react
```

### Estados

| Estado | Estilo | Color |
|---|---|---|
| Reposo | Outlined | `--color-text-secondary` |
| Activo / seleccionado | Duotone | Color de rol + `--color-brand` |
| Deshabilitado | Outlined | `--color-text-disabled` |

### Duotone por rol
- **Cliente activo:** capa principal `#06B6D4`, capa secundaria `#7C3AED`
- **Rentadora activo:** capa principal `#F59E0B`, capa secundaria `#7C3AED`

### Tamaños estándar
- Navegación (tab bar): `24px`
- Inline con texto: `16px`
- Hero / empty states: `48px`
- Micro (badges): `12px`

---

## 7. Fotografía

### Estructura de card de vehículo
```
┌─────────────────────────┐
│                         │
│     FOTO DEL AUTO       │
│     (limpia, sin        │
│      overlay)           │
│                         │
├─────────────────────────┤
│  Nombre del vehículo    │
│  ★ 4.8  •  Desde $X/día │
│  [Badge transmisión]    │
└─────────────────────────┘
```

- Foto en la parte superior, sin overlay ni gradiente encima
- Card de información separada debajo, con fondo `--color-bg-raised`
- Aspect ratio de la foto: `16:9` o `4:3` — consistente en toda la app
- Placeholder mientras carga: skeleton con fondo `--color-bg-raised`

---

## 8. Animaciones

### Principio
**Pocas pero memorables.** Cada animación representa a la marca — no usar librerías de animación genéricas sin personalización.

### Transiciones de UI
- Duración estándar: `200ms` ease-out
- Navegación entre pantallas: `300ms` slide horizontal
- Modales y bottom sheets: `300ms` slide up + fade
- Fade genérico: `150ms`

### Lottie Animations (estados clave)
Usar **Lottie** para los momentos de mayor atención del usuario.
Todos los Lotties deben respetar la paleta de marca.

| Pantalla | Animación |
|---|---|
| Loader global | Cohete pequeño con trayectoria ascendente |
| Reserva confirmada | Ícono de éxito animado con confetti violeta/cian |
| Empty state (sin resultados) | Auto buscando en un mapa vacío |
| Empty state (sin flota) | Garaje vacío con flecha invitando a agregar |
| Onboarding | Secuencia de bienvenida con cohete y ciudad |
| Error de red | Señal perdida con animación de reconexión |

### Microinteracciones
- Botones: scale `0.97` en press, revert en release (`100ms`)
- Tab activo: transición de ícono outlined → duotone con fade `150ms`
- Cards: elevación sutil en hover/press — no en mobile (sin hover real)

---

## 9. Navegación

**Patrón: Bottom Tab Bar** diferenciado por rol.

### Cliente
| Tab | Ícono Phosphor | Label |
|---|---|---|
| Inicio | `House` | Inicio |
| Buscar | `MagnifyingGlass` | Buscar |
| Reservas | `CalendarCheck` | Reservas |
| Perfil | `User` | Perfil |

### Rentadora
| Tab | Ícono Phosphor | Label |
|---|---|---|
| Dashboard | `ChartBar` | Dashboard |
| Mi Flota | `Car` | Mi Flota |
| Reservas | `CalendarCheck` | Reservas |
| Métricas | `TrendUp` | Métricas |
| Perfil | `User` | Perfil |

### Reglas del Tab Bar
- Fondo: `--color-bg-overlay`
- Borde superior: `--color-border-subtle`
- Ícono activo: duotone con color del rol correspondiente
- Label activo: color del rol correspondiente, `--text-caption` Medium
- Label inactivo: `--color-text-secondary`

---

## 10. Ilustraciones

- **En la app:** Lottie animations para todos los empty states, loaders y onboarding
- **En landing/marketing:** ilustraciones estáticas de librería (Storyset/unDraw) estrictamente recoloreadas con la paleta de marca
- **Regla clave:** nunca mezclar estilos de ilustración — consistencia absoluta dentro de cada contexto

---

## Checklist de implementación

Antes de hacer PR de cualquier componente nuevo, verificar:

- [ ] Usa tokens de color, no valores hardcodeados
- [ ] Tipografía en la escala definida (no tamaños arbitrarios)
- [ ] Border radius según el tipo de componente
- [ ] Spacing en múltiplos de 8 (o 4 para micro)
- [ ] Ícono de Phosphor en el estilo correcto (outlined/duotone)
- [ ] Funciona en ambos roles si el componente es compartido
- [ ] Animaciones bajo 300ms y con propósito
- [ ] Contraste de texto accesible (mínimo AA — 4.5:1)
