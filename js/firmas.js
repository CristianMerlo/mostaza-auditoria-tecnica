window.Firmas=(function(){
  'use strict';
  var AR=window.CONFIG.firmas.anchoMm/window.CONFIG.firmas.altoMm;
  function montar(cont,firmaId,estado,alCambiar){
    cont.innerHTML='';
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
    var guardada=!!estado.guardada;
    var editando=false;
    var dibujando=false,ultimo=null,huboTrazo=false;
    function pos(ev){var r=canvas.getBoundingClientRect();return {x:ev.clientX-r.left,y:ev.clientY-r.top};}
    function abajo(ev){if(!editando)return;ev.preventDefault();dibujando=true;ultimo=pos(ev);}
    function mueve(ev){if(!editando||!dibujando)return;ev.preventDefault();var p=pos(ev);
      ctx.beginPath();ctx.moveTo(ultimo.x,ultimo.y);ctx.lineTo(p.x,p.y);ctx.stroke();ultimo=p;huboTrazo=true;}
    function arriba(){dibujando=false;}
    canvas.addEventListener('pointerdown',abajo);
    canvas.addEventListener('pointermove',mueve);
    window.addEventListener('pointerup',arriba);
    cont.appendChild(canvas);
    function limpiarLienzo(){ctx.fillStyle='#ffffff';ctx.fillRect(0,0,ancho,alto);ctx.strokeStyle='#111';huboTrazo=false;}
    function dibujarGuardada(){ window.Almacen.leerBinario(firmaId).then(function(reg){ if(!reg||!reg.blob)return;
      var url=URL.createObjectURL(reg.blob); var im=new Image();
      im.onload=function(){ctx.drawImage(im,0,0,ancho,alto);URL.revokeObjectURL(url);}; im.src=url; }); }
    var acc=document.createElement('div'); acc.style.display='flex'; acc.style.gap='8px'; acc.style.marginTop='8px';
    var bModo=document.createElement('button'); bModo.type='button'; bModo.className='btn'; bModo.style.flex='1';
    var bLimpiar=document.createElement('button'); bLimpiar.type='button'; bLimpiar.className='btn'; bLimpiar.style.flex='1'; bLimpiar.textContent='Limpiar';
    var bGuardar=document.createElement('button'); bGuardar.type='button'; bGuardar.className='btn btn--ok'; bGuardar.style.flex='1'; bGuardar.textContent='Guardar firma';
    acc.appendChild(bModo); acc.appendChild(bLimpiar); acc.appendChild(bGuardar); cont.appendChild(acc);
    function refrescar(){
      canvas.style.opacity=editando?'1':'0.75';
      canvas.style.borderColor=editando?'var(--c-marca)':'var(--c-borde-input)';
      bModo.textContent=editando?'🔓 Firmando…':(guardada?'✓ Firmada (desbloquear)':'🔒 Desbloquear para firmar');
      bModo.className='btn'+(editando?' btn--principal':'');
      bLimpiar.disabled=!editando; bGuardar.disabled=!editando;
      bLimpiar.style.display=editando?'':'none'; bGuardar.style.display=editando?'':'none';
    }
    refrescar();
    if(guardada)dibujarGuardada();
    bModo.addEventListener('click',function(){
      editando=!editando;
      if(editando&&guardada){ limpiarLienzo(); }
      refrescar();
    });
    bLimpiar.addEventListener('click',function(){ if(!editando)return; limpiarLienzo(); });
    bGuardar.addEventListener('click',function(){
      if(!editando)return;
      if(!huboTrazo){window.UI.avisoTemporal('La firma está vacía.');return;}
      canvas.toBlob(function(blob){
        window.Almacen.guardarBinario(firmaId,blob,{w:canvas.width,h:canvas.height}).then(function(){
          guardada=true; editando=false; estado.guardada=true; estado.bloqueada=true;
          alCambiar(); refrescar(); window.UI.avisoTemporal('Firma guardada y bloqueada.');
        });
      },'image/png');
    });
  }
  return {montar:montar,aspectRatio:AR};
})();
