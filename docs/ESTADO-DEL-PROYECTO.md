# Estado del proyecto — Auditoría Técnica (M Auditor / visita-tecnica)

> Documento de traspaso entre hilos de Kiro. Si sos un nuevo hilo retomando este
> proyecto: leé esto completo antes de tocar nada. Al final está el punto exacto
> donde quedamos y lo que falta.
> Última actualización: cierre de sesión con la app funcional en producción (surge).

---

## 1. Qué es

App web estática **mobile-first** para que **jefes de área de Mostaza** auditen locales
gastronómicos (propios y franquicias) desde el celular, durante el recorrido, y
generen un **PDF firmado** en el teléfono, sin red y en pocos minutos.

Objetivo único: que la auditoría quede **auditada, firmada y exportada como PDF**
en el menor tiempo posible. Antipatrón declarado: Frogmi (fotos obligatorias de
todo, formularios largos). Criterio de desempate en UX: **menos fricción**.

---

## 2. Stack y arquitectura (decisiones cerradas, NO re-discutir)

- **HTML + CSS + JavaScript vanilla.** Sin framework, sin bundler, sin paso de
  build, sin backend.
- **Sin Service Worker ni PWA** en esta versión (rompió en producción antes).
- **jsPDF vendorizado** en `vendor/jspdf.umd.min.js` (v4.2.1). Cero CDN, cero
  pedidos a internet en runtime (la app corre con el teléfono en modo avión una
  vez cargada). Excepción tolerada: el link a Google Maps del PDF (se abre
  después, con red) y la carga del logo en runtime para el PDF.
- **Una sola constante de versión** en `index.html` (`window.VT_VERSION`), de la
  que salen el pie de página y el `?v=` de todos los assets. Tocando la versión
  en el pie se abre un panel de **Diagnóstico** que audita que todo coincida.
- **Persistencia detrás de una interfaz** (`js/storage.js`): texto en
  localStorage, binarios (fotos, firmas) en IndexedDB como Blob. Autosave en
  cada cambio (requisito crítico: no perder trabajo si se corta la red / se
  bloquea el teléfono / se recarga). Nunca base64 en localStorage.
- **Motor de controles extensible** (`js/controles/`): cada ítem declara su tipo
  en `data/checklist.js`; el motor lo renderiza. Agregar un tipo = un archivo +
  una línea en `registro.js`, sin tocar el scoring.
- **Identidad visual Mostaza = ROJO institucional** (`#D32F2F` marca / `#B71C1C`
  degradado). El naranja `#F58220` quedó SOLO para el estado "agua blanda" del
  PPM. El rojo de alarma del semáforo es `#c80000` (tono distinto, sobre blanco).
  Paleta declarada una sola vez en `:root` de `css/app.css`; `js/paleta.js` la
  lee para el PDF.

---

## 3. Cómo se trabaja (FLUJO DE TRABAJO REAL — importante)

Hay tres entornos y NO comparten disco:

1. **Kiro (vos, el que lee esto):** diseño y código. NO ejecutás nada. Analizás
   el repo público por `raw.githubusercontent.com` y la API de GitHub.
2. **El usuario (Cristian):** es el nexo. Copia lo que le das, lo lleva a los
   otros entornos, y trae resultados. Toma las decisiones de negocio.
3. **Harness (DeepSeek v4 Flash):** agente local con acceso al filesystem de la
   Mac. Ejecuta los bloques `cat > archivo <<'DELIM'` que le pasás. Escribe en
   `~/visita-tecnica/` (carpeta de trabajo/surge).
4. **Antigravity:** SOLO para commits/push a GitHub. Copia de `~/visita-tecnica/`
   al repo `~/Documents/Repositorios GitHub/PROYECTOS/M Auditor/visita-tecnica/`.

### Reglas del flujo (aprendidas a los golpes):
- **Cada cambio de código:** dale a Cristian un bloque `cat > ruta <<'DELIM' ...
  DELIM` + `echo "archivo: $(wc -c < ruta) bytes"` para harness. UN archivo por
  bloque (o pocos). Nunca cortes un archivo a la mitad; si es largo, partilo en
  bloques que usen `>>` (append) al mismo archivo y ejecutá al final.
- **Siempre LEÉ el archivo del repo antes de reescribirlo** (raw.githubusercontent),
  para no trabajar sobre una versión vieja de memoria.
- **Verificá los tamaños en bytes** después de cada commit contra la API de
  GitHub (`/contents/...?ref=main`). Confirmá que el SHA cambió.
- Harness prueba en **surge**: `cd ~/visita-tecnica && surge . visita-tecnica-mostaza.surge.sh`
  (surge es PERMANENTE, no depende de la terminal; hay que RE-DEPLOYAR en cada
  cambio porque publica una foto congelada. Procedimiento completo en
  `docs/DEPLOY-SURGE.md`.)
- La app en vivo: **https://visita-tecnica-mostaza.surge.sh/**
- GitHub Pages: pendiente, se hará al final (ver sección 7).

---

## 4. Estructura de archivos (repo: visita-tecnica/)

```
index.html                 Cargador de assets + header. UNICA constante de version.
css/app.css                Paleta unica (rojo institucional) + layout + hero + fade-in.
img/logo.png               Logo Mostaza (usado en header, hero y PDF).
vendor/jspdf.umd.min.js     jsPDF 4.2.1 vendorizado.
vendor/LEEME.md            Doc de la libreria vendorizada.
data/jefes.js              6 jefes reales + PIN (NO es seguridad, previene error de carga).
data/locales.js            206 locales reales (113 franquicias + 93 propios) con idGenerador.
data/checklist.js          Items del recorrido: 10 cocina + 1 agua, 13 edilicio. Cada uno con su tipo.
data/maestro_franquicias.csv  Fuente real (La Sabana V4). Referencia.
data/maestro_propios.csv      Fuente real (propios agosto). Referencia.
js/paleta.js               Lee la paleta del CSS y la da en hex/RGB para el PDF.
js/config.js               Todos los numeros: umbrales, pesos, topes de foto, cortes PPM.
js/storage.js              Puerta unica a localStorage + IndexedDB. Degrada a memoria con aviso.
js/visita.js               Modelo de la visita + autosave + restauracion + finalizar().
js/scoring.js              Promedios por bloque y general. No conoce los tipos: les pregunta.
js/fotos.js                Captura, EXIF, redimensionado, topes por bloque, obligatoria en criticos.
js/firmas.js               Canvas de firma. Arranca BLOQUEADA (no se marca al scrollear).
js/pdf.js                  Genera el informe. Nombre = codigo legible. Logo real + fallback.
js/diagnostico.js          Panel de soporte (auditoria de version, paleta, storage).
js/ui.js                   Cascaron: pasos, navegacion, modal, avisos, hero de inicio.
js/controles/registro.js   Registro tipo->renderizador.
js/controles/slider.js     Slider 0-100 + obs. Candado Ajustar/Fijar (bloquea slider Y textarea).
js/controles/checklist.js  Tipo checklist (% cumplido).
js/controles/texto.js      Texto libre (no puntua).
js/controles/escala.js     Numerico con escala (puntua por flag).
js/controles/info.js       Bloque informativo (no puntua).
js/controles/agua.js       Control compuesto del agua (PPM + 3 componentes, semaforo 5 estados).
js/paneles/identificacion.js  Paso 1: elegir jefe + PIN + confirmar "Soy X".
js/paneles/local.js        Paso 2: buscar local + tickets abiertos + geolocalizacion.
js/paneles/recorrido.js    Pasos 3 y 4: cocina y edilicio (registra dos paneles).
js/paneles/firmas.js       Paso 5: dos firmas + nombre/cargo del encargado.
js/paneles/informe.js      Paso 6: repaso + confirmacion anti-Frogmi + generar PDF + finalizar.
js/app.js                  Arranque, cableado, dialogo de "visita en curso".
docs/esquema-visita.md     Esquema del objeto visita (referencia).
docs/ESTADO-DEL-PROYECTO.md Este archivo.
docs/DEPLOY-SURGE.md       Procedimiento para actualizar el sitio en vivo (surge).
```

Orden de carga de scripts: ver `index.html`. Datos y cascaron antes que paneles
(cada panel se registra en UI al cargarse). jsPDF antes de app.js. app.js ultimo.

---

## 5. Reglas de negocio y decisiones tomadas (lo que ya está definido)

### Identificación
- 6 jefes reales con PIN de 4 dígitos. Los PIN difieren entre sí en 2+ dígitos
  (un error de tecleo no cae en otro válido). NO es seguridad (están en el
  fuente). Cristian Merlo = 0731.

### Locales
- Padrón real: 206 (113 franquicias con idGenerador de 3 dígitos + 93 propios,
  sigla que empieza con M, sin idGenerador). Búsqueda por nombre/sigla/provincia.
- "Otro local — carga manual" para los que no están en el padrón.
- Hay 4 duplicados de sigla en la fuente (FJUJ, MPT, MAR, MCR): se desambiguan
  por idGenerador. No tocar salvo pedido.

### Códigos (DOS por auditoría, ambos se imprimen en el PDF)
- **Legible** (`v.codigo`) = `AT-<minutos desde 2026-01-01>-<NOMBRE_NORMALIZADO>`.
  Da el nombre del archivo PDF. Ej: `AT-377513-LAFERRERE_2.pdf`. Para que el jefe
  ordene y busque.
- **Validación único** (`v.codigoValidacion`) = `AT-<minutos>-<ID>-<HASH4>`. Para
  deduplicar en un futuro ingestor. Va arriba a la derecha del PDF.

### Recorrido (2 bloques)
- **Cocina:** 10 equipos slider (con foto) + 1 control de agua (coc-12, no puntúa).
- **Edilicio:** 13 ítems slider (con foto). Incluye "Dinning Salón (Pisos,
  zócalos y paredes)" y "Estado general de cocina" (que se movió de cocina a
  edilicio porque es estado, no equipo).
- Todos los slider arrancan en **100** ("sin observaciones"). El jefe solo baja
  lo que está mal.
- **Slider con candado:** arranca bloqueado (para no moverlo al scrollear). Botón
  "Ajustar" desbloquea slider Y textarea; "Fijar" bloquea ambos.
- **"No aplica"** por ítem: excluye del promedio, exige motivo escrito obligatorio.

### Scoring y semáforo
- Puntaje 0-100 por bloque (promedio de ítems aplicables) + general (promedio
  ponderado, hoy 50/50 en `config.pesosBloques`).
- Umbrales: <60 rojo, 60-80 amarillo, >80 verde. Los tres son alcanzables.
- El agua NO puntúa: tiene semáforo propio, aparte del promedio.

### Agua (PPM) — cortes fijos 50/120/300, criterio de mantenimiento, NO tocar
- 1-49 = NARANJA (agua blanda, malo pero no crítico).
- 50-119 = VERDE (óptimo).
- 120-300 = AMARILLO (alerta).
- >300 = ROJO (agua dura, crítico).
- Sin medir = GRIS, NUNCA verde. Arranca en modo MEDIR pero con campo VACIO
  (hasta cargar un número real es SIN MEDIR).
- Componentes (Filtro/Ablandador/Ósmosis): OP/NO OP/N/A. Ósmosis N/A se excluye
  del cálculo. 2+ NO OP -> ROJO; 1 NO OP -> sube un nivel. Todo lo que mueve el
  color queda escrito en 'porQue' y se imprime en el PDF.

### Fotos
- Captura con cámara, EXIF corregido (createImageBitmap), redimensionado a 1200px
  lado largo, JPEG 0.65. Se acumulan (no se reemplazan). Blob en IndexedDB.
- Tope: **2 por ítem en cocina, 4 en edilicio, 20 por auditoría** (el global
  mantiene el PDF <= 4 MB). El aviso de las 20 está en la pantalla de inicio.
- Foto aparece cuando el puntaje baja de 70. Si baja de **60 (crítico), 2 fotos
  son OBLIGATORIAS** para poder avanzar (evidencia obligatoria condicionada).

### Firmas
- Dos: FIRMA JEFE DE ÁREA y FIRMA ENCARGADO. Canvas táctil, fondo blanco, aspect
  ratio 2:1 (igual al PDF, no se comprime). Arrancan BLOQUEADAS.
- El nombre del encargado se carga en el paso Firmas (no antes: puede firmar otro
  distinto del que estaba al empezar). Nombre obligatorio para generar el PDF.

### Tickets y geolocalización (Paso 2, ambos opcionales)
- Tickets abiertos del local: número entero, el auditor lo revisa antes. Sale en
  el PDF.
- Botón "Marcar ubicación": un toque captura lat/long. En el PDF va un link a
  Google Maps + coordenadas. NO frena la auditoría si falla o no hay permiso.

### Cierre
- Repaso final + checkbox de **confirmación de auditoría** (anti-Frogmi): "Confirmo
  que todos los ítems fueron auditados. Los que quedaron en 100 sin observaciones
  fueron revisados y están acordes al estándar." Sin tildarlo, no se genera el PDF.
- El PDF tiene un **"Resumen para plan de acción"** al final: los ítems <70
  ordenados de peor a mejor (NO usar la palabra "ejecutivo").
- La visita NO se borra sola: `finalizar()` exige `pdfGenerado===true` y
  confirmación explícita. Al descartar/finalizar se limpian los blobs huérfanos.

---

## 6. Estado actual (dónde quedamos)

- App **completa y funcional de punta a punta**, probada en teléfono real contra
  surge. PDF real verificado (AT-377513-LAFERRERE_2.pdf): cumple todo.
- Último fix aplicado: la línea "Revisados sin observaciones: N de N" del PDF ya
  no se pisa con el valor (usa parrafo() en vez de dato()).
- Versión de la app: 2.1.0.
- surge y GitHub main están sincronizados (verificar bytes/SHA si hay dudas).

---

## 7. Pendientes (para próximas rondas, ninguno urgente)

1. **Ponderación de puntajes:** que ciertos ítems pesen más que otros (seguridad/
   frío > estética). Cristian lo dejó para evaluar más adelante. `config.js` ya
   tiene `pesosBloques`; faltaría peso por ítem en `checklist.js` y ajustar
   `scoring.js`.
2. **Matriz de criticidad:** marcar prioridad (crítica/alta/media/baja) por ítem.
   Pendiente hasta que Mostaza la defina.
3. **GitHub Pages (publicación definitiva):** la app está en `visita-tecnica/`
   (subcarpeta), y Pages solo sirve raíz o /docs. Opción recomendada: crear un
   repo aparte (ej. `auditoria-tecnica`) con el contenido de visita-tecnica/ en
   su raíz. Se hará al final. Rutas relativas ya lo permiten sin cambios.
4. **Integración con la ticketera real** de Mostaza (hoy solo se anota el número
   de tickets a mano). Depende del sistema de la empresa.
5. **Evaluar** si la foto obligatoria en críticos (<60) resulta molesta en uso;
   si un ítem malo no se puede fotografiar, quedaría trabado. Si pasa, agregar
   salida "no se pudo fotografiar" con motivo.

## 8. Huecos de dominio que siguen abiertos (del documento original)
- Periodicidad de medición de PPM y criterio de recambio de filtro: hoy son
  defaults nuestros (30 días / 180 días), editables. No son criterio oficial de
  Mostaza.
- Se quitó de la pantalla de local la edición de esos parámetros de agua (se
  verán aparte más adelante).

---

## 9. Cómo verificar rápido que todo está sano (para un hilo nuevo)
1. Abrir https://visita-tecnica-mostaza.surge.sh/ o leer el repo.
2. Tocar la versión en el pie -> panel Diagnóstico: "Coinciden pie y constante:
   SÍ", "Assets con ?v= correcto: N de N".
3. Recorrido completo: identificación (PIN) -> local -> cocina -> edilicio ->
   agua -> firmas -> PDF. Recargar a mitad: debe volver "Hay una visita en curso".
