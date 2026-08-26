# SPEC 01 — MVP jugable de Arkanoid

> **Estado:** Aprobado
> **Depende de:** (ninguno)
> **Fecha:** 2026-08-26
> **Objetivo:** Un juego de Arkanoid jugable de principio a fin en el navegador, con paleta, pelota, una grilla fija de ladrillos, colisiones básicas y victoria/derrota que vuelven directo a la pantalla de inicio.

## Scope

**In:**

- `index.html`, `style.css` y `script.js` en HTML/CSS/JS puro, sin dependencias ni build.
- Renderizado con Canvas 2D API, tamaño fijo 800x600px, sin diseño responsive.
- Uso de `assets/spritesheet-breakout.png` para dibujar paleta, pelota y ladrillos.
- Paleta controlada con las flechas ← →, sin salir de los límites del canvas.
- Pelota con rebote simple (reflexión especular) contra paredes, paleta y ladrillos.
- Velocidad de la pelota constante durante toda la partida (no aumenta con el tiempo).
- Saque automático de la pelota: al iniciar partida y tras perder cada vida, sale sola en una dirección fija, sin input extra del jugador.
- Grilla fija de ladrillos: 6 filas (una por cada color del spritesheet: rojo, naranja, amarillo, verde, azul, púrpura) x 10 columnas = 60 ladrillos.
- Cada ladrillo se destruye de un solo golpe y otorga el mismo puntaje, sin importar su color.
- 3 vidas. Perder una vida resetea la posición de pelota y paleta y relanza automáticamente. Perder la 3ra vida termina la partida.
- Condición de victoria: romper los 60 ladrillos.
- Pantalla de inicio ("presioná una tecla para empezar"). Al perder las 3 vidas o romper todos los ladrillos, se vuelve directo a la pantalla de inicio, sin pantallas ni mensajes intermedios de Game Over/Victoria.
- Marcador de puntaje y de vidas, visibles durante la partida.

**Out of scope (para specs futuros):**

- Power-ups.
- Sonido y música.
- High scores o cualquier persistencia entre sesiones (recargar la página siempre arranca de cero).
- Pausa.
- Múltiples niveles o layouts de ladrillos distintos.
- Puntaje diferenciado por color/fila de ladrillo.
- Ángulo de rebote variable según el punto de impacto en la paleta (queda como reflexión especular simple).
- Controles de mouse o touch.
- Ladrillos irrompibles o con más de un golpe de resistencia (variantes agrietadas del spritesheet).

## Data model

```js
// Estado global del juego
const state = {
  screen: 'start',       // 'start' | 'playing'
  score: 0,
  lives: 3,
  paddle: { x, y, width, height, speed },
  ball: { x, y, dx, dy, radius },
  bricks: [
    // { x, y, width, height, color, alive }
  ],
};
```

Convenciones:

- Origen de coordenadas: esquina superior izquierda del canvas (800x600).
- Velocidades en píxeles/frame.
- La grilla de `bricks` (6 filas x 10 columnas) se genera al entrar a `screen: 'playing'`; el ancho de cada ladrillo sale de dividir el ancho utilizable del canvas entre las 10 columnas, dejando un margen entre ladrillos.
- `score` y `lives` se resetean a sus valores iniciales (0 y 3) cada vez que se vuelve a `screen: 'start'`, sea por derrota o por victoria.

## Implementation plan

1. Crear `index.html` con un `<canvas id="game" width="800" height="600">` y la estructura mínima de página, cargando `style.css` y `script.js`. Verificación manual: abrir `index.html` en el navegador y ver el canvas vacío sin errores en la consola.
2. Crear `style.css` con estilos base (canvas centrado, fondo de página). Verificación: el canvas se ve centrado en la ventana.
3. En `script.js`, cargar `assets/spritesheet-breakout.png` y dibujar la pantalla de inicio con el mensaje "presioná una tecla para empezar" sobre el canvas. Verificación: al abrir el juego se ve ese mensaje.
4. Implementar el game loop con `requestAnimationFrame` y el estado inicial de `screen: 'playing'` (paddle, ball, bricks), arrancando al presionar cualquier tecla desde la pantalla de inicio. Verificación: al presionar una tecla se dibujan la paleta, la pelota y los 60 ladrillos.
5. Implementar el movimiento de la paleta con ← → respetando los límites del canvas. Verificación: la paleta se mueve y no sale del canvas.
6. Implementar el movimiento de la pelota y su rebote especular contra las paredes laterales, la pared superior y la paleta. Verificación: la pelota rebota visiblemente sin atravesar los bordes del canvas.
7. Implementar la colisión pelota-ladrillo: al impactar, el ladrillo pasa a `alive: false` (deja de dibujarse y de colisionar) y suma puntaje al marcador. Verificación: al golpear un ladrillo, desaparece y el puntaje sube.
8. Implementar la pérdida de vida cuando la pelota cae debajo de la paleta: resta una vida, resetea posición de pelota y paleta, y relanza automáticamente. Al llegar a 0 vidas, vuelve a `screen: 'start'` reseteando `score`, `lives` y `bricks`. Verificación: perder las 3 vidas vuelve a la pantalla de inicio.
9. Implementar la condición de victoria (los 60 `bricks` con `alive: false`): vuelve a `screen: 'start'` reseteando `score`, `lives` y `bricks`. Verificación: romper todos los ladrillos vuelve a la pantalla de inicio.
10. Dibujar el marcador de puntaje y de vidas durante `screen: 'playing'`. Verificación: ambos valores se ven y se actualizan en tiempo real durante la partida.

## Acceptance criteria

- [ ] Al abrir `index.html` en el navegador, se ve la pantalla de inicio sin errores en la consola.
- [ ] Presionar cualquier tecla desde la pantalla de inicio arranca la partida con paleta, pelota y 60 ladrillos.
- [ ] Las flechas ← → mueven la paleta sin que salga del canvas.
- [ ] La pelota rebota (reflexión especular) contra paredes, paleta y ladrillos.
- [ ] Golpear un ladrillo lo destruye y suma puntaje al marcador visible.
- [ ] Perder la pelota resta una vida y la relanza automáticamente.
- [ ] Perder la 3ra vida vuelve directo a la pantalla de inicio.
- [ ] Romper los 60 ladrillos vuelve directo a la pantalla de inicio.
- [ ] Recargar la página siempre arranca desde cero (sin persistencia entre sesiones).

## Decisions

- **Sí:** Canvas 2D API. Aprovecha directamente `assets/spritesheet-breakout.png` para dibujar paleta, pelota y ladrillos.
- **No:** DOM/CSS para los elementos del juego. Peor rendimiento con pelota + 60 ladrillos animados en simultáneo.
- **Sí:** rebote especular simple en la paleta, sin ángulo variable según el punto de impacto. Menos superficie de bugs para el MVP; el control angular queda para un spec futuro si se decide agregarlo.
- **Sí:** velocidad de pelota constante durante toda la partida. Simplifica la física del MVP.
- **Sí:** 3 vidas, mismo puntaje por ladrillo sin importar el color. Reduce las decisiones de balance necesarias para este spec.
- **Sí:** al ganar o perder, se vuelve directo a la pantalla de inicio sin pantallas ni mensajes intermedios. Decisión explícita para simplificar los estados de UI del MVP.
- **Sí:** grilla fija de 6 filas x 10 columnas (60 ladrillos), una fila por cada color disponible en el spritesheet.
- **No:** power-ups, sonido, pausa, high scores, múltiples niveles, ladrillos de varios golpes, controles de mouse/touch. Quedan fuera para specs futuros.
- **Sí:** canvas de 800x600px fijo, sin diseño responsive.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| A velocidades altas la pelota podría "atravesar" un ladrillo sin detectar la colisión (tunneling). | La velocidad de la pelota es constante y moderada (ver Decisiones); si el problema aparece igual, se resuelve durante `/spec-impl`. |
| El spritesheet no trae documentación de las coordenadas exactas de cada sprite. | Las coordenadas de recorte se miden manualmente sobre el PNG durante `/spec-impl`. |

## What is **not** in this spec

- Power-ups.
- Sonido y música.
- High scores o persistencia entre sesiones.
- Pausa.
- Múltiples niveles o layouts de ladrillos.
- Puntaje diferenciado por color de ladrillo.
- Ángulo de rebote variable en la paleta.
- Controles de mouse o touch.

Cada uno de estos, si se decide implementar, va en su propio spec.
