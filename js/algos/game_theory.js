// ═══════════════════════════════════════════
// NIM GAME
// ═══════════════════════════════════════════
function initNim(){
  state.extra.nimHeaps=[3,5,7];state.extra.nimHistory=[];state.extra.nimTurn='Player';
  genNimSteps();renderNim();
}
function nimXOR(heaps){return heaps.reduce((a,b)=>a^b,0);}
function genNimSteps(){
  let heaps=[...state.extra.nimHeaps];const steps=[];const history=[];
  function compMove(h){const xr=nimXOR(h);if(xr===0){const ni=h.findIndex(v=>v>0);if(ni>=0){const nh=[...h];nh[ni]--;return nh;}return h;}for(let i=0;i<h.length;i++){const t=h[i]^xr;if(t<h[i]){const nh=[...h];nh[i]=t;return nh;}}return h;}
  function playerMove(h){const ni=h.findIndex(v=>v>0);if(ni<0)return h;const nh=[...h];nh[ni]=Math.max(0,nh[ni]-1);return nh;}
  let turn='Computer';
  for(let s=0;s<40;s++){
    if(heaps.every(h=>h===0))break;
    const prev=[...heaps];heaps=turn==='Computer'?compMove(heaps):playerMove(heaps);
    history.push(`${turn}: [${prev}]→[${heaps}]`);
    steps.push({heaps:[...heaps],history:[...history],turn,code:[2,3,4,5,6,7,8,9]});
    turn=turn==='Computer'?'Player':'Computer';
  }
  state.steps=steps;state.stepIdx=0;
  state.renderFn=fr=>{state.extra.nimHeaps=fr.heaps;state.extra.nimHistory=fr.history;state.extra.nimTurn=fr.turn;renderNim();};
}
function renderNim(){
  const{nimHeaps:heaps,nimHistory:history,nimTurn:turn}=state.extra;
  if(!heaps){state.extra.nimHeaps=[3,5,7];state.extra.nimHistory=[];state.extra.nimTurn='Player';return renderNim();}
  const xr=nimXOR(heaps),win=xr!==0;
  const ca=document.getElementById('av-canvas');ca.innerHTML='';
  const wrap=document.createElement('div');wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:14px;width:100%;padding-top:14px;';
  const status=document.createElement('div');status.style.cssText='font-size:12px;font-family:Fira Code;';
  status.innerHTML=`Turn: <b style='color:#00e5ff'>${turn}</b> &nbsp;|&nbsp; XOR = <b style='color:${win?'#00e676':'#ff4081'}'>${xr}</b> → <b>${win?turn+' has winning move':'Losing position'}</b>`;
  wrap.appendChild(status);
  const heapRow=document.createElement('div');heapRow.style.cssText='display:flex;gap:28px;align-items:flex-end;';
  heaps.forEach((h,i)=>{
    const col=document.createElement('div');col.style.cssText='display:flex;flex-direction:column;align-items:center;gap:6px;';
    const lbl=document.createElement('div');lbl.style.cssText='font-size:11px;color:#5a7099;font-family:Fira Code;';lbl.textContent=`Heap ${i+1}`;
    const sticks=document.createElement('div');sticks.style.cssText='display:flex;gap:4px;align-items:flex-end;min-height:90px;';
    for(let s=0;s<h;s++){const st=document.createElement('div');st.style.cssText='width:14px;height:'+(16+s*3)+'px;background:linear-gradient(180deg,#ffe060,#ffc107);border-radius:2px 2px 0 0;';sticks.appendChild(st);}
    const cnt=document.createElement('div');cnt.style.cssText='font-size:22px;color:#ffc107;font-family:Fira Code;font-weight:700;';cnt.textContent=h;
    col.appendChild(lbl);col.appendChild(sticks);col.appendChild(cnt);heapRow.appendChild(col);
  });
  wrap.appendChild(heapRow);
  if(history&&history.length){const hist=document.createElement('div');hist.style.cssText='font-size:10px;color:#5a7099;font-family:Fira Code;max-width:600px;text-align:center;';hist.textContent='Last moves: '+history.slice(-4).join(' → ');wrap.appendChild(hist);}
  if(heaps.every(h=>h===0)){const w=document.createElement('div');w.style.cssText='font-size:16px;color:#00e676;font-family:Fira Code;font-weight:700;';w.textContent=turn==='Player'?'🏆 Computer wins!':'🏆 Player wins!';wrap.appendChild(w);}
  ca.appendChild(wrap);
}

// ═══════════════════════════════════════════
// GRUNDY NUMBERS
// ═══════════════════════════════════════════
function initGrundy(){
  const n=+(document.getElementById('ctrl-gN')||{value:8}).value||8;
  state.extra.grundyN=n;state.extra.grundyMoves=[1,2];state.extra.grundyG=Array(n+1).fill(null);
  genGrundySteps();renderGrundy([],null);
}
function mex(s){let i=0;while(s.has(i))i++;return i;}
function genGrundySteps(){
  const n=state.extra.grundyN,moves=state.extra.grundyMoves;
  const G=Array(n+1).fill(null);G[0]=0;
  const steps=[{G:[...G],filled:[0],cur:0,code:[1]}];
  for(let i=1;i<=n;i++){
    const reach=new Set(moves.filter(m=>i-m>=0).map(m=>G[i-m]));
    G[i]=mex(reach);
    steps.push({G:[...G],filled:Array.from({length:i+1},(_,j)=>j),cur:i,code:[2,3,4,5,6,7]});
  }
  state.steps=steps;state.stepIdx=0;
  state.extra.grundyG=Array(n+1).fill(null);
  state.renderFn=fr=>{state.extra.grundyG=fr.G;renderGrundy(fr.filled,fr.cur);};
}
function renderGrundy(filled,current){
  const{grundyN:n,grundyG:G,grundyMoves:moves}=state.extra;
  const ca=document.getElementById('av-canvas');ca.innerHTML='';
  const wrap=document.createElement('div');wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:14px;width:100%;padding-top:12px;';
  const info=document.createElement('div');info.style.cssText='font-size:11px;color:#5a7099;font-family:Fira Code;';
  info.textContent=`Moves: {${moves.join(',')}}   G[n] = mex({G[n-m] for m in moves})`;
  wrap.appendChild(info);
  const row=document.createElement('div');row.style.cssText='display:flex;gap:6px;flex-wrap:wrap;justify-content:center;';
  for(let i=0;i<=n;i++){
    const box=document.createElement('div');
    let bg='#0d1526',border='#1e3058',col='#5a7099';
    if(i===current){bg='rgba(255,193,7,.2)';border='#ffc107';col='#ffc107';}
    else if(filled&&filled.includes(i)&&G&&G[i]!=null){bg=G[i]===0?'rgba(255,64,129,.15)':'rgba(0,230,118,.1)';border=G[i]===0?'#ff4081':'#00e676';col=G[i]===0?'#ff4081':'#00e676';}
    box.style.cssText=`width:66px;height:74px;background:${bg};border:1px solid ${border};border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;transition:all .2s;`;
    const posEl=document.createElement('div');posEl.style.cssText='font-size:10px;color:#5a7099;font-family:Fira Code;';posEl.textContent='n='+i;
    const gEl=document.createElement('div');gEl.style.cssText=`font-size:22px;font-weight:700;color:${col};font-family:Fira Code;`;gEl.textContent=G&&G[i]!=null?G[i]:'?';
    const wlEl=document.createElement('div');wlEl.style.cssText=`font-size:9px;color:${col};font-family:Fira Code;`;
    if(G&&G[i]!=null)wlEl.textContent=G[i]===0?'Lose':'Win';
    box.appendChild(posEl);box.appendChild(gEl);box.appendChild(wlEl);row.appendChild(box);
  }
  wrap.appendChild(row);
  if(current!=null&&G&&G[current]!=null){
    const det=document.createElement('div');det.style.cssText='font-size:11px;font-family:Fira Code;color:#ce93d8;';
    const rch=moves.filter(m=>current-m>=0).map(m=>`G[${current-m}]=${G[current-m]}`).join(', ');
    det.innerHTML=`G[${current}] = mex({${rch}}) = <b style='color:#ffc107'>${G[current]}</b> → ${G[current]===0?'<span style="color:#ff4081">Losing</span>':'<span style="color:#00e676">Winning</span>'}`;
    wrap.appendChild(det);
  }
  ca.appendChild(wrap);
}
