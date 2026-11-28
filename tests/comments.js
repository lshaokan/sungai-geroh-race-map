const {chromium}=require('playwright');
const ADMIN=process.argv[2]||'';
const init=()=>{window.__EMU={auth:'http://127.0.0.1:9099',fs:8081};try{localStorage.setItem('geroh-tour-done-v1','1')}catch(_){}};
const denyTxt=p=>p.evaluate(()=>{const d=document.getElementById('deny');return d&&!d.classList.contains('fade')?d.innerText.replace(/\n/g,' / '):'(none)'});
const comments=p=>p.$$eval('#cmList .cm',x=>x.map(e=>e.innerText.replace(/\n/g,' | ')+(e.querySelector('.cmx')?' [x]':'')));
const badge=(p,id)=>p.evaluate(id=>{const e=document.querySelector('#gItems .item[data-id="'+id+'"] .cmb');return e?e.textContent:'none'},id);
(async()=>{const b=await chromium.launch();const errs=[];
const mk=async(n,hash,vp)=>{const ctx=await b.newContext({viewport:vp||{width:1180,height:820},deviceScaleFactor:vp?2:1});
  await ctx.route(/^https:\/\/(firestore|identitytoolkit|securetoken)\.googleapis\.com/,r=>{errs.push(n+' real FB');r.abort()});
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(n+': '+e.message));p.on('dialog',d=>{console.log('  ['+n+' dialog] '+d.message().replace(/\n+/g,' '));d.accept()});
  await p.addInitScript(init);await p.goto('http://localhost:8765/'+(hash||''));await p.waitForTimeout(3800);return p};
const join=async(p,f,l,d)=>{await p.fill('#jFirst',f);await p.fill('#jLast',l);await p.selectOption('#jDept',d);await p.locator('#jpanel .btn.primary').click();await p.waitForTimeout(1800)};
const open=async(p,id)=>{await p.evaluate(id=>{window.__sel&&0},id);const bb=await p.locator('#gItems .item[data-id="'+id+'"]').boundingBox();await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await p.waitForTimeout(400);await p.locator('#card button',{hasText:'Details'}).click().catch(()=>{});await p.waitForTimeout(600)};
const A=await mk('A','#join');await join(A,'Aisha','Rahman','River Safety');
await A.locator('#tk-truck').click();await A.mouse.click(640,430);await A.waitForTimeout(900);const lorry=await A.evaluate(()=>document.querySelector('#gItems .item.sel').getAttribute('data-id'));
await A.locator('#card button',{hasText:'Details'}).click();await A.waitForTimeout(600);
console.log('1 card has comments box:',await A.evaluate(()=>!!document.getElementById('cmBox')),'|',await A.textContent('#cmHead'),'|',await A.textContent('#cmList'));
await A.fill('#cmIn','Check the fuel before 7am');await A.press('#cmIn','Enter');await A.waitForTimeout(1200);
console.log('2 A posted:',JSON.stringify(await comments(A)),'| head:',await A.textContent('#cmHead'),'| box cleared:',await A.inputValue('#cmIn')==='');
await A.screenshot({path:'t95-card.png'});
const V=await mk('V','',{width:820,height:1180});await V.waitForTimeout(500);console.log('3 viewer sees badge:',await badge(V,lorry));
await open(V,lorry);console.log('   viewer sees:',JSON.stringify(await comments(V)),'| placeholder:',await V.getAttribute('#cmIn','placeholder'));
await V.locator('#cmIn').click();await V.waitForTimeout(250);console.log('   viewer taps box:',await denyTxt(V));
const B=await mk('B','#join');await join(B,'Ben','Tan','Logistics');await open(B,lorry);
await B.fill('#cmIn','Lorry 2 is parked at the camp gate');await B.locator('#cmBox .cmgo').click();await B.waitForTimeout(1200);
console.log('4 B comments on Aisha\'s lorry:',JSON.stringify(await comments(B)));
await V.waitForTimeout(600);console.log('   viewer badge now:',await badge(V,lorry),'| viewer list:',(await comments(V)).length);
// draft survives a redraw caused by someone else
await A.locator('#cmIn').click();await A.keyboard.type('half typed');await B.evaluate(()=>{});
await B.locator('#tk-tube').click();await B.mouse.click(800,300);await B.waitForTimeout(1500);
console.log('5 A draft after B changed the map:',JSON.stringify(await A.inputValue('#cmIn')),'| focused:',await A.evaluate(()=>document.activeElement&&document.activeElement.id));
await A.fill('#cmIn','');
// B deletes own comment
await B.keyboard.press('Escape');await open(B,lorry);await B.locator('#cmList .cm.mine .cmx').click();await B.waitForTimeout(1500);
console.log('6 B deleted own:',JSON.stringify(await comments(B)),'| badge on A:',await badge(A,lorry));
// admin deletes Aisha's
const D=await mk('D','#admin='+encodeURIComponent(ADMIN));await join(D,'Marcus','Lim','River Safety');await open(D,lorry);
console.log('7 admin sees delete on Aisha\'s:',JSON.stringify(await comments(D)));await D.locator('#cmList .cmx').first().click();await D.waitForTimeout(1500);
console.log('   after admin delete:',JSON.stringify(await comments(D)),'| badge on V:',await badge(V,lorry));
// preset landmark comment
await D.keyboard.press('Escape');await D.evaluate(()=>{const m=document.querySelector('.mark');m.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:3,pointerType:'mouse',clientX:0,clientY:0}))});
const mk1=await D.evaluate(()=>{const L=document.querySelectorAll('#gMarks .mark');return L.length});
await D.evaluate(()=>{const g=[...document.querySelectorAll('#gMarks .mark')].find(e=>e.getBoundingClientRect().width>0);const q=g.getBoundingClientRect();window.__mp=[q.x+q.width/2,q.y+q.height/2]});
const mp=await D.evaluate(()=>window.__mp);await D.mouse.click(mp[0],mp[1]);await D.waitForTimeout(500);await D.locator('#mtip button').last().click().catch(()=>{});await D.waitForTimeout(500);
const hasBox=await D.evaluate(()=>!!document.getElementById('cmBox'));
if(hasBox){await D.fill('#cmIn','Marshal here at 8:30');await D.press('#cmIn','Enter');await D.waitForTimeout(1500);console.log('8 landmark comment:',JSON.stringify(await comments(D)),'| mark badge:',await D.evaluate(()=>document.querySelectorAll('#gMarks .cmb').length))}else console.log('8 could not open a landmark card');
await D.keyboard.press('Escape');await D.locator('#bMe').click();await D.waitForTimeout(300);await D.locator('#jpanel button',{hasText:'Admin page'}).click();await D.waitForTimeout(2500);
console.log('9 activity log:\n'+(await D.$$eval('#apanel tbody tr',x=>x.slice(0,8).map(r=>'   '+r.innerText.replace(/\t/g,' | ')))).join('\n'));
console.log('errs',errs);await b.close()})();
