/* Bloque informativo. No puntua, sin entrada. */
(function(){
  'use strict';
  function inicial(){return {tipo:'info'};}
  function render(item,d){var t=document.createElement('div');t.className='tarjeta tarjeta--etapa';
    var h=document.createElement('h3');h.className='tarjeta__titulo';h.textContent=item.nombre;t.appendChild(h);
    if(item.texto){var p=document.createElement('p');p.className='tarjeta__texto';p.textContent=item.texto;t.appendChild(p);}return t;}
  function aPdf(item){return {lineas:[item.texto||'']};}
  window.Controles.registrar('info',{inicial:inicial,render:render,puntaje:function(){return null;},aPdf:aPdf});
})();
