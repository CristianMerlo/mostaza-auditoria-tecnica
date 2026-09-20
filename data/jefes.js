window.Jefes=(function(){
  'use strict';
  var L=[
    {id:'jefe-1',nombre:'Emanuel Carrizo',pin:'1482'},
    {id:'jefe-2',nombre:'Lucas Firenze',pin:'2596'},
    {id:'jefe-3',nombre:'Braian Donecker',pin:'3047'},
    {id:'jefe-4',nombre:'Daniel Rodríguez',pin:'4813'},
    {id:'jefe-5',nombre:'Juan de Plazaola',pin:'5269'},
    {id:'jefe-6',nombre:'Cristian Merlo',pin:'0731'}
  ];
  function dist(a,b){var d=0;for(var i=0;i<4;i++)if(a.charAt(i)!==b.charAt(i))d++;return d;}
  function distMin(){var m=4;for(var i=0;i<L.length;i++)for(var j=i+1;j<L.length;j++){var d=dist(L[i].pin,L[j].pin);if(d<m)m=d;}return m;}
  function verificar(){var p=[];L.forEach(function(j){if(!/^[0-9]{4}$/.test(j.pin))p.push(j.nombre+': PIN inválido');});
    if(distMin()<2)p.push('Dos PIN difieren en 1 solo dígito');p.forEach(function(x){console.warn('data/jefes.js — '+x);});return p;}
  verificar();
  function porId(id){for(var i=0;i<L.length;i++)if(L[i].id===id)return L[i];return null;}
  return {todos:function(){return L.map(function(j){return {id:j.id,nombre:j.nombre};});},
    porId:function(id){var j=porId(id);return j?{id:j.id,nombre:j.nombre}:null;},
    pinCorrecto:function(id,pin){var j=porId(id);return !!j&&j.pin===String(pin);},
    distanciaMinima:distMin,verificar:verificar,cantidad:L.length};
})();
