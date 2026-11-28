const {chromium}=require('playwright');
const ADMIN=process.argv[2]||'';
const init=()=>{window.__EMU={auth:'http://127.0.0.1:9099',fs:8081};try{localStorage.setItem('geroh-tour-done-v1','1')}catch(_){}};
const denyTxt=p=>p.evaluate(()=>{const d=document.getElementById('deny');return d&&!d.classList.contains('fade')?d.innerText.split('\n')[0]:'(none)'});
const hideDeny=p=>p.evaluate(()=>{const d=document.getElementById('deny');if(d)d.classList.add('fade')});
(async()=>{const b=await chromium.launch();const errs=[];
const mk=async(n,hash)=>{const ctx=await b.newContext({viewport:{width:1280,height:800}});await ctx.route(/^https:\/\/(firestore|identitytoolkit|securetoken)\.googleapis\.com/,r=>r.abort());
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(n+': '+e.message));p.on('dialog',d=>d.accept());await p.addInitScript(init);await p.goto('http://localhost:8765/'+(hash||''));await p.waitForTimeout(3800);return p};
const join=async(p,f,l,d)=>{await p.fill('#jFirst',f);await p.fill('#jLast',l);await p.selectOption('#jDept',d);await p.locator('#jpanel .btn.primary').click();await p.waitForTimeout(1800);await p.keyboard.press('Escape')};
const place=async(p,t,x,y)=>{if(!(await p.isVisible('#tk-'+t))){const n=await p.locator('.tab').count();for(let i=0;i<n;i++){await p.locator('.tab').nth(i).click();if(await p.isVisible('#tk-'+t))break}}
  await p.locator('#tk-'+t).click();await p.mouse.click(x,y);await p.waitForTimeout(900);const id=await p.evaluate(()=>document.querySelector('#gItems .item.sel').getAttribute('data-id'));await p.keyboard.press('Escape');return id};
const pos=(p,id)=>p.evaluate(id=>{const e=document.querySelector('#gItems .item[data-id="'+id+'"]');if(!e)return null;const q=e.getBoundingClientRect();return Math.round(q.x)},id);
const drag=async(p,id,dx)=>{const bb=await p.locator('#gItems .item[data-id="'+id+'"]').boundingBox();await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await p.mouse.move(bb.x+bb.width/2+dx,bb.y+bb.height/2+20,{steps:8});await p.mouse.up();await p.waitForTimeout(1500)};
const A1=await mk('A1','#join');await join(A1,'Aisha','Rahman','Activities');const it=await place(A1,'flag',600,420);
const A2=await mk('A2','#join');await join(A2,'aisha','RAHMAN ','Activities');await A2.waitForTimeout(800);
let x0=await pos(A2,it);await drag(A2,it,110);console.log('1 Aisha on 2nd device (typed "aisha RAHMAN") drags her flag: moved',(await pos(A2,it))!==x0,'| deny:',await denyTxt(A2));await hideDeny(A2);
const X=await mk('X','#join');await join(X,'Aisha','Rahman','QM');await X.waitForTimeout(800);
x0=await pos(X,it);await drag(X,it,110);console.log('2 "Aisha Rahman" in QM drags it:',await denyTxt(X),'| moved',(await pos(X,it))!==x0);await hideDeny(X);
// lead follows the person
const B1=await mk('B1','#join');await join(B1,'Ben','Tan','Activities');
const D=await mk('D','#admin='+encodeURIComponent(ADMIN));await join(D,'Marcus','Lim','River Safety');
await D.locator('#bMe').click();await D.waitForTimeout(300);await D.locator('#jpanel button',{hasText:'Admin page'}).click();await D.waitForTimeout(2500);await D.locator('.atabs button',{hasText:'People'}).click();await D.waitForTimeout(300);
console.log('3 People (Aisha on 2 devices = 1 row):',await D.$$eval('#apanel table:first-of-type tbody tr',x=>x.map(r=>r.innerText.replace(/\t/g,' | '))));
await D.locator('#apanel tr',{hasText:'Ben Tan'}).locator('button',{hasText:'Make lead'}).click();await D.waitForTimeout(1500);await D.locator('#apanel button[aria-label=Close]').click();
const B2=await mk('B2','#join');await join(B2,'Ben','Tan','Activities');await B2.waitForTimeout(1500);
console.log('4 Ben\'s 2nd device header:',await B2.textContent('#bMe'));
x0=await pos(B2,it);await drag(B2,it,-110);console.log('5 Ben (Activities lead) on 2nd device drags Aisha\'s flag: moved',(await pos(B2,it))!==x0,'| deny:',await denyTxt(B2));
console.log('errs',errs);await b.close()})();
