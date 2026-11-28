const {chromium}=require('playwright');
const init=()=>{window.__EMU={auth:'http://127.0.0.1:9099',fs:8081};try{localStorage.setItem('geroh-tour-done-v1','1')}catch(_){}};
(async()=>{const b=await chromium.launch();const errs=[];
const E=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();E.on('pageerror',e=>errs.push('E '+e.message));await E.addInitScript(init);await E.goto('http://localhost:8765/#join');await E.waitForTimeout(3800);
await E.fill('#jFirst','Pat');await E.fill('#jLast','Lee');await E.selectOption('#jDept','QM');await E.locator('#jpanel .btn.primary').click();await E.waitForTimeout(1800);await E.keyboard.press('Escape');
// drop 5 icons almost on one spot, plus two waypoints next to them
for(const [t,dx] of [['station',0],['tube',3],['flag',-3],['boat',2],['truck',-2]]){await E.locator('#tk-'+t).click().catch(async()=>{});if(!(await E.isVisible('#tk-'+t))){const n=await E.locator('.tab').count();for(let i=0;i<n;i++){await E.locator('.tab').nth(i).click();if(await E.isVisible('#tk-'+t))break}await E.locator('#tk-'+t).click()}
  await E.mouse.click(1000+dx,560+dx);await E.waitForTimeout(500);await E.keyboard.press('Escape')}
await E.locator('.tab',{hasText:'Points'}).click();for(const dx of [40,46]){await E.locator('#tk-waypoint').click();await E.mouse.click(1000+dx,520);await E.waitForTimeout(500);await E.keyboard.press('Escape')}
await E.waitForTimeout(800);
console.log('1 clusters:',await E.locator('#gItems .cluster').count(),'| cluster count label:',await E.evaluate(()=>{const c=document.querySelector('#gItems .cluster text');return c&&c.textContent}));
const cb=await E.locator('#gItems .cluster').first().boundingBox();await E.mouse.click(cb.x+cb.width/2,cb.y+cb.height/2);await E.waitForTimeout(600);
console.log('2 fan:',await E.locator('#gItems .item.spun').count(),'icons +',await E.locator('#gWp .wp.spun').count(),'waypoints | hint:',await E.evaluate(()=>{const h=document.getElementById('hint');return h.classList.contains('fade')?'':h.innerText}));
const boxes=await E.$$eval('#gItems .item.spun, #gWp .wp.spun',x=>x.map(e=>{const q=e.getBoundingClientRect();return[Math.round(q.x+q.width/2),Math.round(q.y+q.height/2)]}));
let minD=1e9;for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++)minD=Math.min(minD,Math.hypot(boxes[i][0]-boxes[j][0],boxes[i][1]-boxes[j][1]));console.log('   closest two fanned icons (px):',Math.round(minD));
await E.screenshot({path:'t101-fan.png',clip:{x:820,y:380,width:380,height:360}});
const one=await E.locator('#gItems .item.spun').nth(2).boundingBox();await E.mouse.click(one.x+one.width/2,one.y+one.height/2);await E.waitForTimeout(500);
console.log('3 tap fanned icon -> card:',await E.textContent('#card h3'),'| fan still open:',await E.locator('#gItems .item.spun').count());
await E.mouse.click(600,700);await E.waitForTimeout(500);console.log('4 tap map -> fan closed:',await E.locator('.spun').count()===0,'| clusters back:',await E.locator('#gItems .cluster').count());
// two waypoints close together: tapping one fans
await E.keyboard.press('Escape');const w=await E.locator('#gWp .wp').first().boundingBox();await E.mouse.click(w.x+w.width/2,w.y+w.height*0.4);await E.waitForTimeout(500);
console.log('5 tap crowded waypoint -> fan of',await E.locator('.spun').count(),'| card open:',await E.evaluate(()=>!document.getElementById('card').hidden));
await E.keyboard.press('Escape');await E.waitForTimeout(300);console.log('   Esc closes fan:',await E.locator('.spun').count()===0);
// zoom limit
for(let i=0;i<40;i++){await E.locator('#zin').click();}await E.waitForTimeout(800);console.log('6 max zoom vs whole river:',await E.evaluate(()=>{const t=document.getElementById('world').getAttribute('transform');const m=/scale\(([\d.]+)/.exec(t);return m?m[1]:t}));
// blue river off
await E.locator('#bLayers').click();await E.waitForTimeout(300);await E.locator('label[for="ly-river"]').click();await E.waitForTimeout(300);
console.log('7 river off:',await E.evaluate(()=>getComputedStyle(document.querySelector('.rv-water')).display),'| remembered:',await E.evaluate(()=>JSON.parse(localStorage.getItem('geroh-layers-v3')).river));
await E.locator('#bLayers').click();await E.locator('#lv1').click();await E.waitForTimeout(800);await E.screenshot({path:'t101-noriver.png'});
console.log('errs',errs);await b.close()})();
