(function(){
  'use strict';
  function arrancar(){
    window.UI.iniciar();
    window.Visita.engancharFlush();
    window.Paleta.listo().then(function(){window.Paleta.todo();avisarGuardado();});
    window.Almacen.iniciar();
    var b=window.Visita.borrador();
    if(b)preguntarBorrador(b); else window.UI.render();
  }
  function preguntarBorrador(b){
    var d=new Date(b.actualizada);function z(n){return (n<10?'0':'')+n;}
    var desc=[(b.local?b.local.nombre:'local sin elegir'),(b.jefe?b.jefe.nombre:'jefe sin identificar'),
      'última edición '+z(d.getDate())+'/'+z(d.getMonth()+1)+' '+z(d.getHours())+':'+z(d.getMinutes())].join(' · ');
    window.UI.modal({titulo:'Hay una visita en curso',
      html:'<p class="tarjeta__texto">'+esc(desc)+'</p><p class="tarjeta__texto">Podés seguir donde la dejaste. Si la descartás, se borran también las fotos que hubiera cargado.</p>',
      acciones:[
        {texto:'Continuar la visita',estilo:'principal',accion:function(){window.Visita.retomar(b);window.UI.render();}},
        {texto:'Descartar y empezar de nuevo',estilo:'peligro',cerrar:false,accion:function(){confirmarDescarte(b);}}
      ]});
  }
  function confirmarDescarte(b){
    window.UI.modal({titulo:'¿Descartar la visita?',
      html:'<p class="tarjeta__texto">Se pierde todo lo cargado'+(b.local?' en '+esc(b.local.nombre):'')+'. No se puede recuperar.</p>',
      acciones:[
        {texto:'Sí, descartar',estilo:'peligro',accion:function(){window.Visita.descartar().then(function(n){
          window.UI.render();if(n)window.UI.avisoTemporal('Se liberaron '+n+' archivo(s) de fotos.');});}},
        {texto:'No, volver',cerrar:false,accion:function(){preguntarBorrador(b);}}
      ]});
  }
  function avisarGuardado(){var e=window.Almacen.estado;
    if(!e.textoPersistente)window.UI.aviso('Este navegador no está guardando en disco ('+e.motivoTexto+'). Si cerrás la pestaña se pierde la visita.',true);}
  function esc(t){var d=document.createElement('div');d.textContent=(t==null?'':String(t));return d.innerHTML;}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',arrancar);else arrancar();
})();
