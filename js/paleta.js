window.Paleta=(function(){
  'use strict';
  var VARS={marca:'--c-marca',tinta:'--c-tinta',fondo:'--c-fondo',superficie:'--c-superficie',
    borde:'--c-borde',bordeInput:'--c-borde-input',label:'--c-label',texto:'--c-texto',
    verde:'--c-verde',amarillo:'--c-amarillo',rojo:'--c-rojo',sinMedir:'--c-sin-medir'};
  var RESP={marca:'#F58220',tinta:'#1A1A1B',fondo:'#f3f4f6',superficie:'#ffffff',borde:'#d1d5db',
    bordeInput:'#9ca3af',label:'#6b7280',texto:'#1A1A1B',verde:'#16a34a',amarillo:'#eab308',
    rojo:'#c80000',sinMedir:'#6b7280'};
  var cache=null,usoResp=false;
  function listo(){ if(window.VT_CSS_LISTO)return Promise.resolve();
    return new Promise(function(r){document.addEventListener('vt:css',function(){r();},{once:true});setTimeout(r,1500);});}
  function norm(v){ if(v.charAt(0)==='#'){ if(v.length===4)return '#'+v[1]+v[1]+v[2]+v[2]+v[3]+v[3]; return v.toLowerCase();}
    var m=v.match(/rgba?\(([^)]+)\)/); if(m){var p=m[1].split(',').map(function(n){return parseInt(n,10)||0;});
      return '#'+p.slice(0,3).map(function(n){var h=n.toString(16);return h.length===1?'0'+h:h;}).join('');} return v;}
  function cargar(){ if(cache)return cache; cache={};
    var st=window.getComputedStyle(document.documentElement);
    Object.keys(VARS).forEach(function(rol){var val=(st.getPropertyValue(VARS[rol])||'').trim();
      if(!val){val=RESP[rol];usoResp=true;} cache[rol]=norm(val);}); return cache;}
  function hex(rol){var p=cargar();return p[rol]||RESP[rol]||'#000000';}
  function rgb(rol){var h=hex(rol).replace('#','');
    return [parseInt(h.substring(0,2),16),parseInt(h.substring(2,4),16),parseInt(h.substring(4,6),16)];}
  return {listo:listo,hex:hex,rgb:rgb,todo:function(){return Object.assign({},cargar());},
    roles:Object.keys(VARS),desdeRespaldo:function(){cargar();return usoResp;}};
})();
