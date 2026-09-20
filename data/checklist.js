window.Checklist=(function(){
  'use strict';
  var COCINA=[
    {id:'coc-02',nombre:'Cafetera y módulo de bebidas',tipo:'slider',fotos:true},
    {id:'coc-03',nombre:'Módulo de retención / Transfer',tipo:'slider',fotos:true},
    {id:'coc-04',nombre:'Heladeras y freezers de línea (bajo mesada)',tipo:'slider',fotos:true},
    {id:'coc-05',nombre:'Tostadoras',tipo:'slider',fotos:true},
    {id:'coc-06',nombre:'Broiler',tipo:'slider',fotos:true},
    {id:'coc-07',nombre:'Planchas',tipo:'slider',fotos:true},
    {id:'coc-08',nombre:'Freidoras',tipo:'slider',fotos:true},
    {id:'coc-09',nombre:'Campana de extracción y filtros',tipo:'slider',fotos:true},
    {id:'coc-10',nombre:'Cámaras de frío (Refrigeración y Congelado)',tipo:'slider',fotos:true},
    {id:'coc-11',nombre:'Fábrica de hielo',tipo:'slider',fotos:true},
    {id:'coc-12',nombre:'Equipo de filtración de agua / Dispensadores',tipo:'agua',puntua:false}
  ];
  var EDILICIO=[
    {id:'edi-01',nombre:'Fachada, marquesina y acceso principal',tipo:'slider',fotos:true},
    {id:'edi-02',nombre:'Dinning Salón (Pisos, zócalos y paredes)',tipo:'slider',fotos:true},
    {id:'edi-02b',nombre:'Estado general de cocina',tipo:'slider',fotos:true},
    {id:'edi-03',nombre:'Cielorrasos e iluminación general del salón',tipo:'slider',fotos:true},
    {id:'edi-04',nombre:'Sistema de climatización / Aires acondicionados (Grillas y difusores)',tipo:'slider',fotos:true},
    {id:'edi-05',nombre:'Baños públicos y sanitarios',tipo:'slider',fotos:true},
    {id:'edi-06',nombre:'Puertas, aberturas y cerramientos',tipo:'slider',fotos:true},
    {id:'edi-07',nombre:'Pisos, rejillas y canaletas de desagüe (Cocina y servicios)',tipo:'slider',fotos:true},
    {id:'edi-08',nombre:'Paredes, azulejos y revestimientos cerámicos (Cocina)',tipo:'slider',fotos:true},
    {id:'edi-09',nombre:'Techos y cielorrasos (Cocina y depósitos)',tipo:'slider',fotos:true},
    {id:'edi-10',nombre:'Tableros eléctricos e instalación de iluminación de servicio',tipo:'slider',fotos:true},
    {id:'edi-11',nombre:'Instalación sanitaria general y trampa de grasa',tipo:'slider',fotos:true},
    {id:'edi-12',nombre:'Depósito, vestuarios y áreas de personal',tipo:'slider',fotos:true}
  ];
  function todos(){return COCINA.concat(EDILICIO);}
  function porBloque(b){return b==='cocina'?COCINA.slice():EDILICIO.slice();}
  function porId(id){var t=todos();for(var i=0;i<t.length;i++)if(t[i].id===id)return t[i];return null;}
  function bloqueDe(id){return id.indexOf('coc-')===0?'cocina':'edilicio';}
  return {cocina:COCINA,edilicio:EDILICIO,todos:todos,porBloque:porBloque,porId:porId,bloqueDe:bloqueDe};
})();
