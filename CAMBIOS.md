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
  - `src/data/localDb.ts`: tipo `ReadingRow`, función `toReading` (convierte snake_case de SQLite a
    camelCase del dominio) y `findReadings(equipmentId, limit = HISTORY_LIMIT)`, que consulta con parámetros:
    `WHERE equipment_id = ? ORDER BY created_at DESC, id DESC LIMIT ?`.
    El `id DESC` desempata lecturas guardadas en el mismo milisegundo (el `id` es autoincremental).
    El límite de 10 se aplica en SQL, xportada `HISTORY_LIMIT = 10`.
  - `src/viewmodel/useHistoryViewModel.ts` (nuevo): ViewModel del historial. Expone un único estado
    `idle | loading | ready | error`, lo que evita combinaciones inválidas (por ejemplo, cargando y con
error
    a la vez). Vuelve a consultar SQLite cada vez que se abre para un equipo, por lo que siempre muestra
    los datos más recientes. Usa una b la respuesta si el diálogo se cerró
    antes de que termine la consulta (mismo patrón que `usePlantViewModel`).
  - `src/components/HistoryDialog.tsx` equipo elegido, con columnas
    fecha/hora (hora local, formato `dd/mm/aaaa hh:mm:ss`), temperatura y origen. Incluye indicador de
    carga, mensaje de error y un estado vacío que explica cómo generar lecturas.
  - `src/views/PlantScreen.tsx`: el bologo para ese equipo (estado`historyOf`).
    Se eliminó el `Alert` demostrativo y su import.
  - No fue necesario modificar la escrrdaba cada lectura en la tabla
    `readings`, tanto desde **Simular ciclo** (origen `simulación`) como desde **Sincronizar API**
    (origen `API ambiental`).
- Verificación:
 - `npm run typecheck`: sin errores derivados de los cambios (solo el error preexistente de `StatusBar`).
  - A-003 sin sincronizar (base nueva): el historial muestra el estado vacío.
  - 12 × Simular ciclo → el historial de P-101 muestra exactamente 10 filas, la más reciente arriba,
    con origen `simulación`.
  - Sincronizar API con conexión → A-003 suma una fila con origen `API ambiental`.
  - Sincronizar API sin conexión (moas con origen `simulación`.
  - Cerrar y reabrir la app → el historial se conserva.

## Refactorización A

- Problema:
 - Archivo afectado: `src/data/localDb.ts`, función `findEquipment`.
  - El texto del buscador se interpolaba directamente en la consulta:
    `WHERE name LIKE '%${filter}%' OR id LIKE '%${filter}%'`.
    Cualquier comilla rompía la consulta (`'` → error de sintaxis SQL) y era posible alterar
    su lógica (`x' OR '1'='1` devolvía todos los equipos). Además era inconsistente con el resto
    del archivo, que ya usaba parámetros.
- Solución:
  - Consulta parametr
    `WHERE name LIKE '%${filter}%' OR id LIKE '%${filter}%'`.
    Cualquier comilla rompía la consulta (`'` → error de sintaxis SQL) y era posible alterar
    su lógica (`x' OR '1'='1` devolvía todos los equipos). Además era inconsistente con el resto
    del archivo, que ya usaba parámetros.
- Solución:
- Consulta parametrizada: `WHERE name LIKE ? OR id LIKE ?`, pasando `%${term}%` como valor.
    Los comodines `%` forman parte del valor, no del SQL; SQLite trata el parámetro siempre
    como dato y nunca como código. Sin filtro se ejecuta la consulta sin `WHERE`.
  - Motivo: elimina la vulnerabilidad sin cambiar el comportamiento del buscador ni la interfaz
    de la función (misma firma, mismo resultado para búsquedas normales).
- Evidencia:
  - Antes del cambio: `'` → "Error al filtrar: … syntax error"; `x' OR '1'='1` → se listaban los 3 
    Los comodines `%` forman parte del valor, no del SQL; SQLite trata el parámetro siempre
    como dato y nunca como código. Sin filtro se ejecuta la consulta sin `WHERE`.
  - Motivo: elimina la vulnerabilidad sin cambiar el comportamiento del buscador ni la interfaz
    de la función (misma firma, mismo resultado para búsquedas normales).
- Evidencia:
 - Antes del cambio: `'` → "Error al filtrar: … syntax error"; `x' OR '1'='1` → se listaban los 3 equipos.
  - Después del cambio: `'` y `x' OR '1'='1` → "No se encontraron equipos." (sin error).
  - Flujo original intacto: `bomba` → P-101; `M-2` → M-204; campo vacío → los 3 equipos.
  - `npm run typecheck`: sin errores nuevos.

## Refactorización B

- Problema:
 - Archivo afectado: `src/data/localDb.ts`, función `recordReading`
    (usada por `simulateCycle` y `syncReference` en `src/data/plantRepository.ts`).
  - Cada lectura hacía dos escrituras independientes: `UPDATE equipment` (temperatura actual) e
    `INSERT INTO readings` (historial). Si la segunda fallaba, la tarjeta mostraba la temperatura
    nueva pero la lectura no figuraba en el historial: estado actual e historial inconsistentes.
    Con la Funcionalidad 2 esa inconsistencia pasaría a ser visible para el usuario.
- Solución:
- Ambas escrituras se ejecutan dentro de `db.withTransactionAsync(...)`: se confirman juntas o,
    si una falla, se hace `ROLLBACK` de las dos y el error se propaga.
  - Motivo: garantiza atomicidad sin cambiar la firma de la función ni sus llamadores; los `catch`
    existentes del ViewModel (`simulate`, `sync`) siguen informando el error igual que antes.
- Evidencia:
 - Prueba de falla forzada (temporal): se cambió el `INSERT` a una tabla inexistente.
    Sin transacción, la temperatura de la tarjeta cambiaba pero el historial no sumaba filas.
    Con transacción, la temperatura no cambia, se muestra el error y el historial queda igual.
    Luego se restauró el `INSERT` original.
  - Flujo original intacto: Simular ciclo y Sincronizar API actualizan temperaturas y agregan
    filas al historial como antes.
  - `npm run typecheck`: sin errores nuevos.

## Uso de IA (opcional)

- Herramienta utilizada: Claude Codex.
- Qué acepté, revisé o corregí:  la IA analizó el código y propuso un plan por capas; implementé cada paso manualmente y pedí revisión después de cada uno.
