const {chromium}=require('playwright');
const init=()=>{window.__EMU={auth:'http://127.0.0.1:9099',fs:8081};try{localStorage.setItem('geroh-tour-done-v1','1');localStorage.setItem('geroh-river-tour-done-v1','1');localStorage.setItem('geroh-name','Pat Lee')}catch(_){}};
(async()=>{const b=await chromium.launch();const errs=[];
const gen=await (await b.newContext()).newPage();
const img=async(w,h,c)=>Buffer.from((await gen.evaluate(([w,h,c])=>{const k=document.createElement('canvas');k.width=w;k.height=h;const g=k.getContext('2d');g.fillStyle=c;g.fillRect(0,0,w,h);g.fillStyle='#fff';g.font='120px sans-serif';g.fillText(c,40,200);return k.toDataURL('image/jpeg',.85).split(',')[1]},[w,h,c])),'base64');
const E=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();E.on('pageerror',e=>errs.push('E '+e.message));E.on('dialog',d=>d.accept());await E.addInitScript(init);await E.goto('http://localhost:8765/#join');await E.waitForTimeout(3800);
await E.fill('#jFirst','Pat');await E.fill('#jLast','Lee');await E.selectOption('#jDept','QM');await E.locator('#jpanel .btn.primary').click();await E.waitForTimeout(1800);await E.keyboard.press('Escape');
console.log('0 feed button visible:',await E.isVisible('#bFeed'));
await E.locator('#tk-station').click();await E.mouse.click(700,420);await E.waitForTimeout(900);const st=await E.evaluate(()=>document.querySelector('#gItems .item.sel').getAttribute('data-id'));
await E.locator('#card button',{hasText:'Details'}).click();await E.waitForTimeout(400);
for(const c of ['red','green','blue']){await E.locator('#card .phadd').click();await E.waitForTimeout(250);const fc=E.waitForEvent('filechooser');await E.locator('#jpanel .pchoose .btn',{hasText:'Choose a file'}).click();(await fc).setFiles({name:c+'.jpg',mimeType:'image/jpeg',buffer:await img(1600,1200,c)});await E.waitForTimeout(1600)}
console.log('1 card:',await E.textContent('#card .lbl-s'),'| tiles:',await E.locator('#card .phtile').count(),'| add tile:',await E.textContent('#card .phadd'),'| map badge count:',await E.evaluate(id=>{const t=[...document.querySelectorAll('#gItems .item[data-id="'+id+'"] text')].map(e=>e.textContent);return t.join(',')},st));
await E.screenshot({path:'t100-grid.png',clip:{x:0,y:120,width:420,height:500}});
await E.locator('#card .phtile').nth(1).click();await E.waitForTimeout(700);console.log('2 viewer:',await E.textContent('#pview .pv-n'),'| arrows:',await E.isVisible('#pview .pv-next'),'| remove:',await E.isVisible('#pview .pv-del'));
await E.keyboard.press('ArrowRight');await E.waitForTimeout(400);console.log('   after → :',await E.textContent('#pview .pv-n'));
await E.locator('#pview .pv-next').click();await E.waitForTimeout(400);console.log('   after next (wraps):',await E.textContent('#pview .pv-n'));
await E.locator('#pview .pv-del').click();await E.waitForTimeout(1200);console.log('   after remove:',await E.textContent('#pview .pv-n'),'| viewer open:',await E.isVisible('#pview'));
await E.keyboard.press('Escape');await E.waitForTimeout(300);console.log('   card tiles now:',await E.locator('#card .phtile').count());
// another device sees both photos
const V=await (await b.newContext({viewport:{width:820,height:1180},hasTouch:true,isMobile:true})).newPage();V.on('pageerror',e=>errs.push('V '+e.message));await V.addInitScript(init);await V.goto('http://localhost:8765/');await V.waitForTimeout(4500);
const bb=await V.locator('#gItems .item[data-id="'+st+'"]').boundingBox();await V.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2);await V.waitForTimeout(500);await V.locator('#card button',{hasText:'Details'}).tap().catch(()=>{});await V.waitForTimeout(1500);
console.log('3 viewer device tiles:',await V.locator('#card .phtile').count(),'| missing:',await V.locator('#card .phtile.missing').count(),'| feed badge:',await V.evaluate(()=>{const d=document.querySelector('#bFeed .fdot');return d.hidden?'hidden':d.textContent}));
await V.locator('#card .phtile').first().tap();await V.waitForTimeout(600);const ib=await V.locator('#pview img').boundingBox();await V.mouse.move(ib.x+ib.width*0.8,ib.y+ib.height/2);
await V.evaluate(()=>{const im=document.querySelector('#pview img');const r=im.getBoundingClientRect();im.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:r.x+r.width*.8,clientY:r.y+50}));im.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,clientX:r.x+r.width*.2,clientY:r.y+50}))});await V.waitForTimeout(400);
console.log('   swipe left ->',await V.textContent('#pview .pv-n'),'| viewer can remove?',await V.isVisible('#pview .pv-del'));await V.locator('#pview .pv-x').tap();
// recent changes
await V.locator('#bFeed').tap();await V.waitForTimeout(500);console.log('4 feed rows:\n'+(await V.$$eval('#fpanel .frow',x=>x.map(r=>'   '+r.innerText.replace(/\n/g,' / ')))).join('\n'));
await V.screenshot({path:'t100-feed.png'});
await V.locator('#fpanel .frow.go').first().tap();await V.waitForTimeout(800);console.log('   tap row -> card:',await V.evaluate(()=>!document.getElementById('card').hidden&&document.querySelector('#card h3,#card .namein').textContent),'| panel closed:',await V.evaluate(()=>document.getElementById('fmodal').hidden),'| badge after open:',await V.evaluate(()=>document.querySelector('#bFeed .fdot').hidden));
// river mode survives reload
const R=await (await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,geolocation:{latitude:4.43,longitude:101.17},permissions:['geolocation']})).newPage();R.on('pageerror',e=>errs.push('R '+e.message));await R.addInitScript(init);await R.goto('http://localhost:8765/');await R.waitForTimeout(4000);
await R.locator('#bRiver').tap();await R.waitForTimeout(1500);console.log('5 river on:',await R.evaluate(()=>document.body.classList.contains('rivermode')));
await R.reload();await R.waitForTimeout(4500);console.log('   after reload still river:',await R.evaluate(()=>document.body.classList.contains('rivermode')),'| gps:',await R.textContent('#rvGps'));
await R.locator('#rvExit').tap();await R.waitForTimeout(500);await R.reload();await R.waitForTimeout(4000);console.log('   after Exit + reload:',await R.evaluate(()=>document.body.classList.contains('rivermode')));
console.log('errs',errs);await b.close()})();
