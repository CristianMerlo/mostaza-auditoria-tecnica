window.CONFIG=(function(){
  'use strict';
  if(!window.VT_VERSION)throw new Error('Falta window.VT_VERSION');
  return {
    version:window.VT_VERSION, esquemaDatos:2,
    nombreApp:'Auditoría Técnica', pieCorporativo:'Mostaza — Control Interno Regional',
    umbrales:{rojo:60,verde:80},
    pesosBloques:{cocina:0.5,edilicio:0.5},
    sliderDefault:100, umbralFoto:70,
    umbralFotoObligatoria:60, fotosMinObligatorias:2,
    fotos:{
      maxLadoLargo:1200, calidad:0.65,
      maxPorItem:2,
      maxPorItemEdilicio:4,
      maxPorVisita:20,
      anchoEnPdfPx:800, porFilaEnPdf:2
    },
    ppm:{cortes:[50,120,300],min:0,max:9999},
    agua:{periodicidadDiasDefault:30,recambioFiltroDefault:{modo:'dias',valor:180},modosRecambio:['dias','ppm','litros']},
    firmas:{anchoMm:60,altoMm:30},
    avisarEspacioDesdeFoto:15,
    almacenamiento:{claveVisita:'vt:v2:visita',dbNombre:'vt-binarios',dbVersion:1,dbStore:'blobs'}
  };
})();
