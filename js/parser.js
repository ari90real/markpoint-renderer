/**
 * parser.js — Labelpoint II command parser.
 * LPParser.parse(code) returns { commands: [], errors: [], variables: {} }
 */
(function (global) {
  'use strict';
  function parseQuotedString(str, pos) {
    while (pos < str.length && (str[pos] === ' ' || str[pos] === '\t')) pos++;
    if (pos >= str.length || str[pos] !== '"') return null;
    pos++;
    var result = '';
    while (pos < str.length) {
      var ch = str[pos];
      if (ch === '"') { if (pos+1 < str.length && str[pos+1] === '"') { result += '"'; pos += 2; } else { pos++; break; } }
      else if (ch === '\\') {
        var next = str[pos+1];
        if (next === '\\') { result += '\\'; pos += 2; }
        else if (next === 'x' || next === 'X') { var hex = str.substr(pos+2,2); if (/^[0-9a-fA-F]{2}$/.test(hex)) { result += String.fromCharCode(parseInt(hex,16)); pos += 4; } else { result += ch; pos++; } }
        else if (next === 'u' || next === 'U') { var uhex = str.substr(pos+2,4); if (/^[0-9a-fA-F]{4}$/.test(uhex)) { result += String.fromCharCode(parseInt(uhex,16)); pos += 6; } else { result += ch; pos++; } }
        else { result += ch; pos++; }
      } else { result += ch; pos++; }
    }
    return { value: result, end: pos };
  }
  function tokenize(str) {
    var tokens = [], pos = 0;
    while (pos < str.length) {
      while (pos < str.length && (str[pos] === ' ' || str[pos] === '\t')) pos++;
      if (pos >= str.length) break;
      if (str[pos] === '"') { var qr = parseQuotedString(str, pos); if (qr) { tokens.push({type:'str',value:qr.value}); pos = qr.end; } else pos++; }
      else { var start = pos; while (pos < str.length && str[pos] !== ' ' && str[pos] !== '\t') pos++; var raw = str.slice(start,pos).replace(/\|$/,''); var num = Number(raw); if (raw !== '' && !isNaN(num)) tokens.push({type:'num',value:num}); else tokens.push({type:'word',value:raw}); }
    }
    return tokens;
  }
  function numAt(t,i) { if(i>=t.length) return NaN; return t[i].type==='num' ? t[i].value : NaN; }
  function wordAt(t,i) { return i<t.length ? t[i].value : ''; }
  function strAt(t,i) { return (i<t.length && t[i].type==='str') ? t[i].value : null; }
  function parseFieldCommon(tokens, si, ln, errors, label) {
    var i=si, uv=wordAt(tokens,i); i++; var bl=numAt(tokens,i); i++; var po=numAt(tokens,i); i++;
    var al=wordAt(tokens,i); i++; var h=numAt(tokens,i); i++; var w=numAt(tokens,i); i++;
    if(isNaN(bl)||isNaN(po)||isNaN(h)||isNaN(w)){errors.push({line:ln,message:label+': invalid params'}); return null;}
    return {upVector:uv,baseline:bl,position:po,alignment:al,height:h,width:w,nextIdx:i};
  }
  function parseFT(tokens,si,ln,errors) {
    var c=parseFieldCommon(tokens,si,ln,errors,'!F T'); if(!c) return null;
    var i=c.nextIdx, font=numAt(tokens,i); i++; if(isNaN(font)){errors.push({line:ln,message:'!F T: missing font'}); return null;}
    var text=strAt(tokens,i); if(text===null){errors.push({line:ln,message:'!F T: missing text'}); return null;}
    return {type:'text',subtype:'bitmap',upVector:c.upVector,baseline:c.baseline,position:c.position,alignment:c.alignment,heightExp:c.height,widthExp:c.width,font:font,text:text,line:ln};
  }
  function parseFS(tokens,si,ln,errors) {
    var c=parseFieldCommon(tokens,si,ln,errors,'!F S'); if(!c) return null;
    var i=c.nextIdx, font=numAt(tokens,i); i++; if(isNaN(font)){errors.push({line:ln,message:'!F S: missing font'}); return null;}
    var spacing; if(i<tokens.length && tokens[i].type==='num' && i+1<tokens.length && tokens[i+1].type==='str'){spacing=tokens[i].value; i++;}
    var text=strAt(tokens,i); if(text===null){errors.push({line:ln,message:'!F S: missing text'}); return null;}
    var obj={type:'text',subtype:'scalable',upVector:c.upVector,baseline:c.baseline,position:c.position,alignment:c.alignment,height:c.height,width:c.width,font:font,text:text,line:ln};
    if(spacing!==undefined) obj.spacing=spacing; return obj;
  }
  function parseFC(tokens,si,ln,errors) {
    var c=parseFieldCommon(tokens,si,ln,errors,'!F C'); if(!c) return null;
    var i=c.nextIdx, sym=numAt(tokens,i); i++; if(isNaN(sym)){errors.push({line:ln,message:'!F C: missing symbology'}); return null;}
    var text=strAt(tokens,i); if(text===null){errors.push({line:ln,message:'!F C: missing text'}); return null;}
    return {type:'barcode',upVector:c.upVector,baseline:c.baseline,position:c.position,alignment:c.alignment,height:c.height,widthExp:c.width,symbology:sym,text:text,line:ln};
  }
  function parseFB(tokens,si,ln,errors) {
    if(si<tokens.length && tokens[si].type==='word' && tokens[si].value.toUpperCase()==='D') {
      var i=si+1,y0=numAt(tokens,i);i++;var x0=numAt(tokens,i);i++;var lw=numAt(tokens,i);i++;var y1=numAt(tokens,i);i++;var x1=numAt(tokens,i);i++;
      if(isNaN(y0)||isNaN(x0)||isNaN(lw)||isNaN(y1)||isNaN(x1)){errors.push({line:ln,message:'!F B D: invalid params'}); return null;}
      return {type:'diagonal',y0:y0,x0:x0,lineWidth:lw,y1:y1,x1:x1,line:ln};
    }
    var c=parseFieldCommon(tokens,si,ln,errors,'!F B'); if(!c) return null;
    var border=0; if(c.nextIdx<tokens.length && tokens[c.nextIdx].type==='num') border=tokens[c.nextIdx].value;
    return {type:'box',upVector:c.upVector,baseline:c.baseline,position:c.position,alignment:c.alignment,height:c.height,width:c.width,border:border,line:ln};
  }
  function parseFG(tokens,si,ln,errors) {
    var c=parseFieldCommon(tokens,si,ln,errors,'!F G'); if(!c) return null;
    var name=strAt(tokens,c.nextIdx); if(name===null){errors.push({line:ln,message:'!F G: missing name'}); return null;}
    return {type:'graphics',upVector:c.upVector,baseline:c.baseline,position:c.position,alignment:c.alignment,heightExp:c.height,widthExp:c.width,name:name,line:ln};
  }
  function parseF(rest, ln, errors) {
    var m=rest.match(/^([A-Za-z])\s*/); if(!m){errors.push({line:ln,message:'!F: missing sub-cmd'}); return null;}
    var sub=m[1].toUpperCase(), tokens=tokenize(rest.slice(m[0].length));
    switch(sub){case 'T':return parseFT(tokens,0,ln,errors);case 'S':return parseFS(tokens,0,ln,errors);
    case 'C':return parseFC(tokens,0,ln,errors);case 'B':return parseFB(tokens,0,ln,errors);
    case 'G':return parseFG(tokens,0,ln,errors);default:errors.push({line:ln,message:'!F: unknown '+sub}); return null;}
  }
  function findCommentStart(line) {
    var inQ=false;
    for(var i=0;i<line.length;i++){var ch=line[i]; if(inQ){if(ch==='"'){if(i+1<line.length&&line[i+1]==='"')i++;else inQ=false;}}else{if(ch==='"')inQ=true;else if(ch==='/'&&i+1<line.length&&line[i+1]==='/')return i;}}
    return -1;
  }
  function parse(code) {
    var commands=[],errors=[],variables={};
    if(typeof code!=='string'){errors.push({line:0,message:'input must be string'}); return {commands:commands,errors:errors,variables:variables};}
    var lines=code.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n');
    for(var li=0;li<lines.length;li++){
      var ln=li+1, raw=lines[li], ci=findCommentStart(raw), line=(ci>=0?raw.slice(0,ci):raw).replace(/\s+$/,'');
      if(line==='') continue;
      if(line[0]!=='!'){variables[ln]=line; continue;}
      if(line.length<2){errors.push({line:ln,message:'Incomplete: '+line}); continue;}
      var cmd=line[1], rest=line.slice(2), result=null;
      try{switch(cmd){
        case 'C':result={type:'clear',line:ln};break;
        case 'Y':var m=rest.match(/^(\d+)\s+(\d+)\|?/); if(m)result={type:'param',id:parseInt(m[1],10),value:parseInt(m[2],10),line:ln}; else errors.push({line:ln,message:'!Y: invalid'}); break;
        case 'Z':result={type:'save_config',line:ln};break;
        case 'R':result={type:'clear_vars',line:ln};break;
        case 'P':var pm=rest.match(/^(\d+)/); result=pm?{type:'print',count:parseInt(pm[1],10),line:ln}:{type:'print',count:1,line:ln}; break;
        case 'F':result=parseF(rest.replace(/^\s+/,''),ln,errors);break;
        case 'W':var wm=rest.match(/^(\d+)\s*/); if(wm){var qr=parseQuotedString(rest.slice(wm[0].length),0); if(qr)result={type:'set_var',varNum:parseInt(wm[1],10),data:qr.value,line:ln};} break;
        default:errors.push({line:ln,message:'Unknown: !'+cmd});
      }}catch(e){errors.push({line:ln,message:'Error: '+e.message});}
      if(result) commands.push(result);
    }
    return {commands:commands,errors:errors,variables:variables};
  }
  var LPParser={parse:parse};
  if(typeof module!=='undefined'&&module.exports)module.exports=LPParser; else global.LPParser=LPParser;
}(typeof globalThis!=='undefined'?globalThis:typeof window!=='undefined'?window:this));
