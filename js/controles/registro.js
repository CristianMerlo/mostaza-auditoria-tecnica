/* Registro tipo->renderizador. Agregar un tipo = registrar aca, sin tocar el motor. */
window.Controles=(function(){
  'use strict';
  var reg={};
  function registrar(tipo,def){reg[tipo]=def;}
  function obtener(tipo){return reg[tipo]||reg['slider'];}
  function inicial(item){var c=obtener(item.tipo);return c.inicial?c.inicial(item):{tipo:item.tipo};}
  return {registrar:registrar,obtener:obtener,inicial:inicial};
})();
