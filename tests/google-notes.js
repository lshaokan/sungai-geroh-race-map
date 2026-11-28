const {chromium}=require('playwright');
const ADMIN=process.argv[2]||'';
const init=()=>{window.__EMU={auth:'http://127.0.0.1:9099',fs:8081};try{localStorage.setItem('geroh-tour-done-v1','1')}catch(_){}};
const denyTxt=p=>p.evaluate(()=>{const d=document.getElementById('deny');return d&&!d.classList.contains('fade')?d.innerText.replace(/\n/g,' / '):'(none)'});
const noteArea=p=>p.evaluate(()=>{const c=document.getElementById('card');const out=[];c.querySelectorAll('.lbl-s,.quote,.gnmeta').forEach(e=>{if(!e.closest('#cmBox'))out.push(e.textContent)});return out.join(' | ')});
(async()=>{const b=await chromium.launch();const errs=[];
const mk=async(n,hash)=>{const ctx=await b.newContext({viewport:{width:1180,height:820}});await ctx.route(/^https:\/\/(firestore|identitytoolkit|securetoken)\.googleapis\.com/,r=>{errs.push(n+' real FB');r.abort()});
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(n+': '+e.message));await p.addInitScript(init);await p.goto('http://localhost:8765/'+(hash||''));await p.waitForTimeout(3800);return p};
const join=async(p,f,l,d)=>{await p.fill('#jFirst',f);await p.fill('#jLast',l);await p.selectOption('#jDept',d);await p.locator('#jpanel .btn.primary').click();await p.waitForTimeout(1800)};
const openR3=async p=>{await p.locator('.rseg').first().click();await p.waitForTimeout(900);
  const pt=await p.evaluate(()=>{const g=document.querySelector('#gMarks .mark[data-mark="rapids:5"]');if(!g)return null;const c=g.querySelectorAll('circle')[1]||g.querySelector('circle');const q=c.getBoundingClientRect();return{x:q.x+q.width/2,y:q.y+q.height/2}});
  await p.mouse.click(pt.x,pt.y);await p.waitForTimeout(500);if(!(await p.evaluate(()=>!document.getElementById('card').hidden))){const bs=await p.$$('#mtip button');await bs[bs.length-1].click();await p.waitForTimeout(500)}
  return p.textContent('#card h3')};
const D=await mk('D','#admin='+encodeURIComponent(ADMIN));await join(D,'Marcus','Lim','River Safety');await D.keyboard.press('Escape');
console.log('1 admin opens:',await openR3(D),'|',await noteArea(D));
await D.locator('#card button',{hasText:'Edit note'}).click();await D.waitForTimeout(300);
await D.fill('#gn-edit','2 lifeguards with poles on river left, 1 with throw rope below the drop. Briefed 20 Nov.');
await D.screenshot({path:'t97-edit.png'});
await D.locator('#card button',{hasText:'Save'}).click();await D.waitForTimeout(1500);console.log('2 after save:',await noteArea(D));
await D.screenshot({path:'t97-saved.png'});
const V=await mk('V');console.log('3 viewer sees:',await openR3(V),'|',await noteArea(V));
await V.locator('#card button',{hasText:'Edit note'}).click();await V.waitForTimeout(250);console.log('   viewer taps Edit note:',await denyTxt(V));
const E=await mk('E','#join');await join(E,'Ben','Tan','Logistics');await E.keyboard.press('Escape');await openR3(E);
await E.locator('#card button',{hasText:'Edit note'}).click();await E.waitForTimeout(250);console.log('4 editor taps Edit note:',await denyTxt(E),'| editing?',await E.evaluate(()=>!!document.getElementById('gn-edit')));
// editor attaching an icon to R3 must not wipe the note
await E.locator('#card button',{hasText:'Edit note'}).isVisible();await E.locator('.tab').nth(1).click();await E.waitForTimeout(200);
await E.locator('#tk-marshal').click();await E.waitForTimeout(1200);console.log('5 editor attached lifeguard; admin still sees note:',(await noteArea(D)).includes('Briefed 20 Nov'),'| chips:',await D.$$eval('#card .chip',x=>x.map(e=>e.textContent)));
// reload keeps it
await V.reload();await V.waitForTimeout(3800);await openR3(V);console.log('6 viewer after reload:',(await noteArea(V)).slice(0,90));
// put the Google note back
await D.locator('#card button',{hasText:'Edit note'}).click();await D.waitForTimeout(300);await D.locator('#card button',{hasText:'Use the Google note'}).click();await D.waitForTimeout(1500);
console.log('7 back to Google:',await noteArea(D));
await D.keyboard.press('Escape');await D.locator('#bMe').click();await D.waitForTimeout(300);await D.locator('#jpanel button',{hasText:'Admin page'}).click();await D.waitForTimeout(2500);
console.log('8 log:\n'+(await D.$$eval('#apanel tbody tr',x=>x.slice(0,4).map(r=>'   '+r.innerText.replace(/\t/g,' | ')))).join('\n'));
console.log('errs',errs);await b.close()})();
