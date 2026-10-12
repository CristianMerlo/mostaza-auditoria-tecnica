/* PWA: instalación en el teléfono + actualización silenciosa del Service Worker.
   - Botón "Instalar app" en el pie: aparece cuando el navegador ofrece instalar
     (Android/Chrome) o siempre en iPhone/iPad, donde la oferta no existe y se
     muestran las instrucciones de Safari.
   - Service Worker (sw.js): la app funciona sin señal en el local y, cuando se
     publica una versión nueva, se recarga sola apenas el técnico la vuelve a abrir.
   Nada de esto toca el flujo de la visita: si el navegador no soporta SW, la app
   sigue funcionando igual desde el navegador. */
(function(){
  'use strict';
  var CFG=window.CONFIG;
  var oferta=null;          // evento beforeinstallprompt pendiente
  var recargando=false;     // guardia anti-bucle del reload por versión nueva

  function yaInstalada(){
    try{ if(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true; }catch(e){}
    return navigator.standalone===true;
  }
  function esIOS(){
    return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
  }
  function boton(){
    var pie=document.querySelector('.pie'); if(!pie) return null;
    var b=document.getElementById('btn-instalar');
    if(!b){
      b=document.createElement('button'); b.type='button'; b.id='btn-instalar';
      b.className='pie__instalar'; b.textContent='Instalar app';
      var ver=document.getElementById('btn-version');
      pie.insertBefore(b,ver||pie.lastChild);
    }
    return b;
  }
  function mostrarBoton(texto){
    if(yaInstalada()) return;
    var b=boton(); if(!b) return;
    b.textContent=texto||'Instalar app'; b.style.display='';
    b.onclick=function(){
      if(oferta){
        oferta.prompt();
        oferta.userChoice.then(function(){ oferta=null; b.style.display='none'; });
        return;
      }
      instrucciones();
    };
  }
  function instrucciones(){
    window.UI.modal({titulo:'Instalar en el teléfono',
      html:'<p class="tarjeta__texto">Con la app instalada tenés ícono propio, se abre sin barra del navegador y '
        +'podés cargar la auditoría aunque no haya señal en el local.</p>'
        +'<p class="tarjeta__texto"><b>'+(esIOS()?'iPhone / iPad (Safari)':'Android (Chrome)')+'</b></p>'
        +'<ol class="pasos-instalar">'+(esIOS()
          ? '<li>Tocá <b>Compartir</b> (el cuadro con la flecha, arriba).</li>'
            +'<li>Bajá hasta <b>Agregar a pantalla de inicio</b>.</li>'
            +'<li>Tocá <b>Agregar</b>: queda el ícono de Auditoría.</li>'
          : '<li>Tocá <b>⋮</b> arriba a la derecha.</li>'
            +'<li>Elegí <b>Instalar aplicación</b> o <b>Agregar a pantalla de inicio</b>.</li>'
            +'<li>Confirmá <b>Instalar</b>.</li>')
        +'</ol>'
        +'<p class="item__ayuda">Si ya la tenés instalada, abrí siempre desde el ícono: los borradores de la visita quedan guardados ahí.</p>',
      acciones:[{texto:'Entendido',estilo:'principal'}]});
  }

  function iniciar(){
    // Oferta nativa de instalación (Chrome/Edge Android y escritorio)
    window.addEventListener('beforeinstallprompt',function(e){
      e.preventDefault(); oferta=e; mostrarBoton();
    });
    window.addEventListener('appinstalled',function(){
      oferta=null; var b=document.getElementById('btn-instalar'); if(b)b.style.display='none';
      window.UI.avisoTemporal('App instalada. Abrila desde el ícono del teléfono.');
    });
    if(esIOS()) mostrarBoton('Instalar app');   // iOS nunca dispara beforeinstallprompt

    if(!('serviceWorker' in navigator)) return;
    var url='sw.js?v='+encodeURIComponent(CFG.version);
    navigator.serviceWorker.register(url).then(function(reg){
      var chequear=function(){ try{ reg.update(); }catch(e){} };
      chequear();
      // El técnico abre y cierra la app todo el día: alcanzar versiones nuevas sin reinstalar.
      setInterval(chequear,5*60*1000);
      document.addEventListener('visibilitychange',function(){ if(!document.hidden) chequear(); });
      window.addEventListener('pageshow',chequear);
    }).catch(function(err){
      if(window.Diagnostico && window.Diagnostico.anotar) window.Diagnostico.anotar('service worker',err);
    });

    // Si la página arranca SIN controlador, es la primera vez que se instala el SW:
    // ahí el controllerchange no es una actualización, es la toma de control, y no hay que recargar.
    var controladoAlAbrir = !!(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener('controllerchange',function(){
      if(recargando || !controladoAlAbrir) return;
      // La visita se guarda sola en cada cambio, recargar no pierde datos.
      if(sessionStorage.getItem('vt:recargada')===CFG.version) return;
      recargando=true; sessionStorage.setItem('vt:recargada',CFG.version);
      window.UI.avisoTemporal('Versión nueva cargada, actualizo la app…');
      setTimeout(function(){ window.location.reload(); },1200);
    });
  }

  window.PWA={iniciar:iniciar,pedirInstalacion:function(){ if(oferta){oferta.prompt();} else instrucciones(); },
              estaInstalada:yaInstalada,esIOS:esIOS};
})();
