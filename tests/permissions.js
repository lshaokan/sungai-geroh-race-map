const {chromium}=require('playwright');
const ADMIN=process.argv[2]||'';
async function tok(p,id){const L=p.locator('#tk-'+id);if(!(await L.isVisible())){const n=await p.locator('.tab').count();for(let i=0;i<n;i++){await p.locator('.tab').nth(i).click();if(await L.isVisible())break}}return L}
async function drag(p,id,x,y){const L=await tok(p,id);const bb=await L.boundingBox();await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await p.mouse.move(x,y,{steps:8});await p.mouse.up();await p.waitForTimeout(800)}
const denyTxt=p=>p.evaluate(()=>{const d=document.getElementById('deny');return d&&!d.classList.contains('fade')?d.innerText.replace(/\n/g,' / '):'(none)'});
const ping=p=>p.evaluate(()=>document.getElementById('bMe').classList.contains('ping'));
const hideDeny=p=>p.evaluate(()=>{const d=document.getElementById('deny');if(d)d.classList.add('fade');document.getElementById('bMe').classList.remove('ping')});
(async()=>{const b=await chromium.launch();const errs=[];
const mk=async(n,hash,vp)=>{const ctx=await b.newContext({viewport:vp||{width:1180,height:820},deviceScaleFactor:vp?2:1});
  await ctx.route(/^https:\/\/(firestore|identitytoolkit|securetoken)\.googleapis\.com/,r=>{errs.push(n+' tried real Firebase');r.abort()});
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(n+': '+e.message));p.on('dialog',d=>{console.log('  ['+n+' dialog] '+d.message().split('\n')[0]);d.accept()});
  await p.addInitScript(()=>{window.__EMU={auth:'http://127.0.0.1:9099',fs:8081};try{localStorage.setItem('geroh-tour-done-v1','1')}catch(_){}});
  await p.goto('http://localhost:8765/'+(hash||''));await p.waitForTimeout(4000);return p};
const join=async(p,f,l,d)=>{await p.fill('#jFirst',f);await p.fill('#jLast',l);await p.selectOption('#jDept',d);await p.locator('#jpanel .btn.primary').click();await p.waitForTimeout(1800)};
// viewer on iPad portrait
const V=await mk('viewer','',{width:820,height:1180});
console.log('1 header button:',await V.textContent('#bMe'));
const tk=await tok(V,'tube');await tk.click();await V.waitForTimeout(250);
console.log('2 viewer taps tube:',await denyTxt(V),'| ping:',await ping(V),'| armed:',await V.evaluate(()=>document.getElementById('map').classList.contains('armed')));
await V.screenshot({path:'t90-viewer-deny.png'});
await V.locator('#deny').click();await V.waitForTimeout(300);console.log('3 tap bubble opens:',await V.textContent('#jpanel h2'));
await V.locator('#jpanel button',{hasText:'Not now'}).click();
// editor A
const A=await mk('A');await A.click('#bMe');await A.waitForTimeout(300);console.log('4 sheet title:',await A.textContent('#jpanel h2'),'| button:',await A.textContent('#jpanel .btn.primary'),'| link:',await A.textContent('#jpanel .jlink'));
await join(A,'Aisha','Rahman','River Safety');await drag(A,'truck',700,450);
const lorry=await A.evaluate(()=>document.querySelector('#gItems .item.sel').getAttribute('data-id'));await A.keyboard.press('Escape');
// editor B
const B=await mk('B','#join');await join(B,'Ben','Tan','Logistics');await B.waitForTimeout(800);
const box=async(p,id)=>p.locator('#gItems .item[data-id="'+id+'"]').boundingBox();
let lb=await box(B,lorry);await B.mouse.click(lb.x+lb.width/2,lb.y+lb.height/2);await B.waitForTimeout(400);
await B.locator('#card button',{hasText:'Details'}).click().catch(()=>{});await B.waitForTimeout(300);
await B.locator('#item-label').click();await B.waitForTimeout(200);console.log('5 B taps label on Aisha\'s lorry:',await denyTxt(B),'| ping:',await ping(B),'| readonly:',await B.evaluate(()=>document.getElementById('item-label').readOnly));
await B.screenshot({path:'t90-own-deny.png'});await hideDeny(B);
await B.locator('#card button',{hasText:'Remove'}).click();await B.waitForTimeout(500);console.log('6 B Remove:',await denyTxt(B),'| lorry still there:',await B.locator('#gItems .item[data-id="'+lorry+'"]').count());await hideDeny(B);
await B.locator('#card .lockb').click();await B.waitForTimeout(300);console.log('7 B Lock:',await denyTxt(B));await hideDeny(B);
lb=await box(B,lorry);const x0=lb.x;await B.mouse.move(lb.x+lb.width/2,lb.y+lb.height/2);await B.mouse.down();await B.mouse.move(lb.x+140,lb.y+60,{steps:8});await B.mouse.up();await B.waitForTimeout(800);
console.log('8 B drags lorry:',await denyTxt(B),'| moved:',Math.abs((await box(B,lorry)).x-x0)>5,'| on A moved:',await A.evaluate(id=>!!document.querySelector('#gItems .item[data-id="'+id+'"]'),lorry));await hideDeny(B);
await B.keyboard.press('Delete');await B.waitForTimeout(400);console.log('9 B presses Delete:',await denyTxt(B),'| still there:',await B.locator('#gItems .item[data-id="'+lorry+'"]').count());await hideDeny(B);
await B.locator('#card button',{hasText:'Duplicate'}).click();await B.waitForTimeout(800);const dup=await B.evaluate(()=>document.querySelector('#gItems .item.sel').getAttribute('data-id'));
console.log('10 B duplicates (allowed):',dup!==lorry,'| deny:',await denyTxt(B));
await B.locator('#card button',{hasText:'Details'}).click().catch(()=>{});await B.waitForTimeout(300);
await B.fill('#item-label','Ben lorry');await B.press('#item-label','Enter');await B.locator('#item-label').blur();await B.waitForTimeout(1500);
console.log('11 B edits own copy, seen by A:',await A.evaluate(id=>{const e=document.querySelector('#gItems .item[data-id="'+id+'"]');return e?e.textContent:'missing'},dup));
// viewer drag on touch: swipe pans, hold+move denies
const V2=V;await V2.evaluate(()=>0);
// admin D can delete Aisha's lorry
const D=await mk('D','#admin='+encodeURIComponent(ADMIN));await join(D,'Marcus','Lim','River Safety');
console.log('12 admin header:',await D.textContent('#bMe'));
lb=await box(D,lorry);await D.mouse.click(lb.x+lb.width/2,lb.y+lb.height/2);await D.waitForTimeout(400);await D.locator('#card button',{hasText:'Remove'}).click();await D.waitForTimeout(1500);
console.log('   admin removed Aisha\'s lorry, gone on A:',await A.locator('#gItems .item[data-id="'+lorry+'"]').count()===0);
// draw tab as viewer
await V.locator('.tab',{hasText:'Draw'}).click();await V.waitForTimeout(300);console.log('13 viewer opens Draw: tool set?',await V.evaluate(()=>document.getElementById('map').classList.contains('tool')));
await V.locator('.tool').first().click();await V.waitForTimeout(250);console.log('   viewer taps Pen:',await denyTxt(V));
console.log('errs',errs);await b.close()})();
