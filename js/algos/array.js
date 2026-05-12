// ═══════════════════════════════════════════
// SLIDING WINDOW  (optimal only — no brute variant requested)
// ═══════════════════════════════════════════
function initArraySW(){
  const kEl=document.getElementById('ctrl-sw-k');
  const k=Math.max(1,+(kEl?kEl.value:4)||4);
  if(!state.extra._customSW){
    const n=18;
    state.arr=Array.from({length:n},()=>Math.floor(Math.random()*50)+1);
  }
  const arr=state.arr;
  if(k>arr.length){setStatus(`k(${k}) > array size(${arr.length})`,false,true);return;}
  const initSum=arr.slice(0,k).reduce((a,b)=>a+b,0);
  state.extra={...state.extra,k,curSum:initSum,maxSum:initSum,maxWin:[0,k-1]};
  state.steps=[];state.stepIdx=0;
  genSWSteps();
  renderArraySW(0,k-1,0);
  setStatus('Ready — click ▶ Start');
}
function genSWSteps(){
  const arr=state.arr,k=state.extra.k;
  if(k>arr.length){setStatus(`k(${k}) > n(${arr.length}) — invalid`,false,true);state.steps=[];return;}
  const steps=[];
  let s=arr.slice(0,k).reduce((a,b)=>a+b,0),maxS=s,mw=[0,k-1];
  state.extra.curSum=s;state.extra.maxSum=maxS;state.extra.maxWin=[...mw];
  steps.push({winL:0,winR:k-1,curSum:s,maxSum:maxS,maxWin:[...mw],step:0,code:[4,5,6,7]});
  for(let i=1;i<=arr.length-k;i++){
    s+=arr[i+k-1]-arr[i-1];if(s>maxS){maxS=s;mw=[i,i+k-1];}
    steps.push({winL:i,winR:i+k-1,curSum:s,maxSum:maxS,maxWin:[...mw],step:i,code:[5,6,7,8]});
  }
  state.steps=steps;state.stepIdx=0;
  state.renderFn=fr=>{state.extra.curSum=fr.curSum;state.extra.maxSum=fr.maxSum;state.extra.maxWin=fr.maxWin;renderArraySW(fr.winL,fr.winR,fr.step);};
}
function renderArraySW(winL,winR,step){
  const arr=state.arr,{k,maxSum,curSum,maxWin}=state.extra;
  const cv=getCanvas(700,250);const ctx=cv.getContext('2d');
  ctx.fillStyle='#060b14';ctx.fillRect(0,0,cv.width,cv.height);
  const bw=28,gap=4,sx=30,baseY=175;
  arr.forEach((v,i)=>{
    const x=sx+i*(bw+gap),bh=v*1.6+18;
    let col='#1e3058';
    if(i>=winL&&i<=winR&&i>=maxWin[0]&&i<=maxWin[1])col='#00e67633';
    else if(i>=winL&&i<=winR)col='#00e5ff2a';
    else if(i>=maxWin[0]&&i<=maxWin[1])col='#ffc1072a';
    ctx.fillStyle=col;ctx.fillRect(x,baseY-bh,bw,bh);
    ctx.fillStyle=(i>=winL&&i<=winR)?'#00e5ff':'#7a90b8';
    ctx.font='bold 11px Fira Code';ctx.textAlign='center';ctx.fillText(v,x+bw/2,baseY-bh-5);
    ctx.fillStyle='#3a5080';ctx.font='9px Fira Code';ctx.fillText(i,x+bw/2,baseY+13);
  });
  const wx1=sx+winL*(bw+gap),wx2=sx+(winR+1)*(bw+gap)-gap;
  ctx.strokeStyle='#00e5ff';ctx.lineWidth=2;ctx.strokeRect(wx1-2,55,wx2-wx1+4,128);
  ctx.fillStyle='#00e5ff';ctx.font='11px Fira Code';ctx.textAlign='left';
  ctx.fillText(`Window [${winL}..${winR}]  sum=${curSum}  k=${k}`,wx1,48);
  ctx.fillStyle='#ffc107';ctx.font='11px Fira Code';
  ctx.fillText(`Max Sum = ${maxSum}  @ [${maxWin[0]}..${maxWin[1]}]`,30,212);
  ctx.fillStyle='#3a5080';ctx.font='10px Fira Code';
  ctx.fillText(`Step ${step} / ${arr.length-k}`,30,232);
}

// ═══════════════════════════════════════════
// TWO POINTER  — Brute O(n²)  +  Optimal O(n)
// ═══════════════════════════════════════════
function initArrayTP(){
  if(!state.extra._customTP){
    const n=16;
    state.arr=Array.from({length:n},()=>Math.floor(Math.random()*40)+1).sort((a,b)=>a-b);
  }
  const arr=state.arr;
  const tEl=document.getElementById('ctrl-tp-target');
  let target;
  if(tEl&&tEl.value.trim()!=='')target=+tEl.value;
  else if(state.extra._customTarget!=null)target=state.extra._customTarget;
  else target=arr[Math.floor(arr.length*0.3)]+arr[Math.floor(arr.length*0.7)]+Math.floor(Math.random()*3);
  state.extra={...state.extra,target,left:0,right:arr.length-1,found:null};
  state.steps=[];state.stepIdx=0;
  const ap=state.extra.approach||'optimal';
  if(ap==='brute')genTPBruteSteps();else genTPSteps();
  renderArrayTP(state.steps[0]);
  setStatus('Ready — click ▶ Start');
}

// ── Brute: nested loops ────────────────────────────────────────────────────────
function genTPBruteSteps(){
  const arr=state.arr,{target}=state.extra;
  const n=arr.length;const steps=[];
  steps.push({mode:'brute',outerI:-1,innerJ:-1,sum:null,found:null,noSol:false,totalChecks:0,code:[1]});
  let totalChecks=0;
  for(let i=0;i<n-1;i++){
    for(let j=i+1;j<n;j++){
      totalChecks++;
      const sum=arr[i]+arr[j];
      const found=sum===target?[i,j]:null;
      steps.push({mode:'brute',outerI:i,innerJ:j,sum,found,noSol:false,totalChecks,code:[2,3,4]});
      if(found){state.steps=steps;state.stepIdx=0;state.renderFn=fr=>renderArrayTP(fr);return;}
    }
  }
  steps.push({mode:'brute',outerI:-1,innerJ:-1,sum:null,found:null,noSol:true,totalChecks,code:[]});
  state.steps=steps;state.stepIdx=0;state.renderFn=fr=>renderArrayTP(fr);
}

// ── Optimal: two pointers ──────────────────────────────────────────────────────
function genTPSteps(){
  const arr=state.arr,{target}=state.extra;
  const steps=[];let left=0,right=arr.length-1;
  steps.push({mode:'optimal',left,right,sum:null,found:null,noSol:false,code:[1,2]});
  while(left<right){
    const sum=arr[left]+arr[right];
    if(sum===target){
      steps.push({mode:'optimal',left,right,sum,found:[left,right],noSol:false,code:[3,4,5]});
      state.steps=steps;state.stepIdx=0;state.renderFn=fr=>renderArrayTP(fr);return;
    }else if(sum<target){steps.push({mode:'optimal',left,right,sum,found:null,noSol:false,code:[5,6]});left++;}
    else{steps.push({mode:'optimal',left,right,sum,found:null,noSol:false,code:[5,7]});right--;}
  }
  steps.push({mode:'optimal',left,right,sum:null,found:null,noSol:true,code:[]});
  state.steps=steps;state.stepIdx=0;state.renderFn=fr=>renderArrayTP(fr);
}

function renderArrayTP(fr){
  const arr=state.arr,{target}=state.extra;
  const{mode,outerI,innerJ,left,right,sum,found,noSol,totalChecks}=fr;
  const cv=getCanvas(700,260);const ctx=cv.getContext('2d');
  ctx.fillStyle='#060b14';ctx.fillRect(0,0,cv.width,cv.height);
  const bw=30,gap=4,sx=22,baseY=158;
  arr.forEach((v,i)=>{
    const x=sx+i*(bw+gap);
    let col='#1e3058';
    if(found&&(i===found[0]||i===found[1]))col='#00e67644';
    else if(mode==='brute'){
      if(i===outerI&&i===innerJ)col='#ffc10733';
      else if(i===outerI)col='#00e5ff22';
      else if(i===innerJ)col='#ce93d822';
    } else {
      if(i===left)col='#00e5ff33';else if(i===right)col='#ff408133';
    }
    ctx.fillStyle=col;ctx.fillRect(x,baseY-v*1.1-8,bw,v*1.1+8);
    let fc='#8090b0';
    if(found&&(i===found[0]||i===found[1]))fc='#00e676';
    else if(mode==='brute'){if(i===outerI)fc='#00e5ff';else if(i===innerJ)fc='#ce93d8';}
    else{if(i===left)fc='#00e5ff';else if(i===right)fc='#ff4081';}
    ctx.fillStyle=fc;ctx.font='bold 11px Fira Code';ctx.textAlign='center';ctx.fillText(v,x+bw/2,baseY-v*1.1-12);
    ctx.fillStyle='#3a5080';ctx.font='9px Fira Code';ctx.fillText(i,x+bw/2,baseY+13);
  });
  // Pointer labels
  if(!found&&!noSol){
    if(mode==='brute'){
      if(outerI>=0){ctx.fillStyle='#00e5ff';ctx.font='bold 12px Fira Code';ctx.textAlign='center';ctx.fillText('i',sx+outerI*(bw+gap)+bw/2,baseY+28);}
      if(innerJ>=0){ctx.fillStyle='#ce93d8';ctx.font='bold 12px Fira Code';ctx.textAlign='center';ctx.fillText('j',sx+innerJ*(bw+gap)+bw/2,baseY+28);}
      if(outerI>=0&&innerJ>=0&&sum!==null){
        ctx.fillStyle=sum===target?'#00e676':'#5a7099';ctx.font='11px Fira Code';ctx.textAlign='left';
        ctx.fillText(`arr[i]+arr[j] = ${arr[outerI]}+${arr[innerJ]} = ${sum} ${sum===target?'== Target ✓':'≠ Target'}`,20,210);
      }
    } else {
      ctx.fillStyle='#00e5ff';ctx.font='bold 13px Fira Code';ctx.textAlign='center';ctx.fillText('L',sx+left*(bw+gap)+bw/2,baseY+28);
      ctx.fillStyle='#ff4081';ctx.fillText('R',sx+right*(bw+gap)+bw/2,baseY+28);
      if(sum!==null){
        ctx.fillStyle=sum===target?'#00e676':sum<target?'#ffc107':'#ff4081';
        ctx.font='11px Fira Code';ctx.textAlign='left';
        ctx.fillText(`arr[L]+arr[R] = ${sum}  →  ${sum<target?'< Target → L++':'> Target → R--'}`,20,210);
      }
    }
  }
  ctx.fillStyle='#cdd8f0';ctx.font='11px Fira Code';ctx.textAlign='left';
  ctx.fillText(`Target = ${target}  |  Sorted array`,20,22);
  if(mode==='brute'&&totalChecks!=null){
    ctx.fillStyle='#ff408188';ctx.font='10px Fira Code';ctx.textAlign='right';
    ctx.fillText(`Pairs checked: ${totalChecks} of ${(arr.length*(arr.length-1)/2)}`,685,22);
  }
  if(found){ctx.fillStyle='#00e676';ctx.font='bold 12px Fira Code';ctx.textAlign='left';ctx.fillText(`✓ Found: arr[${found[0]}]+arr[${found[1]}] = ${arr[found[0]]}+${arr[found[1]]} = ${target}`,20,210);}
  if(noSol){ctx.fillStyle='#ff4081';ctx.font='bold 13px Fira Code';ctx.textAlign='center';ctx.fillText(`✗ No pair sums to ${target}`,350,200);}
}

// ═══════════════════════════════════════════
// KADANE'S  — Brute O(n²)  +  Optimal O(n)
// ═══════════════════════════════════════════
function initKadane(){
  if(!state.extra._customKadane){
    const n=18;
    state.arr=Array.from({length:n},()=>Math.floor(Math.random()*21)-7);
    if(state.arr.every(v=>v<=0))state.arr[Math.floor(n/2)]=12;
  }
  const ap=state.extra.approach||'optimal';
  if(ap==='brute')genKadaneBruteSteps();else genKadaneSteps();
  renderKadane(state.steps[0]);
  setStatus('Ready — click ▶ Start');
}

// ── Brute: try every subarray [i..j] ──────────────────────────────────────────
function genKadaneBruteSteps(){
  const arr=state.arr,n=arr.length;const steps=[];
  let maxSum=-Infinity,maxStart=0,maxEnd=0,totalChecked=0;
  steps.push({mode:'brute',i:-1,j:-1,curSum:0,maxSum:arr[0],maxStart,maxEnd,done:false,totalChecked,code:[1,2]});
  for(let i=0;i<n;i++){
    let sum=0;
    for(let j=i;j<n;j++){
      sum+=arr[j];totalChecked++;
      if(sum>maxSum){maxSum=sum;maxStart=i;maxEnd=j;}
      steps.push({mode:'brute',i,j,curSum:sum,maxSum,maxStart,maxEnd,done:false,totalChecked,code:[4,5,6,7,8]});
    }
  }
  steps.push({mode:'brute',i:-1,j:-1,curSum:maxSum,maxSum,maxStart,maxEnd,done:true,totalChecked,code:[]});
  state.steps=steps;state.stepIdx=0;state.renderFn=fr=>renderKadane(fr);
}

// ── Optimal: Kadane's algorithm ────────────────────────────────────────────────
function genKadaneSteps(){
  const arr=state.arr,n=arr.length;const steps=[];
  let curSum=arr[0],maxSum=arr[0],tempStart=0,maxStart=0,maxEnd=0;
  steps.push({mode:'optimal',i:0,j:-1,curStart:0,curEnd:0,curSum,maxStart,maxEnd,maxSum,done:false,code:[1,2]});
  for(let i=1;i<n;i++){
    if(curSum+arr[i]<arr[i]){curSum=arr[i];tempStart=i;steps.push({mode:'optimal',i,j:-1,curStart:tempStart,curEnd:i,curSum,maxStart,maxEnd,maxSum,done:false,code:[4,5]});}
    else{curSum+=arr[i];steps.push({mode:'optimal',i,j:-1,curStart:tempStart,curEnd:i,curSum,maxStart,maxEnd,maxSum,done:false,code:[4,6]});}
    if(curSum>maxSum){maxSum=curSum;maxStart=tempStart;maxEnd=i;}
    steps.push({mode:'optimal',i,j:-1,curStart:tempStart,curEnd:i,curSum,maxStart,maxEnd,maxSum,done:false,code:[7,8,9]});
  }
  steps.push({mode:'optimal',i:n-1,j:-1,curStart:maxStart,curEnd:maxEnd,curSum,maxStart,maxEnd,maxSum,done:true,code:[10]});
  state.steps=steps;state.stepIdx=0;state.renderFn=fr=>renderKadane(fr);
}

function renderKadane(fr){
  const arr=state.arr;if(!arr||!arr.length)return;
  const{mode,i,j,curStart,curEnd,curSum,maxStart,maxEnd,maxSum,done,totalChecked}=fr;
  const cv=getCanvas(700,320);const ctx=cv.getContext('2d');
  ctx.fillStyle='#060b14';ctx.fillRect(0,0,cv.width,cv.height);
  const n=arr.length,bw=Math.max(18,Math.floor((640-n*3)/n)),gap=3,sx=Math.max(20,(700-(n*(bw+gap)))/2);
  const maxAbs=Math.max(...arr.map(Math.abs),1),scale=72/maxAbs,baseline=160;
  ctx.strokeStyle='#253d6a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(sx-4,baseline);ctx.lineTo(sx+n*(bw+gap)+4,baseline);ctx.stroke();
  arr.forEach((v,idx)=>{
    const x=sx+idx*(bw+gap),bh=Math.abs(v)*scale||2;
    const isMax=idx>=maxStart&&idx<=maxEnd;
    const isCur=(mode==='optimal')?(idx>=curStart&&idx<=curEnd):(idx>=Math.min(i,j)&&idx<=Math.max(i,j)&&i>=0&&j>=0);
    const isI=mode==='brute'&&idx===i&&!done;
    const isJ=mode==='brute'&&idx===j&&!done;
    const isOptI=mode==='optimal'&&idx===i&&!done;
    let col='#1e3058';
    if(done&&isMax)col='#00e676aa';
    else if(isJ)col='#ce93d8cc';
    else if(isOptI)col='#ffc107cc';
    else if(isCur&&isMax)col='rgba(0,230,118,0.35)';
    else if(isCur)col='rgba(0,229,255,0.28)';
    else if(isMax)col='rgba(255,193,7,0.18)';
    ctx.fillStyle=col;
    v>=0?ctx.fillRect(x,baseline-bh,bw,bh):ctx.fillRect(x,baseline,bw,bh);
    let fc=isJ?'#ce93d8':isOptI?'#ffc107':done&&isMax?'#00e676':isCur?'#00e5ff':'#5a7099';
    ctx.fillStyle=fc;ctx.font=`bold ${bw>=20?10:9}px Fira Code`;ctx.textAlign='center';
    ctx.fillText(v,x+bw/2,v>=0?baseline-bh-5:baseline+bh+12);
    ctx.fillStyle='#2a4070';ctx.font='8px Fira Code';ctx.fillText(idx,x+bw/2,baseline+18);
  });
  // Pointer indicators
  if(!done){
    if(mode==='brute'){
      if(i>=0){const ix=sx+i*(bw+gap)+bw/2;ctx.fillStyle='#00e5ff';ctx.font='bold 10px Fira Code';ctx.textAlign='center';ctx.fillText('i',ix,baseline+28);}
      if(j>=0){const jx=sx+j*(bw+gap)+bw/2;ctx.fillStyle='#ce93d8';ctx.font='bold 10px Fira Code';ctx.textAlign='center';ctx.fillText('j',jx,baseline+28);}
    } else if(i>=0){
      const ax=sx+i*(bw+gap)+bw/2;ctx.fillStyle='#ffc107';ctx.font='bold 11px Fira Code';ctx.textAlign='center';ctx.fillText('▲',ax,baseline+28);
    }
  }
  const totalSubs=n*(n+1)/2;
  if(!done){
    if(mode==='brute'){
      ctx.fillStyle='#ff408188';ctx.font='10px Fira Code';ctx.textAlign='right';
      ctx.fillText(`Subarrays checked: ${totalChecked||0} of ${totalSubs}`,685,240);
    }
    ctx.fillStyle='#00e5ff';ctx.font='11px Fira Code';ctx.textAlign='left';
    ctx.fillText(mode==='brute'?`[${i>=0?i:'?'}..${j>=0?j:'?'}]  sum=${curSum||0}`:`curSum=${curSum}  window[${curStart}..${curEnd}]`,28,242);
    ctx.fillStyle='#00e676';ctx.fillText(`maxSum=${maxSum}  best[${maxStart}..${maxEnd}]`,28,258);
  } else {
    ctx.fillStyle='#00e676';ctx.font='bold 13px Fira Code';ctx.textAlign='center';
    ctx.fillText(`✓ Max Subarray = [${maxStart}..${maxEnd}]  →  Sum = ${maxSum}`,350,242);
    ctx.fillStyle='#5a7099';ctx.font='10px Fira Code';
    ctx.fillText(`[ ${arr.slice(maxStart,maxEnd+1).join(', ')} ]`,350,260);
    if(mode==='brute'){ctx.fillStyle='#ff408166';ctx.font='10px Fira Code';ctx.fillText(`Checked all ${totalSubs} subarrays`,350,278);}
  }
  ctx.textBaseline='top';
  const leg=mode==='brute'
    ?[['#1e3058','Unvisited'],['#00e5ff88','i (outer)'],['#ce93d8cc','j (inner)'],['rgba(0,230,118,.6)','Max window']]
    :[['#1e3058','Unvisited'],['#ffc107cc','Current i'],['rgba(0,229,255,.5)','Cur window'],['rgba(0,230,118,.6)','Max window']];
  leg.forEach(([col,lbl],k)=>{ctx.fillStyle=col;ctx.fillRect(20+k*148,288,10,10);ctx.fillStyle='#5a7099';ctx.font='9px Fira Code';ctx.textAlign='left';ctx.fillText(lbl,34+k*148,288);});
}

// ═══════════════════════════════════════════
// BOYER-MOORE  — Brute O(n²)  +  Optimal O(n) O(1) space
// ═══════════════════════════════════════════
function initBoyerMoore(){
  if(!state.extra._customBM){
    const n=17;const mv=Math.floor(Math.random()*4)+1;const mc=Math.floor(n/2)+1;
    const arr=Array(mc).fill(mv);const oth=[1,2,3,4,5].filter(v=>v!==mv);
    while(arr.length<n)arr.push(oth[Math.floor(Math.random()*oth.length)]);
    for(let j=arr.length-1;j>0;j--){const k=Math.floor(Math.random()*(j+1));[arr[j],arr[k]]=[arr[k],arr[j]];}
    state.arr=arr;
  }
  const ap=state.extra.approach||'optimal';
  if(ap==='brute')genBMBruteSteps();else genBoyerMooreSteps();
  renderBoyerMoore(state.steps[0]);
  setStatus('Ready — click ▶ Start');
}

// ── Brute: count frequency of every element ───────────────────────────────────
function genBMBruteSteps(){
  const arr=state.arr,n=arr.length;const steps=[];
  let totalChecks=0;
  steps.push({mode:'brute',outerI:-1,innerJ:-1,countTarget:null,curCount:0,candidate:null,verified:null,phase:'init',totalChecks,code:[1]});
  for(let i=0;i<n;i++){
    let count=0;
    for(let j=0;j<n;j++){
      totalChecks++;
      if(arr[j]===arr[i])count++;
      steps.push({mode:'brute',outerI:i,innerJ:j,countTarget:arr[i],curCount:count,candidate:null,verified:null,phase:'count',totalChecks,code:[2,3,4,5]});
    }
    if(count>n/2){
      steps.push({mode:'brute',outerI:i,innerJ:-1,countTarget:arr[i],curCount:count,candidate:arr[i],verified:true,phase:'found',totalChecks,code:[6,7]});
      state.steps=steps;state.stepIdx=0;state.renderFn=fr=>renderBoyerMoore(fr);return;
    }
  }
  steps.push({mode:'brute',outerI:-1,innerJ:-1,countTarget:null,curCount:0,candidate:null,verified:false,phase:'none',totalChecks,code:[8]});
  state.steps=steps;state.stepIdx=0;state.renderFn=fr=>renderBoyerMoore(fr);
}

// ── Optimal: Boyer-Moore Voting ────────────────────────────────────────────────
function genBoyerMooreSteps(){
  const arr=state.arr,n=arr.length;const steps=[];
  let candidate=null,count=0;
  steps.push({mode:'optimal',phase:1,i:-1,candidate,count,verified:null,code:[1,2]});
  for(let i=0;i<n;i++){
    if(count===0){candidate=arr[i];count=1;steps.push({mode:'optimal',phase:1,i,candidate,count,verified:null,code:[3,4]});}
    else if(arr[i]===candidate){count++;steps.push({mode:'optimal',phase:1,i,candidate,count,verified:null,code:[5]});}
    else{count--;steps.push({mode:'optimal',phase:1,i,candidate,count,verified:null,code:[6]});}
  }
  const votes=arr.filter(x=>x===candidate).length,isMaj=votes>n/2;
  steps.push({mode:'optimal',phase:2,i:-1,candidate,count:votes,verified:isMaj,code:[8,9,isMaj?9:10]});
  state.steps=steps;state.stepIdx=0;state.renderFn=fr=>renderBoyerMoore(fr);
}

function renderBoyerMoore(fr){
  const arr=state.arr;if(!arr||!arr.length)return;
  const ca=document.getElementById('av-canvas');ca.innerHTML='';
  const wrap=document.createElement('div');wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:14px;width:100%;padding-top:14px;font-family:Fira Code;';

  if(fr.mode==='brute'){
    const{outerI,innerJ,countTarget,curCount,candidate,verified,phase,totalChecks}=fr;
    const n=arr.length;
    // Phase header
    const ph=document.createElement('div');ph.style.cssText='display:flex;gap:8px;align-items:center;';
    ph.innerHTML=phase==='found'
      ?`<span style="padding:4px 14px;border-radius:20px;font-size:10px;border:1px solid rgba(0,230,118,.4);background:rgba(0,230,118,.08);color:#00e676">✓ Majority Found</span><span style="font-size:10px;color:#5a7099">Checks: ${totalChecks}</span>`
      :phase==='none'
      ?`<span style="padding:4px 14px;border-radius:20px;font-size:10px;border:1px solid rgba(255,64,129,.3);background:rgba(255,64,129,.06);color:#ff4081">✗ No Majority</span><span style="font-size:10px;color:#5a7099">Checked all ${totalChecks} pairs</span>`
      :`<span style="padding:4px 14px;border-radius:20px;font-size:10px;border:1px solid #1e3058;color:#5a7099">Brute: counting occurrences of every element</span><span style="font-size:10px;color:#ff408188">Pairs checked: ${totalChecks}</span>`;
    wrap.appendChild(ph);
    // Tiles
    const tr=document.createElement('div');tr.style.cssText='display:flex;gap:5px;flex-wrap:wrap;justify-content:center;';
    arr.forEach((v,idx)=>{
      const t=document.createElement('div');let bg='#0d1526',bd='#1e3058',col='#5a7099';
      if(phase==='found'&&v===candidate){bg='rgba(0,230,118,.15)';bd='#00e676';col='#00e676';}
      else if(idx===outerI&&idx===innerJ){bg='rgba(255,193,7,.25)';bd='#ffc107';col='#ffc107';}
      else if(idx===outerI){bg='rgba(0,229,255,.15)';bd='#00e5ff';col='#00e5ff';}
      else if(idx===innerJ){bg='rgba(206,147,216,.12)';bd='#ce93d8';col='#ce93d8';}
      else if(outerI>=0&&idx<outerI){bg='rgba(13,21,38,.5)';bd='#172640';col='#3a5580';}
      t.style.cssText=`width:40px;height:40px;background:${bg};border:1px solid ${bd};border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:${col};`;
      t.textContent=v;tr.appendChild(t);
    });
    wrap.appendChild(tr);
    if(outerI>=0&&phase==='count'){
      const ir=document.createElement('div');ir.style.cssText='display:flex;gap:28px;align-items:center;justify-content:center;';
      const bx=(lbl,val,c)=>{const d=document.createElement('div');d.style.cssText='display:flex;flex-direction:column;align-items:center;gap:3px;';d.innerHTML=`<div style="font-size:9px;color:#5a7099;letter-spacing:2px;text-transform:uppercase">${lbl}</div><div style="font-size:28px;font-weight:700;color:${c};font-family:Fira Code">${val}</div>`;return d;};
      ir.appendChild(bx('Outer i',outerI,'#00e5ff'));ir.appendChild(bx('Inner j',innerJ>=0?innerJ:'—','#ce93d8'));ir.appendChild(bx(`Count(${countTarget})`,curCount,curCount>n/2?'#00e676':'#5a7099'));
      wrap.appendChild(ir);
      if(innerJ>=0){const ht=document.createElement('div');ht.style.cssText='font-size:10px;color:#5a7099;text-align:center;';ht.textContent=arr[innerJ]===countTarget?`arr[${innerJ}]=${arr[innerJ]} matches → count++`:`arr[${innerJ}]=${arr[innerJ]} ≠ ${countTarget} → skip`;wrap.appendChild(ht);}
    }
    if(phase==='found'){const r=document.createElement('div');r.style.cssText='font-size:14px;font-weight:700;color:#00e676;text-align:center;';r.innerHTML=`✓ Majority = <span style="color:#ffc107;font-size:22px">${candidate}</span> (${curCount}/${n} times)`;wrap.appendChild(r);}
  } else {
    // Optimal: Boyer-Moore visualization
    const{phase,i,candidate,count,verified}=fr;
    const pr=document.createElement('div');pr.style.cssText='display:flex;gap:10px;';
    ['Phase 1: Find Candidate','Phase 2: Verify'].forEach((lbl,pi)=>{
      const p=document.createElement('div');const active=pi+1===phase;
      p.style.cssText=`padding:4px 16px;border-radius:20px;font-size:10px;border:1px solid ${active?'rgba(0,229,255,.4)':'#1e3058'};background:${active?'rgba(0,229,255,.1)':'transparent'};color:${active?'#00e5ff':'#5a7099'};`;
      p.textContent=lbl;pr.appendChild(p);
    });
    wrap.appendChild(pr);
    const tr=document.createElement('div');tr.style.cssText='display:flex;gap:5px;flex-wrap:wrap;justify-content:center;';
    arr.forEach((v,idx)=>{
      const t=document.createElement('div');let bg='#0d1526',bd='#1e3058',col='#5a7099';
      if(verified!==null&&v===candidate){bg=verified?'rgba(0,230,118,.15)':'rgba(255,64,129,.1)';bd=verified?'#00e676':'#ff4081';col=verified?'#00e676':'#ff4081';}
      else if(idx===i&&phase===1){bg='rgba(255,193,7,.2)';bd='#ffc107';col='#ffc107';}
      else if(idx<i&&phase===1){bg='rgba(13,21,38,.6)';bd='#172640';col='#3a5580';}
      t.style.cssText=`width:42px;height:42px;background:${bg};border:1px solid ${bd};border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:${col};`;
      t.textContent=v;tr.appendChild(t);
    });
    wrap.appendChild(tr);
    if(phase===1&&i>=0){
      const ir=document.createElement('div');ir.style.cssText='display:flex;gap:32px;align-items:center;justify-content:center;';
      const bx=(lbl,val,c)=>{const d=document.createElement('div');d.style.cssText='display:flex;flex-direction:column;align-items:center;gap:4px;';d.innerHTML=`<div style="font-size:9px;color:#5a7099;letter-spacing:2px;text-transform:uppercase">${lbl}</div><div style="font-size:36px;font-weight:700;color:${c};font-family:Fira Code">${val}</div>`;return d;};
      ir.appendChild(bx('Candidate',candidate??'—','#00e5ff'));ir.appendChild(bx('Net Count',count,count>0?'#00e676':'#ff4081'));
      const mb=document.createElement('div');mb.style.cssText='display:flex;flex-direction:column;align-items:center;gap:6px;';
      mb.innerHTML=`<div style="font-size:9px;color:#5a7099;letter-spacing:2px;text-transform:uppercase">Vote Meter</div><div style="width:130px;height:12px;background:#0d1526;border:1px solid #1e3058;border-radius:3px;overflow:hidden;"><div style="height:100%;width:${Math.min(100,Math.max(0,count/Math.ceil(arr.length/2)*100))}%;background:${count>0?'#00e676':'#ff4081'};border-radius:2px;transition:width .25s;"></div></div>`;
      ir.appendChild(mb);wrap.appendChild(ir);
      const cur=arr[i];
      const ht=document.createElement('div');ht.style.cssText='font-size:10px;color:#5a7099;text-align:center;';
      if(count===1&&candidate===cur)ht.textContent=`count=0 → new candidate=${cur}`;
      else if(cur===candidate)ht.textContent=`arr[${i}]=${cur} matches candidate → count++`;
      else ht.textContent=`arr[${i}]=${cur} ≠ candidate(${candidate}) → count-- (cancellation!)`;
      wrap.appendChild(ht);
    } else if(phase===2){
      const r=document.createElement('div');r.style.cssText='text-align:center;';
      const b=document.createElement('div');b.style.cssText=`font-size:15px;font-weight:700;color:${verified?'#00e676':'#ff4081'};`;
      b.innerHTML=verified?`✓ Majority = <span style="color:#ffc107;font-size:24px">${candidate}</span> (${count}/${arr.length})`:`✗ No majority — ${candidate} only ${count}/${arr.length} (need > ${Math.floor(arr.length/2)})`;
      r.appendChild(b);wrap.appendChild(r);
    }
  }
  ca.appendChild(wrap);
}
