// ═══════════════════════════════════════════
// SLIDING WINDOW
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
  state.extra={k,curSum:initSum,maxSum:initSum,maxWin:[0,k-1],_customSW:state.extra._customSW};
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
// TWO POINTER
// ═══════════════════════════════════════════
function initArrayTP(){
  if(!state.extra._customTP){
    const n=16;
    state.arr=Array.from({length:n},()=>Math.floor(Math.random()*40)+1).sort((a,b)=>a-b);
  }
  const arr=state.arr;
  const tEl=document.getElementById('ctrl-tp-target');
  let target;
  if(tEl&&tEl.value.trim()!=='') target=+tEl.value;
  else if(state.extra._customTarget!=null) target=state.extra._customTarget;
  else target=arr[Math.floor(arr.length*0.3)]+arr[Math.floor(arr.length*0.7)]+Math.floor(Math.random()*3);
  const customFlags={_customTP:state.extra._customTP,_customTarget:state.extra._customTarget};
  state.extra={target,left:0,right:arr.length-1,found:null,...customFlags};
  state.steps=[];state.stepIdx=0;
  genTPSteps();
  renderArrayTP(0,arr.length-1,null,false);
  setStatus('Ready — click ▶ Start');
}
function genTPSteps(){
  const arr=state.arr,{target}=state.extra;
  const steps=[];let left=0,right=arr.length-1;
  while(left<right){
    const sum=arr[left]+arr[right];
    if(sum===target){steps.push({left,right,found:[left,right],noSol:false,code:[3,4,5]});state.steps=steps;state.stepIdx=0;
      state.renderFn=fr=>renderArrayTP(fr.left,fr.right,fr.found,fr.noSol);return;}
    else if(sum<target){steps.push({left,right,found:null,noSol:false,code:[5,6]});left++;}
    else{steps.push({left,right,found:null,noSol:false,code:[5,7]});right--;}
  }
  steps.push({left,right,found:null,noSol:true,code:[]});
  state.steps=steps;state.stepIdx=0;
  state.renderFn=fr=>renderArrayTP(fr.left,fr.right,fr.found,fr.noSol);
}
function renderArrayTP(left,right,found,noSol){
  const arr=state.arr,{target}=state.extra;
  const cv=getCanvas(700,240);const ctx=cv.getContext('2d');
  ctx.fillStyle='#060b14';ctx.fillRect(0,0,cv.width,cv.height);
  const bw=30,gap=4,sx=22,baseY=158;
  arr.forEach((v,i)=>{
    const x=sx+i*(bw+gap);
    let col='#1e3058';
    if(found&&(i===found[0]||i===found[1]))col='#00e67644';
    else if(i===left)col='#00e5ff33';
    else if(i===right)col='#ff408133';
    ctx.fillStyle=col;ctx.fillRect(x,baseY-v*1.1-8,bw,v*1.1+8);
    ctx.fillStyle=(i===left)?'#00e5ff':(i===right)?'#ff4081':'#8090b0';
    ctx.font='bold 11px Fira Code';ctx.textAlign='center';ctx.fillText(v,x+bw/2,baseY-v*1.1-12);
    ctx.fillStyle='#3a5080';ctx.font='9px Fira Code';ctx.fillText(i,x+bw/2,baseY+13);
  });
  if(!found&&!noSol){
    const lx=sx+left*(bw+gap)+bw/2,rx=sx+right*(bw+gap)+bw/2;
    ctx.fillStyle='#00e5ff';ctx.font='bold 13px Fira Code';ctx.textAlign='center';ctx.fillText('L',lx,baseY+28);
    ctx.fillStyle='#ff4081';ctx.fillText('R',rx,baseY+28);
    const sum=arr[left]+arr[right];
    ctx.fillStyle=sum===target?'#00e676':sum<target?'#ffc107':'#ff4081';
    ctx.font='11px Fira Code';ctx.textAlign='left';
    ctx.fillText(`arr[L]+arr[R] = ${sum}  →  ${sum===target?'== Target ✓':sum<target?'< Target → L++':'> Target → R--'}`,20,205);
  }
  ctx.fillStyle='#cdd8f0';ctx.font='11px Fira Code';ctx.textAlign='left';ctx.fillText(`Target = ${target}  |  Sorted array`,20,24);
  if(found)ctx.fillStyle='#00e676',ctx.font='bold 12px Fira Code',ctx.fillText(`✓ Pair found: [${found[0]}]+[${found[1]}] → ${arr[found[0]]} + ${arr[found[1]]} = ${target}`,20,205);
  if(noSol){ctx.fillStyle='#ff4081';ctx.font='bold 13px Fira Code';ctx.textAlign='center';ctx.fillText(`✗ No pair sums to ${target} in this array`,350,195);ctx.font='10px Fira Code';ctx.fillStyle='#5a7099';ctx.fillText('Try Custom Input to set a different target',350,215);}
}

// ═══════════════════════════════════════════
// KADANE'S ALGORITHM
// ═══════════════════════════════════════════
function initKadane(){
  if(!state.extra._customKadane){
    const n=18;
    state.arr=Array.from({length:n},()=>Math.floor(Math.random()*21)-7);
    if(state.arr.every(v=>v<=0))state.arr[Math.floor(n/2)]=12;
  }
  genKadaneSteps();
  renderKadane(state.steps[0]);
  setStatus('Ready — click ▶ Start');
}
function genKadaneSteps(){
  const arr=state.arr,n=arr.length;const steps=[];
  let curSum=arr[0],maxSum=arr[0],tempStart=0,maxStart=0,maxEnd=0;
  steps.push({i:0,curStart:0,curEnd:0,curSum,maxStart,maxEnd,maxSum,done:false,code:[1,2]});
  for(let i=1;i<n;i++){
    if(curSum+arr[i]<arr[i]){
      curSum=arr[i];tempStart=i;
      steps.push({i,curStart:tempStart,curEnd:i,curSum,maxStart,maxEnd,maxSum,done:false,code:[4,5]});
    } else {
      curSum+=arr[i];
      steps.push({i,curStart:tempStart,curEnd:i,curSum,maxStart,maxEnd,maxSum,done:false,code:[4,6]});
    }
    if(curSum>maxSum){maxSum=curSum;maxStart=tempStart;maxEnd=i;}
    steps.push({i,curStart:tempStart,curEnd:i,curSum,maxStart,maxEnd,maxSum,done:false,code:[7,8,9]});
  }
  steps.push({i:n-1,curStart:maxStart,curEnd:maxEnd,curSum,maxStart,maxEnd,maxSum,done:true,code:[10]});
  state.steps=steps;state.stepIdx=0;
  state.renderFn=fr=>renderKadane(fr);
}
function renderKadane(fr){
  const arr=state.arr;if(!arr||!arr.length)return;
  const{i,curStart,curEnd,curSum,maxStart,maxEnd,maxSum,done}=fr;
  const cv=getCanvas(700,310);const ctx=cv.getContext('2d');
  ctx.fillStyle='#060b14';ctx.fillRect(0,0,cv.width,cv.height);
  const n=arr.length,bw=Math.max(18,Math.floor((640-n*3)/n)),gap=3,sx=Math.max(20,(700-(n*(bw+gap)))/2);
  const maxAbs=Math.max(...arr.map(Math.abs),1);
  const scale=72/maxAbs;
  const baseline=155;
  ctx.strokeStyle='#253d6a';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(sx-4,baseline);ctx.lineTo(sx+n*(bw+gap)+4,baseline);ctx.stroke();
  arr.forEach((v,idx)=>{
    const x=sx+idx*(bw+gap);
    const bh=Math.abs(v)*scale||2;
    const isMax=idx>=maxStart&&idx<=maxEnd;
    const isCur=idx>=curStart&&idx<=curEnd;
    const isActive=idx===i&&!done;
    let col='#1e3058';
    if(done&&isMax)col='#00e676aa';
    else if(isActive)col='#ffc107cc';
    else if(isCur&&isMax)col='rgba(0,230,118,0.35)';
    else if(isCur)col='rgba(0,229,255,0.28)';
    else if(isMax)col='rgba(255,193,7,0.18)';
    ctx.fillStyle=col;
    v>=0?ctx.fillRect(x,baseline-bh,bw,bh):ctx.fillRect(x,baseline,bw,bh);
    ctx.fillStyle=isActive?'#ffc107':done&&isMax?'#00e676':isCur?'#00e5ff':'#5a7099';
    ctx.font=`bold ${bw>=20?10:9}px Fira Code`;ctx.textAlign='center';
    ctx.fillText(v,x+bw/2,v>=0?baseline-bh-5:baseline+bh+12);
    ctx.fillStyle='#2a4070';ctx.font='8px Fira Code';
    ctx.fillText(idx,x+bw/2,baseline+18);
  });
  if(!done&&i>=0){
    const ax=sx+i*(bw+gap)+bw/2;
    ctx.fillStyle='#ffc107';ctx.font='bold 11px Fira Code';ctx.textAlign='center';
    ctx.fillText('▲',ax,baseline+28);
  }
  if(!done){
    ctx.fillStyle='#00e5ff';ctx.font='11px Fira Code';ctx.textAlign='left';
    ctx.fillText(`curSum = ${curSum}   window [${curStart}..${curEnd}]`,28,230);
    ctx.fillStyle='#00e676';
    ctx.fillText(`maxSum = ${maxSum}   best window [${maxStart}..${maxEnd}]`,28,248);
  } else {
    ctx.fillStyle='#00e676';ctx.font='bold 13px Fira Code';ctx.textAlign='center';
    ctx.fillText(`✓ Max Subarray = [${maxStart}..${maxEnd}]  →  Sum = ${maxSum}`,350,232);
    ctx.fillStyle='#5a7099';ctx.font='10px Fira Code';
    ctx.fillText(`Elements: [ ${arr.slice(maxStart,maxEnd+1).join(', ')} ]`,350,251);
  }
  ctx.textBaseline='top';
  [['#1e3058','Unvisited'],['#ffc107cc','Current i'],['rgba(0,229,255,0.5)','Cur window'],['rgba(0,230,118,0.6)','Max window']].forEach(([col,lbl],k)=>{
    ctx.fillStyle=col;ctx.fillRect(20+k*148,277,10,10);
    ctx.fillStyle='#5a7099';ctx.font='9px Fira Code';ctx.textAlign='left';ctx.fillText(lbl,34+k*148,277);
  });
}

// ═══════════════════════════════════════════
// BOYER-MOORE VOTING ALGORITHM
// ═══════════════════════════════════════════
function initBoyerMoore(){
  if(!state.extra._customBM){
    const n=17;const majorityVal=Math.floor(Math.random()*4)+1;
    const majorityCount=Math.floor(n/2)+1;
    const arr=Array(majorityCount).fill(majorityVal);
    const others=[1,2,3,4,5].filter(v=>v!==majorityVal);
    while(arr.length<n)arr.push(others[Math.floor(Math.random()*others.length)]);
    for(let j=arr.length-1;j>0;j--){const k=Math.floor(Math.random()*(j+1));[arr[j],arr[k]]=[arr[k],arr[j]];}
    state.arr=arr;
  }
  genBoyerMooreSteps();
  renderBoyerMoore(state.steps[0]);
  setStatus('Ready — click ▶ Start');
}
function genBoyerMooreSteps(){
  const arr=state.arr,n=arr.length;const steps=[];
  let candidate=null,count=0;
  steps.push({phase:1,i:-1,candidate,count,verified:null,code:[1,2]});
  for(let i=0;i<n;i++){
    if(count===0){candidate=arr[i];count=1;steps.push({phase:1,i,candidate,count,verified:null,code:[3,4]});}
    else if(arr[i]===candidate){count++;steps.push({phase:1,i,candidate,count,verified:null,code:[5]});}
    else{count--;steps.push({phase:1,i,candidate,count,verified:null,code:[6]});}
  }
  const votes=arr.filter(x=>x===candidate).length;
  const isMajority=votes>n/2;
  steps.push({phase:2,i:-1,candidate,count:votes,verified:isMajority,code:[8,9,isMajority?9:10]});
  state.steps=steps;state.stepIdx=0;
  state.renderFn=fr=>renderBoyerMoore(fr);
}
function renderBoyerMoore(fr){
  const arr=state.arr;if(!arr||!arr.length)return;
  const{phase,i,candidate,count,verified}=fr;
  const ca=document.getElementById('av-canvas');ca.innerHTML='';
  const wrap=document.createElement('div');wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:14px;width:100%;padding-top:14px;font-family:Fira Code;';
  const phaseRow=document.createElement('div');phaseRow.style.cssText='display:flex;gap:10px;';
  ['Phase 1: Find Candidate','Phase 2: Verify'].forEach((lbl,pi)=>{
    const p=document.createElement('div');const active=pi+1===phase;
    p.style.cssText=`padding:4px 16px;border-radius:20px;font-size:10px;border:1px solid ${active?'rgba(0,229,255,.4)':'#1e3058'};background:${active?'rgba(0,229,255,.1)':'transparent'};color:${active?'#00e5ff':'#5a7099'};letter-spacing:.5px;`;
    p.textContent=lbl;phaseRow.appendChild(p);
  });
  wrap.appendChild(phaseRow);
  const tilesRow=document.createElement('div');tilesRow.style.cssText='display:flex;gap:5px;flex-wrap:wrap;justify-content:center;';
  arr.forEach((v,idx)=>{
    const tile=document.createElement('div');
    let bg='#0d1526',border='#1e3058',col='#5a7099';
    if(verified!==null){
      if(v===candidate){bg=verified?'rgba(0,230,118,.15)':'rgba(255,64,129,.1)';border=verified?'#00e676':'#ff4081';col=verified?'#00e676':'#ff4081';}
    } else if(idx===i&&phase===1){bg='rgba(255,193,7,.2)';border='#ffc107';col='#ffc107';}
    else if(idx<i&&phase===1){bg='rgba(13,21,38,.6)';border='#172640';col='#3a5580';}
    tile.style.cssText=`width:42px;height:42px;background:${bg};border:1px solid ${border};border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:${col};position:relative;transition:all .18s;`;
    tile.textContent=v;
    if(idx===i&&phase===1){const dot=document.createElement('div');dot.style.cssText='position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:5px;height:5px;background:#ffc107;border-radius:50%;';tile.appendChild(dot);}
    tilesRow.appendChild(tile);
  });
  wrap.appendChild(tilesRow);
  if(phase===1&&i>=0){
    const infoRow=document.createElement('div');infoRow.style.cssText='display:flex;gap:32px;align-items:center;justify-content:center;margin-top:4px;';
    const candBox=document.createElement('div');candBox.style.cssText='display:flex;flex-direction:column;align-items:center;gap:4px;';
    const cLbl=document.createElement('div');cLbl.style.cssText='font-size:9px;color:#5a7099;letter-spacing:2px;text-transform:uppercase;';cLbl.textContent='Candidate';
    const cVal=document.createElement('div');cVal.style.cssText='font-size:40px;font-weight:700;color:#00e5ff;';cVal.textContent=candidate??'—';
    candBox.appendChild(cLbl);candBox.appendChild(cVal);
    const cntBox=document.createElement('div');cntBox.style.cssText='display:flex;flex-direction:column;align-items:center;gap:4px;';
    const ctLbl=document.createElement('div');ctLbl.style.cssText='font-size:9px;color:#5a7099;letter-spacing:2px;text-transform:uppercase;';ctLbl.textContent='Net Count';
    const ctVal=document.createElement('div');ctVal.style.cssText=`font-size:40px;font-weight:700;color:${count>0?'#00e676':'#ff4081'};`;ctVal.textContent=count;
    cntBox.appendChild(ctLbl);cntBox.appendChild(ctVal);
    const meterBox=document.createElement('div');meterBox.style.cssText='display:flex;flex-direction:column;align-items:center;gap:6px;';
    const mLbl=document.createElement('div');mLbl.style.cssText='font-size:9px;color:#5a7099;letter-spacing:2px;text-transform:uppercase;';mLbl.textContent='Vote Meter';
    const mOuter=document.createElement('div');mOuter.style.cssText='width:130px;height:12px;background:#0d1526;border:1px solid #1e3058;border-radius:3px;overflow:hidden;';
    const maxPossible=Math.ceil(arr.length/2)+1;
    const pct=Math.min(100,Math.max(0,count/maxPossible*100));
    const mInner=document.createElement('div');mInner.style.cssText=`height:100%;width:${pct}%;background:${count>0?'#00e676':'#ff4081'};border-radius:2px;transition:width .25s;`;
    mOuter.appendChild(mInner);meterBox.appendChild(mLbl);meterBox.appendChild(mOuter);
    infoRow.appendChild(candBox);infoRow.appendChild(cntBox);infoRow.appendChild(meterBox);
    wrap.appendChild(infoRow);
    const hint=document.createElement('div');hint.style.cssText='font-size:10px;color:#5a7099;text-align:center;';
    const cur=arr[i];
    if(count===1&&candidate===cur)hint.textContent=`count was 0 → new candidate = ${cur}, count = 1`;
    else if(cur===candidate)hint.textContent=`arr[${i}] = ${cur} matches candidate → count++`;
    else hint.textContent=`arr[${i}] = ${cur} ≠ candidate (${candidate}) → count--`;
    wrap.appendChild(hint);
  } else if(phase===2){
    const votes=arr.filter(x=>x===candidate).length;
    const result=document.createElement('div');result.style.cssText='text-align:center;';
    const big=document.createElement('div');big.style.cssText=`font-size:15px;font-weight:700;color:${verified?'#00e676':'#ff4081'};`;
    if(verified)big.innerHTML=`✓ Majority Element = <span style="color:#ffc107;font-size:24px">${candidate}</span>  (appears ${votes} / ${arr.length} times)`;
    else big.innerHTML=`✗ No majority — candidate <span style="color:#ffc107">${candidate}</span> appears only ${votes} / ${arr.length} times (need > ${Math.floor(arr.length/2)})`;
    result.appendChild(big);wrap.appendChild(result);
  }
  ca.appendChild(wrap);
}
