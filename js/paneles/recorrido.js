(function(){
  'use strict';
  function armar(bloque){
    return {
      render:function(cont,v){
        var items=window.Checklist.porBloque(bloque);
        cabezal(cont,v,bloque,items);
        items.forEach(function(item){
          if(!v.items[item.id])v.items[item.id]=window.Controles.inicial(item);
          var d=v.items[item.id];
          var ctrl=window.Controles.obtener(item.tipo);
          var el=ctrl.render(item,d,function(datos,opts){
            v.items[item.id]=datos;
            window.Visita.aplicar(function(){},'item:'+item.id);
            window.UI.actualizarSemaforo(window.Visita.actual());
          });
          cont.appendChild(el);
        });
      },
      puedeAvanzar:function(v){
        var items=window.Checklist.porBloque(bloque);
        for(var i=0;i<items.length;i++){var it=items[i],d=v.items[it.id];
          if(!d)continue;
          if(d.na&&!String(d.motivoNa||'').trim())
            return 'El ítem "'+it.nombre+'" está en No aplica sin motivo. Escribí el motivo.';
          if(it.fotos && !d.na && typeof d.valor==='number' && d.valor<window.CONFIG.umbralFotoObligatoria){
            var n=window.Fotos.fotosDe(d);
            if(n<window.CONFIG.fotosMinObligatorias)
              return 'El ítem "'+it.nombre+'" tiene puntaje crítico. Cargá al menos '+window.CONFIG.fotosMinObligatorias+' fotos para avanzar.';
          }
        }
        return true;
      }
    };
  }
  function cabezal(cont,v,bloque,items){
    var t=document.createElement('div');t.className='tarjeta';
    var titulo=bloque==='cocina'?'Recorrido de cocina':'Recorrido edilicio';
    t.appendChild(etq(bloque==='cocina'?'Paso 3':'Paso 4'));
    var h=document.createElement('h2');h.className='tarjeta__titulo';h.textContent=titulo;t.appendChild(h);
    var puntuables=items.filter(function(it){return it.tipo!=='agua';});
    var tocados=0,na=0;
    puntuables.forEach(function(it){var d=v.items[it.id];if(!d)return;if(d.na)na++;else if(d.tocado)tocados++;});
    var pend=puntuables.length-tocados-na;
    var p=document.createElement('p');p.className='tarjeta__texto';
    p.textContent='Todos arrancan en 100. Ajustá solo lo que esté mal. Ajustados: '+tocados+
      ' · N/A: '+na+' · en 100: '+pend+'. Un ítem crítico (<60) exige 2 fotos.';
    t.appendChild(p);
    var sc=window.Scoring.promedioBloque(v,bloque);
    var barra=document.createElement('div');barra.className='progreso-bloque';
    var fill=document.createElement('div');fill.className='progreso-bloque__fill';
    fill.style.width=(sc==null?0:sc)+'%';barra.appendChild(fill);t.appendChild(barra);
    var pv=document.createElement('p');pv.className='item__ayuda';
    pv.textContent='Puntaje del bloque: '+(sc==null?'—':sc+'/100');t.appendChild(pv);
    cont.appendChild(t);
  }
  function etq(t){var s=document.createElement('span');s.className='etiqueta';s.textContent=t;return s;}
  window.UI.registrarPanel('cocina',armar('cocina'));
  window.UI.registrarPanel('edilicio',armar('edilicio'));
})();
