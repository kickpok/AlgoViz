// ═══════════════════════════════════════════
// BINARY EXPONENTIATION  (Naive O(b)  +  Fast O(log b))
// ═══════════════════════════════════════════
function initBinExp(){
  const a=+(document.getElementById('be-a')||{value:2}).value||2;
  const b=+(document.getElementById('be-b')||{value:10}).value||10;
  const mod=+(document.getElementById('be-mod')||{value:1000}).value||1000;
  state.extra.beA=a;state.extra.beB=b;state.extra.beMod=mod;
  const ap=state.extra.approach||'optimal';
  if(ap==='brute')genBinExpBruteSteps();else genBinExpSteps();
  if(state.steps.length)renderBinExp_dispatch(state.steps[0]);
}

// ── Brute: multiply a × result, b times ──────────────────────────────────────
function genBinExpBruteSteps(){
  const a=state.extra.beA,b=state.extra.beB,mod=state.extra.beMod;
  const steps=[];let result=1;
  steps.push({mode:'brute',rows:[],current:-1,done:false,code:[1,2]});
  const amod=a%mod;
  for(let i=0;i<b;i++){
    const prev=result;result=result*amod%mod;
    const row={step:i+1,prev,operation:`${prev} × ${amod} % ${mod}`,result,remaining:b-i-1};
    const allRows=steps.length>0&&steps[steps.length-1].rows?[...steps[steps.length-1].rows,row]:[row];
    steps.push({mode:'brute',rows:allRows,current:i,done:false,finalResult:result,code:[3,4]});
  }
  steps.push({mode:'brute',rows:steps[steps.length-1].rows,current:-1,done:true,finalResult:result,code:[]});
  state.steps=steps;state.stepIdx=0;
  state.renderFn=fr=>renderBinExp_dispatch(fr);
}

// ── Optimal: fast exponentiation (existing) ───────────────────────────────────
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
  const steps=allRows.map((_,i)=>({mode:'optimal',rows:allRows.slice(0,i+1),current:i,code:[3,4,5,6,7]}));
  state.steps=steps;state.stepIdx=0;
  state.renderFn=fr=>renderBinExp_dispatch(fr);
}

function renderBinExp_dispatch(fr){
  if(!fr)return;
  if(fr.mode==='brute')renderBinExpBrute(fr);else renderBinExp(fr.rows,fr.current);
}

function renderBinExpBrute(fr){
  const{beA:a,beB:b,beMod:mod}=state.extra;
  const{rows,done,finalResult,current}=fr;
  const ca=document.getElementById('av-canvas');ca.innerHTML='';
  const wrap=document.createElement('div');wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:14px;width:100%;padding-top:14px;font-family:Fira Code;';
  // Title + comparison
  const logSteps=Math.ceil(Math.log2(b+1));
  const title=document.createElement('div');title.style.cssText='font-size:13px;color:#ce93d8;text-align:center;';
  title.innerHTML=`Computing: <span style='color:#ffc107'>${a}^${b}</span> mod <span style='color:#00e5ff'>${mod}</span>`;
  wrap.appendChild(title);
  const compare=document.createElement('div');compare.style.cssText='display:flex;gap:28px;justify-content:center;flex-wrap:wrap;';
  compare.innerHTML=`<span style="font-size:11px;color:#5a7099">Naive steps: <b style="color:#ff4081">${b}</b></span><span style="font-size:11px;color:#5a7099">Fast expo steps: <b style="color:#00e676">~${logSteps}</b></span><span style="font-size:11px;color:#5a7099">Steps done: <b style="color:#ffc107">${rows?rows.length:0}</b></span>`;
  wrap.appendChild(compare);
  // Progress bar
  const prog=document.createElement('div');prog.style.cssText='width:100%;max-width:500px;';
  const pct=rows&&b>0?Math.round(rows.length/b*100):0;
  prog.innerHTML=`<div style="height:6px;background:#1e3058;border-radius:3px;overflow:hidden;"><div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#ff4081,#ffc107);border-radius:3px;transition:width .1s;"></div></div><div style="font-size:9px;color:#5a7099;margin-top:3px;text-align:right">${pct}% of ${b} multiplications</div>`;
  wrap.appendChild(prog);
  // Multiplication log table
  const tbl=document.createElement('table');tbl.className='dp-table';tbl.style.fontSize='11px';
  const h=document.createElement('tr');
  ['Step','Previous result','Operation','New result','Remaining'].forEach(hd=>{const th=document.createElement('th');th.textContent=hd;h.appendChild(th);});
  tbl.appendChild(h);
  const show=(rows||[]).slice(-8);// show last 8 rows max
  show.forEach((r,i)=>{
    const tr=document.createElement('tr');const isCur=i===show.length-1&&!done;
    [r.step,r.prev,r.operation,r.result,r.remaining].forEach((val,j)=>{
      const td=document.createElement('td');td.textContent=val;
      if(isCur)td.classList.add('active');else td.classList.add('done');
      if(j===4&&val===0)td.style.color='#00e676';
      tr.appendChild(td);
    });
    tbl.appendChild(tr);
  });
  wrap.appendChild(tbl);
  if(done&&finalResult!=null){
    const res=document.createElement('div');res.style.cssText='font-size:16px;font-family:Fira Code;color:#00e676;text-align:center;';
    res.innerHTML=`Result: ${a}^${b} mod ${mod} = <b>${finalResult}</b> &nbsp;(after <span style="color:#ff4081">${b} multiplications</span>)`;
    const note=document.createElement('div');note.style.cssText='font-size:10px;color:#5a7099;text-align:center;margin-top:4px;';
    note.textContent=`Fast exponentiation would compute the same result in only ~${logSteps} multiplications`;
    wrap.appendChild(res);wrap.appendChild(note);
  }
  ca.appendChild(wrap);
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
  (rows||[]).forEach((r,i)=>{
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
  if(rows&&rows.length&&rows[rows.length-1].action==='done'){const res=document.createElement('div');res.style.cssText='font-size:14px;font-family:Fira Code;color:#00e676;';res.textContent=`Result: ${a}^${b} mod ${mod} = ${rows[rows.length-1].result}`;wrap.appendChild(res);}
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

// ═══════════════════════════════════════════
// BINARY ↔ DECIMAL
// ═══════════════════════════════════════════
function setBinDecMode(mode){
  state.extra.bdMode=mode;state.extra.bdVal=mode==='b2d'?'1011':'11';
  state.steps=[];state.stepIdx=0;
  const b1=document.getElementById('bd-b2d');const b2=document.getElementById('bd-d2b');
  if(b1)b1.className='btn btn-mode'+(mode==='b2d'?' active':'');
  if(b2)b2.className='btn btn-mode'+(mode==='d2b'?' active':'');
  initBinDec();
}
function initBinDec(){
  if(!state.extra.bdMode)state.extra.bdMode='b2d';
  if(!state.extra.bdVal)state.extra.bdVal=state.extra.bdMode==='b2d'?'1011':'11';
  genBinDecSteps();
  if(state.steps.length)renderBinDec(state.steps[0]);
  setStatus('Ready — click ▶ Start');
}
function genBinDecSteps(){
  if(state.extra.bdMode==='b2d')genBinDecSteps_b2d();else genBinDecSteps_d2b();
}
function genBinDecSteps_b2d(){
  const bits=state.extra.bdVal.replace(/[^01]/g,'')||'0';
  const n=bits.length;const steps=[];let result=0;
  steps.push({mode:'b2d',bits,n,curIdx:-1,contribution:0,result:0,done:false,code:[0,1]});
  for(let i=0;i<n;i++){const pos=n-1-i,bit=parseInt(bits[i]),contrib=bit*(2**pos);result+=contrib;steps.push({mode:'b2d',bits,n,curIdx:i,contribution:contrib,result,done:false,code:[2,3,4,5]});}
  steps.push({mode:'b2d',bits,n,curIdx:-1,contribution:0,result,done:true,code:[6]});
  state.steps=steps;state.stepIdx=0;state.renderFn=fr=>renderBinDec(fr);
}
function genBinDecSteps_d2b(){
  let num=parseInt(state.extra.bdVal)||0;const steps=[];const rows=[];
  steps.push({mode:'d2b',rows:[],done:false,result:'',code:[8,9]});
  if(num===0){steps.push({mode:'d2b',rows:[{num:0,quotient:0,remainder:0}],done:true,result:'0',code:[13]});state.steps=steps;state.stepIdx=0;state.renderFn=fr=>renderBinDec(fr);return;}
  while(num>0){const q=Math.floor(num/2),r=num%2;rows.push({num,quotient:q,remainder:r});steps.push({mode:'d2b',rows:[...rows],done:false,result:'',code:[10,11,12]});num=q;}
  const result=rows.map(r=>r.remainder).reverse().join('');
  steps.push({mode:'d2b',rows:[...rows],done:true,result,code:[13]});
  state.steps=steps;state.stepIdx=0;state.renderFn=fr=>renderBinDec(fr);
}
function renderBinDec(fr){
  const ca=document.getElementById('av-canvas');ca.innerHTML='';
  const wrap=document.createElement('div');wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:16px;width:100%;padding-top:16px;font-family:Fira Code;';
  if(fr.mode==='b2d'){
    const title=document.createElement('div');title.style.cssText='font-size:13px;color:#5a7099;';title.innerHTML=`Converting binary <span style="color:#ffc107">${fr.bits}</span> → decimal`;wrap.appendChild(title);
    const posRow=document.createElement('div');posRow.style.cssText='display:flex;gap:6px;';
    for(let i=0;i<fr.n;i++){const pos=fr.n-1-i;const lbl=document.createElement('div');lbl.style.cssText='width:56px;height:20px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#5a7099;';lbl.innerHTML=`2<sup>${pos}</sup>=${2**pos}`;posRow.appendChild(lbl);}
    wrap.appendChild(posRow);
    const boxRow=document.createElement('div');boxRow.style.cssText='display:flex;gap:6px;';
    for(let i=0;i<fr.n;i++){const bit=parseInt(fr.bits[i]);const isCur=fr.curIdx===i;const isDone=fr.curIdx>i||fr.done;let bg='#0d1526',border='#1e3058',col='#5a7099';if(isCur){bg='rgba(255,193,7,.2)';border='#ffc107';col='#ffc107';}else if(isDone&&bit===1){bg='rgba(0,230,118,.15)';border='#00e676';col='#00e676';}else if(isDone&&bit===0){bg='rgba(30,48,88,.3)';border='#1e3058';col='#2a4070';}const box=document.createElement('div');box.style.cssText=`width:56px;height:56px;background:${bg};border:2px solid ${border};border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;color:${col};transition:all .2s;`;box.textContent=fr.bits[i];boxRow.appendChild(box);}
    wrap.appendChild(boxRow);
    if(fr.curIdx>=0&&!fr.done){const pos=fr.n-1-fr.curIdx;const bit=parseInt(fr.bits[fr.curIdx]);const info=document.createElement('div');info.style.cssText='font-size:12px;text-align:center;line-height:1.8;';info.innerHTML=bit===1?`bit[${fr.curIdx}] = <span style="color:#ffc107">1</span> × 2<sup>${pos}</sup> = <span style="color:#00e5ff">${fr.contribution}</span> → add to result`:`bit[${fr.curIdx}] = <span style="color:#5a7099">0</span> × 2<sup>${pos}</sup> = 0 → skip`;wrap.appendChild(info);}
    const resBox=document.createElement('div');resBox.style.cssText='display:flex;flex-direction:column;align-items:center;gap:4px;';const resLbl=document.createElement('div');resLbl.style.cssText='font-size:9px;letter-spacing:2px;color:#5a7099;text-transform:uppercase;';resLbl.textContent='Result';const resVal=document.createElement('div');resVal.style.cssText=`font-size:${fr.done?44:32}px;font-weight:700;color:${fr.done?'#00e676':'#00e5ff'};transition:all .2s;`;resVal.textContent=fr.result;resBox.appendChild(resLbl);resBox.appendChild(resVal);if(fr.done){const fin=document.createElement('div');fin.style.cssText='font-size:13px;color:#00e676;margin-top:4px;';fin.innerHTML=`✓ <span style="color:#ffc107">${fr.bits}</span><sub>2</sub> = <span style="color:#00e676">${fr.result}</span><sub>10</sub>`;resBox.appendChild(fin);}wrap.appendChild(resBox);
  } else {
    const originalNum=fr.rows.length?fr.rows[0].num:parseInt(state.extra.bdVal)||0;
    const title=document.createElement('div');title.style.cssText='font-size:13px;color:#5a7099;';title.innerHTML=`Converting decimal <span style="color:#ffc107">${originalNum}</span> → binary`;wrap.appendChild(title);
    if(!fr.rows.length){const hint=document.createElement('div');hint.style.cssText='font-size:11px;color:#5a7099;';hint.textContent='Divide by 2 repeatedly — remainders form the binary number...';wrap.appendChild(hint);}
    const tbl=document.createElement('table');tbl.className='dp-table';tbl.style.cssText='font-size:11px;min-width:340px;';const hrow=document.createElement('tr');['Number','÷ 2','Quotient','Remainder','Bit'].forEach(h=>{const th=document.createElement('th');th.textContent=h;th.style.padding='4px 12px';hrow.appendChild(th);});tbl.appendChild(hrow);
    fr.rows.forEach((r,i)=>{const isCur=i===fr.rows.length-1&&!fr.done;const tr=document.createElement('tr');[r.num,'÷ 2',r.quotient,r.remainder,r.remainder].forEach((val,j)=>{const td=document.createElement('td');td.style.cssText='padding:4px 12px;text-align:center;';td.textContent=val;if(isCur)td.classList.add('active');else td.classList.add('done');if(j===3||j===4){td.style.color=r.remainder===1?'#00e676':'#5a7099';td.style.fontWeight='700';}tr.appendChild(td);});tbl.appendChild(tr);});
    wrap.appendChild(tbl);
    if(fr.done&&fr.result){const resBox=document.createElement('div');resBox.style.cssText='display:flex;flex-direction:column;align-items:center;gap:6px;margin-top:8px;';const hint=document.createElement('div');hint.style.cssText='font-size:10px;color:#5a7099;';hint.textContent='↑  Read remainders from bottom to top:';const resVal=document.createElement('div');resVal.style.cssText='font-size:32px;font-weight:700;color:#00e676;letter-spacing:8px;';resVal.textContent=fr.result;const fin=document.createElement('div');fin.style.cssText='font-size:13px;color:#00e676;';fin.innerHTML=`✓ <span style="color:#ffc107">${originalNum}</span><sub>10</sub> = <span style="color:#00e676">${fr.result}</span><sub>2</sub>`;resBox.appendChild(hint);resBox.appendChild(resVal);resBox.appendChild(fin);wrap.appendChild(resBox);}
  }
  ca.appendChild(wrap);
}
