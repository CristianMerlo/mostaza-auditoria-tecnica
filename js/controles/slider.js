(function(){
  'use strict';
  var CFG=window.CONFIG;
  var desbloqueados={};
  function inicial(item){return {tipo:'slider',valor:CFG.sliderDefault,tocado:false,declarado:false,
    obs:'',na:false,motivoNa:'',fotos:item.fotos?[]:undefined};}
  function claseColor(v){if(v<CFG.umbrales.rojo)return 'rojo';if(v<=CFG.umbrales.verde)return 'amarillo';return 'verde';}
  // Semáforo de la barra: verde≥80 · amarillo 60-79 · naranja 40-59 · rojo <40
  function claseSemaforo(v){if(v<40)return 'rojo';if(v<60)return 'naranja';if(v<80)return 'amarillo';return 'verde';}
  function render(item,d,alCambiar){
    var abierto=!!desbloqueados[item.id];
    var t=document.createElement('div'); t.className='tarjeta'+(d.na?' tarjeta--na':'')+(abierto&&!d.na?' tarjeta--activo':'');
    var cab=document.createElement('div'); cab.className='item__cabecera';
    var h=document.createElement('h3'); h.className='tarjeta__titulo'; h.textContent=item.nombre; h.style.margin='0';
    var val=document.createElement('span'); val.className='item__valor item__valor--'+(d.na?'gris':claseColor(d.valor));
    val.textContent=d.na?'N/A':d.valor;
    cab.appendChild(h); cab.appendChild(val); t.appendChild(cab);
    var pintarFoto=function(){};
    if(!d.na){
      var s=document.createElement('input'); s.type='range'; s.min='0'; s.max='100'; s.step='1';
      s.value=d.valor; s.className='slider slider--'+claseSemaforo(d.valor); s.setAttribute('aria-label',item.nombre);
      s.disabled=!abierto; s.style.opacity=abierto?'1':'0.5';
      s.addEventListener('input',function(){ d.valor=parseInt(s.value,10); d.tocado=true; d.declarado=false;
        val.textContent=d.valor; val.className='item__valor item__valor--'+claseColor(d.valor);
        s.className='slider slider--'+claseSemaforo(d.valor);
        alCambiar(d,{soloValor:true}); pintarFoto(); });
      t.appendChild(s);
      var btn=document.createElement('button'); btn.type='button'; btn.className='btn btn--bloque'+(abierto?' btn--principal':'');
      btn.textContent=abierto?'🔓 Fijar puntaje y observación':'🔒 Ajustar puntaje y observación';
      btn.addEventListener('click',function(){ desbloqueados[item.id]=!abierto; window.UI.render(); });
      t.appendChild(btn);
      var ay=document.createElement('p'); ay.className='item__ayuda';
      ay.textContent=abierto?'0 = crítico · 100 = sin observaciones. Tocá "Fijar" al terminar.'
                            :'Bloqueado para no moverlo al deslizar. Tocá "Ajustar" para cambiarlo.';
      t.appendChild(ay);
      var obs=document.createElement('textarea'); obs.className='campo'; obs.placeholder='Qué hay que mejorar (opcional)';
      obs.value=d.obs||''; obs.readOnly=!abierto; obs.style.opacity=abierto?'1':'0.6';
      /* V2.6.2 (Cristian 12/10): estos ítems piden un dato concreto (fecha de certificado,
         vencimiento de matzá). Con el recorrido libre no se bloquea el avance; sólo se
         recuerda que sin ese dato el informe queda incompleto. */
      var avisoDato=null;
      if(item.requiereObs){
        avisoDato=document.createElement('p'); avisoDato.className='aviso-dato';
        avisoDato.textContent='Falta el dato obligatorio: escribí la fecha o el vencimiento (lo pide el informe).';
        if(String(d.obs||'').trim())avisoDato.style.display='none';
      }
      obs.addEventListener('input',function(){ if(obs.readOnly)return; d.obs=obs.value;
        if(avisoDato)avisoDato.style.display=String(obs.value||'').trim()?'none':'';
        alCambiar(d,{}); });
      t.appendChild(obs);
      if(avisoDato)t.appendChild(avisoDato);
      if(item.fotos){ var cont=document.createElement('div'); t.appendChild(cont);
        pintarFoto=function(){ window.Fotos.renderItem(cont,item,d,alCambiar,true); };
        pintarFoto(); }
    }
    var naFila=document.createElement('label'); naFila.className='na-fila';
    var chk=document.createElement('input'); chk.type='checkbox'; chk.checked=!!d.na;
    var txt=document.createElement('span'); txt.textContent='No aplica (el local no tiene este equipo)';
    chk.addEventListener('change',function(){ d.na=chk.checked; if(!d.na)d.motivoNa=''; if(d.na)desbloqueados[item.id]=false; alCambiar(d,{}); window.UI.render(); });
    naFila.appendChild(chk); naFila.appendChild(txt); t.appendChild(naFila);
    if(d.na){ var mot=document.createElement('textarea'); mot.className='campo'; mot.style.marginTop='8px';
      mot.placeholder='Motivo (obligatorio): por qué no aplica'; mot.value=d.motivoNa||'';
      mot.addEventListener('input',function(){d.motivoNa=mot.value;alCambiar(d,{});}); t.appendChild(mot);
      if(!String(d.motivoNa||'').trim()){var e=document.createElement('p');e.className='error';
        e.textContent='Escribí el motivo: sin eso el informe no explica por qué no aplica.';t.appendChild(e);} }
    return t;
  }
  function puntaje(d){ if(d.na)return null; return typeof d.valor==='number'?d.valor:null; }
  function aPdf(item,d){ if(d.na)return {lineas:['NO APLICA — '+(d.motivoNa||'sin motivo')]};
    var l=['Puntaje: '+d.valor+'/100']; if(d.declarado&&!d.tocado)l.push('Revisado sin observaciones');
    if(String(d.obs||'').trim())l.push('Obs: '+d.obs); return {lineas:l,fotos:d.fotos||[]}; }
  window.Controles.registrar('slider',{inicial:inicial,render:render,puntaje:puntaje,aPdf:aPdf});
})();
