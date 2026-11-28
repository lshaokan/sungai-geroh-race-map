const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];const p=await (await b.newContext({...devices['iPhone 13']})).newPage();p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__EMU={auth:'http://127.0.0.1:9099',fs:8081};try{localStorage.setItem('geroh-tour-done-v1','1')}catch(_){}});await p.goto('http://localhost:8765/#join');await p.waitForTimeout(4000);
await p.addStyleTag({content:'.firebase-emulator-warning{display:none!important}'});
await p.fill('#jFirst','Pat');await p.fill('#jLast','Lee');await p.selectOption('#jDept','QM');await p.locator('#jpanel .btn.primary').tap();await p.waitForTimeout(2000);await p.locator('#hint .x').tap().catch(()=>{});
await p.locator('.rseg').first().tap();await p.waitForTimeout(1000);await p.locator('#card button[aria-label=Close]').tap().catch(()=>{});await p.waitForTimeout(300);
const pt=await p.evaluate(()=>{const W=document.getElementById('world').getAttribute('transform'),m=/translate\(([-\d.e]+)[ ,]+([-\d.e]+)\)\s*scale\(([-\d.e]+)/.exec(W),r=document.getElementById('map').getBoundingClientRect();const g=document.querySelector('#gMarks .mark[data-mark="rapids:5"]');const t=/translate\(([-\d.e]+)[ ,]+([-\d.e]+)/.exec(g.getAttribute('transform'));return{x:r.left+(+m[1])+(+t[1])*(+m[3]),y:r.top+(+m[2])+(+t[2])*(+m[3])}});
await p.touchscreen.tap(pt.x,pt.y);await p.waitForTimeout(500);
console.log('after tap: spun',await p.locator('.spun').count(),'tip',await p.evaluate(()=>{const t=document.getElementById('mtip');return t&&!t.hidden?t.innerText.split('\n')[0]:'none'}));
if(await p.locator('#gMarks .mark.spun[data-mark="rapids:5"]').count()){const q=await p.evaluate(()=>{const W=document.getElementById('world').getAttribute('transform'),m=/translate\(([-\d.e]+)[ ,]+([-\d.e]+)\)\s*scale\(([-\d.e]+)/.exec(W),r=document.getElementById('map').getBoundingClientRect();const g=document.querySelector('#gMarks .mark[data-mark="rapids:5"]');const t=/translate\(([-\d.e]+)[ ,]+([-\d.e]+)/.exec(g.getAttribute('transform'));return{x:r.left+(+m[1])+(+t[1])*(+m[3]),y:r.top+(+m[2])+(+t[2])*(+m[3])}});await p.touchscreen.tap(q.x,q.y);await p.waitForTimeout(600)}
if(await p.evaluate(()=>document.getElementById('card').hidden)){const bs=await p.$$('#mtip button');if(bs.length)await bs[bs.length-1].tap();await p.waitForTimeout(600)}
console.log('card:',await p.evaluate(()=>!document.getElementById('card').hidden&&document.querySelector('#card h3').textContent),'| drag hint shown:',await p.isVisible('#card .dropzone'));
await p.locator('#card button',{hasText:'Add an icon'}).tap();await p.waitForTimeout(400);console.log('picker:',await p.textContent('#mpanel h2'),'| icons:',await p.locator('#mpanel .ipk').count());
await p.screenshot({path:'p4-picker.png'});
await p.locator('#mpanel .ipk',{hasText:'Lifeguard'}).tap();await p.waitForTimeout(1000);
console.log('chips on card:',await p.$$eval('#card .chip',x=>x.map(e=>e.textContent)),'| hint:',await p.evaluate(()=>{const h=document.getElementById('hint');return h.classList.contains('fade')?'':h.innerText}));
await p.screenshot({path:'p4-after.png'});console.log('errs',errs);await b.close()})();
