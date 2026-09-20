/* Texto libre: no puntua. */
(function(){
  'use strict';
  function inicial(){return {tipo:'texto',texto:'',na:false,motivoNa:''};}
  function render(item,d,alCambiar){var t=document.createElement('div');t.className='tarjeta';
    var h=document.createElement('h3');h.className='tarjeta__titulo';h.textContent=item.nombre;t.appendChild(h);
    var ta=document.createElement('textarea');ta.className='campo';ta.placeholder=item.placeholder||'Escribí acá';
    ta.value=d.texto||'';ta.addEventListener('input',function(){d.texto=ta.value;alCambiar(d,{});});t.appendChild(ta);return t;}
  function aPdf(item,d){return {lineas:[String(d.texto||'').trim()||'(sin texto)']};}
  window.Controles.registrar('texto',{inicial:inicial,render:render,puntaje:function(){return null;},aPdf:aPdf});
})();
