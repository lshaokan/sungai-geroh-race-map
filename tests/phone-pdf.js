const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];const ctx=await b.newContext({...devices['iPhone 13']});
await ctx.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/jspdf/,r=>r.fulfill({path:'emu/node_modules/jspdf/dist/jspdf.umd.min.js',contentType:'application/javascript'}));
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__EMU={auth:'http://127.0.0.1:9099',fs:8081};try{localStorage.setItem('geroh-tour-done-v1','1')}catch(_){}});await p.goto('http://localhost:8765/');await p.waitForTimeout(4500);
await p.addStyleTag({content:'.firebase-emulator-warning{display:none!important}'});
await p.locator('#bMenu').tap();await p.waitForTimeout(300);await p.locator('#mpanel .mrow',{hasText:'Export'}).tap();await p.waitForTimeout(800);
await p.screenshot({path:'p3-a.png'});console.log('xmodal open:',await p.evaluate(()=>!document.getElementById('xmodal').hidden),'mmodal open:',await p.evaluate(()=>!document.getElementById('mmodal').hidden));await p.fill('#rep-by','Pat Lee');await p.locator('#xgo').tap();await p.waitForTimeout(3000);console.log('xmsg:',await p.evaluate(()=>[...document.querySelectorAll('.xmsg')].map(e=>e.textContent).join(' / ')));
for(let i=0;i<60;i++){await p.waitForTimeout(1000);if(await p.evaluate(()=>{const h=document.querySelector('#mpanel h2');return !document.getElementById('mmodal').hidden&&h&&/ready/.test(h.textContent)}))break}
console.log('sheet:',await p.evaluate(()=>[...document.querySelectorAll('#mpanel h2,#mpanel .jnote,#mpanel .mrow b')].map(e=>e.textContent)));
await p.screenshot({path:'p3-pdf.png'});
const popup=p.waitForEvent('popup',{timeout:5000}).catch(()=>null);await p.locator('#mpanel .mrow',{hasText:'Open the PDF'}).tap();const pp=await popup;console.log('open -> new tab:',pp?pp.url().slice(0,20):'none');
console.log('errs',errs);await b.close()})();
