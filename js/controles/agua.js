(function(){
  'use strict';
  var ESCALA=['verde','amarillo','naranja','rojo'];
  function inicial(){return {tipo:'agua',ppm:{estado:'medido',valor:null},
    filtro:'OP',ablandador:'OP',osmosis:'N/A',detalle:'',semaforo:'gris',porQue:''};}
  function nivelPorPpm(v){ if(v>=1&&v<=49)return {n:'naranja',txt:'PPM '+v+' bajo rango (1-49): agua muy blanda'};
    if(v>=50&&v<=119)return {n:'verde',txt:'PPM '+v+' en rango óptimo (50-119)'};
    if(v>=120&&v<=300)return {n:'amarillo',txt:'PPM '+v+' en rango de alerta (120-300)'};
    if(v>300)return {n:'rojo',txt:'PPM '+v+' agua dura (>300): crítico'};
    if(v===0)return {n:'rojo',txt:'PPM 0: revisar, valor fuera de rango'};
    return {n:'verde',txt:'PPM '+v}; }
  function sube(n){var i=ESCALA.indexOf(n);return ESCALA[Math.min(i+1,ESCALA.length-1)];}
  function calcular(d){
    var noop=0,comp=[];
    ['filtro','ablandador','osmosis'].forEach(function(k){
      if(d[k]==='N/A')return; if(d[k]==='NO OP'){noop++;comp.push(k+' NO OP');}});
    var nivel,base;
    if(d.ppm.estado==='sin_medir'||d.ppm.valor==null){ nivel='gris'; base='PPM sin medir'; }
    else { var r=nivelPorPpm(d.ppm.valor); nivel=r.n; base=r.txt; }
    var por=base;
    if(nivel==='gris'){
      if(noop>=2){nivel='rojo';por+=' + 2 o más componentes NO OP ('+comp.join(', ')+')';}
      else if(noop===1){nivel='amarillo';por+=' + 1 componente NO OP ('+comp.join(', ')+')';}
      else {por+=' (estado depende de componentes; sin medir no se considera verde)';}
    } else {
      if(noop>=2){nivel='rojo';por+=' + 2 o más componentes NO OP ('+comp.join(', ')+')';}
      else if(noop===1){var antes=nivel;nivel=sube(nivel);por+=' + 1 componente NO OP ('+comp.join(', ')+') sube de '+antes+' a '+nivel;}
    }
    if(d.osmosis==='N/A')por+='. Ósmosis en N/A: excluida del cálculo.';
    d.semaforo=nivel; d.porQue=por; return {nivel:nivel,porQue:por};
  }
  function claseColor(sem){return sem==='naranja'?'marca':(sem==='gris'?'gris':sem);}
  function rotulo(sem){return ({verde:'VERDE',amarillo:'AMARILLO',naranja:'NARANJA',rojo:'ROJO',gris:'SIN MEDIR'})[sem];}
  function seg(t,val,opciones,onset){ var w=document.createElement('div');w.className='seg';
    opciones.forEach(function(o){var b=document.createElement('button');b.type='button';
      b.className='seg__b'+(val===o?' seg__b--on':'');b.textContent=o;
      b.addEventListener('click',function(){onset(o);});w.appendChild(b);}); t.appendChild(w); }
  function render(item,d,alCambiar){
    calcular(d);
    var t=document.createElement('div');t.className='tarjeta';
    var cab=document.createElement('div');cab.className='item__cabecera';
    var h=document.createElement('h3');h.className='tarjeta__titulo';h.style.margin='0';h.textContent=item.nombre;
    var val=document.createElement('span');val.className='item__valor item__valor--'+claseColor(d.semaforo);
    val.textContent=rotulo(d.semaforo);
    cab.appendChild(h);cab.appendChild(val);t.appendChild(cab);
    var por=document.createElement('p');por.className='item__ayuda';por.textContent=d.porQue;t.appendChild(por);
    if(d.ppm.estado==='medido'){
      var e=document.createElement('span');e.className='etiqueta';e.textContent='PPM post-filtrado (medí y cargá el valor)';t.appendChild(e);
      var i=document.createElement('input');i.type='number';i.className='campo';i.inputMode='numeric';
      i.min=window.CONFIG.ppm.min;i.max=window.CONFIG.ppm.max;i.placeholder='ej. 95';
      i.value=(d.ppm.valor==null?'':d.ppm.valor);
      i.addEventListener('change',function(){var n=parseInt(i.value,10);d.ppm.valor=isFinite(n)?n:null;alCambiar(d,{});window.UI.render();});
      t.appendChild(i);
    }
    var lblPend=document.createElement('label');lblPend.className='na-fila';
    var pend=document.createElement('input');pend.type='checkbox';pend.checked=(d.ppm.estado==='sin_medir');
    var pt=document.createElement('span');pt.textContent='No se pudo medir (dejar pendiente)';
    pend.addEventListener('change',function(){ if(pend.checked){d.ppm.estado='sin_medir';d.ppm.valor=null;}
      else{d.ppm.estado='medido';} alCambiar(d,{});window.UI.render(); });
    lblPend.appendChild(pend);lblPend.appendChild(pt);t.appendChild(lblPend);
    var comp=[['filtro','Filtro',['OP','NO OP','N/A']],['ablandador','Ablandador',['OP','NO OP','N/A']],
      ['osmosis','Ósmosis',['N/A','OP','NO OP']]];
    comp.forEach(function(c){var lab=document.createElement('span');lab.className='etiqueta';lab.textContent=c[1];t.appendChild(lab);
      seg(t,d[c[0]],c[2],function(o){d[c[0]]=o;alCambiar(d,{});window.UI.render();});});
    var ld=document.createElement('span');ld.className='etiqueta';ld.textContent='Detalle de instalación hídrica';t.appendChild(ld);
    var det=document.createElement('textarea');det.className='campo';det.placeholder='Cañerías, desagotes, ubicación del equipo';
    det.value=d.detalle||'';det.addEventListener('input',function(){d.detalle=det.value;alCambiar(d,{});});t.appendChild(det);
    return t;
  }
  function aPdf(item,d){ calcular(d);
    var l=['Estado: '+rotulo(d.semaforo),
      'PPM: '+((d.ppm.estado==='sin_medir'||d.ppm.valor==null)?'sin medir':d.ppm.valor),
      'Filtro: '+d.filtro+'  ·  Ablandador: '+d.ablandador+'  ·  Ósmosis: '+d.osmosis,
      'Motivo del color: '+d.porQue];
    if(String(d.detalle||'').trim())l.push('Instalación: '+d.detalle);
    return {lineas:l,semaforo:d.semaforo}; }
  window.Controles.registrar('agua',{inicial:inicial,render:render,puntaje:function(){return null;},aPdf:aPdf,calcular:calcular});
})();
