(function(){
  'use strict';
  var SAMPLE_CODE='// ============================================================\n// LabelPoint MP4 Compact Mark III Label\n// Label: 101mm breit x 60mm hoch\n// Honeywell Markpoint Compact 4\n// ============================================================\n!C\n!Y24 70|\n!Y35 10|\n!Y42 1\n!Z\n// --- Zeile 1: Firmenname ---\n!F T S 502 1000 L 10 0 94023 "Th\u00fcringer Kl\u00f6\u00dfe GmbH"\n// --- Zeile 2: Tour + Wert ---\n!F T S 448 1000 L 10 0 94023 "Tour:"\n!F T S 443 910 L 17 0 94023 "706/706"\n// --- Zeile 3: Auftr.Nr + Wert ---\n!F T S 402 1000 L 10 0 94023 "Auftr.Nr:"\n!F T S 398 845 L 12 0 94023 "67000247 Pos.: 1,000"\n// --- Zeile 4: Liefertermin und Empf-Nr ---\n!F T S 362 1000 L 10 0 94023 "LT: 27.02.26 | Empf.Nr.: 639171"\n// --- Zeile 6: KoHi ---\n!F T S 327 1000 L 8 0 94023 "KoHi: "\n!F T S 327 875 L 6 0 94023 ""\n// --- Zeile 7: Add-Info ---\n!F T S 277 1000 L 8 0 94023 "Add-Info: "\n!F T S 277 875 L 6 0 94023 ""\n// --- EUDR QR Code ---\n!F T S 232 1000 L 7 32 94023 "EUDR"\n!F C W 998 225 L 3 3 102 "EUDR/OLD0INVENTORYD/00019565"\n!F T S 210 875 L 7 0 94023 "Gewicht: 12,50 KG"\n!F T S 180 875 L 7 0 94023 "EUDR/OLD0INVENTORYD/00019565"\n// --- Zeile 8: Art. Nr + Wert ---\n!F T S 78 1000 L 10 0 94023 "Art. Nr:"\n!F T S 78 870 L 11 0 94023 "809A80S"\n// --- Zeile 9: Artikelbezeichnung ---\n!F T S 44 1000 L 9 0 94023 "Happy Office Kopierpapier"\n// --- Zeile 10: Menge + RM + von ---\n!F T S 6 1000 L 10 0 94023 "Menge: 2500 BL"\n!F T S 6 670 L 8 0 94023 "5 RM"\n!F T S 6 470 L 8 0 94023 "von: 701"\n!F T S 6 270 L 13 0 94023 "K"\n!F T S 6 245 L 13 0 94023 ""\n// ============================================================\n// Barcode: Code 128 Auto (41), 90\u00b0 gedreht (Up-Vector W)\n!F C W 270 450 L 225 2 41 "110007000039659209"\n// ============================================================\n// --- Testprint ---\n!F T W 36 450 L 6 0 94021 "Testprint from L-JN8GQ93 - User: tschulz"\n// --- Drucken ---\n!P1\n';
  var editor,canvas,dpiSelect,labelWidth,labelHeight,autoRender,btnRender,btnExport,lineNumbers,statusCommands,statusErrors,statusMessage;
  function debounce(fn,delay){var t=null;return function(){var a=arguments,s=this;clearTimeout(t);t=setTimeout(function(){fn.apply(s,a)},delay)};}
  function updateLineNumbers(){var c=editor.value.split('\n').length,e=lineNumbers.children.length;if(c>e){var f=document.createDocumentFragment();for(var i=e;i<c;i++){f.appendChild(document.createElement('li'));}lineNumbers.appendChild(f);}else{while(lineNumbers.children.length>c)lineNumbers.removeChild(lineNumbers.lastChild);}}
  function syncScroll(){lineNumbers.scrollTop=editor.scrollTop;}
  function updateStatus(cc,errors){statusCommands.textContent=cc+' command'+(cc!==1?'s':'');statusErrors.textContent=errors.length+' error'+(errors.length!==1?'s':'');if(errors.length>0){statusErrors.classList.add('has-errors');statusMessage.textContent=errors[0].message||String(errors[0]);}else{statusErrors.classList.remove('has-errors');statusMessage.textContent=cc>0?'OK':'No commands';}}
  function render(){var code=editor.value;var pr;try{pr=LPParser.parse(code);}catch(e){statusMessage.textContent='Parser error: '+e.message;statusErrors.classList.add('has-errors');return;}
  var dpi=parseInt(dpiSelect.value,10)||203,wMm=parseFloat(labelWidth.value)||101,hMm=parseFloat(labelHeight.value)||60;
  try{LPRenderer.render(canvas,pr.commands,{dpi:dpi,labelWidthMm:wMm,labelHeightMm:hMm});}catch(e){statusMessage.textContent='Render error: '+e.message;return;}
  updateStatus((pr.commands||[]).length,pr.errors||[]);}
  function exportPng(){try{var d=canvas.toDataURL('image/png'),a=document.createElement('a');a.href=d;a.download='label.png';document.body.appendChild(a);a.click();document.body.removeChild(a);}catch(e){statusMessage.textContent='Export error: '+e.message;}}
  var debouncedRender=debounce(function(){if(autoRender.checked)render();},500);
  document.addEventListener('DOMContentLoaded',function(){
    editor=document.getElementById('code-editor');canvas=document.getElementById('label-canvas');
    dpiSelect=document.getElementById('dpi-select');labelWidth=document.getElementById('label-width');
    labelHeight=document.getElementById('label-height');autoRender=document.getElementById('auto-render');
    btnRender=document.getElementById('btn-render');btnExport=document.getElementById('btn-export');
    lineNumbers=document.getElementById('line-numbers');statusCommands=document.getElementById('status-commands');
    statusErrors=document.getElementById('status-errors');statusMessage=document.getElementById('status-message');
    editor.value=SAMPLE_CODE;updateLineNumbers();
    editor.addEventListener('input',function(){updateLineNumbers();debouncedRender();});
    editor.addEventListener('scroll',syncScroll);
    btnRender.addEventListener('click',render);btnExport.addEventListener('click',exportPng);
    [dpiSelect,labelWidth,labelHeight].forEach(function(el){el.addEventListener('change',function(){if(autoRender.checked)render();});});
    document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();render();}});
    window.addEventListener('resize',debounce(function(){render();},300));
    render();
  });
}());
