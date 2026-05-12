// ═══════════════════════════════════════════
// DP — FIBONACCI  (Brute O(2ⁿ) / Memo O(n) / Tabulation O(n))
// ═══════════════════════════════════════════
function initFib(){
  const n=+(document.getElementById('ctrl-fibN')||{value:10}).value||10;
  state.extra.fibN=n;
  const ap=state.extra.approach||'optimal';
  if(ap==='brute')genFibBruteSteps();
  else if(ap==='memo')genFibMemoSteps();
  else genFibSteps();
}

// ── Brute: naive recursion, count every call ──────────────────────────────────
function genFibBruteSteps(){
  const n=state.extra.fibN;
  const callCount=Array(n+1).fill(0);
  const computed=Array(n+1).fill(null);
  computed[0]=0;if(n>0)computed[1]=1;
  const steps=[];let totalCalls=0;
  function fib(k){
    callCount[k]++;totalCalls++;
    steps.push({mode:'brute',callCount:[...callCount],computed:[...computed],current:k,totalCalls,done:false,code:[2,3,4]});
    if(k<=1){computed[k]=k;return k;}
    const r=fib(k-1)+fib(k-2);
    computed[k]=r;
    return r;
  }
  fib(n);
  steps.push({mode:'brute',callCount:[...callCount],computed:[...computed],current:-1,totalCalls,done:true,code:[]});
  state.steps=steps;state.stepIdx=0;
  state.renderFn=fr=>renderFib(fr);
}

// ── Memo: top-down with cache, track hits/misses ──────────────────────────────
function genFibMemoSteps(){
  const n=state.extra.fibN;
  const memo=Array(n+1).fill(null);
  const steps=[];let hits=0,misses=0,totalCalls=0;
  function fib(k){
    totalCalls++;
    if(memo[k]!==null){
      hits++;
      steps.push({mode:'memo',memo:[...memo],current:k,isHit:true,hits,misses,totalCalls,done:false,code:[2,3,4]});
      return memo[k];
    }
    misses++;
    if(k<=1)memo[k]=k;
    steps.push({mode:'memo',memo:[...memo],current:k,isHit:false,hits,misses,totalCalls,done:false,code:[5,6,7]});
    if(k<=1)return k;
    memo[k]=fib(k-1)+fib(k-2);
    steps.push({mode:'memo',memo:[...memo],current:k,isHit:false,hits,misses,totalCalls,done:false,code:[8]});
    return memo[k];
  }
  fib(n);
  steps.push({mode:'memo',memo:[...memo],current:-1,isHit:false,hits,misses,totalCalls,done:true,code:[]});
  state.steps=steps;state.stepIdx=0;
  state.renderFn=fr=>renderFib(fr);
}

// ── Optimal: bottom-up tabulation ────────────────────────────────────────────
function genFibSteps(){
  const n=state.extra.fibN;
  const dp=Array(n+1).fill(null);dp[0]=0;dp[1]=1;
  const steps=[{mode:'optimal',dp:[...dp],filled:[0,1],current:null,code:[2,3]}];
  for(let i=2;i<=n;i++){dp[i]=dp[i-1]+dp[i-2];steps.push({mode:'optimal',dp:[...dp],filled:Array.from({length:i+1},(_,j)=>j),current:i,code:[3,4,5]});}
  state.steps=steps;state.stepIdx=0;
  state.extra.fibDP=Array(n+1).fill(null);state.extra.fibDP[0]=0;state.extra.fibDP[1]=1;
  state.renderFn=fr=>{
    if(fr.mode==='optimal')state.extra.fibDP=fr.dp;
    renderFib(fr);
  };
}

function renderFib(fr){
  const n=state.extra.fibN;
  const ca=document.getElementById('av-canvas');ca.innerHTML='';
  const wrap=document.createElement('div');wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:18px;width:100%;padding-top:16px;';
  const{mode}=fr;

  if(mode==='brute'){
    // ── call frequency heatmap ──────────────────────────────────────────────
    const{callCount,computed,current,totalCalls,done}=fr;
    const maxCalls=Math.max(...callCount,1);
    const header=document.createElement('div');header.style.cssText='font-size:11px;color:#5a7099;font-family:Fira Code;text-align:center;';
    header.innerHTML=`<span style="color:#ff4081">Total calls so far: <b>${totalCalls}</b></span> &nbsp;|&nbsp; Optimal would make <span style="color:#00e676"><b>${n-1}</b> additions</span>`;
    wrap.appendChild(header);
    // index row
    const idxRow=document.createElement('div');idxRow.style.cssText='display:flex;gap:5px;flex-wrap:wrap;justify-content:center;';
    for(let i=0;i<=n;i++){const c=document.createElement('div');c.style.cssText='width:52px;height:20px;background:#0a1628;border:1px solid #1e3058;font-size:10px;color:#5a7099;display:flex;align-items:center;justify-content:center;border-radius:3px;font-family:Fira Code;';c.textContent='fib('+i+')';idxRow.appendChild(c);}
    wrap.appendChild(idxRow);
    // call-count bars + boxes
    const barRow=document.createElement('div');barRow.style.cssText='display:flex;gap:5px;flex-wrap:wrap;justify-content:center;';
    for(let i=0;i<=n;i++){
      const cnt=callCount[i];const isCur=current===i&&!done;
      let bg='#0d1526',border='#1e3058',col='#5a7099';
      if(isCur){bg='rgba(255,193,7,.25)';border='#ffc107';col='#ffc107';}
      else if(cnt>=4){bg='rgba(255,64,129,.25)';border='#ff4081';col='#ff4081';}
      else if(cnt>=2){bg='rgba(255,193,7,.15)';border='#ffc10788';col='#ffc107';}
      else if(cnt===1){bg='rgba(0,229,255,.1)';border='#00e5ff66';col='#00e5ff';}
      const box=document.createElement('div');
      box.style.cssText=`width:52px;background:${bg};border:1px solid ${border};border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6px 2px;gap:3px;transition:all .18s;`;
      box.innerHTML=`<div style="font-size:18px;font-weight:700;color:${col};font-family:Fira Code">${computed[i]!=null?computed[i]:'?'}</div><div style="font-size:9px;color:${col};font-family:Fira Code">${cnt} call${cnt!==1?'s':''}</div>`;
      if(cnt>=2&&!isCur){const warn=document.createElement('div');warn.style.cssText='font-size:8px;color:#ff408188;font-family:Fira Code;';warn.textContent='REDUNDANT';box.appendChild(warn);}
      barRow.appendChild(box);
    }
    wrap.appendChild(barRow);
    if(done){
      const legend=document.createElement('div');legend.style.cssText='display:flex;gap:16px;font-size:10px;font-family:Fira Code;flex-wrap:wrap;justify-content:center;';
      [['#00e5ff66','1 call (unique)'],['#ffc10788','2–3 calls (redundant!)'],['#ff4081','4+ calls (very redundant!)']].forEach(([c,l])=>{legend.innerHTML+=`<span style="display:flex;align-items:center;gap:5px;"><span style="width:10px;height:10px;background:${c};border-radius:2px;display:inline-block;"></span><span style="color:#5a7099">${l}</span></span>`;});
      wrap.appendChild(legend);
    }

  } else if(mode==='memo'){
    // ── memo cache table ────────────────────────────────────────────────────
    const{memo,current,isHit,hits,misses,totalCalls,done}=fr;
    const header=document.createElement('div');header.style.cssText='font-size:11px;color:#5a7099;font-family:Fira Code;text-align:center;';
    header.innerHTML=`Total calls: <b style="color:#ffc107">${totalCalls}</b> &nbsp;|&nbsp; Cache hits: <b style="color:#00e676">${hits}</b> &nbsp;|&nbsp; Cache misses: <b style="color:#ff4081">${misses}</b>`;
    wrap.appendChild(header);
    const idxRow=document.createElement('div');idxRow.style.cssText='display:flex;gap:4px;flex-wrap:wrap;justify-content:center;';
    for(let i=0;i<=n;i++){const c=document.createElement('div');c.style.cssText='width:46px;height:20px;background:#0a1628;border:1px solid #1e3058;font-size:10px;color:#5a7099;display:flex;align-items:center;justify-content:center;border-radius:3px;font-family:Fira Code;';c.textContent='i='+i;idxRow.appendChild(c);}
    wrap.appendChild(idxRow);
    const valRow=document.createElement('div');valRow.style.cssText='display:flex;gap:4px;flex-wrap:wrap;justify-content:center;';
    for(let i=0;i<=n;i++){
      const isCur=current===i&&!done;const isCacheHit=isCur&&isHit;
      let bg='#0d1526',border='#1e3058',col='#5a7099';
      if(isCacheHit){bg='rgba(255,193,7,.3)';border='#ffc107';col='#ffc107';}
      else if(isCur){bg='rgba(0,229,255,.2)';border='#00e5ff';col='#00e5ff';}
      else if(memo[i]!=null){bg='rgba(0,230,118,.1)';border='#00e676';col='#00e676';}
      const c=document.createElement('div');
      c.style.cssText=`width:46px;height:52px;background:${bg};border:1px solid ${border};color:${col};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-radius:4px;font-family:Fira Code;transition:all .18s;`;
      c.innerHTML=`<div style="font-size:${memo[i]!=null&&memo[i]>999?9:12}px;font-weight:600">${memo[i]!=null?memo[i]:'?'}</div>${isCacheHit?'<div style="font-size:8px;color:#ffc107">HIT ✓</div>':memo[i]!=null&&!isCur?'<div style="font-size:8px;color:#00e67688">cached</div>':''}`;
      valRow.appendChild(c);
    }
    wrap.appendChild(valRow);
    if(current!=null&&!done&&memo[current]!=null){
      const info=document.createElement('div');info.style.cssText='font-size:11px;color:#5a7099;font-family:Fira Code;';
      info.innerHTML=isHit?`<span style="color:#ffc107">Cache HIT for fib(${current}) = ${memo[current]}</span> — no recursion needed!`:`<span style="color:#00e5ff">Computing fib(${current})</span> → cache miss, recurse`;
      wrap.appendChild(info);
    }

  } else {
    // ── Tabulation (existing optimal) ───────────────────────────────────────
    const{dp,filled,current}=fr;
    state.extra.fibDP=dp;
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
    wrap.appendChild(info);
  }

  ca.appendChild(wrap);
}

// ═══════════════════════════════════════════
// DP — KNAPSACK  (Brute O(2ⁿ)  +  Optimal O(nW))
// ═══════════════════════════════════════════
function initKnapsack(){
  state.extra.ksW=state.extra.ksW||8;state.extra.ksN=state.extra.ksN||5;
  state.extra.ksWts=state.extra.ksWts||[2,3,4,5,1];
  state.extra.ksVals=state.extra.ksVals||[3,4,5,6,2];
  state.extra.ksDP=Array.from({length:(state.extra.ksN||5)+1},()=>Array((state.extra.ksW||8)+1).fill(0));
  const ap=state.extra.approach||'optimal';
  if(ap==='brute')genKSBruteSteps();else genKSSteps();
  if(ap==='brute')renderKSBrute({callCount:0,i:-1,remW:-1,result:0,subProblems:{},done:false});
  else renderKS(0,0);
}

// ── KS Brute: simulate recursion, track (i,w) call frequency ─────────────────
function genKSBruteSteps(){
  const{ksN:n,ksW:W,ksWts:wts,ksVals:vals}=state.extra;
  const subProblems={};// key="i,w" → call count
  const steps=[];let totalCalls=0;
  function ks(i,remW){
    totalCalls++;
    const key=`${i},${remW}`;
    subProblems[key]=(subProblems[key]||0)+1;
    steps.push({mode:'brute',i,remW,callCount:totalCalls,subProblems:{...subProblems},done:false,code:[2,3,4]});
    if(i===0||remW===0)return 0;
    if(wts[i-1]>remW)return ks(i-1,remW);
    return Math.max(vals[i-1]+ks(i-1,remW-wts[i-1]),ks(i-1,remW));
  }
  const result=ks(n,W);
  steps.push({mode:'brute',i:-1,remW:-1,callCount:totalCalls,subProblems:{...subProblems},result,done:true,code:[]});
  state.steps=steps;state.stepIdx=0;
  state.renderFn=fr=>{if(fr.mode==='brute')renderKSBrute(fr);};
}

function renderKSBrute(fr){
  const{ksN:n,ksW:W,ksWts:wts,ksVals:vals}=state.extra;
  const{callCount,subProblems,result,done,i,remW}=fr;
  const ca=document.getElementById('av-canvas');ca.innerHTML='';
  const wrap=document.createElement('div');wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:12px;width:100%;padding-top:12px;font-family:Fira Code;';
  // Stats
  const stats=document.createElement('div');stats.style.cssText='display:flex;gap:20px;align-items:center;flex-wrap:wrap;justify-content:center;';
  stats.innerHTML=`<span style="font-size:11px;color:#5a7099">Recursive calls: <b style="color:#ff4081">${callCount}</b></span><span style="font-size:11px;color:#5a7099">Unique subproblems: <b style="color:#ffc107">${(n+1)*(W+1)}</b></span><span style="font-size:11px;color:#5a7099">Optimal DP cells: <b style="color:#00e676">${(n+1)*(W+1)}</b></span>`;
  wrap.appendChild(stats);
  // Heatmap grid: rows = items, cols = weights
  const gridWrap=document.createElement('div');gridWrap.style.cssText='overflow:auto;max-width:100%;';
  const tbl=document.createElement('table');tbl.className='dp-table';
  const thead=document.createElement('thead');const hr=document.createElement('tr');
  const th0=document.createElement('th');th0.textContent='i\\w';hr.appendChild(th0);
  for(let w=0;w<=Math.min(W,12);w++){const th=document.createElement('th');th.textContent=w;hr.appendChild(th);}
  thead.appendChild(hr);tbl.appendChild(thead);
  const tbody=document.createElement('tbody');
  for(let ii=0;ii<=n;ii++){
    const tr=document.createElement('tr');
    const td0=document.createElement('td');td0.textContent=ii===0?'∅':`i${ii}`;td0.style.cssText='color:#5a7099;font-size:10px;background:#0a1628;';tr.appendChild(td0);
    for(let w=0;w<=Math.min(W,12);w++){
      const cnt=(subProblems&&subProblems[`${ii},${w}`])||0;
      const isActive=!done&&i===ii&&remW===w;
      const td=document.createElement('td');
      if(isActive){td.classList.add('active');td.textContent='→';}
      else if(cnt>=4){td.style.cssText='background:rgba(255,64,129,.35);color:#ff4081;font-size:10px;font-weight:700;';td.textContent=`×${cnt}`;}
      else if(cnt>=2){td.style.cssText='background:rgba(255,193,7,.2);color:#ffc107;font-size:10px;font-weight:700;';td.textContent=`×${cnt}`;}
      else if(cnt===1){td.style.cssText='background:rgba(0,229,255,.12);color:#00e5ff;font-size:10px;';td.textContent='1';}
      else{td.textContent='';}
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  tbl.appendChild(tbody);gridWrap.appendChild(tbl);wrap.appendChild(gridWrap);
  const hint=document.createElement('div');hint.style.cssText='font-size:10px;color:#5a7099;text-align:center;';
  if(done)hint.innerHTML=`<b style="color:#ff4081">×4+ red</b> = computed 4+ times, <b style="color:#ffc107">×2–3 amber</b> = recomputed, <b style="color:#00e5ff">1</b> = computed once &nbsp;|&nbsp; Result: <b style="color:#00e676">${result}</b>`;
  else hint.innerHTML='<b style="color:#ff4081">Red cells</b> = same subproblem recomputed many times → Optimal DP would compute each cell just <b style="color:#00e676">once</b>';
  wrap.appendChild(hint);
  ca.appendChild(wrap);
}

// ── KS Optimal: existing tabulation ──────────────────────────────────────────
function genKSSteps(){
  const{ksN:n,ksW:W,ksWts:wts,ksVals:vals}=state.extra;
  const dp=Array.from({length:n+1},()=>Array(W+1).fill(0));
  state.extra.ksDP=dp;const steps=[];
  for(let i=1;i<=n;i++)for(let w=0;w<=W;w++){
    if(wts[i-1]<=w)dp[i][w]=Math.max(vals[i-1]+dp[i-1][w-wts[i-1]],dp[i-1][w]);
    else dp[i][w]=dp[i-1][w];
    steps.push({mode:'optimal',i,w,snapshot:dp.map(r=>[...r]),code:[4,5,6,7,8,9]});
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
// DP — LCS  (Brute O(2^m)  +  Optimal O(mn))
// ═══════════════════════════════════════════
function initLCS(){
  state.extra.lcsS1=state.extra.lcsS1||'ABCBDAB';
  state.extra.lcsS2=state.extra.lcsS2||'BDCAB';
  const m=state.extra.lcsS1.length,n=state.extra.lcsS2.length;
  state.extra.lcsDP=Array.from({length:m+1},()=>Array(n+1).fill(0));
  const ap=state.extra.approach||'optimal';
  if(ap==='brute')genLCSBruteSteps();else genLCSSteps();
  if(ap==='brute')renderLCSBrute({callCount:0,i:-1,j:-1,subProblems:{},done:false});
  else renderLCS(0,0);
}

// ── LCS Brute: simulate recursion, track (i,j) call frequency ────────────────
function genLCSBruteSteps(){
  const{lcsS1:s1,lcsS2:s2}=state.extra;const m=s1.length,n=s2.length;
  const subProblems={};const steps=[];let totalCalls=0;
  function lcs(i,j){
    totalCalls++;
    const key=`${i},${j}`;
    subProblems[key]=(subProblems[key]||0)+1;
    steps.push({mode:'brute',i,j,callCount:totalCalls,subProblems:{...subProblems},done:false,code:[2,3,4]});
    if(i===0||j===0)return 0;
    if(s1[i-1]===s2[j-1])return 1+lcs(i-1,j-1);
    return Math.max(lcs(i-1,j),lcs(i,j-1));
  }
  const result=lcs(m,n);
  steps.push({mode:'brute',i:-1,j:-1,callCount:totalCalls,subProblems:{...subProblems},result,done:true,code:[]});
  state.steps=steps;state.stepIdx=0;
  state.renderFn=fr=>{if(fr.mode==='brute')renderLCSBrute(fr);};
}

function renderLCSBrute(fr){
  const{lcsS1:s1,lcsS2:s2}=state.extra;const m=s1.length,n=s2.length;
  const{callCount,subProblems,result,done,i,j}=fr;
  const ca=document.getElementById('av-canvas');ca.innerHTML='';
  const wrap=document.createElement('div');wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:12px;width:100%;padding-top:12px;font-family:Fira Code;';
  // Stats bar
  const stats=document.createElement('div');stats.style.cssText='display:flex;gap:20px;flex-wrap:wrap;justify-content:center;';
  stats.innerHTML=`<span style="font-size:11px;color:#5a7099">Recursive calls: <b style="color:#ff4081">${callCount}</b></span><span style="font-size:11px;color:#5a7099">Optimal DP cells: <b style="color:#00e676">${(m+1)*(n+1)}</b></span>`;
  wrap.appendChild(stats);
  // (i,j) heatmap
  const tbl=document.createElement('table');tbl.className='dp-table';
  const thead=document.createElement('thead');const hr=document.createElement('tr');
  [' ',''].concat(s2.split('')).forEach(ch=>{const th=document.createElement('th');th.textContent=ch;hr.appendChild(th);});
  thead.appendChild(hr);tbl.appendChild(thead);
  const tbody=document.createElement('tbody');
  for(let ii=0;ii<=m;ii++){
    const tr=document.createElement('tr');
    const rl=document.createElement('td');rl.textContent=ii===0?'':s1[ii-1];rl.style.cssText='color:#ce93d8;background:#0a1628;font-weight:600;';tr.appendChild(rl);
    for(let jj=0;jj<=n;jj++){
      const cnt=(subProblems&&subProblems[`${ii},${jj}`])||0;
      const isActive=!done&&i===ii&&j===jj;
      const td=document.createElement('td');
      if(isActive){td.classList.add('active');td.textContent='→';}
      else if(cnt>=4){td.style.cssText='background:rgba(255,64,129,.35);color:#ff4081;font-size:10px;font-weight:700;';td.textContent=`×${cnt}`;}
      else if(cnt>=2){td.style.cssText='background:rgba(255,193,7,.2);color:#ffc107;font-size:10px;font-weight:700;';td.textContent=`×${cnt}`;}
      else if(cnt===1){td.style.cssText='background:rgba(0,229,255,.12);color:#00e5ff;font-size:10px;';td.textContent='1';}
      else{td.textContent='';}
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  tbl.appendChild(tbody);wrap.appendChild(tbl);
  const hint=document.createElement('div');hint.style.cssText='font-size:10px;color:#5a7099;text-align:center;';
  if(done)hint.innerHTML=`<b style="color:#ff4081">Red ×N</b> = same cell computed N times &nbsp;|&nbsp; LCS = <b style="color:#00e676">${result}</b> &nbsp;|&nbsp; "${s1}" vs "${s2}"`;
  else hint.innerHTML=`<b style="color:#ff4081">Red/amber</b> = subproblem recomputed → DP would compute each cell <b style="color:#00e676">exactly once</b>`;
  wrap.appendChild(hint);ca.appendChild(wrap);
}

// ── LCS Optimal: existing tabulation ─────────────────────────────────────────
function genLCSSteps(){
  const{lcsS1:s1,lcsS2:s2}=state.extra;const m=s1.length,n=s2.length;
  const dp=Array.from({length:m+1},()=>Array(n+1).fill(0));
  state.extra.lcsDP=dp;const steps=[];
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){
    if(s1[i-1]===s2[j-1])dp[i][j]=dp[i-1][j-1]+1;
    else dp[i][j]=Math.max(dp[i-1][j],dp[i][j-1]);
    steps.push({mode:'optimal',i,j,snap:dp.map(r=>[...r]),code:[4,5,6,7,8]});
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
