# Esquema de datos de la visita

Especificacion del objeto que js/visita.js persiste. Es la referencia para las
etapas que faltan: si los numeros del ejemplo no salen de la formula, alguien va
a implementar mal el calculo.

- Una clave de localStorage (vt:v1:visita) guarda todo lo que esta aca.
- Las fotos y las firmas no estan aca: en este objeto va solo el metadato, y el
  Blob vive en IndexedDB bajo esa misma id.
- esquema es la version del formato. Si cambia, el borrador viejo se descarta
  avisando en lugar de intentar adivinar una migracion a mitad de una visita.

## Ejemplo poblado

VER docs/esquema-visita.md en el repo original para el JSON completo.
La seccion "De donde salen los tres scores del ejemplo" explica el calculo.
