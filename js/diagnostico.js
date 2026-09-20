/* Panel de soporte accesible tocando la version en el pie. Audita que el ?v= de
   cada asset coincida con window.VT_VERSION (el bug del V12.5 vs v12-7). */
window.Diagnostico=(function(){
  'use strict';
  function verUrl(u){var m=/[?&]v=([^&]*)/.exec(u||'');return m?decodeURIComponent(m[1]):null;}
  function assets(){var l=[],vis={};
    function add(u){if(!u||vis[u])return;if(!/\.(css|js)(\?|$)/i.test(u))return;vis[u]=true;
      var a=u.split('/').slice(-1)[0].split('?')[0];var v=verUrl(u);l.push({archivo:a,v:v,ok:v===window.VT_VERSION});}
    document.querySelectorAll('link[rel="stylesheet"],script[src]').forEach(function(n){add(n.href||n.src);});
    if(window.performance&&performance.getEntriesByType)performance.getEntriesByType('resource').forEach(function(r){add(r.name);});
    return l;}
  function auditarVersion(){var a=assets();return {constante:window.VT_VERSION,
    enPantalla:(document.getElementById('btn-version')||{}).textContent||'',assets:a,
    todoOk:a.length>0&&a.every(function(x){return x.ok;})};}
  function esc(t){var d=document.createElement('div');d.textContent=(t==null?'':String(t));return d.innerHTML;}
  function fila(k,val,cls){return '<tr><th>'+k+'</th><td'+(cls?' class="'+cls+'"':'')+'>'+val+'</td></tr>';}
  function kb(b){if(b==null)return '—';if(b>1048576)return (b/1048576).toFixed(1)+' MB';return Math.round(b/1024)+' KB';}
  function render(cont){
    var a=auditarVersion(),est=window.Almacen.estado,v=window.Visita.actual();
    var h='<div class="diag"><h3>Versión</h3><table>';
    h+=fila('Constante',esc(a.constante));
    h+=fila('Pie',esc(a.enPantalla));
    h+=fila('Coinciden',a.enPantalla.replace(/^v/,'')===a.constante?'SÍ':'NO',a.enPantalla.replace(/^v/,'')===a.constante?'ok':'mal');
    h+=fila('Assets con ?v= correcto',a.assets.filter(function(x){return x.ok;}).length+' de '+a.assets.length,a.todoOk?'ok':'mal');
    h+='</table><table><tr><th>Archivo</th><th>?v=</th><th></th></tr>';
    a.assets.forEach(function(x){h+='<tr><td>'+esc(x.archivo)+'</td><td>'+esc(x.v||'(sin)')+'</td><td class="'+(x.ok?'ok':'mal')+'">'+(x.ok?'OK':'DISTINTO')+'</td></tr>';});
    h+='</table><h3>Paleta</h3><table>';
    window.Paleta.roles.forEach(function(rol){var hx=window.Paleta.hex(rol);
      h+='<tr><th>'+rol+'</th><td><span class="muestra" style="background:'+hx+'"></span> '+esc(hx)+'</td><td>'+window.Paleta.rgb(rol).join(', ')+'</td></tr>';});
    h+='</table><table>'+fila('Origen',window.Paleta.desdeRespaldo()?'respaldo':'css/app.css',window.Paleta.desdeRespaldo()?'mal':'ok')+'</table>';
    h+='<h3>Almacenamiento</h3><table>';
    h+=fila('Texto',esc(est.motivoTexto||'—'),est.textoPersistente?'ok':'mal');
    h+=fila('Binario',esc(est.motivoBinario||'sin abrir'),est.binarioPersistente?'ok':'mal');
    h+=fila('Escrituras',est.escrituras);
    h+='<tr><th>Espacio</th><td id="diag-esp">midiendo…</td></tr></table>';
    h+='<h3>Visita</h3><table>';
    if(!v){h+=fila('Estado','sin visita');}
    else{h+=fila('Código',esc(v.codigo||'(pendiente)'));h+=fila('Paso',esc(v.paso));
      h+=fila('Local',esc(v.local?v.local.nombre:'—'));h+=fila('Jefe',esc(v.jefe?v.jefe.nombre:'—'));
      h+=fila('Fotos',window.Fotos.totalVisita());h+=fila('Cocina',esc(v.scores.cocina));
      h+=fila('Edilicio',esc(v.scores.edilicio));h+=fila('General',esc(v.scores.general));
      h+=fila('PDF generado',v.pdfGenerado?'sí':'no');h+=fila('Esquema',esc(v.esquema));}
    h+='</table><h3>Entorno</h3><table>';
    h+=fila('Origen',esc(location.protocol+'//'+location.host));
    h+=fila('Conexión',navigator.onLine?'con red':'sin red',navigator.onLine?'ok':'');
    h+=fila('Pantalla',window.innerWidth+' x '+window.innerHeight+' @ '+(window.devicePixelRatio||1)+'x');
    h+='</table></div>';
    cont.innerHTML=h;
    window.Almacen.espacio().then(function(e){var c=document.getElementById('diag-esp');if(!c)return;
      c.textContent=e?(kb(e.usado)+' de '+kb(e.disponible)):'no informado';});
  }
  return {render:render,auditarVersion:auditarVersion};
})();
