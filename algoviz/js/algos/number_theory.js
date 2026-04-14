// ═══════════════════════════════════════════
// BINARY EXPONENTIATION
// ═══════════════════════════════════════════
function initBinExp(){
  const a=+(document.getElementById('be-a')||{value:2}).value||2;
  const b=+(document.getElementById('be-b')||{value:10}).value||10;
  const mod=+(document.getElementById('be-mod')||{value:1000}).value||1000;
  state.extra.beA=a;state.extra.beB=b;state.extra.beMod=mod;
  genBinExpSteps();renderBinExp([],null);
}
function genBinExpSteps(){
  let a=state.extra.beA,b=state.extra.beB;const mod=state.extra.beMod;
  let result=1;a=a%mod;
  const allRows=[];let step=0;
  while(b>0){
    const odd=(b&1)===1,r=odd?result*a%mod:result;
    allRows.push({step,b_bin:b.toString(2),odd:odd?'yes':'no',result:r,base:a,action:odd?`result=${result}×${a}%${mod}`:'skip'});
    if(odd)result=r;b>>=1;a=a*a%mod;step++;
  }
  allRows.push({step,b_bin:'0',odd:'no',result,base:a,action:'done'});
  const steps=allRows.map((_,i)=>({rows:allRows.slice(0,i+1),current:i,code:[3,4,5,6,7]}));
  state.steps=steps;state.stepIdx=0;
  state.renderFn=fr=>renderBinExp(fr.rows,fr.current);
}
function renderBinExp(rows,current){
  const{beA:a,beB:b,beMod:mod}=state.extra;
  const ca=document.getElementById('av-canvas');ca.innerHTML='';
  const wrap=document.createElement('div');wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:12px;width:100%;padding-top:14px;';
  const title=document.createElement('div');title.style.cssText='font-size:14px;font-family:Fira Code;color:#ce93d8;';
  title.innerHTML=`Computing: <span style='color:#ffc107'>${a}^${b}</span> mod <span style='color:#00e5ff'>${mod}</span>`;
  wrap.appendChild(title);
  const tbl=document.createElement('table');tbl.className='dp-table';tbl.style.fontSize='11px';
  const h=document.createElement('tr');['Step','b (binary)','b odd?','result','a','action'].forEach(hd=>{const th=document.createElement('th');th.textContent=hd;h.appendChild(th);});
  tbl.appendChild(h);
  rows.forEach((r,i)=>{
    const tr=document.createElement('tr');const isCur=i===current;
    [r.step,r.b_bin,r.odd,r.result,r.base,r.action].forEach((val,j)=>{
      const td=document.createElement('td');td.textContent=val;
      if(isCur)td.classList.add('active');else if(i<(current||Infinity))td.classList.add('done');
      if(j===2&&val==='yes')td.style.color='#00e676';
      tr.appendChild(td);
    });
    tbl.appendChild(tr);
  });
  wrap.appendChild(tbl);
  if(rows.length&&rows[rows.length-1].action==='done'){const res=document.createElement('div');res.style.cssText='font-size:14px;font-family:Fira Code;color:#00e676;';res.textContent=`Result: ${a}^${b} mod ${mod} = ${rows[rows.length-1].result}`;wrap.appendChild(res);}
  ca.appendChild(wrap);
}

// ═══════════════════════════════════════════
// XOR
// ═══════════════════════════════════════════
function initXOR(){
  const pairs=[[2,3,5],[1,4,1,2,4],[7,3,7,5,3,9,5]];
  state.extra.xorArr=pairs[Math.floor(Math.random()*pairs.length)];
  genXORSteps();renderXOR([],0,null);
}
function genXORSteps(){
  const arr=state.extra.xorArr;
  const steps=arr.map((_,i)=>({done:Array.from({length:i+1},(_,j)=>j),running:i,result:null,code:[2,3,4,5]}));
  let r=0;arr.forEach(v=>r^=v);
  steps.push({done:Array.from({length:arr.length},(_,i)=>i),running:null,result:r,code:[]});
  state.steps=steps;state.stepIdx=0;
  state.renderFn=fr=>renderXOR(fr.done,fr.running,fr.result);
}
function renderXOR(done,running,result){
  const arr=state.extra.xorArr;
  const cv=getCanvas(700,270);const ctx=cv.getContext('2d');
  ctx.fillStyle='#060b14';ctx.fillRect(0,0,cv.width,cv.height);
  const bw=52,gap=8,sx=Math.max(20,(700-arr.length*(bw+gap))/2),baseY=155;
  arr.forEach((v,i)=>{
    const x=sx+i*(bw+gap);let col='#1e3058',tcol='#cdd8f0';
    if(done&&done.includes(i)){col='rgba(0,229,255,0.15)';tcol='#00e5ff';}
    if(running===i){col='rgba(255,193,7,0.22)';tcol='#ffc107';}
    if(result!==null&&done&&done.length===arr.length&&arr.indexOf(result)===i){col='rgba(0,230,118,0.25)';tcol='#00e676';}
    ctx.fillStyle=col;ctx.strokeStyle=running===i?'#ffc107':'#1e3058';ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(x,baseY-58,bw,68,4);ctx.fill();ctx.stroke();
    ctx.fillStyle=tcol;ctx.font='bold 22px Fira Code';ctx.textAlign='center';ctx.fillText(v,x+bw/2,baseY-14);
    ctx.fillStyle='#5a7099';ctx.font='9px Fira Code';ctx.fillText('['+i+']',x+bw/2,baseY+14);
  });
  if(done&&done.length>0){let xr=0;done.forEach(i=>xr^=arr[i]);ctx.fillStyle='#ffc107';ctx.font='12px Fira Code';ctx.textAlign='left';ctx.fillText(`Running XOR: ${done.map(i=>arr[i]).join(' ⊕ ')} = ${xr}`,20,200);}
  if(result!=null){ctx.fillStyle='#00e676';ctx.font='bold 14px Fira Code';ctx.fillText(`✓ Unique element = ${result}`,20,228);}
  ctx.fillStyle='#5a7099';ctx.font='10px Fira Code';ctx.fillText('a⊕a=0  |  a⊕0=a  |  XOR is commutative & associative',20,252);
}
