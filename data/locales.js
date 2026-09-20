/* 89 franquicias del documento de dominio. Locales propios: carga manual (H1). */
window.Locales=(function(){
  'use strict'; var F='franquicia';
  var L=[
   ['VILLA DEL PARQUE','FVDP','FVDP',F],['SAN JUSTO','FSJU','FCSJ3',F],['LAFERRERE 2','FLF2','FLF2',F],
   ['RAMOS','FMRAM','FMRAM',F],['EZEIZA','FEZE','FEZEA',F],['CANNING','FMCAN','FMCAN',F],
   ['MONTEGRANDE','FMGD','FMGRA',F],['ZARATE','FZAR','FMZAR',F],['GUALEGUAYCHU','FMGUA','FMGUA',F],
   ['CABILDO','FCAB','FCABI',F],['CABILDO 2','FMCYM','FMCYM',F],['GUEMES','FGUE','FGUE',F],
   ['URQUIZA','FURQ','FMURQ',F],['PALMAS PILAR','FPPI','FPMPI',F],['SAN ISIDRO','FSIS','FMSIS',F],
   ['LA RIOJA','FMRVP','FMRVP',F],['CATAMARCA','FCAT','FMCAT',F],['F. ALVAREZ','FFRA','FFRA',F],
   ['MORENO','FMORE','FMMRE',F],['LUJAN','FLUJ','FLUJA',F],['SAN MARTIN 2','FMSVP','FMSVP',F],
   ['SAN MARTIN AUTO','FSMA','F3DF',F],['SAN JUAN','FSJN','FSJUA',F],['SAN JUAN 2','FSJ2','FMSJ2',F],
   ['CORDOBA','FMCBA','FMCBA',F],['BARILOCHE','FBARI','FBARI',F],['NEUQUEN','FNEU','FNEU',F],
   ['COMODORO','FCOM','FCOM',F],['ROSARIO','FROSA','FROSA',F],['SANTA FE','FSFE','FSFE',F],
   ['PARANA','FPAR','FPAR',F],['POSADAS','FPOS','FPOS',F],['CORRIENTES','FCORR','FCORR',F],
   ['RESISTENCIA','FRES','FRES',F],['FORMOSA','FFORM','FFORM',F],['SGO DEL ESTERO','FSDE','FSDE',F],
   ['SALTA','FSAL','FSAL',F],['JUJUY','FJUJ','FJUJ',F],['TUCUMAN 2','FTU2','FMTCM',F],
   ['TUCUMAN 3','FTU3','FMTM2',F],['TUCUMAN 4','FTU4','FMTU4',F],['TUCUMAN 5','FTC5','FTC5',F],
   ['TUCUMAN 6','FTC6','FMTU6',F],['TUCUMAN 7','FMTU7','FMTU7',F],['TUCUMAN 8','FTC8','FMTC8',F],
   ['PORTAL TUCUMAN','MPT','MPT',F],['TUCUMAN 9','FMTU9','FMTU9',F],['QUILMES P.','FQUP','FMQCA',F],
   ['LA PLATA 2','FLP2','FLPCA',F],['LA PLATA 3','FLP3','FLPC3',F],['LA PLATA 4','FLP4','FLPC4',F],
   ['LA PLATA 6','FLP6','FLPC6',F],['CITY BELL','FCYB','FMCB1',F],['LOMAS AUTO','FLOZ','',F],
   ['LOMAS','FMLCA','',F],['LANUS 2','FLA2','',F],['LA PAMPA','FLPA','',F],['GALLEGOS','FMP1','',F],
   ['ALDREY','FMP2','',F],['LA PERLA','FMD3','',F],['PEATONAL','FMDQ4','',F],['OLAVARRIA','FOLAV','',F],
   ['TANDIL','FCTA','',F],['TANDIL 2','','',F],['CIPOLLETTI','','',F],['GENERAL ROCA','','',F],
   ['VILLA REGINA','','',F],['RIO GALLEGOS','','',F],['USHUAIA','','',F],['TRELEW','','',F],
   ['PUERTO MADRYN','','',F],['MAR DEL PLATA','','',F],['BALCARCE','','',F],['AZUL','','',F],
   ['PERGAMINO','','',F],['SAN NICOLAS','','',F],['SAN PEDRO','','',F],['CHIVILCOY','','',F],
   ['JUNIN','','',F],['CONSTITUCION','FCONS','',F],['ONCE','FONCE','',F],['CENTRO','FCENT','',F],
   ['FLORES','FFLOR','',F],['LINIERS','FLIN','',F],['RETIRO','FRET','',F],['TRIBUNALES','FTRIB','',F],
   ['MENDOZA','FMENDOZA','',F],['MENDOZA 2','FMZA2','',F],['MENDOZA 3','FMZA3','',F]
  ];
  function clavear(n,s){if(s)return s;return n.toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/^_+|_+$/g,'');}
  var CAT=L.map(function(f){return {clave:clavear(f[0],f[1]),nombre:f[0],siglaSistema:f[1],siglaTicket:f[2],tipo:f[3],manual:false};});
  function norm(t){var s=String(t||'').toUpperCase();return s.normalize?s.normalize('NFD').replace(/[\u0300-\u036f]/g,''):s;}
  function buscar(txt,lim){var q=norm(txt).trim();if(!q)return CAT.slice(0,lim||12);
    var r=CAT.filter(function(l){return norm(l.nombre).indexOf(q)!==-1||norm(l.siglaSistema).indexOf(q)!==-1||norm(l.siglaTicket).indexOf(q)!==-1;});
    return lim?r.slice(0,lim):r;}
  function manual(n,s,t){var N=String(n||'').trim().toUpperCase(),S=String(s||'').trim().toUpperCase();
    return {clave:clavear(N,S),nombre:N,siglaSistema:S,siglaTicket:'',tipo:(t==='propio'?'propio':'franquicia'),manual:true};}
  function estad(){var d=0,u=0,s=0;CAT.forEach(function(l){if(l.siglaSistema&&l.siglaTicket)d++;else if(l.siglaSistema||l.siglaTicket)u++;else s++;});
    return {total:CAT.length,conDosSiglas:d,conUnaSigla:u,sinSiglas:s};}
  return {total:CAT.length,todos:function(){return CAT.slice();},buscar:buscar,
    porClave:function(c){for(var i=0;i<CAT.length;i++)if(CAT[i].clave===c)return CAT[i];return null;},
    manual:manual,clavear:clavear,estadisticas:estad};
})();
