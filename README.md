# 🎯 Trivia OAJNU

Herramienta de trivia interactiva para capacitaciones de OAJNU. Diseñada para videollamadas, con soporte para múltiples salas simultáneas, buzz desde el celular de cada participante y sincronización en tiempo real via Firebase.

[![Deploy](https://img.shields.io/github/deployments/ojedajuanc/oajnu-2026-triviaApp/github-pages?label=deploy&logo=github)](https://ojedajuanc.github.io/oajnu-2026-triviaApp/)
[![License: GPL v3](https://img.shields.io/badge/license-GPLv3-blue)](https://www.gnu.org/licenses/gpl-3.0)
[![Built with Vite](https://img.shields.io/badge/built%20with-Vite-646cff?logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/realtime-Firebase-ffca28?logo=firebase)](https://firebase.google.com/)

---

## ✨ Funcionalidades

### Juego
- **Salas con código único** — cada partida genera un código de 4 letras (ej. `KBJM`) que aísla las sesiones en Firebase, permitiendo múltiples partidas simultáneas sin interferencia
- **Dos modos de buzz** configurables al iniciar:
  - **Moderador** — el moderador presiona manualmente qué equipo respondió primero (ideal para videollamada)
  - **Participantes** — cada participante abre la sala en su celular y tiene su propio botón de buzz; Firebase registra quién llegó primero por timestamp del servidor
- **Temporizador** configurable (10–90 seg) con barra visual y alertas de color
- **Comodín "Pedir ayuda"** configurable por equipo, pausa el timer
- **Bloqueo automático** de equipos que respondieron incorrectamente en el turno

### Pantallas
- **Moderador** — panel de control completo con buzzer, timer y marcador en vivo
- **Pantalla pública** (`#audience/CODE`) — vista limpia para proyectar, muestra la pregunta solo cuando el moderador arranca el timer
- **Participante** (`#sala/CODE`) — pantalla mobile-first con botón de buzz y mini marcador
- **Resultados finales** — podio animado en la pantalla pública al finalizar la partida, habilitado por el moderador

### Preguntas
- Carga **manual** con respuesta, explicación pedagógica, categoría, dificultad e imagen opcional
- **Importación** desde archivo CSV o JSON con drag & drop — [ver formato](#-formato-de-archivos)
- Plantillas descargables desde la misma app
- Tres niveles de dificultad: Fácil (10 pts) · Media (15 pts) · Difícil (20 pts)

### Estadísticas finales
- Podio con medallas
- Tasa de aciertos global y rendimiento por equipo
- Análisis por categoría — barras comparativas entre equipos
- Pregunta más fallada
- Exportar resultados en `.txt`

---

## 🚀 Demo

**[ojedajuanc.github.io/oajnu-2026-triviaApp](https://ojedajuanc.github.io/oajnu-2026-triviaApp/)**

| Rol | URL |
|---|---|
| Moderador | `https://.../oajnu-2026-triviaApp/` |
| Pantalla pública | `https://.../oajnu-2026-triviaApp/#audience/CODIGO` |
| Participante | `https://.../oajnu-2026-triviaApp/#sala/CODIGO` |

El código de sala aparece automáticamente en el header al iniciar la partida. Hacé click en él para copiar el enlace de participante al portapapeles.

---

## 🛠 Stack

| | |
|---|---|
| **Bundler** | [Vite 5](https://vitejs.dev/) |
| **Lenguaje** | JavaScript ES Modules (Vanilla, sin framework) |
| **Sincronización** | [Firebase Realtime Database](https://firebase.google.com/docs/database) |
| **Estilos** | CSS modular con custom properties (sin preprocesador) |
| **Deploy** | GitHub Pages via GitHub Actions |
| **Tipografía** | [Nunito](https://fonts.google.com/specimen/Nunito) (Google Fonts) |

---

## 📁 Estructura del proyecto

```
trivia-oajnu/
├── index.html                  # Shell HTML — sin lógica
├── vite.config.js
├── package.json
│
├── src/
│   ├── main.js                 # Entry point — detecta rol e inicializa
│   │
│   ├── config/
│   │   ├── firebase.js         # SDK Firebase + refs dinámicas por sala
│   │   └── constants.js        # SEDES, COLORS, DIFF, BUZZ_MODE
│   │
│   ├── state/
│   │   ├── setup.js            # Estado de configuración (pre-partida)
│   │   └── game.js             # Estado de partida + payload Firebase
│   │
│   ├── modules/
│   │   ├── timer.js            # Countdown sin DOM
│   │   ├── audio.js            # Web Audio API
│   │   ├── importer.js         # parseCSV, parseJSON, normalizeQuestion
│   │   └── exporter.js         # exportResults, downloadTemplate
│   │
│   ├── ui/
│   │   ├── dom.js              # Cache centralizado del DOM
│   │   ├── screens.js          # Navegación entre vistas
│   │   ├── setup-ui.js         # Renders del panel de configuración
│   │   ├── game-ui.js          # Renders del panel de juego
│   │   ├── scoreboard-ui.js    # renderScoreboard, showScoreDelta
│   │   ├── final-ui.js         # Podio, estadísticas, categorías
│   │   ├── public-ui.js        # Pantalla de audiencia (Firebase listener)
│   │   ├── participant-ui.js   # Pantalla mobile de participante
│   │   └── utils.js            # escHtml, escAttr (prevención XSS)
│   │
│   └── styles/
│       ├── tokens.css          # Variables CSS — design tokens OAJNU
│       ├── base.css
│       ├── components.css      # Botones, cards, badges, inputs, modales
│       ├── setup.css
│       ├── game.css
│       ├── public.css
│       ├── participant.css
│       └── final.css
│
└── .github/
    └── workflows/
        └── deploy.yml          # Build → GitHub Pages automático
```

---

## ⚙️ Instalación local

```bash
git clone https://github.com/ojedajuanc/oajnu-2026-triviaApp.git
cd oajnu-2026-triviaApp
npm install
```

Antes de levantar el servidor, configurá Firebase (ver [Configuración Firebase](#-configuración-firebase)).

```bash
npm run dev      # desarrollo en localhost:5173
npm run build    # genera dist/ para producción
npm run preview  # previsualizar el build
```

---

## 🔥 Configuración Firebase

### 1. Crear proyecto

1. Ir a [console.firebase.google.com](https://console.firebase.google.com)
2. **Agregar proyecto** → nombre `oajnu-trivia` → crear
3. **Compilación → Realtime Database → Crear base de datos** → modo de prueba → habilitar

### 2. Registrar app web

1. ⚙️ → **Configuración del proyecto → Tus apps → `</>`**
2. Nombre: `trivia-web` → registrar
3. Copiar el objeto `firebaseConfig`

### 3. Pegar config en el código

En `src/config/firebase.js`, reemplazar los campos `'REEMPLAZAR'`:

```js
const FIREBASE_CONFIG = {
  apiKey:            'AIzaSy...',
  authDomain:        'oajnu-trivia.firebaseapp.com',
  databaseURL:       'https://oajnu-trivia-default-rtdb.firebaseio.com',
  projectId:         'oajnu-trivia',
  storageBucket:     'oajnu-trivia.appspot.com',
  messagingSenderId: '123456789',
  appId:             '1:123456789:web:abc123',
};
```

> **Nota:** La `apiKey` de Firebase es un identificador público por diseño — no es un secreto. La seguridad real está en las Realtime Database Rules. Ver [documentación oficial](https://firebase.google.com/docs/projects/api-keys).

### 4. Reglas de la base de datos

En Firebase Console → Realtime Database → **Reglas**:

```json
{
  "rules": {
    "trivia": {
      "salas": {
        "$salaCode": {
          "estado":     { ".read": true, ".write": true },
          "buzz":       { ".read": true, ".write": true },
          "resultados": { ".read": true, ".write": true }
        }
      }
    }
  }
}
```

### 5. Restringir la API key por dominio (recomendado)

[Google Cloud Console](https://console.cloud.google.com) → **APIs y servicios → Credenciales → Browser key** → **Sitios web HTTP referentes**:

```
https://ojedajuanc.github.io/*
http://localhost/*
```

---

## 🚢 Deploy en GitHub Pages

### Configuración única (primera vez)

1. En el repo: **Settings → Pages → Source → GitHub Actions**
2. Verificar que `vite.config.js` tiene el `base` correcto:

```js
base: '/oajnu-2026-triviaApp/',
```

### Deploy automático

Cada `git push` a `main` dispara el workflow que buildea y despliega automáticamente.

```bash
git add .
git commit -m "feat: ..."
git push origin main
# → GitHub Actions buildea y publica en ~1 minuto
```

---

## 📋 Formato de archivos

### CSV

```csv
pregunta,respuesta,explicacion,categoria,dificultad,puntos
¿En qué año fue fundada la ONU?,1945,Fundada el 24 de octubre de 1945.,Historia,easy,
¿Qué significa ODS?,Objetivos de Desarrollo Sostenible,17 objetivos Agenda 2030.,Agenda 2030,hard,20
```

| Campo | Valores | Notas |
|---|---|---|
| `dificultad` | `easy` / `mid` / `hard` | |
| `puntos` | número entero | dejar vacío = automático según dificultad |
| `explicacion`, `categoria`, `imagen` | — | opcionales |

### JSON

```json
[
  {
    "pregunta": "¿En qué año fue fundada la ONU?",
    "respuesta": "1945",
    "explicacion": "Fundada el 24 de octubre de 1945.",
    "categoria": "Historia",
    "dificultad": "easy",
    "puntos": 10
  }
]
```

Ambos formatos aceptan nombres de campo en español e inglés (`pregunta`/`question`, `respuesta`/`answer`, etc.).

---

## 🎮 Flujo de uso

```
1. Moderador abre la app → configura equipos, preguntas y modo de buzz
2. Inicia el juego → se genera el código de sala (ej. KBJM)
3. Comparte los enlaces:
   · Pantalla pública → botón "Pantalla pública ↗" en el header
   · Participantes    → click en el código KBJM (copia al portapapeles)
4. Por cada pregunta:
   · El moderador arranca el timer → la pregunta se revela en todas las pantallas
   · Alguien responde (buzz manual o desde el celu)
   · El moderador juzga: Correcto / Incorrecto
   · Si incorrecto → ese equipo queda bloqueado y otro puede intentar
   · Revelar respuesta + explicación pedagógica → siguiente pregunta
5. Al finalizar → el moderador hace click en "Finalizar"
   · La pantalla pública muestra el ranking animado
   · El moderador ve el podio, estadísticas y puede exportar resultados
```

---

## 🎨 Identidad visual

Basada en el Manual de Identidad Visual Institucional OAJNU 2023.

| Token | Valor | Uso |
|---|---|---|
| Naranja primario | `#E05206` | Headers, botones principales, énfasis |
| Cyan complementario | `#009AA6` | Badges de categoría, acentos |
| Blanco | `#FFFFFF` | Fondos de cards, texto sobre naranja/cyan |
| Tipografía | Nunito 900/800/400 | Equivalente a VAG Rounded disponible en Google Fonts |

---

## 📄 Licencia

Este proyecto está licenciado bajo **GNU General Public License v3.0** — ver [LICENSE](LICENSE) para el texto completo.

Esto significa que podés usar, modificar y distribuir el código libremente, pero cualquier trabajo derivado debe publicarse con la misma licencia GPL y con el código fuente disponible.

> **Nota sobre el logo:** El isotipo y la marca OAJNU son propiedad registrada de la organización y **no** están cubiertos por esta licencia. Su uso está reservado exclusivamente a OAJNU y sus actividades institucionales.

© [Juan Carlos Ojeda](https://github.com/ojedajuanc) — OAJNU 2026
