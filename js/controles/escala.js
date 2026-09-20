/* Numerico con escala. Por defecto NO puntua (puntua:true en el item para que sí). */
(function(){
  'use strict';
  function inicial(){return {tipo:'escala',valor:null,na:false,motivoNa:''};}
  function render(item,d,alCambiar){var t=document.createElement('div');t.className='tarjeta';
    var h=document.createElement('h3');h.className='tarjeta__titulo';h.textContent=item.nombre;t.appendChild(h);
    var i=document.createElement('input');i.type='number';i.className='campo';i.inputMode='numeric';
    if(item.min!=null)i.min=item.min; if(item.max!=null)i.max=item.max;
    i.placeholder=item.unidad||''; i.value=(d.valor==null?'':d.valor);
    i.addEventListener('change',function(){var n=parseFloat(i.value);d.valor=isFinite(n)?n:null;alCambiar(d,{});});
    t.appendChild(i);return t;}
  function puntajeItem(d,item){if(!item||!item.puntua||d.valor==null)return null;
    var min=item.min||0,max=item.max||100;var p=Math.round((d.valor-min)*100/(max-min));return Math.max(0,Math.min(100,p));}
  function aPdf(item,d){return {lineas:[(d.valor==null?'Sin medir':d.valor+' '+(item.unidad||''))]};}
  window.Controles.registrar('escala',{inicial:inicial,render:render,
    puntaje:function(){return null;},puntajeItem:puntajeItem,aPdf:aPdf});
})();
