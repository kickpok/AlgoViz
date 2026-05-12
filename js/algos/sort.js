// ═══════════════════════════════════════════
// SORT  (Normal + Head-to-Head Compare)
// ═══════════════════════════════════════════
const COLORS={default:'#1e3058',comparing:'#ffc107',swapped:'#ff4081',sorted:'#00e676',pivot:'#ce93d8'};

// ─── Normal Mode ─────────────────────────────────────────────────────────────
function initSort(id){
  const n=Math.min(60,Math.max(5,+(document.getElementById('ctrl-size')||{value:30}).value||30));
  state.arr=Array.from({length:n},()=>Math.floor(Math.random()*90)+10);
  state.states=state.arr.map(()=>({color:COLORS.default}));
  state.steps=genSortSteps(id,[...state.arr]);state.stepIdx=0;
  state.renderFn=fr=>renderSort(fr.arr,fr.states,fr.comparisons||0,fr.swaps||0);
  renderSort(state.arr,state.states,0,0);setStatus('Ready');
}

function renderSort(arr,states,comparisons=0,swaps=0){
  const cv=getCanvas(700,262);
  const ctx=cv.getContext('2d');
  const n=arr.length,W=cv.width,H=cv.height,pad=14;
  const bw=Math.max(2,(W-2*pad)/n-2);
  ctx.fillStyle='#060b14';ctx.fillRect(0,0,W,H);
  const maxV=Math.max(...arr);
  arr.forEach((v,i)=>{
    const bh=(v/maxV)*(H-36),x=pad+i*(bw+2),y=H-bh-8;
    ctx.fillStyle=states[i].color;
    ctx.beginPath();ctx.roundRect(x,y,bw,bh,2);ctx.fill();
    if(n<=40&&bw>8){
      ctx.fillStyle='#fff';ctx.font=`bold ${bw>18?11:9}px Fira Code`;ctx.textAlign='center';
      if(bh>20)ctx.fillText(v,x+bw/2,y+13);else ctx.fillText(v,x+bw/2,y-4);
    }
  });
  // ── Live stats bar ──────────────────────────────────────────────────────────
  const sorted=states.filter(s=>s.color===COLORS.sorted).length;
  const statsBar=document.createElement('div');
  statsBar.style.cssText='display:flex;width:700px;max-width:100%;background:#0a1628;border:1px solid #1e3058;border-top:none;border-radius:0 0 8px 8px;overflow:hidden;flex-shrink:0;';
  [
    {icon:'⚖',label:'Comparisons',value:comparisons,color:'#ffc107'},
    {icon:'↕',label:'Swaps / Writes',value:swaps,color:'#ff4081'},
    {icon:'✓',label:'Sorted',value:`${sorted} / ${n}`,color:'#00e676'},
    {icon:'▣',label:'Array Size',value:n,color:'#00e5ff'},
  ].forEach(({icon,label,value,color},i,a)=>{
    const chip=document.createElement('div');
    chip.style.cssText=`flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:9px 4px;gap:3px;${i<a.length-1?'border-right:1px solid #1e3058;':''}`;
    chip.innerHTML=`<div style="font-size:8.5px;color:#5a7099;letter-spacing:.8px;font-family:Fira Code;text-transform:uppercase;white-space:nowrap">${icon} ${label}</div><div style="font-size:19px;font-weight:700;color:${color};font-family:Fira Code">${value}</div>`;
    statsBar.appendChild(chip);
  });
  document.getElementById('av-canvas').appendChild(statsBar);
}

// ─── Generators (each frame carries comparisons + swaps counts) ───────────────

function* bubbleSortGen(arr){
  const n=arr.length;const s=arr.map(()=>({color:COLORS.default}));
  let comparisons=0,swaps=0;
  for(let i=0;i<n;i++){
    let sw=false;
    for(let j=0;j<n-i-1;j++){
      s[j].color=COLORS.comparing;s[j+1].color=COLORS.comparing;comparisons++;
      yield{arr:[...arr],states:s.map(x=>({...x})),comparisons,swaps,code:[4,5]};
      if(arr[j]>arr[j+1]){
        [arr[j],arr[j+1]]=[arr[j+1],arr[j]];sw=true;swaps++;
        s[j].color=COLORS.swapped;s[j+1].color=COLORS.swapped;
        yield{arr:[...arr],states:s.map(x=>({...x})),comparisons,swaps,code:[6,7,8]};
      }
      s[j].color=COLORS.default;s[j+1].color=COLORS.default;
    }
    s[n-1-i].color=COLORS.sorted;if(!sw)break;
  }
  s.forEach(x=>x.color=COLORS.sorted);
  yield{arr:[...arr],states:s.map(x=>({...x})),comparisons,swaps,code:[]};
}

function* mergeSortGen(arr){
  const s=arr.map(()=>({color:COLORS.default}));
  let comparisons=0,swaps=0;
  function* ms(a,lo,hi){
    if(lo>=hi)return;
    const mid=Math.floor((lo+hi)/2);
    yield* ms(a,lo,mid);yield* ms(a,mid+1,hi);
    const L=a.slice(lo,mid+1),R=a.slice(mid+1,hi+1);
    let i=0,j=0,k=lo;
    while(i<L.length&&j<R.length){
      s[k].color=COLORS.comparing;comparisons++;
      if(L[i]<=R[j])a[k++]=L[i++];else a[k++]=R[j++];
      swaps++;
      yield{arr:[...a],states:s.map(x=>({...x})),comparisons,swaps,code:[9,10,11]};
      s[k-1].color=COLORS.sorted;
    }
    while(i<L.length){a[k++]=L[i++];swaps++;s[k-1].color=COLORS.sorted;yield{arr:[...a],states:s.map(x=>({...x})),comparisons,swaps,code:[12]};}
    while(j<R.length){a[k++]=R[j++];swaps++;s[k-1].color=COLORS.sorted;yield{arr:[...a],states:s.map(x=>({...x})),comparisons,swaps,code:[12]};}
  }
  yield* ms(arr,0,arr.length-1);
  s.forEach(x=>x.color=COLORS.sorted);
  yield{arr:[...arr],states:s.map(x=>({...x})),comparisons,swaps,code:[]};
}

function* quickSortGen(arr){
  const s=arr.map(()=>({color:COLORS.default}));
  let comparisons=0,swaps=0;
  function* qs(a,lo,hi){
    if(lo>=hi)return;
    s[hi].color=COLORS.pivot;
    yield{arr:[...a],states:s.map(x=>({...x})),comparisons,swaps,code:[7]};
    let i=lo-1;
    for(let j=lo;j<hi;j++){
      s[j].color=COLORS.comparing;comparisons++;
      yield{arr:[...a],states:s.map(x=>({...x})),comparisons,swaps,code:[9]};
      if(a[j]<=a[hi]){
        i++;[a[i],a[j]]=[a[j],a[i]];swaps++;
        s[i].color=COLORS.swapped;s[j].color=COLORS.swapped;
        yield{arr:[...a],states:s.map(x=>({...x})),comparisons,swaps,code:[10,11,12]};
      }
      if(s[j].color!==COLORS.sorted)s[j].color=COLORS.default;
      if(s[i]&&s[i].color!==COLORS.sorted)s[i].color=COLORS.default;
    }
    [a[i+1],a[hi]]=[a[hi],a[i+1]];swaps++;
    s[i+1].color=COLORS.sorted;s[hi].color=COLORS.default;
    yield{arr:[...a],states:s.map(x=>({...x})),comparisons,swaps,code:[13]};
    const p=i+1;yield* qs(a,lo,p-1);yield* qs(a,p+1,hi);
  }
  yield* qs(arr,0,arr.length-1);
  s.forEach(x=>x.color=COLORS.sorted);
  yield{arr:[...arr],states:s.map(x=>({...x})),comparisons,swaps,code:[]};
}

function* heapSortGen(arr){
  const n=arr.length;const s=arr.map(()=>({color:COLORS.default}));
  let comparisons=0,swaps=0;
  function* heapify(a,sz,i){
    let largest=i,l=2*i+1,r=2*i+2;
    s[i].color=COLORS.comparing;
    yield{arr:[...a],states:s.map(x=>({...x})),comparisons,swaps,code:[11]};
    if(l<sz&&a[l]>a[largest])largest=l;
    if(r<sz&&a[r]>a[largest])largest=r;
    comparisons++;
    if(largest!==i){
      [a[i],a[largest]]=[a[largest],a[i]];swaps++;
      s[i].color=COLORS.swapped;s[largest].color=COLORS.swapped;
      yield{arr:[...a],states:s.map(x=>({...x})),comparisons,swaps,code:[12,13]};
      s[i].color=COLORS.default;s[largest].color=COLORS.default;
      yield* heapify(a,sz,largest);
    } else s[i].color=COLORS.default;
  }
  for(let i=Math.floor(n/2)-1;i>=0;i--)yield* heapify(arr,n,i);
  for(let i=n-1;i>0;i--){
    [arr[0],arr[i]]=[arr[i],arr[0]];swaps++;
    s[i].color=COLORS.sorted;
    yield{arr:[...arr],states:s.map(x=>({...x})),comparisons,swaps,code:[5,6]};
    yield* heapify(arr,i,0);
  }
  s[0].color=COLORS.sorted;
  yield{arr:[...arr],states:s.map(x=>({...x})),comparisons,swaps,code:[]};
}

function genSortSteps(id,arr){
  const gen=id==='bubble'?bubbleSortGen(arr):id==='merge'?mergeSortGen(arr):id==='quick'?quickSortGen(arr):heapSortGen(arr);
  const steps=[];let r=gen.next();while(!r.done){steps.push(r.value);r=gen.next();}return steps;
}

// ═══════════════════════════════════════════
// COMPARE MODE — dedicated section
// ═══════════════════════════════════════════
const _CMP_META={
  bubble:{name:'Bubble Sort',color:'#ffc107',swLabel:'Swaps'},
  merge: {name:'Merge Sort', color:'#00e5ff',swLabel:'Writes'},
  quick: {name:'Quick Sort', color:'#ce93d8',swLabel:'Swaps'},
  heap:  {name:'Heap Sort',  color:'#00e676',swLabel:'Swaps'},
};
const _CMP_ORDER=['bubble','merge','quick','heap'];

function _cmpToggleAlgo(id){
  const btn=document.getElementById(`cmp-tog-${id}`);
  if(!btn)return;
  // Don't allow fewer than 2 selected
  const active=_CMP_ORDER.filter(a=>document.getElementById(`cmp-tog-${a}`)?.classList.contains('active'));
  if(btn.classList.contains('active')&&active.length<=2)return;
  btn.classList.toggle('active');
}

function _cmpSelected(){
  return _CMP_ORDER.filter(id=>document.getElementById(`cmp-tog-${id}`)?.classList.contains('active'));
}

// ── Init: build layout and pre-generate steps (no animation yet) ─────────────
function initSortCompare(){
  const algos=_cmpSelected();
  if(algos.length<2){setStatus('Select ≥ 2 algorithms',false,true);return;}

  const n=Math.min(60,Math.max(5,+(document.getElementById('ctrl-cmp-size')||{value:30}).value||30));
  const base=state.extra.cmpCustomArr||Array.from({length:n},()=>Math.floor(Math.random()*90)+10);
  state.extra.cmpArr=[...base];
  state.extra.cmpAlgos=[...algos];

  state.extra.cmpData={};
  algos.forEach(id=>{
    const steps=genSortSteps(id,[...base]);
    state.extra.cmpData[id]={steps,idx:0,done:false,total:steps.length};
  });

  _buildCmpLayout(algos,base);
  setStatus(`${algos.length} algorithms · ${base.length} elements · click ▶ Race!`);
}

// ── DOM grid ──────────────────────────────────────────────────────────────────
function _buildCmpLayout(algos,arr){
  const ca=document.getElementById('av-canvas');
  ca.innerHTML='';
  ca.style.cssText='display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;padding:12px;overflow-y:auto;background:var(--surface);';

  const cols=algos.length<=2?algos.length:2;
  const cvH=algos.length<=2?195:130;

  const grid=document.createElement('div');
  grid.id='cmp-grid';
  grid.style.cssText=`display:grid;grid-template-columns:repeat(${cols},1fr);gap:10px;width:100%;`;
  ca.appendChild(grid);

  // Leaderboard placeholder
  const lb=document.createElement('div');
  lb.id='cmp-leaderboard';
  lb.style.cssText='width:100%;margin-top:14px;display:none;';
  ca.appendChild(lb);

  algos.forEach(id=>{
    const m=_CMP_META[id];
    const panel=document.createElement('div');
    panel.id=`cmp-panel-${id}`;
    panel.style.cssText='display:flex;flex-direction:column;background:#060b14;border:1px solid #1e3058;border-radius:8px;overflow:hidden;';

    // Header with inline progress bar
    const ph=document.createElement('div');
    ph.style.cssText=`display:flex;align-items:center;gap:8px;padding:7px 12px;background:#0a1628;border-bottom:1px solid #1e3058;`;
    ph.innerHTML=`
      <span style="font-family:Fira Code;font-size:11px;font-weight:700;color:${m.color};white-space:nowrap;">${m.name}</span>
      <div style="flex:1;height:3px;background:#1e3058;border-radius:2px;overflow:hidden;">
        <div id="cmp-pbar-${id}" style="height:100%;width:0%;background:${m.color};border-radius:2px;transition:width .08s linear;"></div>
      </div>
      <span id="cmp-prog-${id}" style="font-size:9px;color:#5a7099;font-family:Fira Code;min-width:32px;text-align:right;">—</span>
    `;

    const cv=document.createElement('canvas');
    cv.id=`cmp-cv-${id}`;cv.width=330;cv.height=cvH;
    cv.style.cssText='display:block;width:100%;background:#060b14;';

    // 4-stat strip
    const sr=document.createElement('div');
    sr.style.cssText='display:flex;border-top:1px solid #1e3058;background:#0a1628;';
    [
      {key:'cmp',label:'Comparisons',color:'#ffc107'},
      {key:'swp',label:m.swLabel,color:'#ff4081'},
      {key:'pct',label:'Sorted',color:'#00e676'},
      {key:'steps',label:'Steps',color:'#00e5ff'},
    ].forEach(({key,label,color},i)=>{
      const chip=document.createElement('div');
      chip.style.cssText=`flex:1;display:flex;flex-direction:column;align-items:center;padding:6px 2px;gap:1px;${i<3?'border-right:1px solid #1e3058;':''}`;
      chip.innerHTML=`
        <div style="font-size:7.5px;color:#5a7099;font-family:Fira Code;letter-spacing:.4px;white-space:nowrap;text-transform:uppercase;">${label}</div>
        <div id="cmp-${id}-${key}" style="font-size:13px;font-weight:700;color:${color};font-family:Fira Code;">0</div>
      `;
      sr.appendChild(chip);
    });

    panel.appendChild(ph);panel.appendChild(cv);panel.appendChild(sr);
    grid.appendChild(panel);
    _cmpDraw(id,[...arr],arr.map(()=>({color:COLORS.default})));
  });
}

// ── Race animation ─────────────────────────────────────────────────────────────
function runSortCompare(){
  if(!state.extra.cmpData)return;
  state.running=true;
  setStatus('Racing…',true);
  _cmpTick();
}

function _cmpTick(){
  if(!state.extra.cmpData||!state.running)return;
  const algos=state.extra.cmpAlgos||[];
  let allDone=true;

  algos.forEach(id=>{
    const d=state.extra.cmpData[id];
    if(!d||d.done)return;
    if(d.idx>=d.steps.length){
      d.done=true;
      const last=d.steps[d.steps.length-1];
      _cmpDraw(id,last.arr,last.states);
      _cmpStat(id,last.comparisons||0,last.swaps||0,last.arr.length,last.arr.length,d.total);
      const p=document.getElementById(`cmp-prog-${id}`);
      if(p)p.innerHTML=`<span style="color:#00e676;font-weight:700">✓</span>`;
      const b=document.getElementById(`cmp-pbar-${id}`);
      if(b)b.style.width='100%';
      return;
    }
    allDone=false;
    const fr=d.steps[d.idx++];
    _cmpDraw(id,fr.arr,fr.states);
    _cmpStat(id,fr.comparisons||0,fr.swaps||0,fr.states.filter(s=>s.color===COLORS.sorted).length,fr.arr.length,d.total);
    const pct=Math.round((d.idx/d.total)*100);
    const p=document.getElementById(`cmp-prog-${id}`);
    const b=document.getElementById(`cmp-pbar-${id}`);
    if(p)p.textContent=`${pct}%`;
    if(b)b.style.width=`${pct}%`;
  });

  if(allDone){_cmpLeaderboard();return;}
  state.timer=setTimeout(_cmpTick,Math.max(4,68-state.speed*6));
}

function _cmpDraw(id,arr,states){
  const cv=document.getElementById(`cmp-cv-${id}`);if(!cv)return;
  const ctx=cv.getContext('2d');
  const n=arr.length,W=cv.width,H=cv.height,pad=6;
  const bw=Math.max(1.5,(W-2*pad)/n-1.5);
  ctx.fillStyle='#060b14';ctx.fillRect(0,0,W,H);
  const maxV=Math.max(...arr)||1;
  arr.forEach((v,i)=>{
    const bh=Math.max(2,(v/maxV)*(H-8)),x=pad+i*(bw+1.5),y=H-bh-3;
    ctx.fillStyle=states[i].color;
    ctx.beginPath();ctx.roundRect(x,y,bw,bh,1);ctx.fill();
  });
}

function _cmpStat(id,cmp,swp,sorted,total,steps){
  const g=k=>document.getElementById(`cmp-${id}-${k}`);
  if(g('cmp'))g('cmp').textContent=cmp.toLocaleString();
  if(g('swp'))g('swp').textContent=swp.toLocaleString();
  if(g('pct'))g('pct').textContent=`${sorted}/${total}`;
  if(g('steps'))g('steps').textContent=(steps||0).toLocaleString();
}

// ── Leaderboard ────────────────────────────────────────────────────────────────
function _cmpLeaderboard(){
  state.running=false;_restoreStartBtn();
  setStatus('Done ✓');
  const lb=document.getElementById('cmp-leaderboard');if(!lb)return;

  const algos=state.extra.cmpAlgos||[];
  const results=algos.map(id=>{
    const d=state.extra.cmpData[id];
    const last=d.steps[d.steps.length-1];
    return{id,..._CMP_META[id],comparisons:last.comparisons||0,swaps:last.swaps||0,steps:d.total};
  }).sort((a,b)=>a.comparisons-b.comparisons);

  const medals=['🥇','🥈','🥉','🏅'];
  const podBg=[
    'linear-gradient(145deg,rgba(255,193,7,.13),rgba(255,193,7,.04))',
    'linear-gradient(145deg,rgba(200,200,220,.07),rgba(200,200,220,.02))',
    'linear-gradient(145deg,rgba(180,100,50,.1),rgba(180,100,50,.02))',
    'rgba(10,22,40,.8)',
  ];
  const podBorder=['rgba(255,193,7,.4)','rgba(200,200,220,.18)','rgba(180,100,50,.28)','#1e3058'];

  lb.style.display='block';
  lb.innerHTML=`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
      <div style="height:1px;flex:1;background:linear-gradient(90deg,transparent,#1e3058)"></div>
      <span style="font-size:9px;letter-spacing:2px;color:#5a7099;font-family:Fira Code;text-transform:uppercase;white-space:nowrap">🏁 Final Standings</span>
      <div style="height:1px;flex:1;background:linear-gradient(90deg,#1e3058,transparent)"></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(${results.length},1fr);gap:8px;">
      ${results.map((r,i)=>`
        <div style="background:${podBg[Math.min(i,3)]};border:1px solid ${podBorder[Math.min(i,3)]};border-radius:8px;padding:14px 10px 12px;text-align:center;font-family:Fira Code;">
          <div style="font-size:26px;margin-bottom:6px">${medals[Math.min(i,3)]}</div>
          <div style="font-size:11px;font-weight:700;color:${r.color};margin-bottom:10px;">${r.name}</div>
          <div style="display:flex;flex-direction:column;gap:5px;">
            <div style="display:flex;justify-content:space-between;font-size:10px;padding:0 4px;"><span style="color:#5a7099">⚖ comparisons</span><span style="color:#ffc107;font-weight:700">${r.comparisons.toLocaleString()}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:10px;padding:0 4px;"><span style="color:#5a7099">↕ ${r.swLabel.toLowerCase()}</span><span style="color:#ff4081;font-weight:700">${r.swaps.toLocaleString()}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:10px;padding:0 4px;"><span style="color:#5a7099">⏱ steps</span><span style="color:#00e5ff;font-weight:700">${r.steps.toLocaleString()}</span></div>
          </div>
        </div>
      `).join('')}
    </div>
    <div style="margin-top:8px;font-size:9px;color:#2a4060;font-family:Fira Code;text-align:right;">★ Ranked by fewest comparisons — shuffle for a different race</div>
  `;
}
