(function(){
  'use strict';
  function render(cont,v){
    window.Scoring.recalcular(v);
    var t=document.createElement('div');t.className='tarjeta';t.appendChild(etq('Paso 6'));
    var h=document.createElement('h2');h.className='tarjeta__titulo';h.textContent='Informe';t.appendChild(h);
    t.appendChild(dato('Local',v.local?v.local.nombre:'—'));
    t.appendChild(dato('Código de informe',v.codigo||'—'));
    t.appendChild(dato('Código de validación',v.codigoValidacion||'—'));
    t.appendChild(dato('General',score(v.scores.general)));
    t.appendChild(dato('Cocina',score(v.scores.cocina)));
    t.appendChild(dato('Edilicio',score(v.scores.edilicio)));
    var dAgua=v.items['coc-12'];
    t.appendChild(dato('Agua',dAgua?({verde:'VERDE',amarillo:'AMARILLO',rojo:'ROJO',gris:'SIN MEDIR'})[dAgua.semaforo||'gris']:'sin datos'));
    cont.appendChild(t);
    var r=document.createElement('div');r.className='tarjeta';r.appendChild(etq('Repaso antes de firmar el informe'));
    var bajos=[],naArr=[],sinTocar=[];
    window.Checklist.todos().forEach(function(it){ if(it.tipo==='agua')return;
      var d=v.items[it.id];if(!d)return;
      if(d.na)naArr.push(it.nombre);
      else if(typeof d.valor==='number'&&d.valor<window.CONFIG.umbralFoto)bajos.push(it.nombre+' ('+d.valor+')');
      else if(!d.tocado)sinTocar.push(it.nombre);});
    r.appendChild(lista('Ítems por debajo de 70',bajos,'var(--c-rojo)'));
    r.appendChild(lista('No aplica',naArr,'var(--c-sin-medir)'));
    r.appendChild(lista('En 100 sin tocar',sinTocar,'var(--c-amarillo)'));
    cont.appendChild(r);
    var c=document.createElement('div');c.className='tarjeta';c.appendChild(etq('Confirmación de auditoría'));
    var lbl=document.createElement('label');lbl.className='na-fila';lbl.style.alignItems='flex-start';
    var chk=document.createElement('input');chk.type='checkbox';chk.checked=!!v.confirmacionAuditoria;
    var span=document.createElement('span');
    span.textContent='Confirmo que todos los ítems fueron auditados. Los que quedaron en 100 sin observaciones fueron revisados y están acordes al estándar.';
    chk.addEventListener('change',function(){
      window.Visita.aplicar(function(vv){ vv.confirmacionAuditoria=chk.checked;
        if(chk.checked){
          window.Checklist.todos().forEach(function(it){ if(it.tipo==='agua')return;
            var d=vv.items[it.id]; if(d&&!d.tocado&&!d.na)d.declarado=true; });
        }
      },'confirmacion');
      window.UI.render();
    });
    lbl.appendChild(chk);lbl.appendChild(span);c.appendChild(lbl);
    cont.appendChild(c);
    var g=document.createElement('div');g.className='tarjeta';g.appendChild(etq('Exportar'));
    var faltan=[];
    if(!v.firmas.jefe.guardada)faltan.push('firma del jefe');
    if(!v.firmas.encargado.guardada)faltan.push('firma del encargado');
    if(!String(v.encargado.nombre||'').trim())faltan.push('nombre del encargado');
    if(!v.confirmacionAuditoria)faltan.push('confirmación de auditoría');
    if(faltan.length){var e=document.createElement('p');e.className='tarjeta__texto error';
      e.textContent='No se puede generar el PDF: falta '+faltan.join(', ')+'.';g.appendChild(e);}
    var bPdf=document.createElement('button');bPdf.type='button';bPdf.className='btn btn--principal btn--bloque';
    bPdf.textContent=v.pdfGenerado?'Volver a generar el PDF':'Generar PDF';
    bPdf.disabled=faltan.length>0;
    bPdf.addEventListener('click',function(){
      bPdf.disabled=true;bPdf.textContent='Generando…';
      window.PDF.generar().then(function(out){
        out.doc.save(out.nombre);
        window.Visita.aplicar(function(vv){vv.pdfGenerado=true;},'pdf');
        window.UI.avisoTemporal('PDF generado: '+out.nombre);
        window.UI.render();
      }).catch(function(err){console.error(err);bPdf.disabled=false;bPdf.textContent='Generar PDF';
        window.UI.avisoTemporal('No se pudo generar el PDF: '+(err&&err.message?err.message:'error'));});
    });
    g.appendChild(bPdf);
    if(v.pdfGenerado){
      var ok=document.createElement('p');ok.className='item__ayuda';ok.style.color='var(--c-verde)';
      ok.textContent='✓ PDF generado. Guardalo o compartilo desde el teléfono. Recién ahora podés finalizar la visita.';g.appendChild(ok);
      var bFin=document.createElement('button');bFin.type='button';bFin.className='btn btn--peligro btn--bloque';
      bFin.textContent='Finalizar y cerrar la visita';
      bFin.addEventListener('click',function(){confirmarFin();});
      g.appendChild(bFin);
    }
    cont.appendChild(g);
  }
  function confirmarFin(){
    window.UI.modal({titulo:'¿Finalizar la visita?',
      html:'<p class="tarjeta__texto">Asegurate de tener el PDF guardado en el teléfono. Al finalizar se borra la visita de la app y se liberan las fotos. Esto no se puede deshacer.</p>',
      acciones:[
        {texto:'Sí, finalizar',estilo:'peligro',accion:function(){
          window.Visita.finalizar().then(function(){window.UI.render();window.UI.avisoTemporal('Visita finalizada.');})
            .catch(function(e){window.UI.avisoTemporal(e.message);});}},
        {texto:'No, volver',cerrar:true}
      ]});
  }
  function score(s){if(s==null)return 'sin datos';
    return s+'/100 ('+({verde:'VERDE',amarillo:'AMARILLO',rojo:'ROJO',gris:'—'})[window.Scoring.color(s)]+')';}
  function lista(titulo,arr,color){var w=document.createElement('div');var e=etq(titulo+' ('+arr.length+')');w.appendChild(e);
    if(!arr.length){var p=document.createElement('p');p.className='item__ayuda';p.textContent='ninguno';w.appendChild(p);return w;}
    arr.forEach(function(x){var p=document.createElement('p');p.className='tarjeta__texto';p.style.borderLeft='4px solid '+color;
      p.style.paddingLeft='8px';p.style.margin='4px 0';p.textContent=x;w.appendChild(p);});return w;}
  function etq(t){var s=document.createElement('span');s.className='etiqueta';s.textContent=t;return s;}
  function dato(k,val){var d=document.createElement('p');d.className='dato';var kk=document.createElement('span');kk.className='dato__clave';kk.textContent=k;
    var vv=document.createElement('span');vv.className='dato__valor';vv.textContent=val;d.appendChild(kk);d.appendChild(vv);return d;}
  window.UI.registrarPanel('informe',{render:render});
})();
