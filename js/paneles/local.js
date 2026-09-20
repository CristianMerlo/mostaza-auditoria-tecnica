(function(){
  'use strict';
  var busqueda='',modoManual=false,mensaje='',geoEstado='';
  var BASE=Date.UTC(2026,0,1);
  function render(cont,v){ cont.appendChild(v.local?fichaLocal(v):buscador(v)); }
  function buscador(v){
    var t=document.createElement('div');t.className='tarjeta';
    t.innerHTML='<span class="etiqueta">Paso 2</span><h2 class="tarjeta__titulo">¿Qué local estás auditando?</h2>';
    if(modoManual){armarManual(t);return t;}
    var p=document.createElement('p');p.className='tarjeta__texto';
    p.textContent='Buscá por nombre, sigla o provincia. '+window.Locales.total+' locales cargados.';t.appendChild(p);
    var c=document.createElement('input');c.type='search';c.className='campo';c.placeholder='SAN JUSTO, FSJU, MENDOZA…';c.value=busqueda;
    c.setAttribute('aria-label','Buscar local');
    var lista=document.createElement('div');
    c.addEventListener('input',function(){busqueda=c.value;pintar(lista);});t.appendChild(c);t.appendChild(lista);pintar(lista);
    var man=document.createElement('button');man.type='button';man.className='btn btn--bloque';man.textContent='Otro local — carga manual';
    man.addEventListener('click',function(){modoManual=true;window.UI.render();});t.appendChild(man);return t;
  }
  function pintar(cont){cont.innerHTML='';var res=window.Locales.buscar(busqueda,12);
    if(!res.length){var p=document.createElement('p');p.className='tarjeta__texto error';
      p.textContent='Ningún local coincide. Puede cargarse manualmente.';cont.appendChild(p);return;}
    res.forEach(function(l){var b=document.createElement('button');b.type='button';b.className='btn btn--bloque btn--opcion';
      b.appendChild(lin(l.nombre,'opcion__nombre'));b.appendChild(lin(sig(l)+' · '+l.tipo,'opcion__detalle'));
      b.addEventListener('click',function(){elegir(l);});cont.appendChild(b);});}
  function lin(t,c){var s=document.createElement('span');s.className=c;s.textContent=t;return s;}
  function sig(l){if(l.siglaSistema&&l.siglaTicket&&l.siglaSistema!==l.siglaTicket)return 'sistema '+l.siglaSistema+' / ticket '+l.siglaTicket;
    if(l.siglaSistema)return 'sigla '+l.siglaSistema;
    return l.provincia?l.provincia:'sin sigla en el padrón';}
  function armarManual(t){
    var p=document.createElement('p');p.className='tarjeta__texto';
    p.textContent='Para locales que todavía no están en el padrón. Queda asentado en el informe que la sigla se cargó a mano.';t.appendChild(p);
    var nombre=campo(t,'Nombre del local','ej. LOMAS CENTER');
    var sigla=campo(t,'Sigla (si la sabés)','ej. FLOMC');
    t.appendChild(etq('Tipo'));var tipo=document.createElement('select');tipo.className='campo';
    ['franquicia','propio'].forEach(function(o){var op=document.createElement('option');op.value=o;op.textContent=o;tipo.appendChild(op);});t.appendChild(tipo);
    if(mensaje){var e=document.createElement('p');e.className='tarjeta__texto error';e.textContent=mensaje;t.appendChild(e);}
    var ok=document.createElement('button');ok.type='button';ok.className='btn btn--principal btn--bloque';ok.textContent='Usar este local';
    ok.addEventListener('click',function(){if(!nombre.value.trim()){mensaje='Falta el nombre del local.';window.UI.render();return;}
      mensaje='';elegir(window.Locales.manual(nombre.value,sigla.value,tipo.value));});t.appendChild(ok);
    var vol=document.createElement('button');vol.type='button';vol.className='btn btn--bloque';vol.textContent='Volver al buscador';
    vol.addEventListener('click',function(){modoManual=false;mensaje='';window.UI.render();});t.appendChild(vol);
  }
  function elegir(local){window.Visita.aplicar(function(v){v.local=local;
    var cods=generarCodigos(v,local); v.codigo=cods.legible; v.codigoValidacion=cods.validacion;
  },'local'); modoManual=false;busqueda='';window.UI.render();}
  function normalizarNombre(n){var s=String(n||'').toUpperCase();
    s=s.normalize?s.normalize('NFD').replace(/[\u0300-\u036f]/g,''):s;
    return s.replace(/[^A-Z0-9]+/g,'_').replace(/^_+|_+$/g,'');}
  function minutosBase(){return Math.floor((Date.now()-BASE)/60000);}
  function hash4(txt){var h=0;for(var i=0;i<txt.length;i++){h=((h<<5)-h+txt.charCodeAt(i))|0;}
    var s=(h>>>0).toString(36).toUpperCase();while(s.length<4)s='0'+s;return s.slice(-4);}
  function generarCodigos(v,local){var min=minutosBase();
    var nombreNorm=normalizarNombre(local.nombre);
    var id=local.idGenerador||local.siglaSistema||local.clave;
    var semilla=(v.jefe?v.jefe.id:'')+'|'+local.clave+'|'+(v.iniciada||'')+'|'+Date.now();
    return {legible:'AT-'+min+'-'+nombreNorm, validacion:'AT-'+min+'-'+id+'-'+hash4(semilla)};}
  function fichaLocal(v){var l=v.local;var t=document.createElement('div');t.className='tarjeta';
    t.appendChild(etq('Paso 2 · local'));var h=document.createElement('h2');h.className='tarjeta__titulo';h.style.fontSize='20px';h.textContent=l.nombre;t.appendChild(h);
    t.appendChild(dato('Sigla de sistema',l.siglaSistema||'no figura en el padrón'));
    t.appendChild(dato('Sigla de ticket',l.siglaTicket||'no figura en el padrón'));
    if(l.provincia)t.appendChild(dato('Provincia',l.provincia));
    t.appendChild(dato('Tipo',l.tipo+(l.manual?' · cargado a mano':'')));
    t.appendChild(dato('Código de informe',v.codigo||'—'));
    t.appendChild(dato('Código de validación',v.codigoValidacion||'—'));
    t.appendChild(etq('Tickets abiertos del local (opcional)'));
    var pt=document.createElement('p');pt.className='item__ayuda';
    pt.textContent='Revisá la ticketera antes de la visita y anotá cuántos tickets tiene abiertos. Sale en el informe.';t.appendChild(pt);
    var tk=document.createElement('input');tk.type='number';tk.className='campo';tk.min='0';tk.step='1';tk.inputMode='numeric';
    tk.placeholder='ej. 3';tk.value=(v.ticketsAbiertos==null?'':v.ticketsAbiertos);
    tk.addEventListener('change',function(){var n=parseInt(tk.value,10);
      window.Visita.set('ticketsAbiertos',(isFinite(n)&&n>=0)?n:null);});
    t.appendChild(tk);
    t.appendChild(etq('Ubicación de la auditoría (opcional)'));
    var pg=document.createElement('p');pg.className='item__ayuda';
    pg.textContent='Un toque marca dónde estás. Se agrega al informe como referencia. No es obligatorio: si no hay señal o no das permiso, la auditoría sigue igual.';t.appendChild(pg);
    if(v.geo&&v.geo.lat!=null){
      t.appendChild(dato('Ubicación marcada',v.geo.lat.toFixed(5)+', '+v.geo.lng.toFixed(5)));
    }
    var bg=document.createElement('button');bg.type='button';bg.className='btn btn--bloque';
    bg.textContent=(v.geo&&v.geo.lat!=null)?'📍 Volver a marcar ubicación':'📍 Marcar ubicación';
    bg.addEventListener('click',function(){ marcarUbicacion(bg); });
    t.appendChild(bg);
    if(geoEstado){var eg=document.createElement('p');eg.className='item__ayuda';eg.textContent=geoEstado;t.appendChild(eg);}
    var cm=document.createElement('button');cm.type='button';cm.className='btn btn--bloque';cm.textContent='Cambiar de local';
    cm.addEventListener('click',function(){window.Visita.set('local',null);window.UI.render();});t.appendChild(cm);
    var seguir=document.createElement('button');seguir.type='button';seguir.className='btn btn--principal btn--bloque';seguir.textContent='Continuar al recorrido';
    seguir.addEventListener('click',function(){window.UI.siguiente();});t.appendChild(seguir);
    return t;}
  function marcarUbicacion(btn){
    if(!navigator.geolocation){geoEstado='Este dispositivo no permite geolocalización.';window.UI.render();return;}
    btn.disabled=true;btn.textContent='Obteniendo ubicación…';
    navigator.geolocation.getCurrentPosition(function(pos){
      window.Visita.set('geo',{lat:pos.coords.latitude,lng:pos.coords.longitude,
        precision:Math.round(pos.coords.accuracy||0),cuando:new Date().toISOString()});
      geoEstado='Ubicación marcada correctamente.';window.UI.render();
    },function(err){
      geoEstado='No se pudo obtener la ubicación ('+(err&&err.message?err.message:'permiso denegado')+'). La auditoría sigue igual.';
      window.UI.render();
    },{enableHighAccuracy:true,timeout:10000,maximumAge:0});
  }
  function etq(t){var s=document.createElement('span');s.className='etiqueta';s.textContent=t;return s;}
  function dato(k,val){var d=document.createElement('p');d.className='dato';var kk=document.createElement('span');kk.className='dato__clave';kk.textContent=k;
    var vv=document.createElement('span');vv.className='dato__valor';vv.textContent=val;d.appendChild(kk);d.appendChild(vv);return d;}
  function campo(padre,rot,ej){padre.appendChild(etq(rot));var i=document.createElement('input');i.type='text';i.className='campo';i.autocomplete='off';i.placeholder=ej;padre.appendChild(i);return i;}
  window.UI.registrarPanel('local',{render:render,puedeAvanzar:function(v){
    if(!v.local)return 'Elegí el local antes de seguir';return true;}});
})();
