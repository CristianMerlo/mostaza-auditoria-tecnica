# PUBLICACIÓN — dónde vive cada versión

> **Producción (lo que usan los jefes y técnicos):**
> **https://cristianmerlo.github.io/mostaza-auditoria-tecnica/**
>
> **Pruebas (sólo desarrollo):** `https://auditoria-tecnica-v22.surge.sh/`
>
> Los dominios `.surge.sh` **nunca** fueron el link de los jefes: son banco de
> pruebas. La regla es que **GitHub Pages siempre tenga la última versión**.

---

## 1. Los dos canales

| Canal | Link | Para qué | ¿Se actualiza solo? |
|-------|------|----------|---------------------|
| **GitHub Pages** | `cristianmerlo.github.io/mostaza-auditoria-tecnica` | **Producción**, el link que se reparte | **Sí**: al pushear a `main` se regenera solo (~1 min) |
| **Surge** | `auditoria-tecnica-v22.surge.sh` | Probar cambios antes de aprobarlos | No: hay que re-deployar |

Consecuencia práctica: **publicar = pushear a `main`**. Si el código está
commiteado y pusheado, la versión de producción ya está servida. Si está sólo en
Surge, existe únicamente para vos.

> `visita-tecnica-mostaza.surge.sh` es un dominio **viejo y congelado** (quedó en
> V2.1.0). Pertenece a otra cuenta de Surge y no hay credenciales en esta máquina,
> así que no se puede ni se debe actualizar. No lo repartir.

---

## 2. Flujo de una versión nueva

1. Se edita el código y se despliega en el dominio de **pruebas**:
   ```bash
   ~/.hermes/node/bin/surge --project . --domain auditoria-tecnica-v22.surge.sh
   ```
   (las credenciales de la cuenta están en `~/.netrc`; surge genera un archivo
   `CNAME` en el directorio que **no** se commitea)
2. Se prueba en el teléfono contra ese link.
3. Con el OK, se commitea y se pushea a `main` → **GitHub Pages queda actualizado**.
4. Se verifica la publicación (sección 3).

---

## 3. Verificar que producción tomó la versión

```bash
curl -s https://cristianmerlo.github.io/mostaza-auditoria-tecnica/index.html | grep VT_VERSION
```

Tiene que mostrar el `VT_VERSION` recién pusheado. Si sale la versión vieja,
esperar un minuto y volver a consultar (el build de Pages es asíncrono).

En el teléfono:

- Si se ve contenido viejo, **cerrar la pestaña y reabrir el link** (la app es una
  SPA: una pestaña abierta hace tiempo sigue corriendo el código anterior).
- Desde V2.6.2 hay **Service Worker**: la app busca versión nueva al abrirla, al
  volver de otra pestaña y cada 5 minutos, y se recarga sola cuando encuentra una.
  Por eso producción puede actualizarse sin que el técnico haga nada.
- El número de versión del pie de página abre el panel de **Diagnóstico**, donde se
  ve la versión, el estado de la visita y si el PDF fue generado.

---

## 4. App instalable

El link de producción es el que hay que instalar en el teléfono (botón
**"Instalar app"** en el pie, o menú del navegador → *Instalar aplicación*; en
iPhone: Compartir → *Agregar a pantalla de inicio*).

En iPhone la app instalada tiene **almacenamiento separado** al del navegador: el
borrador de una visita que se empezó en Safari no aparece en la app instalada. Se
usa siempre el mismo camino.

---

## 5. Problemas comunes

- **"Aborted - you do not have permission to publish to ..."** → ese dominio
  `.surge.sh` es de otra cuenta. `surge list` muestra los dominios de la cuenta
  configurada.
- **"command not found: surge"** → `npm install -g surge` una sola vez.
- **Pages no cambia** → confirmar el push (`git ls-remote origin -h refs/heads/main`
  tiene que dar el hash del commit nuevo) y reintentar el `curl` de la sección 3.

---

## 6. Resumen de una línea

Producción es GitHub Pages y se actualiza **pusheando a `main`**; Surge es sólo
para probar antes de subir.
