/* Checklist: N puntos. Aporta el % cumplido. "No aplica" lo excluye. */
(function(){
  'use strict';
  function inicial(item){var m={};(item.puntos||[]).forEach(function(_,i){m[i]=false;});
    return {tipo:'checklist',marcados:m,tocado:false,declarado:false,obs:'',na:false,motivoNa:'',fotos:item.fotos?[]:undefined};}
  function pct(item,d){var p=item.puntos||[];if(!p.length)return 100;var ok=0;
    p.forEach(function(_,i){if(d.marcados[i])ok++;});return Math.round(ok*100/p.length);}
  function render(item,d,alCambiar){
    var t=document.createElement('div');t.className='tarjeta'+(d.na?' tarjeta--na':'');
    var cab=document.createElement('div');cab.className='item__cabecera';
    var h=document.createElement('h3');h.className='tarjeta__titulo';h.style.margin='0';h.textContent=item.nombre;
    var val=document.createElement('span');val.className='item__valor';
    cab.appendChild(h);cab.appendChild(val);t.appendChild(cab);
    var refresco=function(){val.textContent=d.na?'N/A':pct(item,d)+'%';};refresco();
    if(!d.na){ (item.puntos||[]).forEach(function(p,i){var lb=document.createElement('label');lb.className='chk';
      var c=document.createElement('input');c.type='checkbox';c.checked=!!d.marcados[i];
      c.addEventListener('change',function(){d.marcados[i]=c.checked;d.tocado=true;d.declarado=false;refresco();alCambiar(d,{});});
      var sp=document.createElement('span');sp.textContent=p;lb.appendChild(c);lb.appendChild(sp);t.appendChild(lb);});
      var obs=document.createElement('textarea');obs.className='campo';obs.style.marginTop='8px';
      obs.placeholder='Observación (opcional)';obs.value=d.obs||'';
      obs.addEventListener('input',function(){d.obs=obs.value;alCambiar(d,{});});t.appendChild(obs);
    }
    var naFila=document.createElement('label');naFila.className='na-fila';
    var chk=document.createElement('input');chk.type='checkbox';chk.checked=!!d.na;
    var txt=document.createElement('span');txt.textContent='No aplica';
    chk.addEventListener('change',function(){d.na=chk.checked;if(!d.na)d.motivoNa='';alCambiar(d,{});window.UI.render();});
    naFila.appendChild(chk);naFila.appendChild(txt);t.appendChild(naFila);
    if(d.na){var mot=document.createElement('textarea');mot.className='campo';mot.style.marginTop='8px';
      mot.placeholder='Motivo (obligatorio)';mot.value=d.motivoNa||'';
      mot.addEventListener('input',function(){d.motivoNa=mot.value;alCambiar(d,{});});t.appendChild(mot);
      if(!String(d.motivoNa||'').trim()){var e=document.createElement('p');e.className='error';e.textContent='Escribí el motivo para avanzar.';t.appendChild(e);}}
    return t;
  }
  function puntajeItem(d,item){if(d.na)return null;return pct(item,d);}
  function aPdf(item,d){if(d.na)return {lineas:['NO APLICA — '+(d.motivoNa||'sin motivo')]};
    var l=['Cumplido: '+pct(item,d)+'%'];(item.puntos||[]).forEach(function(p,i){l.push((d.marcados[i]?'[x] ':'[ ] ')+p);});
    if(String(d.obs||'').trim())l.push('Obs: '+d.obs);return {lineas:l,fotos:d.fotos||[]};}
  window.Controles.registrar('checklist',{inicial:inicial,render:render,
    puntaje:function(){return null;},puntajeItem:puntajeItem,aPdf:aPdf});
})();
