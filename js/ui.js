window.UI=(function(){
  'use strict';
  var PASOS=[
    {id:'identificacion',titulo:'Identificación'},
    {id:'local',titulo:'Datos del local'},
    {id:'cocina',titulo:'Recorrido de cocina'},
    {id:'edilicio',titulo:'Recorrido edilicio'},
    {id:'firmas',titulo:'Firmas'},
    {id:'informe',titulo:'Informe'}
  ];
  var paneles={},n={},timerAviso=null;
  function iniciar(){
    n.panel=document.getElementById('panel');n.contexto=document.getElementById('cab-contexto');
    n.semaforo=document.getElementById('cab-semaforo');n.progreso=document.getElementById('barra-progreso');
    n.barra=document.getElementById('barra');n.atras=document.getElementById('btn-atras');
    n.siguiente=document.getElementById('btn-siguiente');n.version=document.getElementById('btn-version');
    n.modal=document.getElementById('modal');n.modalCaja=document.getElementById('modal-caja');
    n.aviso=document.getElementById('aviso-almacenamiento');
    n.version.textContent='v'+window.CONFIG.version;
    n.version.addEventListener('click',abrirDiagnostico);
    n.atras.addEventListener('click',atras); n.siguiente.addEventListener('click',siguiente);
    n.modal.addEventListener('click',function(e){if(e.target===n.modal)e.stopPropagation();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!n.modal.classList.contains('modal--oculto'))cerrarModal();});
  }
  function registrarPanel(id,def){paneles[id]=def;}
  function idx(id){for(var i=0;i<PASOS.length;i++)if(PASOS[i].id===id)return i;return -1;}
  function pasoActual(){var v=window.Visita.actual();return v?v.paso:null;}
  function irA(id){if(idx(id)===-1)return;window.Visita.set('paso',id);render();window.scrollTo(0,0);n.panel.focus();}
  function siguiente(){var i=idx(pasoActual());if(i===-1||i>=PASOS.length-1)return;
    var def=paneles[PASOS[i].id];
    if(def&&typeof def.puedeAvanzar==='function'){var ver=def.puedeAvanzar(window.Visita.actual());
      if(ver!==true){avisoTemporal(typeof ver==='string'?ver:'Falta completar');return;}}
    irA(PASOS[i+1].id);}
  function atras(){var i=idx(pasoActual());if(i<=0)return;irA(PASOS[i-1].id);}
  function actualizarSemaforo(v){
    if(!v||(v.scores.general==null&&v.scores.cocina==null&&v.scores.edilicio==null)){
      n.semaforo.className='semaforo semaforo--oculto';return;}
    window.Scoring.recalcular(v);
    var col=window.Scoring.color(v.scores.general);
    n.semaforo.className='semaforo semaforo--'+(col==='gris'?'gris':col);
    n.semaforo.title='General: '+(v.scores.general==null?'—':v.scores.general);
  }
  function render(){
    var v=window.Visita.actual();
    if(!v){n.barra.style.display='none';n.contexto.textContent='Sin visita iniciada';
      n.semaforo.className='semaforo semaforo--oculto';renderInicio();return;}
    n.barra.style.display='';
    var i=idx(v.paso);if(i===-1){window.Visita.set('paso',PASOS[0].id);i=0;}
    var paso=PASOS[i];
    n.progreso.textContent='Paso '+(i+1)+' de '+PASOS.length+' · '+paso.titulo;
    n.atras.disabled=(i===0);n.siguiente.disabled=(i===PASOS.length-1);
    n.contexto.textContent=contextoTexto(v);
    actualizarSemaforo(v);
    n.panel.innerHTML='';
    var def=paneles[paso.id];
    if(def&&typeof def.render==='function')def.render(n.panel,v);
    else{var t=document.createElement('div');t.className='tarjeta tarjeta--etapa';
      t.innerHTML='<h2 class="tarjeta__titulo">'+paso.titulo+'</h2><p class="tarjeta__texto">Pantalla no disponible.</p>';
      n.panel.appendChild(t);}
  }
  function contextoTexto(v){var p=[];if(v.jefe)p.push(v.jefe.nombre);
    if(v.local)p.push(v.local.nombre+(v.local.siglaSistema?' ('+v.local.siglaSistema+')':''));
    if(!p.length)p.push('Visita en curso · sin identificar');return p.join(' · ');}
  function renderInicio(){
    n.panel.innerHTML='';
    var hero=document.createElement('div');hero.className='hero';
    var caja=document.createElement('div');caja.className='hero__logo';
    var img=document.createElement('img');img.src='img/logo.png';img.alt='Mostaza';img.className='hero__img';
    img.onerror=function(){caja.classList.add('hero__logo--fb');caja.textContent='M';};
    caja.appendChild(img);hero.appendChild(caja);
    var h=document.createElement('h1');h.className='hero__titulo';h.textContent='Auditoría Técnica';hero.appendChild(h);
    var sub=document.createElement('p');sub.className='hero__sub';
    sub.textContent='Mantenimiento Franquicias y Propios · Auditoría Salud de Locales';hero.appendChild(sub);
    n.panel.appendChild(hero);
    var t=document.createElement('div');t.className='tarjeta';
    t.innerHTML='<p class="tarjeta__texto">Una auditoría a la vez. Todo se guarda solo, en el momento: si se corta la señal, se bloquea el teléfono o se recarga la página, la auditoría sigue donde la dejaste.</p>'+
      '<p class="tarjeta__texto" style="margin-top:8px"><strong>Máximo 20 fotos por auditoría.</strong> Organizá qué documentar (edilicio admite hasta 4 por ítem; cocina, 2).</p>';
    var b=document.createElement('button');b.type='button';b.className='btn btn--principal btn--bloque';
    b.textContent='Iniciar auditoría';b.addEventListener('click',function(){window.Visita.iniciar();render();});
    t.appendChild(b);n.panel.appendChild(t);
    var info=document.createElement('p');info.className='hero__info';
    info.textContent=window.Locales.total+' locales cargados · Control Interno Regional · v'+window.CONFIG.version;
    n.panel.appendChild(info);
  }
  function modal(op){
    n.modalCaja.innerHTML='';
    var h=document.createElement('h2');h.className='modal__titulo';h.id='modal-titulo';h.textContent=op.titulo||'';n.modalCaja.appendChild(h);
    if(op.html){var c=document.createElement('div');c.innerHTML=op.html;n.modalCaja.appendChild(c);}
    if(typeof op.render==='function'){var cc=document.createElement('div');n.modalCaja.appendChild(cc);op.render(cc);}
    var acc=document.createElement('div');acc.className='modal__acciones';
    (op.acciones||[]).forEach(function(a){var b=document.createElement('button');b.type='button';
      b.className='btn'+(a.estilo?' btn--'+a.estilo:'');b.textContent=a.texto;
      b.addEventListener('click',function(){if(a.cerrar!==false)cerrarModal();if(typeof a.accion==='function')a.accion();});
      acc.appendChild(b);});
    n.modalCaja.appendChild(acc);n.modal.classList.remove('modal--oculto');
  }
  function cerrarModal(){n.modal.classList.add('modal--oculto');n.modalCaja.innerHTML='';}
  function abrirDiagnostico(){modal({titulo:'Diagnóstico',render:function(c){window.Diagnostico.render(c);},acciones:[{texto:'Cerrar',estilo:'principal'}]});}
  function aviso(t,crit){n.aviso.textContent=t;n.aviso.classList.remove('aviso--oculto');n.aviso.classList.toggle('aviso--critico',!!crit);}
  function ocultarAviso(){n.aviso.classList.add('aviso--oculto');}
  function avisoTemporal(t){aviso(t,false);if(timerAviso)clearTimeout(timerAviso);timerAviso=setTimeout(ocultarAviso,4000);}
  return {iniciar:iniciar,pasos:PASOS,registrarPanel:registrarPanel,render:render,irA:irA,
    siguiente:siguiente,atras:atras,modal:modal,cerrarModal:cerrarModal,abrirDiagnostico:abrirDiagnostico,
    aviso:aviso,ocultarAviso:ocultarAviso,avisoTemporal:avisoTemporal,actualizarSemaforo:actualizarSemaforo};
})();
