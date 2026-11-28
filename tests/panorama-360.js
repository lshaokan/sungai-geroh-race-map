const {chromium}=require('playwright');
const PNL='emu/node_modules/pannellum/build/pannellum.';
const init=()=>{window.__EMU={auth:'http://127.0.0.1:9099',fs:8081};try{localStorage.setItem('geroh-tour-done-v1','1')}catch(_){}};
// JPEG with an XMP packet saying "equirectangular", like a 360 camera writes
function withXmp(buf){const xml='<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:GPano="http://ns.google.com/photos/1.0/panorama/" GPano:ProjectionType="equirectangular" GPano:FullPanoWidthPixels="5760"/></rdf:RDF></x:xmpmeta>';
  const hdr=Buffer.from('http://ns.adobe.com/xap/1.0/\0','binary'),body=Buffer.concat([hdr,Buffer.from(xml)]),len=body.length+2;
  return Buffer.concat([buf.slice(0,2),Buffer.from([0xFF,0xE1,len>>8,len&255]),body,buf.slice(2)])}
(async()=>{const b=await chromium.launch();const errs=[];
const mkCtx=async(opt)=>{const c=await b.newContext(opt);await c.route(/cdn\.jsdelivr\.net\/npm\/pannellum@2\.5\.6\/build\/pannellum\.(js|css)/,r=>{const ext=r.request().url().endsWith('.css')?'css':'js';r.fulfill({path:PNL+ext,contentType:ext==='css'?'text/css':'application/javascript'})});return c};
// make test images in the browser
const gen=await (await b.newContext()).newPage();
const img=async(w,h,label)=>Buffer.from((await gen.evaluate(([w,h,label])=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');const gr=g.createLinearGradient(0,0,w,0);['#e63946','#f4a261','#2a9d8f','#264653','#e63946'].forEach((col,i)=>gr.addColorStop(i/4,col));g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle='#fff';g.font=(h/8|0)+'px sans-serif';for(let i=0;i<8;i++)g.fillText(label+' '+(i*45)+'°',i*w/8+20,h/2);if(label!=='normal'&&label!=='two-to-one'){const d=g.getImageData(0,0,w,h),a=d.data;for(let i=0;i<a.length;i+=4){const n=(Math.random()*90-45)|0;a[i]+=n;a[i+1]+=n;a[i+2]-=n}g.putImageData(d,0,0)}return c.toDataURL('image/jpeg',.9).split(',')[1]},[w,h,label])),'base64');
const files={normal:await img(4032,3024,'normal'),pano:await img(8000,1800,'pano'),s360:withXmp(await img(5760,2880,'sphere')),wide2:await img(2000,1000,'two-to-one')};
console.log('sizes MB',Object.fromEntries(Object.entries(files).map(([k,v])=>[k,(v.length/1e6).toFixed(1)])));
const E=await (await mkCtx({viewport:{width:1440,height:900}})).newPage();E.on('pageerror',e=>errs.push('E '+e.message));await E.addInitScript(init);await E.goto('http://localhost:8765/#join');await E.waitForTimeout(3800);
await E.fill('#jFirst','Pat');await E.fill('#jLast','Lee');await E.selectOption('#jDept','QM');await E.locator('#jpanel .btn.primary').click();await E.waitForTimeout(1800);
const ids={};
for(const [name,x,y] of [['normal',560,330],['pano',700,330],['s360',840,330],['wide2',980,330]]){
  await E.keyboard.press('Escape');await E.locator('#tk-station').click();await E.mouse.click(x,y);await E.waitForTimeout(900);ids[name]=await E.evaluate(()=>document.querySelector('#gItems .item.sel').getAttribute('data-id'));
  await E.locator('#card button',{hasText:'Details'}).click();await E.waitForTimeout(400);await E.locator('#card button',{hasText:'Add photo'}).click();await E.waitForTimeout(300);
  if(name==='normal'){console.log('1 chooser (laptop):',await E.$$eval('#jpanel .pchoose b',x=>x.map(e=>e.textContent)),'| guide:',await E.textContent('#jpanel summary'));await E.locator('#jpanel summary').click();await E.screenshot({path:'t99-chooser.png'})}
  const fc=E.waitForEvent('filechooser');await E.locator('#jpanel .pchoose .btn',{hasText:'Choose a file'}).click();(await fc).setFiles({name:name+'.jpg',mimeType:'image/jpeg',buffer:files[name]});
  await E.waitForTimeout(name==='normal'||name==='wide2'?1500:4000);
  console.log('2',name,'| badge:',await E.evaluate(()=>{const b=document.querySelector('#card .phbadge');return b?b.textContent:'(normal thumb)'}),'| hint:',await E.evaluate(()=>{const h=document.getElementById('hint');return h.classList.contains('fade')?'':h.innerText}),'| map badge 360:',await E.evaluate(id=>!!document.querySelector('#gItems .item[data-id="'+id+'"] text')&&document.querySelector('#gItems .item[data-id="'+id+'"]').textContent.includes('360'),ids[name]))}
await E.waitForTimeout(2500);
// what landed in the database
const r=await fetch('http://127.0.0.1:8081/v1/projects/wwsc-river-map-7ab35/databases/(default)/documents/photos?pageSize=50',{headers:{Authorization:'Bearer owner'}}).then(r=>r.json());
console.log('3 photo docs:',(r.documents||[]).map(d=>{const id=d.name.split('/').pop(),f=d.fields;return id.slice(0,1)+'…'+id.slice(-3)+':'+(f.parts?'parts='+f.parts.integerValue:f.data?Math.round(f.data.stringValue.length/1000)+'k':'?')}).join('  '));
// another device opens them
const V=await (await mkCtx({viewport:{width:820,height:1180},hasTouch:true,isMobile:true})).newPage();V.on('pageerror',e=>errs.push('V '+e.message));await V.addInitScript(init);await V.goto('http://localhost:8765/');await V.waitForTimeout(4500);
const openCard=async(p,id)=>{await p.keyboard.press('Escape');const bb=await p.locator('#gItems .item[data-id="'+id+'"]').boundingBox();await p.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2);await p.waitForTimeout(500);await p.locator('#card button',{hasText:'Details'}).tap().catch(()=>{});await p.waitForTimeout(1500)};
await openCard(V,ids.pano);await V.locator('#card .ph-thumb').tap();await V.waitForTimeout(1500);
console.log('4 viewer pano:',JSON.stringify(await V.evaluate(()=>{const s=document.querySelector('#pview .pv-pan');return s?{scrollable:s.scrollWidth>s.clientWidth+50,startsMid:Math.abs(s.scrollLeft-(s.scrollWidth-s.clientWidth)/2)<5,tip:document.querySelector('#pview .pv-tip').textContent}:'none'})));
await V.screenshot({path:'t99-pano.png'});await V.locator('#pview .pv-x').tap();await V.waitForTimeout(300);
await openCard(V,ids.s360);await V.locator('#card .ph-thumb').tap();await V.waitForTimeout(3500);
console.log('5 viewer 360:',JSON.stringify(await V.evaluate(()=>({pannellum:!!document.querySelector('#pview .pnlm-container'),canvas:!!document.querySelector('#pview canvas'),err:(document.querySelector('#pview .pnlm-error-msg')||{}).textContent||'',tip:(document.querySelector('#pview .pv-tip')||{}).textContent}))));
await V.screenshot({path:'t99-360.png'});await V.locator('#pview .pv-x').tap();await V.waitForTimeout(300);
await openCard(V,ids.wide2);console.log('6 2:1 small photo treated as normal:',await V.evaluate(()=>!document.querySelector('#card .phbadge')&&!!document.querySelector('#card .ph-thumb')));
await V.locator('#card button',{hasText:'Add photo'}).tap().catch(()=>{});await V.waitForTimeout(300);
// viewer with no CDN: 360 falls back to flat
const N=await (await b.newContext({viewport:{width:820,height:1180}})).newPage();await N.context().route(/cdn\.jsdelivr\.net/,r=>r.abort());await N.addInitScript(init);await N.goto('http://localhost:8765/');await N.waitForTimeout(4500);
await N.keyboard.press('Escape');const bb=await N.locator('#gItems .item[data-id="'+ids.s360+'"]').boundingBox();await N.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await N.waitForTimeout(500);await N.locator('#card button',{hasText:'Details'}).click().catch(()=>{});await N.waitForTimeout(1500);
await N.locator('#card .ph-thumb').click();await N.waitForTimeout(2500);console.log('7 no-signal 360 fallback:',await N.evaluate(()=>{const t=document.querySelector('#pview .pv-tip');return (document.querySelector('#pview .pv-pan')?'flat view':'none')+' | '+(t?t.textContent:'')}));
// iPad editor chooser shows both
const T=await (await mkCtx({viewport:{width:820,height:1180},hasTouch:true,isMobile:true})).newPage();await T.addInitScript(init);await T.goto('http://localhost:8765/#join');await T.waitForTimeout(3800);
await T.fill('#jFirst','Ipad');await T.fill('#jLast','User');await T.selectOption('#jDept','QM');await T.locator('#jpanel .btn.primary').tap();await T.waitForTimeout(1800);await openCard(T,ids.normal);
await T.evaluate(()=>0);const lb=await T.locator('#tk-station');
console.log('8 iPad: editor on someone else\'s station, Add photo ->',await (async()=>{await T.locator('#card button',{hasText:'photo'}).first().tap();await T.waitForTimeout(300);return T.evaluate(()=>{const d=document.getElementById('deny');return d&&!d.classList.contains('fade')?d.innerText.split('\n')[0]:(document.getElementById('jmodal').hidden?'nothing':'chooser')})})());
console.log('errs',errs);await b.close()})();
