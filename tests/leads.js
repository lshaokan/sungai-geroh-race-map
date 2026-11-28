const {chromium}=require('playwright');
const ADMIN=process.argv[2]||'';
const init=()=>{window.__EMU={auth:'http://127.0.0.1:9099',fs:8081};try{localStorage.setItem('geroh-tour-done-v1','1')}catch(_){}};
const denyTxt=p=>p.evaluate(()=>{const d=document.getElementById('deny');return d&&!d.classList.contains('fade')?d.innerText.replace(/\n/g,' / '):'(none)'});
const hideDeny=p=>p.evaluate(()=>{const d=document.getElementById('deny');if(d)d.classList.add('fade')});
const BASE='http://127.0.0.1:8081/v1/projects/wwsc-river-map-7ab35/databases/(default)/documents';
(async()=>{const b=await chromium.launch();const errs=[];
const mk=async(n,hash)=>{const ctx=await b.newContext({viewport:{width:1280,height:800}});await ctx.route(/^https:\/\/(firestore|identitytoolkit|securetoken)\.googleapis\.com/,r=>r.abort());
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(n+': '+e.message));p.on('dialog',d=>d.accept());await p.addInitScript(init);await p.goto('http://localhost:8765/'+(hash||''));await p.waitForTimeout(3800);return p};
const join=async(p,f,l,d)=>{await p.fill('#jFirst',f);await p.fill('#jLast',l);await p.selectOption('#jDept',d);await p.locator('#jpanel .btn.primary').click();await p.waitForTimeout(1800);await p.keyboard.press('Escape')};
const place=async(p,t,x,y)=>{if(!(await p.isVisible('#tk-'+t))){const n=await p.locator('.tab').count();for(let i=0;i<n;i++){await p.locator('.tab').nth(i).click();if(await p.isVisible('#tk-'+t))break}}
  await p.locator('#tk-'+t).click();await p.mouse.click(x,y);await p.waitForTimeout(900);const id=await p.evaluate(()=>document.querySelector('#gItems .item.sel').getAttribute('data-id'));await p.keyboard.press('Escape');return id};
const pos=(p,id)=>p.evaluate(id=>{const e=document.querySelector('#gItems .item[data-id="'+id+'"]');if(!e)return null;const q=e.getBoundingClientRect();return[Math.round(q.x),Math.round(q.y)]},id);
const drag=async(p,id,dx)=>{const bb=await p.locator('#gItems .item[data-id="'+id+'"]').boundingBox();await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await p.mouse.move(bb.x+bb.width/2+dx,bb.y+bb.height/2+20,{steps:8});await p.mouse.up();await p.waitForTimeout(1500)};
const A=await mk('A','#join');await join(A,'Aisha','Rahman','Activities');const aItem=await place(A,'flag',560,420);
const C=await mk('C','#join');await join(C,'Cara','Ng','Logistics');const cItem=await place(C,'truck',820,420);
const B=await mk('B','#join');await join(B,'Ben','Tan','Logistics');
// before being a lead, Ben can't move Cara's lorry
await B.waitForTimeout(800);let p0=await pos(B,cItem);await drag(B,cItem,120);console.log('1 Ben (not lead) drags Cara\'s lorry:',await denyTxt(B),'| moved:',JSON.stringify(await pos(B,cItem))!==JSON.stringify(p0));await hideDeny(B);
// admin makes Ben the Logistics lead
const D=await mk('D','#admin='+encodeURIComponent(ADMIN));await join(D,'Marcus','Lim','River Safety');
await D.locator('#bMe').click();await D.waitForTimeout(300);await D.locator('#jpanel button',{hasText:'Admin page'}).click();await D.waitForTimeout(2500);await D.locator('.atabs button',{hasText:'People'}).click();await D.waitForTimeout(300);
console.log('2 People rows:',await D.$$eval('#apanel table:first-of-type tbody tr',x=>x.map(r=>r.innerText.replace(/\t/g,' | '))));
await D.locator('#apanel tr',{hasText:'Ben Tan'}).locator('button',{hasText:'Make lead'}).click();await D.waitForTimeout(1500);
console.log('   after Make lead:',await D.$$eval('#apanel table:first-of-type tbody tr',x=>x.filter(r=>/Ben/.test(r.innerText)).map(r=>r.innerText.replace(/\t/g,' | '))));
await D.locator('#apanel button[aria-label=Close]').click();
await B.waitForTimeout(1500);console.log('3 Ben header:',await B.textContent('#bMe'));
p0=await pos(B,cItem);await drag(B,cItem,120);console.log('4 lead Ben drags Cara\'s lorry: moved',JSON.stringify(await pos(B,cItem))!==JSON.stringify(p0),'| deny:',await denyTxt(B),'| seen by Cara:',JSON.stringify(await pos(C,cItem)));
p0=await pos(B,aItem);await drag(B,aItem,120);console.log('5 lead Ben drags Aisha\'s (Activities) flag:',await denyTxt(B),'| moved:',JSON.stringify(await pos(B,aItem))!==JSON.stringify(p0));await hideDeny(B);
// lead removes Cara's lorry
const bb=await B.locator('#gItems .item[data-id="'+cItem+'"]').boundingBox();await B.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await B.waitForTimeout(400);await B.locator('#card button',{hasText:'Remove'}).click();await B.waitForTimeout(1500);
console.log('6 lead removes Cara\'s lorry, gone for Cara:',await C.locator('#gItems .item[data-id="'+cItem+'"]').count()===0);
// backfill: an older item with an owner but no department
const tok=await A.evaluate(()=>firebase.auth().currentUser.getIdToken());const auid=await A.evaluate(()=>firebase.auth().currentUser.uid);
await fetch(BASE+'/items/oldone',{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+tok},body:JSON.stringify({fields:{type:{stringValue:'tube'},x:{doubleValue:700},y:{doubleValue:500},side:{stringValue:''},label:{stringValue:''},color:{stringValue:''},cr:{mapValue:{fields:{by:{stringValue:'Aisha'},at:{doubleValue:1},uid:{stringValue:auid}}}}}})});
await D.reload();await D.waitForTimeout(9000);
const r=await fetch(BASE+'/items/oldone',{headers:{Authorization:'Bearer owner'}}).then(r=>r.json());console.log('7 backfilled department on old item:',r.fields.cr.mapValue.fields.dept?r.fields.cr.mapValue.fields.dept.stringValue:'(none)');
console.log('errs',errs);await b.close()})();
