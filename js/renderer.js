/**
 * renderer.js — Canvas renderer for Labelpoint II label preview.
 * Depends on: LPCoords, LPFonts, bwipjs
 */
var LPRenderer = (function () {
    'use strict';
    var SYM = {1:'interleaved2of5',2:'interleaved2of5',3:'interleaved2of5',4:'interleaved2of5',5:'interleaved2of5',6:'interleaved2of5',7:'interleaved2of5',11:'code39',12:'code39',13:'code39',14:'code39',15:'code39',16:'code39',17:'code39',21:'rationalizedCodabar',22:'rationalizedCodabar',23:'rationalizedCodabar',24:'rationalizedCodabar',25:'rationalizedCodabar',26:'rationalizedCodabar',27:'rationalizedCodabar',31:'upca',32:'ean13',33:'ean8',34:'upce',41:'code128',43:'gs1-128',51:'itf14',52:'itf14',53:'itf14',54:'itf14',55:'itf14',56:'itf14',57:'itf14',61:'pdf417',64:'databaromni',67:'databarlimited',68:'databarexpanded',101:'qrcode',102:'qrcode',131:'datamatrix'};
    function pad2(n){return String(n).padStart(2,'0');}
    function subVars(text){
        if(typeof text!=='string')return String(text||'');
        var now=new Date(),r='',i=0;
        while(i<text.length){
            if(text[i]==='%'){i++;if(i>=text.length){r+='%';break;}var ch=text[i];
            if(ch==='%'){r+='%';i++;}else if(ch==='D'){r+=pad2(now.getDate());i++;}else if(ch==='N'){r+=pad2(now.getMonth()+1);i++;}else if(ch==='Y'){r+=String(now.getFullYear()).slice(-2);i++;}else if(ch==='y'){r+=String(now.getFullYear());i++;}else if(ch==='H'){r+=pad2(now.getHours());i++;}else if(ch==='M'){r+=pad2(now.getMinutes());i++;}else if(ch==='S'){r+=pad2(now.getSeconds());i++;}else if(ch>='0'&&ch<='9'){var ns='';while(i<text.length&&text[i]>='0'&&text[i]<='9'){ns+=text[i];i++;}if(i<text.length&&(text[i]==='V'||text[i]==='v')){r+='[VAR '+ns+']';i++;}else if(i<text.length&&(text[i]==='C'||text[i]==='c')){r+='[CTR '+ns+']';i++;}else{r+='%'+ns;}}else{r+='%'+ch;i++;}}else{r+=text[i];i++;}
        }return r;
    }
    function renderText(ctx,cmd,state,dpi){
        try{
            var pos=LPCoords.toCanvas(cmd.baseline,cmd.position,cmd.upVector),rot=LPCoords.getRotation(cmd.upVector);
            var fontSize,fontId=cmd.font,isScF=(fontId>=90000||(fontId>=24000&&fontId<=25000));
            if(cmd.subtype==='scalable'){fontSize=(cmd.height*dpi)/72;}
            else{var h=cmd.heightExp||1;if(isScF){fontSize=h*2.5*(dpi/203);}else{fontSize=LPFonts.getPixelSize(h,'bitmap',dpi,fontId);}}
            if(!isFinite(fontSize)||fontSize<1)fontSize=12;if(fontSize>2000)fontSize=2000;
            var fi={family:LPFonts.getFontFamily(fontId),weight:LPFonts.getFontWeight(fontId),style:LPFonts.getFontStyle(fontId)};
            var fc='';if(fi.style!=='normal')fc+=fi.style+' ';if(fi.weight!=='normal')fc+=fi.weight+' ';fc+=Math.round(fontSize)+'px '+fi.family;
            var text=subVars(cmd.text);if(!text)return;
            ctx.save();ctx.translate(pos.x,pos.y);ctx.rotate(rot);ctx.font=fc;ctx.textBaseline='alphabetic';
            var al=(cmd.alignment||'L').toUpperCase();ctx.textAlign=al==='R'?'right':al==='C'?'center':'left';
            if(state.reverseVideo){var m=ctx.measureText(text),tw=m.width,bx=0;if(al==='R')bx=-tw;else if(al==='C')bx=-tw/2;ctx.fillStyle='#000';ctx.fillRect(bx,-fontSize,tw,fontSize*1.3);ctx.fillStyle='#fff';}else{ctx.fillStyle='#000';}
            ctx.fillText(text,0,0);ctx.restore();
        }catch(e){}
    }
    function renderBarcode(ctx,cmd,state,dpi){
        try{
            var bcid=SYM[cmd.symbology];if(!bcid){drawBCPH(ctx,cmd,dpi,'Unknown sym '+cmd.symbology);return;}
            var text=subVars(cmd.text);if(!text){drawBCPH(ctx,cmd,dpi,'Empty data');return;}
            var hPx=LPCoords.unitsToPixels(cmd.height),isQR=(cmd.symbology===101||cmd.symbology===102),isDM=(cmd.symbology===131),isPDF=(cmd.symbology===61),is2D=isQR||isDM||isPDF;
            var off=document.createElement('canvas'),opts={bcid:bcid,text:text,includetext:!is2D&&!!state.barcodeInterpretation};
            if(isQR||isDM){opts.scale=Math.max(1,Math.min(16,cmd.widthExp||2));}else if(isPDF){opts.columns=4;opts.rows=20;opts.scale=Math.max(1,cmd.widthExp||2);}else{opts.height=Math.max(1,(cmd.height||100)/10);opts.scaleX=Math.max(1,cmd.widthExp||1);}
            bwipjs.toCanvas(off,opts);
            var pos=LPCoords.toCanvas(cmd.baseline,cmd.position,cmd.upVector),rot=LPCoords.getRotation(cmd.upVector);
            ctx.save();ctx.translate(pos.x,pos.y);ctx.rotate(rot);
            if(!is2D&&off.height>0){var tH=Math.max(10,hPx),sc=tH/off.height;ctx.scale(sc,sc);}
            ctx.drawImage(off,0,-off.height);ctx.restore();
        }catch(e){drawBCPH(ctx,cmd,dpi,e.message||String(e));}
    }
    function drawBCPH(ctx,cmd,dpi,msg){
        try{var pos=LPCoords.toCanvas(cmd.baseline,cmd.position,cmd.upVector),rot=LPCoords.getRotation(cmd.upVector),w=Math.max(80,LPCoords.unitsToPixels((cmd.widthExp||3)*150)),h=Math.max(40,LPCoords.unitsToPixels(cmd.height||100));
        ctx.save();ctx.translate(pos.x,pos.y);ctx.rotate(rot);ctx.translate(0,-h);ctx.strokeStyle='#c00';ctx.lineWidth=1.5;ctx.strokeRect(0,0,w,h);ctx.fillStyle='#fff0f0';ctx.fillRect(1,1,w-2,h-2);ctx.fillStyle='#c00';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';var m=String(msg||'?');if(m.length>40)m=m.slice(0,37)+'...';ctx.fillText('BC: '+m,w/2,h/2);ctx.restore();}catch(e2){}
    }
    function renderBox(ctx,cmd){
        try{var pos=LPCoords.toCanvas(cmd.baseline,cmd.position,cmd.upVector),rot=LPCoords.getRotation(cmd.upVector),w=LPCoords.unitsToPixels(cmd.width||0),h=LPCoords.unitsToPixels(cmd.height||0);if(w<=0||h<=0)return;
        ctx.save();ctx.translate(pos.x,pos.y);ctx.rotate(rot);
        if(!cmd.border||cmd.border===0){ctx.fillStyle='#000';ctx.fillRect(0,-h,w,h);}else{var bPx=Math.max(1,LPCoords.unitsToPixels(cmd.border));ctx.strokeStyle='#000';ctx.lineWidth=bPx;ctx.strokeRect(bPx/2,-(h-bPx/2),w-bPx,h-bPx);}
        ctx.restore();}catch(e){}
    }
    function renderDiag(ctx,cmd){
        try{var x0=LPCoords.unitsToPixels(cmd.x0),y0=LPCoords.unitsToPixels(cmd.y0),x1=LPCoords.unitsToPixels(cmd.x1),y1=LPCoords.unitsToPixels(cmd.y1),lw=Math.max(1,LPCoords.unitsToPixels(cmd.lineWidth||5)),s=LPCoords.getCanvasSize();
        ctx.save();ctx.beginPath();ctx.moveTo(s.width-x0,s.height-y0);ctx.lineTo(s.width-x1,s.height-y1);ctx.strokeStyle='#000';ctx.lineWidth=lw;ctx.stroke();ctx.restore();}catch(e){}
    }
    function renderGfx(ctx,cmd){
        try{var pos=LPCoords.toCanvas(cmd.baseline,cmd.position,cmd.upVector),rot=LPCoords.getRotation(cmd.upVector),w=Math.max(40,LPCoords.unitsToPixels((cmd.widthExp||1)*100)),h=Math.max(40,LPCoords.unitsToPixels((cmd.heightExp||1)*100));
        ctx.save();ctx.translate(pos.x,pos.y);ctx.rotate(rot);ctx.translate(0,-h);ctx.fillStyle='#e8e8e8';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#aaa';ctx.lineWidth=1;ctx.strokeRect(0,0,w,h);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(w,h);ctx.moveTo(w,0);ctx.lineTo(0,h);ctx.stroke();ctx.fillStyle='#555';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(cmd.name||'graphic',w/2,h/2);ctx.restore();}catch(e){}
    }
    function render(canvas,commands,options){
        if(!canvas||!commands)return;
        options=options||{};var dpi=options.dpi||203,wMm=options.labelWidthMm||101,hMm=options.labelHeightMm||60;
        LPCoords.init(wMm,hMm,dpi);
        var size=LPCoords.getCanvasSize();canvas.width=Math.round(size.width);canvas.height=Math.round(size.height);
        var ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
        var state={barcodeInterpretation:0,reverseVideo:false};
        for(var i=0;i<commands.length;i++){var cmd=commands[i];if(!cmd)continue;
        try{switch(cmd.type){
            case 'param':if(cmd.id===42)state.barcodeInterpretation=cmd.value;if(cmd.id===162)state.reverseVideo=!!(cmd.value);break;
            case 'text':renderText(ctx,cmd,state,dpi);break;
            case 'barcode':renderBarcode(ctx,cmd,state,dpi);break;
            case 'box':renderBox(ctx,cmd);break;
            case 'diagonal':renderDiag(ctx,cmd);break;
            case 'graphics':renderGfx(ctx,cmd);break;
            case 'clear':case 'save_config':case 'clear_vars':case 'print':break;
        }}catch(e){}}
    }
    return {render:render};
}());
