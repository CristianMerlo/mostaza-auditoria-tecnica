(function(){
  'use strict';
  var tentativo=null,mensaje='',intentos=0;
  function render(cont,v){ if(v.jefe){conf(cont,v);return;} if(tentativo){pin(cont);return;} elegir(cont); }
  function elegir(cont){
    var t=document.createElement('div');t.className='tarjeta';
    t.innerHTML='<span class="etiqueta">Paso 1</span><h2 class="tarjeta__titulo">¿Quién hace la visita?</h2><p class="tarjeta__texto">Elegí tu nombre y confirmá con tu PIN de 4 dígitos.</p>';
    window.Jefes.todos().forEach(function(j){var b=document.createElement('button');b.type='button';
      b.className='btn btn--bloque';b.textContent=j.nombre;
      b.addEventListener('click',function(){tentativo=j;mensaje='';window.UI.render();});t.appendChild(b);});
    if(mensaje)t.appendChild(err(mensaje));cont.appendChild(t);
  }
  function pin(cont){
    var t=document.createElement('div');t.className='tarjeta';
    t.innerHTML='<span class="etiqueta">Paso 1</span><h2 class="tarjeta__titulo">'+esc(tentativo.nombre)+'</h2><p class="tarjeta__texto">Escribí tu PIN de 4 dígitos.</p>';
    var c=document.createElement('input');c.type='tel';c.inputMode='numeric';c.autocomplete='off';c.maxLength=4;c.className='pin';
    c.setAttribute('aria-label','PIN de cuatro dígitos');
    c.addEventListener('input',function(){c.value=c.value.replace(/[^0-9]/g,'').slice(0,4);if(c.value.length===4)validar(c.value);});
    t.appendChild(c);
    if(mensaje)t.appendChild(err(mensaje));
    var vol=document.createElement('button');vol.type='button';vol.className='btn btn--bloque';vol.textContent='No soy '+tentativo.nombre;
    vol.addEventListener('click',function(){tentativo=null;mensaje='';window.UI.render();});t.appendChild(vol);
    cont.appendChild(t);setTimeout(function(){c.focus();},50);
  }
  function validar(p){
    if(window.Jefes.pinCorrecto(tentativo.id,p)){intentos=0;mensaje='';
      window.Visita.set('jefe',{id:tentativo.id,nombre:tentativo.nombre});tentativo=null;window.UI.render();return;}
    intentos++;mensaje='PIN incorrecto (intento '+intentos+'). Si te equivocaste de nombre, tocá "No soy '+tentativo.nombre+'".';
    window.UI.render();
  }
  function conf(cont,v){
    var t=document.createElement('div');t.className='tarjeta';
    t.innerHTML='<span class="etiqueta">Paso 1 · identificado</span><h2 class="tarjeta__titulo" style="font-size:22px">'+esc(v.jefe.nombre)+'</h2><p class="tarjeta__texto">La visita y el informe van a salir a este nombre. Si no sos vos, cambialo ahora.</p>';
    var s=document.createElement('button');s.type='button';s.className='btn btn--principal btn--bloque';
    s.textContent='Soy '+v.jefe.nombre+' — Continuar';s.addEventListener('click',function(){window.UI.siguiente();});t.appendChild(s);
    var cm=document.createElement('button');cm.type='button';cm.className='btn btn--bloque';cm.textContent='Cambiar de jefe';
    cm.addEventListener('click',function(){window.Visita.set('jefe',null);tentativo=null;mensaje='';window.UI.render();});t.appendChild(cm);
    cont.appendChild(t);
  }
  function err(txt){var p=document.createElement('p');p.className='tarjeta__texto error';p.setAttribute('role','alert');p.textContent=txt;return p;}
  function esc(t){var d=document.createElement('div');d.textContent=(t==null?'':String(t));return d.innerHTML;}
  window.UI.registrarPanel('identificacion',{render:render,
    puedeAvanzar:function(v){return v.jefe?true:'Identificate con tu PIN para seguir';}});
})();
