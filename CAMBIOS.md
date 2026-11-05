# Cambios y validación

## Funcionalidad 1 — Umbral

- Cambios realizados:
 - `src/domain/alarm.ts` (nuevo): reglas de negocio puras y reutilizables.
    - `isInAlarm(e)`: un equipo está en alarma solo si `enabled === 1` y `temperature >= maxTemp`.
    - `parseThreshold(raw)`: convierte el texto ingresado (acepta coma decimal) y valida que sea
      un número real finito, `> 0` y `<= 150` (`MAX_LIMIT`). Devuelve `{ ok, value }` o `{ ok, error }`.
      Se usa `Number()` y no `parseFloat()` para rechazar entradas como `12abc`.
  - `src/data/localDb.ts`: nueva funcióque hace
      un número real finito, `> 0` y `<= 150` (`MAX_LIMIT`). Devuelve `{ ok, value }` o `{ ok, error }`.
      Se usa `Number()` y no `parseFloat()` para rechazar entradas como `12abc`.
  - `src/data/localDb.ts`: nueva funcióque hace
    `UPDATE equipment SET max_temp = ?, updated_at = ? WHERE id = ?` con parámetros (sin concatenar SQL).
    El seed inicial usa `INSERT OR IGNORE`, por lo que el límite editado no se sobrescribe al reabrir la app.
  - `src/viewmodel/usePlantViewModel.tsp(id, raw)`.
    Valida primero; si es inválido no toca SQLite ni el estado. Si es válido, persiste y **recién después**
    actualiza `items` (para que la UI n quedó guardado) y el aviso de estado.
    Devuelve `ThresholdResult` para que la vista sepa si cerrar el diálogo o mostrar el error.
  - `src/components/ThresholdDialog.tsxl equipo seleccionado, con el límite
    actual precargado, teclado decimal, mensaje de error en línea y botones Cancelar/Guardar.
    No contiene lógica de validación: d Se evitó `Alert.prompt` por ser soloiOS.
  - `src/views/PlantScreen.tsx`: el botón **Umbral** abre el diálogo para ese equipo (estado `editing`).
    La tarjeta y el contador de alarmas usan `isInAlarm` en lugar de repetir la condición.
  - `src/components/OverviewWeb.tsx`: ea calculado con `isInAlarm`.
    Antes coloreaba en alarma sin considerar si el equipo estaba activado (inconsistente con las tarjetas).
    El panel se regenera automáticamentitems
- Verificación:
 - `npm run typecheck`: sin errores derivados de los cambios. Persiste un único error preexistente en
    `PlantScreen.tsx` (`backgroundColor` no es prop válida de `StatusBar` en esta versión de RN),
    presente en el código original.
  - Valores inválidos (`abc`, vacío, `0`, `-5`, `151`): se muestra el error y no se guarda.
  - Valores válidos (`150`, `65,5`): se guardan y se ven en la tarjeta.
  - M-204 con límite `40`: tarjeta en ALARMA, contador de alarmas = 1, barra naranja en el panel HTML.
  - Al desactivar M-204: desaparece la alarma en tarjeta, contador y panel HTML.
  - Cerrar y reabrir la app: el límite `40` se conserva (SQLite).

## Funcionalidad 2 — Historial

- Cambios realizados:
- Verificación:

## Refactorización A

- Problema:
- Solución:
- Evidencia:

## Refactorización B

- Problema:
- Solución:
- Evidencia:

## Uso de IA (opcional)

- Herramienta utilizada: Claude Codex.
- Qué acepté, revisé o corregí:  la IA analizó el código y propuso un plan por capas; implementé cada paso manualmente y pedí revisión después de cada uno.
