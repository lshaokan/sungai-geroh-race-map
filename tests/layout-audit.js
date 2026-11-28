const {chromium}=require('playwright');
const DEV=[['iPad mini P',768,1024],['iPad mini L',1024,768],['iPad 10 P',820,1180],['iPad 10 L',1180,820],['iPad Pro11 P',834,1194],['iPad Pro11 L',1194,834],['iPad Pro13 L',1366,1024],['iPhone P',390,844],['iPhone L',844,390],['iPhone SE',375,667],['Pixel P',412,915]];
const BOX=['.tl','.tc','.compass','.vstack','.zstack','#card','#dock','#hint','.bl'];
(async()=>{const b=await chromium.launch();const report=[];
for(const [name,w,h] of DEV){
 const p=await b.newPage({viewport:{width:w,height:h},hasTouch:true,isMobile:w<700});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{window.__EMU={auth:'http://127.0.0.1:9099',fs:8081};try{localStorage.setItem('geroh-tour-done-v1','1')}catch(_){}});
 await p.goto('http://localhost:8765/');await p.waitForTimeout(3500);
 const states={base:async()=>{},section:async()=>{await p.evaluate(()=>document.querySelectorAll('.rseg')[3].click());await p.waitForTimeout(500)},
  draw:async()=>{await p.evaluate(()=>{document.querySelector('#card .ib')&&document.querySelector('#card .ib').click();document.querySelectorAll('.tab')[4].click()});await p.waitForTimeout(300)},
  layers:async()=>{await p.evaluate(()=>{document.querySelectorAll('.tab')[0].click();document.getElementById('bLayers').click()});await p.waitForTimeout(300)},
  exportm:async()=>{await p.evaluate(()=>{document.getElementById('bLayers').click();document.getElementById('bExport').click()});await p.waitForTimeout(300)}};
 for(const [st,fn] of Object.entries(states)){await fn();
  const r=await p.evaluate((BOX)=>{const vw=innerWidth,vh=innerHeight,out={over:[],off:[]};const rs=[];
   BOX.forEach(sel=>{const e=document.querySelector(sel);if(!e||e.hidden||e.classList.contains('fade')||getComputedStyle(e).visibility==='hidden')return;const q=e.getBoundingClientRect();if(!q.width||!q.height)return;if(getComputedStyle(e).display==='none')return;rs.push([sel,q]);
     if(q.left<-0.5||q.top<-0.5||q.right>vw+0.5||q.bottom>vh+0.5)out.off.push(sel+' '+[q.left,q.top,q.right,q.bottom].map(Math.round))});
   ['#pLayers','#xpanel'].forEach(sel=>{const e=document.querySelector(sel);if(!e||e.hidden||e.closest('[hidden]'))return;const q=e.getBoundingClientRect();if(q.width&&(q.left<0||q.top<0||q.right>vw||q.bottom>vh))out.off.push(sel+' '+[q.left,q.top,q.right,q.bottom].map(Math.round))});
   for(let i=0;i<rs.length;i++)for(let j=i+1;j<rs.length;j++){const a=rs[i][1],c=rs[j][1];const ix=Math.min(a.right,c.right)-Math.max(a.left,c.left),iy=Math.min(a.bottom,c.bottom)-Math.max(a.top,c.top);if(ix>1&&iy>1)out.over.push(rs[i][0]+'x'+rs[j][0]+' '+Math.round(ix)+'x'+Math.round(iy))}
   const m=document.getElementById('map').getBoundingClientRect();let free=vh;out.small=[...document.querySelectorAll('#hud button, #tourCard button')].filter(x=>{const q=x.getBoundingClientRect();return q.width&&q.height&&(q.width<40||q.height<40)}).length;
   out.dockH=Math.round(document.getElementById('dock').getBoundingClientRect().height);return out},BOX);
  report.push([name,st,JSON.stringify(r)]);}
 if(errs.length)report.push([name,'errors',errs.join('|')]);await p.close()}
report.forEach(r=>console.log(r.join(' | ')));await b.close()})();
