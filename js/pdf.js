window.PDF=(function(){
  'use strict';
  function rgb(rol){return window.Paleta.rgb(rol);}
  function colorSem(sem){var m={verde:'verde',amarillo:'amarillo',rojo:'rojo',naranja:'naranja',gris:'sinMedir'};return rgb(m[sem]||'sinMedir');}
  function rotAgua(sem){return ({verde:'AGUA EN RANGO',amarillo:'AGUA EN ALERTA',naranja:'AGUA BLANDA',rojo:'AGUA CRÍTICA',gris:'AGUA SIN MEDIR'})[sem]||'AGUA';}
  function blobADataURL(blob){return new Promise(function(res){var fr=new FileReader();fr.onload=function(){res(fr.result);};fr.readAsDataURL(blob);});}
  function fechaCorta(iso){var d=iso?new Date(iso):new Date();function z(n){return (n<10?'0':'')+n;}
    return z(d.getDate())+'/'+z(d.getMonth()+1)+'/'+d.getFullYear();}
  function cargarLogo(){return fetch('img/logo.png').then(function(r){if(!r.ok)throw 0;return r.blob();})
    .then(function(b){return blobADataURL(b);}).catch(function(){return null;});}
  function cargarFotos(v){var ids=[];window.Checklist.todos().forEach(function(it){var d=v.items[it.id];
    if(d&&d.fotos)d.fotos.forEach(function(f){ids.push(f);});});
    return ids.reduce(function(prom,f){return prom.then(function(mapa){
      return window.Almacen.leerBinario(f.id).then(function(reg){
        if(reg&&reg.blob)return blobADataURL(reg.blob).then(function(u){mapa[f.id]=u;return mapa;});
        return mapa;});});},Promise.resolve({}));}
  function cargarFirma(id){return window.Almacen.leerBinario(id).then(function(reg){return reg&&reg.blob?blobADataURL(reg.blob):null;});}
  function generar(){
    var v=window.Visita.actual(); if(!v)return Promise.reject(new Error('No hay visita'));
    window.Scoring.recalcular(v);
    return Promise.all([cargarFotos(v),cargarFirma(v.firmas.jefe.id),cargarFirma(v.firmas.encargado.id),cargarLogo()])
      .then(function(res){ return construir(v,res[0],res[1],res[2],res[3]); });
  }
  function construir(v,fotos,firmaJefe,firmaEnc,logo){
    var jsPDFctor=(window.jspdf&&window.jspdf.jsPDF)||window.jsPDF;
    if(!jsPDFctor)throw new Error('jsPDF no está cargado');
    var doc=new jsPDFctor({unit:'mm',format:'a4'});
    var W=210,H=297,mx=14,y=0,pag=1;
    var cM=rgb('marca'),cMO=rgb('rojo'),cTinta=rgb('tinta'),cLabel=rgb('label');
    function pie(){ doc.setFontSize(8); doc.setTextColor(150,150,150);
      doc.text(window.CONFIG.pieCorporativo,W/2,H-8,{align:'center'});
      doc.text('Página '+pag,W-mx,H-8,{align:'right'}); }
    function logoCirculo(){ doc.setFillColor(cMO[0],cMO[1],cMO[2]); doc.circle(mx+7,15,6,'F');
      doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(13); doc.text('M',mx+7,17.5,{align:'center'}); }
    function encabezado(){
      if(logo){ try{doc.addImage(logo,'PNG',mx,8,14,14);}catch(e){logoCirculo();} } else logoCirculo();
      doc.setTextColor(cTinta[0],cTinta[1],cTinta[2]); doc.setFont('helvetica','bold'); doc.setFontSize(14);
      doc.text('AUDITORÍA TÉCNICA',W/2,17,{align:'center'});
      doc.setFontSize(7.5); doc.setTextColor(cLabel[0],cLabel[1],cLabel[2]); doc.setFont('helvetica','normal');
      doc.text(fechaCorta(v.iniciada),W-mx,12,{align:'right'});
      doc.text(v.codigoValidacion||v.codigo||'',W-mx,16,{align:'right'});
      doc.setDrawColor(cM[0],cM[1],cM[2]); doc.setLineWidth(1); doc.line(mx,26,W-mx,26); y=32; }
    function nuevaPagina(){ pie(); doc.addPage(); pag++; encabezado(); }
    function espacio(alto){ if(y+alto>H-16)nuevaPagina(); }
    function titulo(txt){ espacio(12); doc.setFont('helvetica','bold'); doc.setFontSize(12);
      doc.setTextColor(cTinta[0],cTinta[1],cTinta[2]); doc.text(txt.toUpperCase(),mx,y); y+=6;
      doc.setDrawColor(220,220,220); doc.setLineWidth(0.3); doc.line(mx,y,W-mx,y); y+=5; }
    function dato(k,val){ espacio(6); doc.setFont('helvetica','bold'); doc.setFontSize(9);
      doc.setTextColor(cLabel[0],cLabel[1],cLabel[2]); doc.text(k+':',mx,y);
      doc.setFont('helvetica','normal'); doc.setTextColor(30,30,30);
      var lines=doc.splitTextToSize(String(val==null?'—':val),W-mx*2-42); doc.text(lines,mx+42,y); y+=Math.max(5,lines.length*4.6); }
    function parrafo(txt,size){ doc.setFont('helvetica','normal'); doc.setFontSize(size||9); doc.setTextColor(50,50,50);
      var lines=doc.splitTextToSize(txt,W-mx*2); lines.forEach(function(ln){espacio(5);doc.text(ln,mx,y);y+=4.6;}); }
    encabezado();
    titulo('Datos de la auditoría');
    dato('Local',v.local?v.local.nombre:'—');
    if(v.local){ if(v.local.siglaSistema)dato('Sigla sistema',v.local.siglaSistema);
      if(v.local.siglaTicket)dato('Sigla ticket',v.local.siglaTicket);
      if(v.local.provincia)dato('Provincia',v.local.provincia);
      dato('Tipo',v.local.tipo+(v.local.manual?' (carga manual)':'')); }
    dato('Fecha',fechaCorta(v.iniciada));
    dato('Jefe de área',v.jefe?v.jefe.nombre:'—');
    dato('Encargado',v.encargado.nombre+(v.encargado.cargo?' — '+v.encargado.cargo:''));
    if(v.ticketsAbiertos!=null)dato('Tickets abiertos',String(v.ticketsAbiertos));
    dato('Código de informe',v.codigo);
    dato('Código de validación',v.codigoValidacion);
    if(v.geo&&v.geo.lat!=null){
      var url='https://www.google.com/maps?q='+v.geo.lat+','+v.geo.lng;
      dato('Ubicación',v.geo.lat.toFixed(5)+', '+v.geo.lng.toFixed(5)+(v.geo.precision?' (±'+v.geo.precision+' m)':''));
      espacio(6); doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(cM[0],cM[1],cM[2]);
      doc.textWithLink('Ver ubicación en Google Maps',mx+42,y,{url:url}); y+=6;
    }
    y+=2;
    function bloque(nombre,clave){
      titulo('Bloque '+nombre);
      var items=window.Checklist.porBloque(clave);
      var revisados=0,total=0;
      items.forEach(function(it){ if(it.tipo==='agua')return; var d=v.items[it.id]; if(!d)return; total++;
        if((d.declarado||d.tocado)&&!d.na)revisados++; });
      var sc=v.scores[clave];
      dato('Puntaje del bloque',(sc==null?'sin datos':sc+'/100')+'  ('+({verde:'VERDE',amarillo:'AMARILLO',rojo:'ROJO',gris:'—'})[window.Scoring.color(sc)]+')');
      parrafo('Revisados sin observaciones: '+revisados+' de '+total,9); y+=1;
      items.forEach(function(it){ var d=v.items[it.id]||window.Controles.inicial(it);
        var c=window.Controles.obtener(it.tipo); var r=c.aPdf?c.aPdf(it,d):{lineas:[]};
        espacio(10);
        doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(cTinta[0],cTinta[1],cTinta[2]);
        var nom=doc.splitTextToSize(it.nombre,W-mx*2); doc.text(nom,mx,y); y+=nom.length*4.8;
        (r.lineas||[]).forEach(function(ln){ parrafo(ln,9); });
        if(r.fotos&&r.fotos.length)ponerFotos(r.fotos); y+=2;
      });
    }
    function ponerFotos(lista){
      var anchoMm=(W-mx*2-6)/2; var xs=[mx,mx+anchoMm+6];
      for(var i=0;i<lista.length;i+=2){
        var altoMax=0, fila=lista.slice(i,i+2);
        var alturas=fila.map(function(f){var ar=(f.w&&f.h)?(f.h/f.w):0.75;var a=anchoMm*ar;if(a>altoMax)altoMax=a;return a;});
        espacio(altoMax+3);
        fila.forEach(function(f,j){ var du=fotos[f.id]; if(!du)return;
          try{doc.addImage(du,'JPEG',xs[j],y,anchoMm,alturas[j]);}catch(e){} });
        y+=altoMax+3;
      }
    }
    bloque('Cocina','cocina');
    bloque('Edilicio','edilicio');
    titulo('Sistema de filtrado de agua');
    var itAgua=window.Checklist.porId('coc-12'); var dAgua=v.items['coc-12']||window.Controles.inicial(itAgua);
    var rAgua=window.Controles.obtener('agua').aPdf(itAgua,dAgua);
    var col=colorSem(dAgua.semaforo); espacio(10);
    doc.setFillColor(col[0],col[1],col[2]); doc.circle(mx+3,y-1,3,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(cTinta[0],cTinta[1],cTinta[2]);
    doc.text(rotAgua(dAgua.semaforo),mx+9,y); y+=6;
    (rAgua.lineas||[]).forEach(function(ln){parrafo(ln,9);});
    dato('Periodicidad de medición',v.parametrosAgua.periodicidadDias+' días');
    dato('Recambio de filtro',v.parametrosAgua.recambioFiltro.valor+' '+({dias:'días',ppm:'PPM',litros:'litros'})[v.parametrosAgua.recambioFiltro.modo]); y+=2;
    titulo('Resumen de puntajes');
    function barra(nombre,sc){ espacio(14);
      doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(cTinta[0],cTinta[1],cTinta[2]);
      doc.text(nombre,mx,y); doc.text((sc==null?'—':sc+'/100'),W-mx,y,{align:'right'}); y+=3;
      var ancho=W-mx*2, val=sc==null?0:sc/100;
      doc.setFillColor(225,225,225); doc.rect(mx,y,ancho,4,'F');
      var c=colorSem(window.Scoring.color(sc)); doc.setFillColor(c[0],c[1],c[2]); doc.rect(mx,y,ancho*val,4,'F'); y+=9; }
    barra('Cocina',v.scores.cocina); barra('Edilicio',v.scores.edilicio); barra('General',v.scores.general); y+=2;
    titulo('Resumen para plan de acción');
    var criticos=[];
    window.Checklist.todos().forEach(function(it){ if(it.tipo==='agua')return;
      var d=v.items[it.id]; if(!d||d.na)return;
      if(typeof d.valor==='number' && d.valor<window.CONFIG.umbralFoto)
        criticos.push({nombre:it.nombre,valor:d.valor,obs:d.obs||''}); });
    criticos.sort(function(a,b){return a.valor-b.valor;});
    if(dAgua.semaforo==='rojo'||dAgua.semaforo==='naranja')
      criticos.push({nombre:'Sistema de filtrado de agua',valor:'('+rotAgua(dAgua.semaforo)+')',obs:dAgua.porQue||''});
    if(!criticos.length){ parrafo('Sin ítems por debajo de 70. No se registran prioridades de acción.',9); }
    else{ parrafo('Ordenados de mayor a menor prioridad (puntaje más bajo primero):',9); y+=1;
      criticos.forEach(function(c){ espacio(9);
        doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(cMO[0],cMO[1],cMO[2]);
        var t=doc.splitTextToSize('• '+c.nombre+'  ['+c.valor+(typeof c.valor==='number'?'/100':'')+']',W-mx*2);
        doc.text(t,mx,y); y+=t.length*4.8;
        if(String(c.obs).trim()){ doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(50,50,50);
          var o=doc.splitTextToSize(c.obs,W-mx*2-4); o.forEach(function(ln){espacio(5);doc.text(ln,mx+4,y);y+=4.4;}); }
        y+=1;
      });
    }
    y+=2;
    titulo('Firmas');
    var fw=window.CONFIG.firmas.anchoMm, fh=window.CONFIG.firmas.altoMm; espacio(fh+20);
    var y0=y; var x1=mx, x2=W/2+4;
    if(firmaJefe)try{doc.addImage(firmaJefe,'PNG',x1,y0,fw,fh);}catch(e){}
    if(firmaEnc)try{doc.addImage(firmaEnc,'PNG',x2,y0,fw,fh);}catch(e){}
    var yl=y0+fh+2; doc.setDrawColor(120,120,120); doc.setLineWidth(0.3);
    doc.line(x1,yl,x1+fw,yl); doc.line(x2,yl,x2+fw,yl);
    doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(cLabel[0],cLabel[1],cLabel[2]);
    doc.text('FIRMA JEFE DE ÁREA',x1,yl+4); doc.text('FIRMA ENCARGADO',x2,yl+4);
    doc.setFont('helvetica','normal'); doc.setTextColor(30,30,30);
    doc.text(v.jefe?v.jefe.nombre:'',x1,yl+9);
    doc.text(v.encargado.nombre+(v.encargado.cargo?' — '+v.encargado.cargo:''),x2,yl+9); y=yl+14;
    pie();
    var base=(v.codigo||('AT-'+((v.local&&v.local.clave)||'SIN_LOCAL'))).replace(/[^A-Za-z0-9_\-]/g,'_');
    return {doc:doc,nombre:base+'.pdf'};
  }
  return {generar:generar};
})();
