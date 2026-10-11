/* Control 'bloque': una sola tarjeta con varios subpuntos evaluados por chips
   (OK / Leve / Grave / N/A), un candado único para cerrar la inspección y un pool
   de fotos compartido. El puntaje del bloque es el promedio de sus subpuntos.
   Nace del prototipo prototipos/bloque-cocina.html (Cristian aprobó 08/10). */
(function(){
  'use strict';
  var VALOR={'OK':100,'LEVE':75,'GRAVE':40,'NA':null};
  var ROTULO={'OK':'OK','LEVE':'Leve','GRAVE':'Grave','NA':'N/A'};
  function inicial(item){var subs={};
    (item.subs||[]).forEach(function(s){subs[s.k]={e:'OK',obs:''};});
    return {tipo:'bloque',cerrado:false,tocado:false,subs:subs,fotos:item.fotos?[]:undefined};}
  function promedio(d){var subs=d.subs||{};var vals=Object.keys(subs).map(function(k){return VALOR[subs[k].e];})
    .filter(function(v){return v!=null;});
    return vals.length?Math.round(vals.reduce(function(a,b){return a+b;},0)/vals.length):100;}
  function claseScore(s){if(s<60)return 'rojo';if(s<80)return 'amarillo';return 'verde';}
  function render(item,d,alCambiar){
    // Defensa ante visitas guardadas con otro formato (ej. el ítem antes era slider)
    if(!d.subs||typeof d.subs!=='object')d.subs={};
    (item.subs||[]).forEach(function(s){if(!d.subs[s.k])d.subs[s.k]={e:'OK',obs:''};});
    var t=document.createElement('div');
    function pintar(){
      t.innerHTML='';t.className='tarjeta'+(d.cerrado?' tarjeta--na':' tarjeta--activo');
      var cab=document.createElement('div');cab.className='item__cabecera';
      var h=document.createElement('h3');h.className='tarjeta__titulo';h.style.margin='0';
      h.textContent=item.nombre;
      var val=document.createElement('span');val.className='item__valor item__valor--'+claseScore(promedio(d));
      val.textContent=promedio(d);
      cab.appendChild(h);cab.appendChild(val);t.appendChild(cab);
      var ay=document.createElement('p');ay.className='item__ayuda';
      ay.textContent=d.cerrado?'Bloque cerrado. Tocá "Reabrir" si falta corregir algo.'
        :'Tocá el estado de cada punto. Sin deslizar, sin candados individuales.';
      t.appendChild(ay);
      (item.subs||[]).forEach(function(s){
        var sd=d.subs[s.k]||(d.subs[s.k]={e:'OK',obs:''});
        var row=document.createElement('div');row.className='bloque__punto';
        var fila=document.createElement('div');fila.className='bloque__fila';
        var nom=document.createElement('span');nom.className='bloque__nombre';nom.textContent=s.n;
        var chips=document.createElement('div');chips.className='chips';
        ['OK','LEVE','GRAVE','NA'].forEach(function(e){
          var c=document.createElement('button');c.type='button';
          c.className='chip'+(sd.e===e?' chip--on':'');c.dataset.e=e;c.textContent=ROTULO[e];
          c.disabled=!!d.cerrado;
          c.addEventListener('click',function(){sd.e=e;d.tocado=true;alCambiar(d,{});pintar();});
          chips.appendChild(c);});
        fila.appendChild(nom);fila.appendChild(chips);row.appendChild(fila);
        if(sd.e==='LEVE'||sd.e==='GRAVE'){
          var ta=document.createElement('textarea');ta.className='campo';ta.style.marginTop='6px';
          ta.placeholder='Qué pasa con '+s.n.toLowerCase()+' (opcional)';ta.value=sd.obs||'';
          ta.readOnly=!!d.cerrado;
          ta.addEventListener('input',function(){if(ta.readOnly)return;sd.obs=ta.value;d.tocado=true;alCambiar(d,{});});
          row.appendChild(ta);}
        t.appendChild(row);});
      if(item.fotos){var fc=document.createElement('div');t.appendChild(fc);
        window.Fotos.renderItem(fc,item,d,alCambiar,true);}
      var btn=document.createElement('button');btn.type='button';
      btn.className='btn btn--bloque'+(d.cerrado?'':' btn--principal');
      btn.textContent=d.cerrado?'🔒 Bloque cerrado — Reabrir':'🔓 Cerrar bloque (ya revisé todo)';
      btn.addEventListener('click',function(){d.cerrado=!d.cerrado;d.tocado=true;
        alCambiar(d,{});pintar();window.UI.actualizarSemaforo(window.Visita.actual());});
      t.appendChild(btn);
    }
    pintar();return t;}
  function puntaje(d){return promedio(d);}
  /* Texto consolidado de lo marcado, para contadores de pantalla y para el resumen del PDF. */
  function observaciones(item,d){
    var p=[];(item.subs||[]).forEach(function(s){var sd=d.subs&&d.subs[s.k];if(!sd||sd.e==='OK'||sd.e==='NA')return;
      p.push(s.n+': '+ROTULO[sd.e]+(String(sd.obs||'').trim()?' — '+sd.obs.trim():''));});
    return p.join(' · ');
  }
  function aPdf(item,d){
    var l=['Inspección por puntos — '+promedio(d)+'/100'+(d.cerrado?' (bloque cerrado)':' (en revisión)')];
    (item.subs||[]).forEach(function(s){var sd=(d.subs&&d.subs[s.k])||{e:'OK'};
      if(sd.e==='OK')return;
      if(sd.e==='NA'){l.push('· '+s.n+': NO APLICA');return;}
      l.push('· '+s.n+': '+ROTULO[sd.e]+(String(sd.obs||'').trim()?' — '+sd.obs.trim():''));});
    return {lineas:l,fotos:d.fotos||[]};}
  window.Controles.registrar('bloque',{inicial:inicial,render:render,puntaje:puntaje,observaciones:observaciones,aPdf:aPdf});
})();
