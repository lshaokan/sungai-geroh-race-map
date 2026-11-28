const {chromium,devices}=require('playwright');
const init=()=>{window.__EMU={auth:'http://127.0.0.1:9099',fs:8081};try{localStorage.setItem('geroh-tour-done-v1','1')}catch(_){}};
const denyTxt=p=>p.evaluate(()=>{const d=document.getElementById('deny');return d&&!d.classList.contains('fade')?d.innerText.split('\n')[0]:'(none)'});
const hint=p=>p.evaluate(()=>{const h=document.getElementById('hint');return h.classList.contains('fade')?'':h.innerText});
(async()=>{const b=await chromium.launch();const errs=[];
const mk=async(n,opt)=>{const ctx=await b.newContext(opt||{viewport:{width:1280,height:800}});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(n+': '+e.message));await p.addInitScript(init);await p.goto('http://localhost:8765/#join');await p.waitForTimeout(3800);return p};
const join=async(p,f,l,d)=>{await p.fill('#jFirst',f);await p.fill('#jLast',l);await p.selectOption('#jDept',d);await p.locator('#jpanel .btn.primary').click();await p.waitForTimeout(1800);await p.keyboard.press('Escape')};
const E=await mk('E');await join(E,'Pat','Lee','Logistics');
const tabs=await E.$$eval('.tab span',x=>x.map(e=>e.textContent));console.log('1 tabs:',tabs.join(', '));
for(const t of ['Race','Logistics','Points']){await E.locator('.tab',{hasText:t}).click();await E.waitForTimeout(150);console.log('  ',t+':',(await E.$$eval('.tray .tk span',x=>x.map(e=>e.textContent))).join(', '))}
const place=async(tab,t,x,y)=>{await E.locator('.tab',{hasText:tab}).click();await E.locator('#tk-'+t).click();await E.mouse.click(x,y);await E.waitForTimeout(700);const id=await E.evaluate(()=>{const s=document.querySelector('#gItems .item.sel');return s&&s.getAttribute('data-id')});await E.keyboard.press('Escape');return id};
const a=await place('Logistics','tube',500,300),c=await place('Logistics','food',700,300),d=await place('Race','truck',900,300);
const O=await mk('O');await join(O,'Ola','Ng','QM');await O.locator('.tab',{hasText:'Race'}).click();await O.locator('#tk-flag').click();await O.mouse.click(600,500);await O.waitForTimeout(700);const oid=await O.evaluate(()=>document.querySelector('#gItems .item.sel').getAttribute('data-id'));
await E.waitForTimeout(1200);
// clear mode
await E.locator('#bClear').click();await E.waitForTimeout(200);console.log('2 clear on:',await E.evaluate(()=>document.body.classList.contains('clearing')),'| bar:',await E.textContent('#clearbar'));
const tap=async id=>{const bb=await E.locator('#gItems .item[data-id="'+id+'"]').boundingBox();await E.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await E.waitForTimeout(250)};
await tap(a);await tap(c);console.log('3 picked 2:',await E.textContent('#clearbar'),'| marked:',await E.locator('#gItems .doomed').count(),'| card opened:',await E.evaluate(()=>!document.getElementById('card').hidden));
await tap(oid);console.log('4 tap someone else\'s:',await denyTxt(E),'| still',await E.textContent('#clearbar'));
await E.screenshot({path:'t110-clear.png'});
await E.locator('#clearbar .btn.danger').click();await E.waitForTimeout(1500);console.log('5 deleted, gone on O:',await O.locator('#gItems .item[data-id="'+a+'"]').count()===0&&await O.locator('#gItems .item[data-id="'+c+'"]').count()===0,'| lorry kept:',await E.locator('#gItems .item[data-id="'+d+'"]').count(),'| hint:',await hint(E));
await E.locator('#bUndo').click();await E.waitForTimeout(1500);console.log('6 undo restores both:',await O.locator('#gItems .item[data-id="'+a+'"]').count()+await O.locator('#gItems .item[data-id="'+c+'"]').count());
// find next in layers
await E.locator('#bLayers').click();await E.waitForTimeout(300);console.log('7 Google section folded:',await E.getAttribute('.gmhead','aria-expanded'),'| layer rows:',await E.locator('#pLayers .lrow').count());
await E.locator('#pLayers .lrow',{hasText:'Logistics'}).locator('.loc').click();await E.waitForTimeout(900);console.log('8 find:',await hint(E));
await E.locator('#pLayers .lrow',{hasText:'Logistics'}).locator('.loc').click();await E.waitForTimeout(900);console.log('   again:',await hint(E));
await E.locator('.gmhead').click();await E.waitForTimeout(300);console.log('9 Google section opened:',await E.getAttribute('.gmhead','aria-expanded'),'| rows:',await E.locator('#pLayers .lrow').count());
await E.locator('#pLayers .lrow',{hasText:'rapids'}).locator('.loc').click();await E.waitForTimeout(900);console.log('   rapids find:',await hint(E));
await E.locator('#pLayers .lrow',{hasText:'rapids'}).locator('.loc').click();await E.waitForTimeout(900);console.log('   rapids again:',await hint(E));
await E.screenshot({path:'t110-layers.png'});
// phone
const M=await mk('M',{...devices['iPhone 13']});await join(M,'Mo','Ali','Kitchen');await M.waitForTimeout(500);
console.log('10 phone trash visible:',await M.isVisible('#bClear'),'| tabs fit:',await M.evaluate(()=>{const d=document.getElementById('dock').getBoundingClientRect();return d.right<=innerWidth+1}));
await M.screenshot({path:'t110-phone.png'});
console.log('errs',errs);await b.close()})();
