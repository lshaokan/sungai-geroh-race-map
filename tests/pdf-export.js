const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:1280,height:800},acceptDownloads:true});
await ctx.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/jspdf/,r=>r.fulfill({path:'emu/node_modules/jspdf/dist/jspdf.umd.min.js',contentType:'application/javascript'}));
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__EMU={auth:'http://127.0.0.1:9099',fs:8081};try{localStorage.setItem('geroh-tour-done-v1','1')}catch(_){}});await p.goto('http://localhost:8765/#join');await p.waitForTimeout(3800);
await p.fill('#jFirst','Pat');await p.fill('#jLast','Lee');await p.selectOption('#jDept','QM');await p.locator('#jpanel .btn.primary').click();await p.waitForTimeout(1800);await p.keyboard.press('Escape');
// a few icons in section 1 so we can see them upright
await p.locator('.rseg').first().click();await p.waitForTimeout(900);await p.locator('#card button[aria-label=Close]').click().catch(()=>{});
const pt=await p.evaluate(()=>{const q=document.querySelector('.sbadge').getBoundingClientRect();return{x:q.x+q.width/2,y:q.y+q.height/2}});
for(const [t,dx,dy] of [['truck',40,0],['station',-40,30],['tube',0,-40],['strainer',60,40]]){if(t==='strainer')await p.locator('.tab',{hasText:'Hazards'}).click();await p.locator('#tk-'+t).click();await p.mouse.click(pt.x+dx,pt.y+dy);await p.waitForTimeout(500);await p.keyboard.press('Escape')}
await p.locator('#bExport').click();await p.waitForTimeout(600);await p.fill('#rep-by','Pat Lee');
const dl=p.waitForEvent('download',{timeout:180000});await p.locator('#xgo').click();const d=await dl;await d.saveAs('t109.pdf');console.log('pdf saved');console.log('errs',errs);await b.close()})();
