(function(){
  'use strict';
  function render(cont,v){
    var intro=document.createElement('div');intro.className='tarjeta';
    intro.appendChild(etq('Paso 5'));
    var h=document.createElement('h2');h.className='tarjeta__titulo';h.textContent='Firmas';intro.appendChild(h);
    var p=document.createElement('p');p.className='tarjeta__texto';
    p.textContent='Firmá con el dedo y tocá "Guardar firma" para fijarla. Sin las dos firmas y el nombre del encargado no se puede generar el informe.';
    intro.appendChild(p);cont.appendChild(intro);
    bloqueFirma(cont,v,'jefe','FIRMA JEFE DE ÁREA',v.jefe?v.jefe.nombre:'',null);
    bloqueFirma(cont,v,'encargado','FIRMA ENCARGADO',null,function(t){
      t.appendChild(etq('Nombre y apellido de quien firma (obligatorio)'));
      var nom=document.createElement('input');nom.type='text';nom.className='campo';nom.autocomplete='off';
      nom.value=v.encargado.nombre||'';nom.placeholder='ej. Rodrigo Paz';
      nom.addEventListener('input',function(){window.Visita.set('encargado.nombre',nom.value);});t.appendChild(nom);
      t.appendChild(etq('Cargo (opcional)'));
      var car=document.createElement('input');car.type='text';car.className='campo';car.autocomplete='off';
      car.value=v.encargado.cargo||'';car.placeholder='ej. Encargado de turno';
      car.addEventListener('input',function(){window.Visita.set('encargado.cargo',car.value);});t.appendChild(car);
      if(!String(v.encargado.nombre||'').trim()){var e=document.createElement('p');e.className='error';
        e.textContent='Falta el nombre de quien firma. Es obligatorio para el informe.';t.appendChild(e);}
    });
  }
  function bloqueFirma(cont,v,clave,rotulo,aclaracion,extra){
    var t=document.createElement('div');t.className='tarjeta';
    t.appendChild(etq(rotulo));
    if(aclaracion){var a=document.createElement('p');a.className='item__ayuda';a.textContent=aclaracion;t.appendChild(a);}
    var estado=v.firmas[clave];
    var cajaCanvas=document.createElement('div');t.appendChild(cajaCanvas);
    window.Firmas.montar(cajaCanvas,estado.id,estado,function(){
      window.Visita.aplicar(function(){},'firma:'+clave);
    });
    if(typeof extra==='function')extra(t);
    cont.appendChild(t);
  }
  function etq(t){var s=document.createElement('span');s.className='etiqueta';s.textContent=t;return s;}
  window.UI.registrarPanel('firmas',{render:render,puedeAvanzar:function(v){
    if(!v.firmas.jefe.guardada)return 'Falta la firma del jefe de área';
    if(!v.firmas.encargado.guardada)return 'Falta la firma del encargado';
    if(!String(v.encargado.nombre||'').trim())return 'Falta el nombre de quien firma como encargado';
    return true;}});
})();
