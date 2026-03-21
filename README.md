# 🎯 Trivia de CMIs · OAJNU

Herramienta de trivia interactiva para capacitaciones de OAJNU. Identidad visual según el Manual de Identidad Visual Institucional 2023. Funciona 100% en el navegador, sin dependencias ni servidor.

## ✨ Funcionalidades

- **Identidad OAJNU** — naranja `#E05206`, cyan `#009AA6`, tipografía Nunito
- **Dos modos**: Grupos (hasta 7 equipos) o Sedes (lista fija)
- **Importar preguntas** desde archivo **CSV** o **JSON** — arrastrá el archivo o seleccionalo
- **Carga manual** de preguntas con respuesta, explicación pedagógica, categoría, dificultad e imagen
- **Tres niveles de dificultad**: Fácil (10) · Media (15) · Difícil (20 pts)
- **Plantillas descargables** de CSV y JSON desde la misma app
- **Temporizador** configurable con barra visual y sonidos
- **Comodín "Pedir ayuda"** configurable por equipo
- **Pantalla pública** para compartir en videollamada (fondo naranja OAJNU, sin controles)
- **Estadísticas finales**: podio, rendimiento por equipo y por categoría
- **Exportar resultados** en `.txt`

## 🚀 Publicar en GitHub Pages

```bash
git init trivia-cmis
cd trivia-cmis
# Copiá index.html, preguntas-ejemplo.csv y preguntas-ejemplo.json
git add .
git commit -m "Trivia de CMIs v3 - identidad OAJNU + importación de preguntas"
git remote add origin https://github.com/TU-USUARIO/trivia-cmis.git
git push -u origin main
```

Luego: **Settings → Pages → Source: main / (root)** → Save.

URL resultante: `https://tu-usuario.github.io/trivia-cmis/`

## 📋 Formato de archivos de preguntas

### CSV
```
pregunta,respuesta,explicacion,categoria,dificultad,puntos
¿Pregunta?,Respuesta,Explicación pedagógica,Categoría,easy,
```
- **dificultad**: `easy` / `mid` / `hard`  
- **puntos**: dejar vacío = automático según dificultad

### JSON
```json
[
  {
    "pregunta": "¿...?",
    "respuesta": "...",
    "explicacion": "...",
    "categoria": "...",
    "dificultad": "mid",
    "puntos": 15
  }
]
```

## 📁 Archivos del repositorio

```
trivia-cmis/
├── index.html               # App completa (self-contained)
├── preguntas-ejemplo.csv    # Plantilla CSV con preguntas de ejemplo
├── preguntas-ejemplo.json   # Plantilla JSON con preguntas de ejemplo
└── README.md
```

## 🎨 Colores institucionales

| Variable | Hex | Uso |
|---|---|---|
| Naranja primario | `#E05206` | Encabezados, botones principales, énfasis |
| Cyan complementario | `#009AA6` | Badges de categoría, acentos secundarios |
| Blanco | `#FFFFFF` | Fondos de cards, texto sobre naranja/cyan |
| Gris oscuro | `#333333` | Texto principal |
