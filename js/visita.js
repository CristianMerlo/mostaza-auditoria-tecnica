window.Visita=(function(){
  'use strict';
  var CLAVE=window.CONFIG.almacenamiento.claveVisita, ESQ=window.CONFIG.esquemaDatos;
  var actual=null,subs=[],guardados=0;
  function ahora(){return new Date().toISOString();}
  function nueva(){return {esquema:ESQ,version:window.CONFIG.version,codigo:null,
    iniciada:ahora(),actualizada:ahora(),paso:'identificacion',jefe:null,local:null,
    encargado:{nombre:'',cargo:''},
    parametrosAgua:{periodicidadDias:window.CONFIG.agua.periodicidadDiasDefault,
      recambioFiltro:{modo:window.CONFIG.agua.recambioFiltroDefault.modo,valor:window.CONFIG.agua.recambioFiltroDefault.valor}},
    items:{}, declarados:{cocina:false,edilicio:false}, fotosUsadas:0,
    firmas:{jefe:{guardada:false,bloqueada:false,id:'firma-jefe'},encargado:{guardada:false,bloqueada:false,id:'firma-encargado'}},
    scores:{cocina:null,edilicio:null,general:null}, pdfGenerado:false, finalizada:false};}
  function guardar(){if(!actual)return;actual.actualizada=ahora();window.Almacen.guardar(CLAVE,actual);guardados++;}
  function notificar(m){subs.forEach(function(fn){try{fn(actual,m);}catch(e){console.error(e);}});}
  function aplicar(mut,m){if(!actual)actual=nueva();mut(actual);guardar();notificar(m||'cambio');return actual;}
  function set(ruta,val){return aplicar(function(v){var p=ruta.split('.'),n=v;
    for(var i=0;i<p.length-1;i++){if(typeof n[p[i]]!=='object'||n[p[i]]===null)n[p[i]]={};n=n[p[i]];}
    n[p[p.length-1]]=val;},ruta);}
  function obtener(ruta){var n=actual,p=ruta.split('.');for(var i=0;i<p.length;i++){if(n===null||typeof n!=='object')return undefined;n=n[p[i]];}return n;}
  function borrador(){var v=window.Almacen.leer(CLAVE);if(!v)return null;
    if(v.esquema!==ESQ){window.Almacen.borrar(CLAVE);return null;}
    if(v.finalizada){window.Almacen.borrar(CLAVE);return null;} return v;}
  function retomar(v){actual=v;if(actual.version!==window.CONFIG.version){actual.versionInicial=actual.version;actual.version=window.CONFIG.version;}guardar();notificar('retomada');return actual;}
  function iniciar(){actual=nueva();guardar();notificar('iniciada');return actual;}
  function idsBinariosVivos(){var ids=[];if(!actual)return ids;
    Object.keys(actual.items||{}).forEach(function(id){var it=actual.items[id];(it&&it.fotos?it.fotos:[]).forEach(function(f){ids.push(f.id);});});
    if(actual.firmas)Object.keys(actual.firmas).forEach(function(k){if(actual.firmas[k].guardada)ids.push(actual.firmas[k].id);}); return ids;}
  function descartar(){actual=null;window.Almacen.borrar(CLAVE);
    return window.Almacen.limpiarHuerfanos([]).then(function(b){notificar('descartada');return b;});}
  function finalizar(){if(!actual)return Promise.reject(new Error('No hay visita'));
    if(!actual.pdfGenerado)return Promise.reject(new Error('Todavía no se generó el PDF'));
    actual.finalizada=true;guardar();actual=null;window.Almacen.borrar(CLAVE);
    return window.Almacen.limpiarHuerfanos([]).then(function(b){notificar('finalizada');return b;});}
  function suscribir(fn){subs.push(fn);return function(){subs=subs.filter(function(f){return f!==fn;});};}
  function engancharFlush(){var flush=function(){if(actual)window.Almacen.guardar(CLAVE,actual);};
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')flush();});
    window.addEventListener('pagehide',flush);}
  return {iniciar:iniciar,actual:function(){return actual;},hayVisita:function(){return actual!==null;},
    aplicar:aplicar,set:set,obtener:obtener,borrador:borrador,retomar:retomar,descartar:descartar,
    finalizar:finalizar,suscribir:suscribir,idsBinariosVivos:idsBinariosVivos,engancharFlush:engancharFlush,
    guardados:function(){return guardados;},esquemaVacio:nueva};
})();
