/* Promedios por bloque y general. No conoce los tipos: le pregunta a cada control
   su puntaje. null y "no aplica" se excluyen. General = promedio ponderado (config). */
window.Scoring=(function(){
  'use strict';
  function puntajeItem(item,d){ if(!d)return null;
    var c=window.Controles.obtener(item.tipo);
    if(c.puntajeItem)return c.puntajeItem(d,item);
    return c.puntaje?c.puntaje(d):null; }
  function promedioBloque(v,bloque){
    var items=window.Checklist.porBloque(bloque),suma=0,n=0;
    items.forEach(function(item){ if(item.puntua===false)return;
      var d=v.items[item.id]; var p=puntajeItem(item,d); if(p==null)return; suma+=p;n++; });
    return n?Math.round(suma/n*100)/100:null; }
  function color(p){ if(p==null)return 'gris';
    if(p<window.CONFIG.umbrales.rojo)return 'rojo';
    if(p<=window.CONFIG.umbrales.verde)return 'amarillo'; return 'verde'; }
  function general(coc,edi){ var pesos=window.CONFIG.pesosBloques,partes=[],peso=0;
    if(coc!=null){partes.push(coc*pesos.cocina);peso+=pesos.cocina;}
    if(edi!=null){partes.push(edi*pesos.edilicio);peso+=pesos.edilicio;}
    if(!peso)return null; var s=0;partes.forEach(function(x){s+=x;});return Math.round(s/peso*100)/100; }
  function recalcular(v){ var c=promedioBloque(v,'cocina'),e=promedioBloque(v,'edilicio');
    v.scores={cocina:c,edilicio:e,general:general(c,e)}; return v.scores; }
  return {puntajeItem:puntajeItem,promedioBloque:promedioBloque,color:color,general:general,recalcular:recalcular};
})();
