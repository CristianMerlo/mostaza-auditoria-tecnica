window.Checklist=(function(){
  'use strict';
  // V2.2.0: ítems ajustados por relevamiento real (Quilmes, 24/09/2026).
  // sector: agrupador visual del recorrido · aplicaSi: formatos de local donde el ítem corresponde (si falta, aplica a todos)
  var COCINA=[
    {id:'coc-02',nombre:'Cafetera y módulo de bebidas',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-03a',nombre:'Módulo de retención',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-03b',nombre:'Módulo de transfer',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-04',nombre:'Heladeras y freezers de línea (bajo mesada)',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-05a',nombre:'Horno de medialunas',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-05b',nombre:'Horno de tostados / paninera',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-06',nombre:'Broiler',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-07',nombre:'Planchas',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-08',nombre:'Freidoras',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-13',nombre:'Máquina de helados',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-14',nombre:'Carameladora',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-15',nombre:'PHU (unidad de calentamiento)',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-16',nombre:'Microondas',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-09',nombre:'Campana de extracción y filtros',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-09b',nombre:'Limpieza de ductos de extracción (anotar última fecha realizada)',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-10',nombre:'Cámaras de frío (Refrigeración y Congelado)',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-11',nombre:'Fábrica de hielo',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-12',nombre:'Equipo de filtración de agua / Dispensadores',tipo:'agua',puntua:false,sector:'Cocina'}
  ];
  var EDILICIO=[
    {id:'edi-01',nombre:'Fachada y acceso principal',tipo:'slider',fotos:true,sector:'Fachada'},
    {id:'edi-01b',nombre:'Marquesina (estado de luces)',tipo:'slider',fotos:true,sector:'Fachada',aplicaSi:['AUTO / DRIVE THRU','A LA CALLE']},
    {id:'edi-01c',nombre:'Careta de torre',tipo:'slider',fotos:true,sector:'Fachada',aplicaSi:['AUTO / DRIVE THRU','A LA CALLE']},
    {id:'edi-02',nombre:'Dining — Comedor/Salón (Pisos, zócalos y paredes)',tipo:'slider',fotos:true,sector:'Dining'},
    {id:'edi-02b',nombre:'Estado general de cocina',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'edi-03',nombre:'Cielorrasos e iluminación general del salón',tipo:'slider',fotos:true,sector:'Dining'},
    {id:'edi-04',nombre:'Sistema de climatización / Aires acondicionados (Grillas y difusores)',tipo:'slider',fotos:true,sector:'Dining'},
    {id:'edi-05',nombre:'Baños públicos y sanitarios',tipo:'slider',fotos:true,sector:'Dining'},
    {id:'edi-06',nombre:'Puertas, aberturas y cerramientos',tipo:'slider',fotos:true,sector:'Fachada'},
    {id:'edi-07',nombre:'Pisos, rejillas y canaletas de desagüe (Cocina y servicios)',tipo:'slider',fotos:true,sector:'Servicios'},
    {id:'edi-08',nombre:'Paredes, azulejos y revestimientos cerámicos (Cocina)',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'edi-09',nombre:'Techos y cielorrasos (Cocina y depósitos)',tipo:'slider',fotos:true,sector:'Servicios'},
    {id:'edi-10',nombre:'Tableros eléctricos (retención de transformer e instalación)',tipo:'slider',fotos:true,sector:'Servicios'},
    {id:'edi-10b',nombre:'Iluminación de emergencia',tipo:'slider',fotos:true,sector:'Servicios'},
    {id:'edi-11',nombre:'Instalación sanitaria general y trampa de grasa',tipo:'slider',fotos:true,sector:'Servicios'},
    {id:'edi-12',nombre:'Depósito, vestuarios y áreas de personal',tipo:'slider',fotos:true,sector:'Servicios'}
  ];
  function todos(){return COCINA.concat(EDILICIO);}
  function porBloque(b){return b==='cocina'?COCINA.slice():EDILICIO.slice();}
  // Ítems que corresponden al formato de local informado (sin formato = todos)
  function visibles(b,formato){
    return porBloque(b).filter(function(it){
      if(!it.aplicaSi)return true;
      if(!formato)return true;
      return it.aplicaSi.indexOf(formato)!==-1;
    });
  }
  function porId(id){var t=todos();for(var i=0;i<t.length;i++)if(t[i].id===id)return t[i];return null;}
  function bloqueDe(id){return id.indexOf('coc-')===0?'cocina':'edilicio';}
  return {cocina:COCINA,edilicio:EDILICIO,todos:todos,porBloque:porBloque,visibles:visibles,porId:porId,bloqueDe:bloqueDe};
})();
