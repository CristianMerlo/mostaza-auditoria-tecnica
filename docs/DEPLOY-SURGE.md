# DEPLOY-SURGE — Cómo actualizar el sitio en vivo (surge)

> Procedimiento para publicar la última versión de la app en
> **https://visita-tecnica-mostaza.surge.sh/**
> Pensado para pasarle el bloque directo al harness cuando quieras actualizar.

---

## 1. Lo primero que hay que entender

**El sitio en surge es PERMANENTE.** No depende de la terminal ni de que la Mac
esté prendida. Cuando corrés `surge`, los archivos se **suben a los servidores de
surge** (una CDN en la nube). Podés cerrar la terminal, apagar la compu o irte:
el sitio sigue online.

Consecuencia importante:

- Surge publica una **foto congelada** del contenido de la carpeta en el momento
  del deploy. **No está conectado a tu carpeta ni a GitHub.**
- Si el harness edita archivos en `~/visita-tecnica/` DESPUÉS del deploy, el
  sitio en vivo **NO se actualiza solo**. Hay que **volver a correr el comando de
  deploy** para subir los cambios nuevos.

Regla de oro: **cada cambio de código = re-deploy de surge.**

| Cosa | ¿Se cae al cerrar la terminal? | ¿Se actualiza sola? |
|------|--------------------------------|---------------------|
| Surge (`.surge.sh`)              | No, es permanente | No, hay que re-deployar |
| Servidor local (`http.server`)   | Sí, se muere      | N/A |

---

## 2. Procedimiento de actualización (el que le pasás al harness)

### Bloque para el harness

```bash
cd ~/visita-tecnica && surge . visita-tecnica-mostaza.surge.sh
```

Eso es todo. `surge` sube el contenido actual de `~/visita-tecnica/` al dominio
`visita-tecnica-mostaza.surge.sh`, sobrescribiendo la versión anterior.

### Qué esperar como salida

Al terminar bien, surge muestra algo como:

```
   Success! - Published to visita-tecnica-mostaza.surge.sh
```

Si sale eso, el sitio ya está actualizado. Abrí el link en el teléfono para
confirmar (ver sección 4).

---

## 3. Orden correcto de los pasos cuando hay cambios de código

1. **Harness** aplica los bloques `cat > ...` que te pasó Kiro (escribe en
   `~/visita-tecnica/`).
2. **Harness** re-deploya surge con el bloque de la sección 2.
3. **Vos** probás en el teléfono contra el link en vivo.
4. **Antigravity** commitea/pushea a GitHub (esto es INDEPENDIENTE de surge:
   GitHub y surge no se sincronizan entre sí, cada uno se actualiza por su lado).

> Surge = para probar en vivo ya. GitHub = para versionar/respaldar. Son dos
> destinos distintos del mismo código; hay que actualizar ambos.

---

## 4. Cómo verificar que el deploy tomó los cambios

1. Abrí **https://visita-tecnica-mostaza.surge.sh/** en el teléfono.
2. Si ves contenido viejo: **forzá recarga** (el navegador cachea). En el
   celular, cerrá la pestaña y volvé a abrir el link, o usá una pestaña de
   incógnito.
3. Tocá el **número de versión en el pie de página** para abrir el panel de
   Diagnóstico y confirmar que la versión y los assets coinciden con lo esperado.

---

## 5. Problemas comunes

- **"command not found: surge"** → falta instalar surge en la Mac una sola vez:
  `npm install -g surge`. Requiere Node/npm.
- **Pide login (email/password)** → la primera vez surge pide crear/entrar a una
  cuenta. Una vez logueado, no lo vuelve a pedir en esa máquina.
- **El sitio no cambió** → casi siempre es caché del navegador (ver sección 4) o
  que se corrió `surge` desde la carpeta equivocada. Confirmá que estás en
  `~/visita-tecnica/` (ahí tiene que estar el `index.html`).
- **"Aborted" / dominio ocupado** → el dominio `.surge.sh` es de esta cuenta;
  mientras uses la misma cuenta, podés re-publicar sin problema.

---

## 6. Resumen de una línea

Para actualizar el sitio en vivo, el harness corre:
`cd ~/visita-tecnica && surge . visita-tecnica-mostaza.surge.sh`
