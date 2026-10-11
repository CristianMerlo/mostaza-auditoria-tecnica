window.Checklist=(function(){
  'use strict';
  // V2.3.0: ajustes de las visitas Wilde/Caseros (07/10/2026) + relevamiento Quilmes.
  // sector: agrupador visual (los ítems van ordenados por sector para que el PDF no saltee de zona)
  // requiereObs: exige texto en Observaciones (fechas, remitos, certificados) aunque el puntaje sea alto
  var COCINA=[
    {id:'coc-02',nombre:'Sector cafetería',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-03a',nombre:'Módulo de retención',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-03b',nombre:'Módulo de transfer',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-04',nombre:'Heladeras y freezers de línea (bajo mesada)',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-05a',nombre:'Horno de medialunas',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-05b',nombre:'Horno de tostados / paninera',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-06',nombre:'Broiler',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-07',nombre:'Planchas',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-08',nombre:'Freidoras',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-13',nombre:'Máquina de helados',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-11',nombre:'Fabricadora de hielo',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-14',nombre:'Acarameladora',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-15',nombre:'PHU (unidad de calentamiento)',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-16',nombre:'Microondas',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-09',nombre:'Campana de extracción y filtros',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-09b',nombre:'Limpieza de ductos y extracción — anotar última fecha y si hay remito de limpieza recurrente/programada',tipo:'slider',fotos:true,sector:'Cocina',requiereObs:true},
    {id:'coc-18',nombre:'Sistema de incendios — verificar vencimiento y estado',tipo:'slider',fotos:true,sector:'Cocina',requiereObs:true},
    {id:'coc-10',nombre:'Cámaras de frío (Refrigeración y Congelado)',tipo:'slider',fotos:true,sector:'Cocina'},
    {id:'coc-17',nombre:'Tanques de agua — certificado/constancia de limpieza (vigencia dentro de los 6 meses)',tipo:'slider',fotos:true,sector:'Cocina',requiereObs:true},
    {id:'coc-12',nombre:'Equipo de filtración de agua / Dispensadores',tipo:'agua',puntua:false,sector:'Cocina'}
  ];
  var EDILICIO=[
    {id:'edi-01',nombre:'Fachada y acceso principal',tipo:'slider',fotos:true,sector:'Fachada'},
    {id:'edi-01b',nombre:'Marquesina (estado estructural e iluminación)',tipo:'slider',fotos:true,sector:'Fachada'},
    {id:'edi-13',nombre:'Bloque exterior (perimetral, vereda, entorno)',tipo:'slider',fotos:true,sector:'Fachada'},
    {id:'edi-06',nombre:'Puerta principal, automáticas, mecánicas, portones y estado de cortina',tipo:'slider',fotos:true,sector:'Fachada'},
    {id:'edi-02',nombre:'Dining — Comedor/Salón (Pisos, zócalos y paredes)',tipo:'slider',fotos:true,sector:'Dining'},
    {id:'edi-03',nombre:'Cielorrasos e iluminación general del salón',tipo:'slider',fotos:true,sector:'Dining'},
    {id:'edi-04',nombre:'Sistema de climatización, aires acondicionados',tipo:'slider',fotos:true,sector:'Dining'},
    {id:'edi-05',nombre:'Baños públicos y sanitarios',tipo:'slider',fotos:true,sector:'Dining'},
    // V2.5.0: mega-bloque de Cocina — un solo módulo con subpuntos por chip (ver js/controles/bloque.js)
    {id:'edi-02b',nombre:'Cocina — inspección completa',tipo:'bloque',fotos:true,fotosMax:8,sector:'Cocina',
      subs:[
        {k:'pisos',n:'Pisos, rejillas y desagües'},
        {k:'paredes',n:'Paredes, azulejos y revestimientos'},
        {k:'cielorraso',n:'Cielorraso y techos'},
        {k:'aire',n:'Salidas de aire y ventilación'},
        {k:'luces',n:'Iluminación y tomas de servicio'},
        {k:'limpieza',n:'Hermeticidad y limpieza general'}]},
    {id:'edi-07',nombre:'Pisos, rejillas y canaletas de desagüe (servicios, depósitos y baños)',tipo:'slider',fotos:true,sector:'Servicios'},
    {id:'edi-09',nombre:'Techos y cielorrasos (depósitos y áreas de servicio)',tipo:'slider',fotos:true,sector:'Servicios'},
    {id:'edi-10',nombre:'Tableros eléctricos (retención de transformer e instalación)',tipo:'slider',fotos:true,sector:'Servicios'},
    {id:'edi-10b',nombre:'Iluminación de emergencia',tipo:'slider',fotos:true,sector:'Servicios'},
    {id:'edi-11',nombre:'Instalación sanitaria general y trampa de grasa',tipo:'slider',fotos:true,sector:'Servicios'},
    {id:'edi-12',nombre:'Depósito, vestuarios y áreas de personal',tipo:'slider',fotos:true,sector:'Servicios'},
    {id:'edi-14',nombre:'Terraza — limpieza de drenajes (prevención de goteras/filtraciones)',tipo:'slider',fotos:true,sector:'Terraza',requiereObs:true},
    {id:'edi-15',nombre:'Terraza — acceso (estado, cierre, seguridad)',tipo:'slider',fotos:true,sector:'Terraza'},
    {id:'edi-16',nombre:'Terraza — observaciones generales',tipo:'texto',sector:'Terraza',placeholder:'Detalles varios de la terraza…'}
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
