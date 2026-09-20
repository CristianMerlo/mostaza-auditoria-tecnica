/* Firma en canvas tactil con Pointer Events. Correcciones sobre la herramienta vieja:
   - Fondo BLANCO explicito (no transparente).
   - El canvas usa el MISMO aspect ratio que el destino en el PDF (config.firmas),
     asi el trazo no se comprime al insertarlo.
   - Bloqueo tras firmar para no pisar el trazo.
   - Validacion bloqueante: sin firma no se genera PDF (lo controla el panel informe).
   Se guarda como PNG (Blob) en IndexedDB con el id de la firma. */
window.Firmas=(function(){
  'use strict';
  var AR=window.CONFIG.firmas.anchoMm/window.CONFIG.firmas.altoMm; // 60/30 = 2:1
  function montar(cont,firmaId,estado,alCambiar){
    cont.innerHTML='';
    var caja=document.createElement('div');
    var ancho=Math.min(cont.clientWidth||320,420); if(ancho<200)ancho=300;
    var alto=Math.round(ancho/AR);
    var dpr=window.devicePixelRatio||1;
    var canvas=document.createElement('canvas');
    canvas.width=Math.round(ancho*dpr); canvas.height=Math.round(alto*dpr);
    canvas.style.width=ancho+'px'; canvas.style.height=alto+'px';
    canvas.style.border='2px solid var(--c-borde-input)';
    canvas.style.borderRadius='10px'; canvas.style.touchAction='none'; canvas.style.background='#fff';
    var ctx=canvas.getContext('2d'); ctx.scale(dpr,dpr);
    ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,ancho,alto);
    ctx.strokeStyle='#111'; ctx.lineWidth=2.2; ctx.lineJoin='round'; ctx.lineCap='round';
    var dibujando=false,ultimo=null,huboTrazo=false,bloqueada=!!estado.bloqueada;

    function pos(ev){var r=canvas.getBoundingClientRect();return {x:ev.clientX-r.left,y:ev.clientY-r.top};}
    function abajo(ev){if(bloqueada)return;ev.preventDefault();dibujando=true;ultimo=pos(ev);}
    function mueve(ev){if(!dibujando||bloqueada)return;ev.preventDefault();var p=pos(ev);
      ctx.beginPath();ctx.moveTo(ultimo.x,ultimo.y);ctx.lineTo(p.x,p.y);ctx.stroke();ultimo=p;huboTrazo=true;}
    function arriba(){dibujando=false;}
    canvas.addEventListener('pointerdown',abajo);
    canvas.addEventListener('pointermove',mueve);
    window.addEventListener('pointerup',arriba);
    caja.appendChild(canvas); cont.appendChild(caja);

    var acc=document.createElement('div'); acc.style.display='flex'; acc.style.gap='8px'; acc.style.marginTop='8px';
    var bLimpiar=document.createElement('button'); bLimpiar.type='button'; bLimpiar.className='btn'; bLimpiar.style.flex='1';
    bLimpiar.textContent='Limpiar';
    var bGuardar=document.createElement('button'); bGuardar.type='button'; bGuardar.className='btn btn--ok'; bGuardar.style.flex='1';
    bGuardar.textContent=bloqueada?'Firmada ✓':'Guardar firma';

    function refrescarBotones(){ bLimpiar.disabled=bloqueada; bGuardar.disabled=bloqueada;
      bGuardar.textContent=bloqueada?'Firmada ✓':'Guardar firma'; }
    refrescarBotones();

    bLimpiar.addEventListener('click',function(){ if(bloqueada)return;
      ctx.fillStyle='#ffffff';ctx.fillRect(0,0,ancho,alto);ctx.strokeStyle='#111';huboTrazo=false; });
    bGuardar.addEventListener('click',function(){
      if(bloqueada)return;
      if(!huboTrazo){window.UI.avisoTemporal('La firma está vacía.');return;}
      canvas.toBlob(function(blob){
        window.Almacen.guardarBinario(firmaId,blob,{w:canvas.width,h:canvas.height}).then(function(){
          bloqueada=true; estado.guardada=true; estado.bloqueada=true; alCambiar(); refrescarBotones();
          window.UI.avisoTemporal('Firma guardada.');
        });
      },'image/png');
    });
    acc.appendChild(bLimpiar); acc.appendChild(bGuardar); cont.appendChild(acc);

    if(bloqueada){
      window.Almacen.leerBinario(firmaId).then(function(reg){ if(!reg||!reg.blob)return;
        var url=URL.createObjectURL(reg.blob); var im=new Image();
        im.onload=function(){ctx.drawImage(im,0,0,ancho,alto);URL.revokeObjectURL(url);}; im.src=url; });
      var bRehacer=document.createElement('button'); bRehacer.type='button'; bRehacer.className='btn btn--bloque';
      bRehacer.textContent='Rehacer firma';
      bRehacer.addEventListener('click',function(){ bloqueada=false; estado.guardada=false; estado.bloqueada=false;
        ctx.fillStyle='#ffffff';ctx.fillRect(0,0,ancho,alto);ctx.strokeStyle='#111';huboTrazo=false; alCambiar(); refrescarBotones(); });
      cont.appendChild(bRehacer);
    }
  }
  return {montar:montar,aspectRatio:AR};
})();
