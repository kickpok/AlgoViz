// ═══════════════════════════════════════════
// DP — FIBONACCI
// ═══════════════════════════════════════════
function initFib(){
  const n=+(document.getElementById('ctrl-fibN')||{value:10}).value||10;
  state.extra.fibN=n;state.extra.fibDP=Array(n+1).fill(null);
  genFibSteps();
  renderFib([],null);
}
function genFibSteps(){
  const n=state.extra.fibN;
  const dp=Array(n+1).fill(null);dp[0]=0;dp[1]=1;
  const steps=[{dp:[...dp],filled:[0,1],current:null,code:[2,3]}];
  for(let i=2;i<=n;i++){dp[i]=dp[i-1]+dp[i-2];steps.push({dp:[...dp],filled:Array.from({length:i+1},(_,j)=>j),current:i,code:[3,4,5]});}
  state.steps=steps;state.stepIdx=0;
  state.extra.fibDP=Array(n+1).fill(null);state.extra.fibDP[0]=0;state.extra.fibDP[1]=1;
  state.renderFn=fr=>{state.extra.fibDP=fr.dp;renderFib(fr.filled,fr.current);};
}
function renderFib(filled,current){
  const{fibN:n,fibDP:dp}=state.extra;
  const ca=document.getElementById('av-canvas');ca.innerHTML='';
  const wrap=document.createElement('div');wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:18px;width:100%;padding-top:20px;';
  const idxRow=document.createElement('div');idxRow.style.cssText='display:flex;gap:4px;flex-wrap:wrap;justify-content:center;';
  for(let i=0;i<=n;i++){const c=document.createElement('div');c.style.cssText='width:46px;height:22px;background:#0a1628;border:1px solid #1e3058;font-size:10px;color:#5a7099;display:flex;align-items:center;justify-content:center;border-radius:3px;font-family:Fira Code;';c.textContent='i='+i;idxRow.appendChild(c);}
  const valRow=document.createElement('div');valRow.style.cssText='display:flex;gap:4px;flex-wrap:wrap;justify-content:center;';
  for(let i=0;i<=n;i++){
    const c=document.createElement('div');
    let bg='#0d1526',border='#1e3058',col='#5a7099';
    if(i===current){bg='rgba(255,193,7,.2)';border='#ffc107';col='#ffc107';}
    else if(filled&&filled.includes(i)){bg='rgba(0,230,118,.1)';border='#00e676';col='#00e676';}
    c.style.cssText=`width:46px;height:46px;background:${bg};border:1px solid ${border};color:${col};display:flex;align-items:center;justify-content:center;border-radius:4px;font-family:Fira Code;font-size:${dp&&dp[i]!=null&&dp[i]>999?9:12}px;font-weight:600;transition:all .2s;`;
    c.textContent=dp&&dp[i]!=null?dp[i]:'?';valRow.appendChild(c);
  }
  wrap.appendChild(idxRow);wrap.appendChild(valRow);
  const info=document.createElement('div');info.style.cssText='font-size:11px;color:#5a7099;font-family:Fira Code;';
  if(current!=null&&dp)info.innerHTML=`<span style="color:#ffc107">dp[${current}]</span> = dp[${current-1}] + dp[${current-2}] = <span style="color:#00e5ff">${dp[current]}</span>`;
  wrap.appendChild(info);ca.appendChild(wrap);
}

// ═══════════════════════════════════════════
// DP — KNAPSACK
// ═══════════════════════════════════════════
function initKnapsack(){
  state.extra.ksW=8;state.extra.ksN=5;
  state.extra.ksWts=[2,3,4,5,1];state.extra.ksVals=[3,4,5,6,2];
  state.extra.ksDP=Array.from({length:6},()=>Array(9).fill(0));
  genKSSteps();renderKS(0,0);
}
function genKSSteps(){
  const{ksN:n,ksW:W,ksWts:wts,ksVals:vals}=state.extra;
  const dp=Array.from({length:n+1},()=>Array(W+1).fill(0));
  state.extra.ksDP=dp;const steps=[];
  for(let i=1;i<=n;i++)for(let w=0;w<=W;w++){
    if(wts[i-1]<=w)dp[i][w]=Math.max(vals[i-1]+dp[i-1][w-wts[i-1]],dp[i-1][w]);
    else dp[i][w]=dp[i-1][w];
    steps.push({i,w,snapshot:dp.map(r=>[...r]),code:[4,5,6,7,8,9]});
  }
  state.steps=steps;state.stepIdx=0;
  state.renderFn=fr=>{state.extra.ksDP=fr.snapshot;renderKS(fr.i,fr.w);};
}
function renderKS(curI,curW){
  const{ksN:n,ksW:W,ksWts:wts,ksVals:vals,ksDP:dp}=state.extra;
  const ca=document.getElementById('av-canvas');ca.innerHTML='';
  const wrap=document.createElement('div');wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;padding-top:10px;';
  const iinfo=document.createElement('div');iinfo.style.cssText='display:flex;gap:6px;flex-wrap:wrap;justify-content:center;';
  for(let i=1;i<=n;i++){const b=document.createElement('div');b.style.cssText=`padding:3px 10px;background:#0d1526;border:1px solid ${i===curI?'#ffc107':'#1e3058'};border-radius:4px;font-size:10px;font-family:Fira Code;color:${i===curI?'#ffc107':'#5a7099'}`;b.innerHTML=`Item ${i}: w=${wts[i-1]} v=${vals[i-1]}`;iinfo.appendChild(b);}
  wrap.appendChild(iinfo);
  const tbl=document.createElement('table');tbl.className='dp-table';
  const thead=document.createElement('thead');const hr=document.createElement('tr');
  const th0=document.createElement('th');th0.textContent='i\\w';hr.appendChild(th0);
  for(let w=0;w<=W;w++){const th=document.createElement('th');th.textContent=w;hr.appendChild(th);}
  thead.appendChild(hr);tbl.appendChild(thead);
  const tbody=document.createElement('tbody');
  for(let i=0;i<=n;i++){
    const tr=document.createElement('tr');
    const td0=document.createElement('td');td0.textContent=i===0?'∅':`i${i}`;td0.style.cssText='color:#5a7099;font-size:10px;background:#0a1628;';tr.appendChild(td0);
    for(let w=0;w<=W;w++){
      const td=document.createElement('td');td.textContent=dp&&dp[i]?dp[i][w]:'';
      if(i===curI&&w===curW)td.classList.add('active');
      else if(i<curI||(i===curI&&w<curW))td.classList.add('done');
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  tbl.appendChild(tbody);wrap.appendChild(tbl);
  if(curI>0&&curW>0&&dp&&dp[curI]){const info2=document.createElement('div');info2.style.cssText='font-size:11px;color:#5a7099;font-family:Fira Code;';info2.innerHTML=`<span style="color:#ffc107">dp[${curI}][${curW}]</span> = <span style="color:#00e5ff">${dp[curI][curW]}</span>  |  Max so far: ${Math.max(...dp.flat())}`;wrap.appendChild(info2);}
  ca.appendChild(wrap);
}

// ═══════════════════════════════════════════
// DP — LCS
// ═══════════════════════════════════════════
function initLCS(){
  state.extra.lcsS1='ABCBDAB';state.extra.lcsS2='BDCAB';
  const m=state.extra.lcsS1.length,n=state.extra.lcsS2.length;
  state.extra.lcsDP=Array.from({length:m+1},()=>Array(n+1).fill(0));
  genLCSSteps();renderLCS(0,0);
}
function genLCSSteps(){
  const{lcsS1:s1,lcsS2:s2}=state.extra;const m=s1.length,n=s2.length;
  const dp=Array.from({length:m+1},()=>Array(n+1).fill(0));
  state.extra.lcsDP=dp;const steps=[];
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){
    if(s1[i-1]===s2[j-1])dp[i][j]=dp[i-1][j-1]+1;
    else dp[i][j]=Math.max(dp[i-1][j],dp[i][j-1]);
    steps.push({i,j,snap:dp.map(r=>[...r]),code:[4,5,6,7,8]});
  }
  state.steps=steps;state.stepIdx=0;
  state.renderFn=fr=>{state.extra.lcsDP=fr.snap;renderLCS(fr.i,fr.j);};
}
function renderLCS(curI,curJ){
  const{lcsS1:s1,lcsS2:s2,lcsDP:dp}=state.extra;
  const m=s1.length,n=s2.length;
  const ca=document.getElementById('av-canvas');ca.innerHTML='';
  const wrap=document.createElement('div');wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:10px;padding-top:10px;';
  const tbl=document.createElement('table');tbl.className='dp-table';
  const thead=document.createElement('thead');const hr=document.createElement('tr');
  [' ',''].concat(s2.split('')).forEach(ch=>{const th=document.createElement('th');th.textContent=ch;hr.appendChild(th);});
  thead.appendChild(hr);tbl.appendChild(thead);
  const tbody=document.createElement('tbody');
  for(let i=0;i<=m;i++){
    const tr=document.createElement('tr');
    const rl=document.createElement('td');rl.textContent=i===0?'':s1[i-1];rl.style.cssText='color:#ce93d8;background:#0a1628;font-weight:600;';tr.appendChild(rl);
    for(let j=0;j<=n;j++){
      const td=document.createElement('td');td.textContent=dp&&dp[i]?dp[i][j]:'0';
      if(i===curI&&j===curJ)td.classList.add('active');
      else if(i<curI||(i===curI&&j<curJ)){if(dp&&dp[i]&&dp[i][j]>0&&i>0&&j>0&&dp[i][j]>dp[i-1][j]&&dp[i][j]>dp[i][j-1])td.classList.add('highlight');else td.classList.add('done');}
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  tbl.appendChild(tbody);wrap.appendChild(tbl);
  const info=document.createElement('div');info.style.cssText='font-size:11px;color:#5a7099;font-family:Fira Code;';
  if(curI>0&&curJ>0&&dp&&dp[curI]){const match=s1[curI-1]===s2[curJ-1];info.innerHTML=match?`<span style='color:#00e676'>s1[${curI-1}]='${s1[curI-1]}' == s2[${curJ-1}]='${s2[curJ-1]}' → dp[${curI}][${curJ}]=${dp[curI][curJ]}</span>`:`<span style='color:#5a7099'>s1[${curI-1}]≠s2[${curJ-1}] → max=${dp[curI][curJ]}</span>`;}
  const lbl=document.createElement('div');lbl.style.cssText='font-size:12px;color:#ffc107;font-family:Fira Code;';
  lbl.textContent=`LCS = ${dp&&dp[m]?dp[m][n]:0}  |  "${s1}" vs "${s2}"`;
  wrap.appendChild(info);wrap.appendChild(lbl);ca.appendChild(wrap);
}
