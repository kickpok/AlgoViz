// ═══════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════
function buildSidebar(){
  const icons=document.getElementById('sb-icons');
  const list=document.getElementById('sb-list');
  CATS.forEach(cat=>{
    const allItems=Object.entries(ALGOS).filter(([,a])=>a.cat===cat.key);
    if(!allItems.length) return;
    const pill=document.createElement('div');
    pill.className='cat-icon-pill';pill.title=cat.key;pill.textContent=cat.icon;
    icons.appendChild(pill);
    const ch=document.createElement('div');ch.className='cat-header';
    ch.innerHTML=`${cat.icon} ${cat.key}`;list.appendChild(ch);
    if(cat.subcats){
      cat.subcats.forEach(subcat=>{
        const subitems=Object.entries(ALGOS).filter(([,a])=>a.cat===cat.key&&a.subcat===subcat);
        if(!subitems.length) return;
        const sh=document.createElement('div');sh.className='subcat-header';sh.textContent=subcat;list.appendChild(sh);
        subitems.forEach(([id,a])=>{
          const el=document.createElement('div');el.className='algo-item subcat-item';el.id='si-'+id;
          el.innerHTML=`<div class="dot"></div>${a.name}`;
          el.onclick=()=>loadAlgo(id);list.appendChild(el);
        });
      });
    } else {
      allItems.forEach(([id,a])=>{
        const el=document.createElement('div');el.className='algo-item';el.id='si-'+id;
        el.innerHTML=`<div class="dot"></div>${a.name}`;
        el.onclick=()=>loadAlgo(id);list.appendChild(el);
      });
    }
    const div=document.createElement('div');div.className='cat-divider';list.appendChild(div);
  });
}

// ═══════════════════════════════════════════
// LOAD ALGO
// ═══════════════════════════════════════════
function loadAlgo(id){
  if(state.timer){clearTimeout(state.timer);state.timer=null;}
  state.running=false;state.arena=false;state.steps=[];state.stepIdx=0;
  state.current=id;
  document.querySelectorAll('.algo-item').forEach(e=>e.classList.remove('active'));
  const si=document.getElementById('si-'+id);if(si)si.classList.add('active');
  document.querySelectorAll('.cat-icon-pill').forEach(p=>p.classList.toggle('has-active',p.title===ALGOS[id].cat));
  document.getElementById('welcome').style.display='none';
  const av=document.getElementById('algo-view');av.style.display='flex';
  const a=ALGOS[id];
  document.getElementById('av-title').textContent=a.name;
  document.getElementById('av-badge').textContent=a.badge;
  document.getElementById('av-desc').textContent=a.desc;
  document.getElementById('av-code').innerHTML=a.code.map((l,i)=>`<div class="code-line" id="cl${i}">${l||'&nbsp;'}</div>`).join('');
  document.getElementById('av-info').innerHTML=a.info;
  const ep=document.getElementById('av-edges');
  if(a.cases&&a.cases.length){
    ep.style.display='block';
    ep.innerHTML='<div class="edge-title">⚠ Edge Cases</div>'+a.cases.map(c=>`<div class="edge-case">${c}</div>`).join('');
  } else ep.style.display='none';
  closeInputPanel();
  _lastExplain='';
  buildControls(id,a);
  buildViz(id,a);
}

function highlightCode(lines){
  document.querySelectorAll('.code-line').forEach(e=>e.classList.remove('highlight'));
  if(lines)lines.forEach(i=>{const el=document.getElementById('cl'+i);if(el)el.classList.add('highlight');});
}

// ═══════════════════════════════════════════
// INPUT PANEL
// ═══════════════════════════════════════════
function closeInputPanel(){
  const p=document.getElementById('input-panel');
  p.classList.remove('open');p.style.display='none';
  clearInputError();
  const b=document.getElementById('btn-input');if(b)b.classList.remove('active');
}
function toggleInputPanel(id){
  const p=document.getElementById('input-panel');
  const b=document.getElementById('btn-input');
  if(p.classList.contains('open')){closeInputPanel();return;}
  p.style.display='flex';p.classList.add('open');
  if(b)b.classList.add('active');
  buildInputPanel(id);
}
function showInputError(msg){const e=document.getElementById('input-error');e.textContent=msg;e.style.display='block';}
function clearInputError(){const e=document.getElementById('input-error');if(e){e.textContent='';e.style.display='none';}}
function parseInts(str){return str.split(',').map(s=>parseInt(s.trim(),10)).filter(n=>!isNaN(n));}
function addField(inner,lbl,id,ph,w,hint){
  const g=document.createElement('div');g.className='field-group';
  const l=document.createElement('label');l.textContent=lbl;l.setAttribute('for',id);
  const inp=document.createElement('input');inp.type='text';inp.id=id;inp.placeholder=ph;if(w)inp.style.width=w;
  g.appendChild(l);g.appendChild(inp);
  if(hint){const h=document.createElement('span');h.className='hint';h.textContent=hint;g.appendChild(h);}
  inner.appendChild(g);
}
function addApply(inner,fn){const b=document.createElement('button');b.className='apply-btn';b.textContent='✓ Apply';b.onclick=fn;inner.appendChild(b);}

function buildInputPanel(id){
  const a=ALGOS[id];
  const inner=document.getElementById('input-panel-inner');
  inner.innerHTML='';clearInputError();
  if(a.type==='sort'){
    addField(inner,'Array:','ci-arr','34,12,67,5,2,89,41','230px','comma-separated integers (max 60)');
    addApply(inner,()=>{
      const arr=parseInts(document.getElementById('ci-arr').value);
      if(arr.length<2){showInputError('Need at least 2 integers.');return;}
      if(arr.length>60){showInputError('Max 60 elements.');return;}
      clearInputError();
      state.arr=[...arr];state.states=arr.map(()=>({color:COLORS.default}));
      state.steps=genSortSteps(id,[...arr]);state.stepIdx=0;
      renderSort(state.arr,state.states);setStatus(`Loaded ${arr.length} elements`);
    });
  } else if(a.type==='array_sw'){
    addField(inner,'Array:','ci-arr','10,20,5,15,30,25','200px','integers comma-separated');
    addField(inner,'k:','ci-k','4','50px','window size');
    addApply(inner,()=>{
      const arr=parseInts(document.getElementById('ci-arr').value);
      const k=parseInt(document.getElementById('ci-k').value,10);
      if(arr.length<2){showInputError('Need at least 2 integers.');return;}
      if(isNaN(k)||k<1){showInputError('k must be ≥ 1');return;}
      if(k>arr.length){showInputError(`k(${k}) must be ≤ array length(${arr.length})`);return;}
      clearInputError();
      state.arr=arr;
      state.extra._customSW=true;
      const kEl=document.getElementById('ctrl-sw-k');if(kEl)kEl.value=k;
      state.running=false;clearTimeout(state.timer);state.steps=[];state.stepIdx=0;
      state.arena=false;
      const bA=document.getElementById('btn-arena');if(bA){bA.classList.remove('active');bA.textContent='🎮 Arena';}
      initArraySW();
      setStatus(`Loaded: n=${arr.length}, k=${k} — click ▶ Start`);
    });
  } else if(a.type==='array_tp'){
    addField(inner,'Sorted Array:','ci-arr','1,4,6,8,11,15','180px','will auto-sort');
    addField(inner,'Target:','ci-target','15','65px');
    addApply(inner,()=>{
      let arr=parseInts(document.getElementById('ci-arr').value);
      const target=parseInt(document.getElementById('ci-target').value,10);
      if(arr.length<2){showInputError('Need at least 2 integers.');return;}
      if(isNaN(target)){showInputError('Enter a valid target.');return;}
      arr=arr.sort((a,b)=>a-b);
      clearInputError();
      state.arr=arr;
      state.extra._customTP=true;
      state.extra._customTarget=target;
      const tEl=document.getElementById('ctrl-tp-target');if(tEl)tEl.value=target;
      state.running=false;clearTimeout(state.timer);state.steps=[];state.stepIdx=0;
      state.arena=false;
      const bA=document.getElementById('btn-arena');if(bA){bA.classList.remove('active');bA.textContent='🎮 Arena';}
      initArrayTP();
      setStatus(`Loaded: [${arr.join(',')}] | Target=${target} — click ▶ Start`);
    });
  } else if(a.type==='array_kadane'){
    addField(inner,'Array:','ci-karr','-2,1,-3,4,-1,2,1,-5,4','240px','integers (mix pos & neg, max 30)');
    addApply(inner,()=>{
      const arr=parseInts(document.getElementById('ci-karr').value);
      if(arr.length<2){showInputError('Need at least 2 integers.');return;}
      if(arr.length>30){showInputError('Max 30 elements.');return;}
      clearInputError();
      state.arr=arr;state.extra._customKadane=true;
      state.running=false;clearTimeout(state.timer);state.steps=[];state.stepIdx=0;state.arena=false;
      const bA=document.getElementById('btn-arena');if(bA){bA.classList.remove('active');bA.textContent='🎮 Arena';}
      initKadane();
      setStatus(`Loaded: ${arr.length} elements — click ▶ Start`);
    });
  } else if(a.type==='array_bm'){
    addField(inner,'Array:','ci-bmarr','3,3,4,2,3,1,3,3,2','230px','must have a majority (>n/2 times)');
    addApply(inner,()=>{
      const arr=parseInts(document.getElementById('ci-bmarr').value);
      if(arr.length<1){showInputError('Need at least 1 integer.');return;}
      const freq={};arr.forEach(v=>{freq[v]=(freq[v]||0)+1;});
      const majority=Object.entries(freq).find(([,c])=>c>arr.length/2);
      if(!majority){showInputError('No majority element found — one value must appear more than n/2 times.');return;}
      clearInputError();
      state.arr=arr;state.extra._customBM=true;
      state.running=false;clearTimeout(state.timer);state.steps=[];state.stepIdx=0;state.arena=false;
      const bA=document.getElementById('btn-arena');if(bA){bA.classList.remove('active');bA.textContent='🎮 Arena';}
      initBoyerMoore();
      setStatus(`Loaded: ${arr.length} elements — click ▶ Start`);
    });
  } else if(a.type==='grid'){
    addField(inner,'Rows:','ci-rows','16','55px','6–28');
    addField(inner,'Cols:','ci-cols','22','55px','8–36');
    addApply(inner,()=>{
      const r=Math.min(28,Math.max(6,parseInt(document.getElementById('ci-rows').value,10)||16));
      const c=Math.min(36,Math.max(8,parseInt(document.getElementById('ci-cols').value,10)||22));
      state.gridRows=r;state.gridCols=c;
      clearInputError();initGrid(id);setStatus(`Grid ${r}×${c}`);
    });
  } else if(a.type==='graph'||a.type==='dsu'||a.type==='cycle_u'||a.type==='cycle_d'){
    addField(inner,'Nodes:','ci-nodes','8','55px','2–12');
    addField(inner,'Edges:','ci-edges','0-1,1-2,2-3','210px','e.g. 0-1,1-2,2-4');
    addApply(inner,()=>{
      const n=parseInt(document.getElementById('ci-nodes').value,10);
      if(isNaN(n)||n<2||n>12){showInputError('Node count must be 2–12.');return;}
      const edgePairs=document.getElementById('ci-edges').value.split(',').map(s=>{const p=s.trim().split('-').map(Number);return p.length===2&&!isNaN(p[0])&&!isNaN(p[1])?p:null;}).filter(Boolean);
      if(edgePairs.some(([a,b])=>a>=n||b>=n)){showInputError('Edge index out of range.');return;}
      clearInputError();
      const algo=ALGOS[id].algo||'bfs';
      const cx=350,cy=190,rx=190,ry=135;
      const nodes=Array.from({length:n},(_,i)=>({id:i,x:cx+Math.cos(i/n*2*Math.PI-Math.PI/2)*rx,y:cy+Math.sin(i/n*2*Math.PI-Math.PI/2)*ry,label:algo==='topo'?String.fromCharCode(65+i):i}));
      if(algo==='topo'){
        nodes.forEach((nd,i)=>{nd.x=80+(i+1)*(580/(n+1));nd.y=100+Math.floor(i*55/n)*2;});
      }
      state.extra.graphNodes=nodes;state.extra.graphEdges=edgePairs;state.extra.graphAlgo=algo;
      state.steps=[];state.stepIdx=0;
      if(a.type==='cycle_u'){genCycleUSteps();renderCycleU({color:Array(n).fill(0),current:-1,parent:{},backEdge:null,done:false,hasCycle:false});}
      else if(a.type==='cycle_d'){genCycleDSteps();renderCycleD({color:Array(n).fill(0),current:-1,backEdge:null,done:false,hasCycle:false});}
      else{renderGraph([],[],null,[]);}
      setStatus(`${n} nodes, ${edgePairs.length} edges`);
    });
  } else if(a.type==='tree'||a.type==='tree_trav'){
    addField(inner,'Values:','ci-vals','50,30,70,20,40,60,80','240px','comma-separated (max 20)');
    addApply(inner,()=>{
      const vals=parseInts(document.getElementById('ci-vals').value);
      if(vals.length<1){showInputError('Need at least 1 integer.');return;}
      if(vals.length>20){showInputError('Max 20 nodes.');return;}
      clearInputError();
      state.extra.treeRoot=null;
      vals.forEach(v=>{state.extra.treeRoot=bstInsertNode(state.extra.treeRoot,v);});
      renderTree(new Set(),[]);setStatus(`Tree: ${vals.length} nodes`);
    });
  } else if(a.type==='dp_fib'){
    addField(inner,'N:','ci-n','15','60px','1–25');
    addApply(inner,()=>{
      const n=parseInt(document.getElementById('ci-n').value,10);
      if(isNaN(n)||n<1||n>25){showInputError('N must be 1–25.');return;}
      clearInputError();
      state.extra.fibN=n;state.extra.fibDP=Array(n+1).fill(null);
      renderFib([],null);setStatus(`N=${n}`);
    });
  } else if(a.type==='dp_ks'){
    addField(inner,'Capacity W:','ci-ksW','8','55px');
    addField(inner,'Items (w:v):','ci-ksItems','2:3,3:4,4:5,5:6','190px','weight:value pairs');
    addApply(inner,()=>{
      const W=parseInt(document.getElementById('ci-ksW').value,10);
      if(isNaN(W)||W<1){showInputError('W must be ≥ 1');return;}
      const items=document.getElementById('ci-ksItems').value.split(',').map(s=>{const p=s.trim().split(':').map(Number);return p.length===2&&!isNaN(p[0])&&!isNaN(p[1])?{w:p[0],v:p[1]}:null;}).filter(Boolean);
      if(!items.length){showInputError('Format: w1:v1,w2:v2,...');return;}
      clearInputError();
      state.extra.ksW=W;state.extra.ksN=items.length;
      state.extra.ksWts=items.map(i=>i.w);state.extra.ksVals=items.map(i=>i.v);
      state.extra.ksDP=Array.from({length:items.length+1},()=>Array(W+1).fill(0));
      renderKS(0,0);setStatus(`${items.length} items W=${W}`);
    });
  } else if(a.type==='dp_lcs'){
    addField(inner,'String 1:','ci-s1','ABCBDAB','130px');
    addField(inner,'String 2:','ci-s2','BDCAB','130px','max 12 chars each');
    addApply(inner,()=>{
      const s1=(document.getElementById('ci-s1').value||'').toUpperCase().slice(0,12);
      const s2=(document.getElementById('ci-s2').value||'').toUpperCase().slice(0,12);
      if(!s1||!s2){showInputError('Both strings required.');return;}
      clearInputError();
      state.extra.lcsS1=s1;state.extra.lcsS2=s2;
      state.extra.lcsDP=Array.from({length:s1.length+1},()=>Array(s2.length+1).fill(0));
      renderLCS(0,0);setStatus(`"${s1}" vs "${s2}"`);
    });
  } else if(a.type==='binexp'){
    addField(inner,'a:','ci-bea','2','50px');
    addField(inner,'b (exp):','ci-beb','10','50px');
    addField(inner,'mod:','ci-bemod','1000','65px');
    addApply(inner,()=>{
      const a=parseInt(document.getElementById('ci-bea').value,10),b=parseInt(document.getElementById('ci-beb').value,10),mod=parseInt(document.getElementById('ci-bemod').value,10);
      if(isNaN(a)||isNaN(b)||isNaN(mod)||mod<1){showInputError('All fields required, mod ≥ 1.');return;}
      clearInputError();
      state.extra.beA=a;state.extra.beB=b;state.extra.beMod=mod;
      renderBinExp([],null);setStatus(`${a}^${b} mod ${mod}`);
    });
  } else if(a.type==='xor'){
    addField(inner,'Array:','ci-xarr','2,3,2,5,3','200px','one unique element');
    addApply(inner,()=>{
      const arr=parseInts(document.getElementById('ci-xarr').value);
      if(arr.length<1){showInputError('At least one element required.');return;}
      const freq={};arr.forEach(v=>{freq[v]=(freq[v]||0)+1;});
      const odds=Object.values(freq).filter(c=>c%2!==0).length;
      if(odds!==1){showInputError(`Array must have exactly ONE unique element. Found ${odds}.`);return;}
      clearInputError();
      state.extra.xorArr=arr;renderXOR([],0,null);setStatus(`${arr.length} elements`);
    });
  } else if(a.type==='nim'){
    addField(inner,'Heap sizes:','ci-heaps','3,5,7','150px','positive integers');
    addApply(inner,()=>{
      const heaps=parseInts(document.getElementById('ci-heaps').value).filter(h=>h>0);
      if(!heaps.length){showInputError('Need at least 1 positive heap.');return;}
      clearInputError();
      state.extra.nimHeaps=[...heaps];state.extra.nimHistory=[];
      renderNim();setStatus(`Heaps: [${heaps}]`);
    });
  } else if(a.type==='grundy'){
    addField(inner,'N:','ci-gn','8','55px','max 15');
    addField(inner,'Moves:','ci-gmoves','1,2','90px','e.g. 1,2,3');
    addApply(inner,()=>{
      const n=parseInt(document.getElementById('ci-gn').value,10);
      const moves=parseInts(document.getElementById('ci-gmoves').value).filter(m=>m>0);
      if(isNaN(n)||n<1||n>15){showInputError('N must be 1–15.');return;}
      if(!moves.length){showInputError('At least one move required.');return;}
      clearInputError();
      state.extra.grundyN=n;state.extra.grundyMoves=moves;state.extra.grundyG=Array(n+1).fill(null);
      renderGrundy([],null);setStatus(`N=${n} moves={${moves}}`);
    });
  }
}

// ═══════════════════════════════════════════
// CONTROLS BUILDER
// ═══════════════════════════════════════════
function mkCtrl(html){const d=document.createElement('div');d.className='ctrl-group';d.innerHTML=html;return d;}
function mkSep(){const d=document.createElement('div');d.className='ctrl-sep';return d;}
function mkBtn(label,cls,fn,bid){const b=document.createElement('button');b.className='btn '+cls;b.innerHTML=label;b.onclick=fn;if(bid)b.id=bid;return b;}
function setStatus(s,running=false,err=false){const b=document.getElementById('status-badge');if(!b)return;b.textContent=s;b.className='status-badge'+(running?' running':err?' error':'');}
function pauseViz(){
  if(!state.running)return;
  state.running=false;state.paused=true;clearTimeout(state.timer);setStatus('Paused');
  const btn=document.getElementById('btn-start');
  if(btn){btn.dataset.origLabel=btn.innerHTML;btn.innerHTML='▶ Resume';}
}
function _restoreStartBtn(){
  const btn=document.getElementById('btn-start');
  if(btn&&btn.dataset.origLabel){btn.innerHTML=btn.dataset.origLabel;delete btn.dataset.origLabel;}
}
function handleStartBtn(){
  const a=ALGOS[state.current];if(!a||state.running)return;
  const resuming=!!(state.paused&&state.steps&&state.steps.length>0&&state.stepIdx<state.steps.length);
  state.paused=false;_restoreStartBtn();
  if(a.type==='grid'){startGridViz(state.current,resuming);}
  else{startViz(resuming);}
}
function appendArena(ctrl){
  ctrl.appendChild(mkSep());
  ctrl.appendChild(mkBtn('🎮 Arena','btn-arena',toggleArena,'btn-arena'));
  ctrl.appendChild(mkBtn('⏮','btn-step',stepBack));
  ctrl.appendChild(mkBtn('⏭','btn-step',stepFwd));
}
function buildControls(id,a){
  const ctrl=document.getElementById('av-controls');ctrl.innerHTML='';
  ctrl.appendChild(mkCtrl(`<span class='ctrl-label'>Speed</span><input type='range' min='1' max='10' value='${state.speed}' id='ctrl-speed'>`));
  document.getElementById('ctrl-speed').oninput=e=>{state.speed=+e.target.value;};
  if(a.type==='sort'){
    ctrl.appendChild(mkCtrl(`<span class='ctrl-label'>Size</span><input type='number' min='5' max='60' value='30' id='ctrl-size' style='width:58px'>`));
    ctrl.appendChild(mkBtn('▶ Start','btn-primary',()=>handleStartBtn(),'btn-start'));
    ctrl.appendChild(mkBtn('⏸ Pause','btn-secondary',pauseViz));
    ctrl.appendChild(mkBtn('↺ Reset','btn-danger',()=>initSort(id)));
  } else if(a.type==='array_sw'){
    ctrl.appendChild(mkCtrl(`<span class='ctrl-label'>k =</span><input type='number' min='1' max='30' value='4' id='ctrl-sw-k' style='width:52px'>`));
    ctrl.appendChild(mkBtn('▶ Start','btn-primary',()=>handleStartBtn(),'btn-start'));
    ctrl.appendChild(mkBtn('⏸ Pause','btn-secondary',pauseViz));
    ctrl.appendChild(mkBtn('↺ Reset','btn-danger',()=>buildViz(id,a)));
  } else if(a.type==='array_tp'){
    ctrl.appendChild(mkCtrl(`<span class='ctrl-label'>Target</span><input type='number' id='ctrl-tp-target' placeholder='auto' style='width:70px'>`));
    ctrl.appendChild(mkBtn('▶ Start','btn-primary',()=>handleStartBtn(),'btn-start'));
    ctrl.appendChild(mkBtn('⏸ Pause','btn-secondary',pauseViz));
    ctrl.appendChild(mkBtn('↺ New','btn-danger',()=>buildViz(id,a)));
  } else if(a.type==='array_kadane'){
    ctrl.appendChild(mkBtn('▶ Start','btn-primary',()=>handleStartBtn(),'btn-start'));
    ctrl.appendChild(mkBtn('⏸ Pause','btn-secondary',pauseViz));
    ctrl.appendChild(mkBtn('↺ Reset','btn-danger',()=>buildViz(id,a)));
  } else if(a.type==='array_bm'){
    ctrl.appendChild(mkBtn('▶ Start','btn-primary',()=>handleStartBtn(),'btn-start'));
    ctrl.appendChild(mkBtn('⏸ Pause','btn-secondary',pauseViz));
    ctrl.appendChild(mkBtn('↺ Reset','btn-danger',()=>buildViz(id,a)));
  } else if(a.type==='grid'){
    ctrl.appendChild(mkCtrl(`<span class='ctrl-label'>Rows</span><input type='number' min='6' max='28' value='${state.gridRows}' id='ctrl-gr' style='width:48px'>`));
    ctrl.appendChild(mkCtrl(`<span class='ctrl-label'>Cols</span><input type='number' min='8' max='36' value='${state.gridCols}' id='ctrl-gc' style='width:48px'>`));
    ctrl.appendChild(mkBtn('Apply','btn-secondary',()=>applyGridSize(id)));
    ctrl.appendChild(mkSep());
    ctrl.appendChild(mkBtn('✏ Wall','btn-mode active',()=>setGridMode('wall',id),'gm-wall'));
    ctrl.appendChild(mkBtn('🟢 Start','btn-mode',()=>setGridMode('start',id),'gm-start'));
    ctrl.appendChild(mkBtn('🔴 End','btn-mode',()=>setGridMode('end',id),'gm-end'));
    ctrl.appendChild(mkSep());
    ctrl.appendChild(mkBtn('▶ Visualize','btn-primary',()=>handleStartBtn(),'btn-start'));
    ctrl.appendChild(mkBtn('⏸ Pause','btn-secondary',pauseViz));
    ctrl.appendChild(mkBtn('Clear','btn-secondary',()=>clearGridWalls(id)));
    ctrl.appendChild(mkBtn('↺ Reset','btn-danger',()=>initGrid(id)));
  } else if(a.type==='graph'){
    ctrl.appendChild(mkBtn('▶ Start','btn-primary',()=>handleStartBtn(),'btn-start'));
    ctrl.appendChild(mkBtn('↺ New','btn-danger',()=>buildViz(id,a)));
  } else if(a.type==='dsu'){
    ctrl.appendChild(mkBtn('▶ Run Unions','btn-primary',()=>handleStartBtn(),'btn-start'));
    ctrl.appendChild(mkBtn('↺ Reset','btn-danger',()=>buildViz(id,a)));
  } else if(a.type==='tree'){
    ctrl.appendChild(mkCtrl(`<input type='number' id='ctrl-tval' placeholder='value' style='width:70px'>`));
    ctrl.appendChild(mkBtn('Insert','btn-primary',()=>treeInsert()));
    ctrl.appendChild(mkBtn('Search','btn-secondary',()=>treeSearch()));
    ctrl.appendChild(mkBtn('Delete','btn-danger',()=>treeDelete()));
    ctrl.appendChild(mkBtn('↺ Reset','btn-secondary',()=>buildViz(id,a)));
  } else if(a.type==='tree_trav'){
    ctrl.appendChild(mkCtrl(`<input type='number' id='ctrl-tval' placeholder='value' style='width:70px'>`));
    ctrl.appendChild(mkBtn('Insert','btn-secondary',()=>treeInsert()));
    ctrl.appendChild(mkBtn('Delete','btn-danger',()=>treeDelete()));
    ctrl.appendChild(mkBtn('Inorder','btn-primary',()=>startTraversal('inorder')));
    ctrl.appendChild(mkBtn('Preorder','btn-secondary',()=>startTraversal('preorder')));
    ctrl.appendChild(mkBtn('Postorder','btn-secondary',()=>startTraversal('postorder')));
    ctrl.appendChild(mkBtn('↺ Reset','btn-danger',()=>buildViz(id,a)));
  } else if(a.type==='dp_fib'){
    ctrl.appendChild(mkCtrl(`<span class='ctrl-label'>N</span><input type='number' min='2' max='25' value='10' id='ctrl-fibN' style='width:55px'>`));
    ctrl.appendChild(mkBtn('▶ Run','btn-primary',()=>handleStartBtn(),'btn-start'));
    ctrl.appendChild(mkBtn('⏸ Pause','btn-secondary',pauseViz));
    ctrl.appendChild(mkBtn('↺ Reset','btn-danger',()=>buildViz(id,a)));
  } else if(a.type==='dp_ks'||a.type==='dp_lcs'){
    ctrl.appendChild(mkBtn('▶ Run','btn-primary',()=>handleStartBtn(),'btn-start'));
    ctrl.appendChild(mkBtn('⏸ Pause','btn-secondary',pauseViz));
    ctrl.appendChild(mkBtn('↺ Reset','btn-danger',()=>buildViz(id,a)));
  } else if(a.type==='binexp'){
    ctrl.appendChild(mkCtrl(`a=<input type='number' value='2' id='be-a' style='width:48px'> b=<input type='number' value='10' id='be-b' style='width:48px'> mod=<input type='number' value='1000' id='be-mod' style='width:62px'>`));
    ctrl.appendChild(mkBtn('▶ Run','btn-primary',()=>handleStartBtn(),'btn-start'));
    ctrl.appendChild(mkBtn('↺ Reset','btn-danger',()=>buildViz(id,a)));
  } else if(a.type==='xor'){
    ctrl.appendChild(mkBtn('▶ Run','btn-primary',()=>handleStartBtn(),'btn-start'));
    ctrl.appendChild(mkBtn('New','btn-secondary',()=>buildViz(id,a)));
  } else if(a.type==='nim'){
    ctrl.appendChild(mkBtn('▶ Play','btn-primary',()=>handleStartBtn(),'btn-start'));
    ctrl.appendChild(mkBtn('New Game','btn-secondary',()=>buildViz(id,a)));
  } else if(a.type==='grundy'){
    ctrl.appendChild(mkCtrl(`<span class='ctrl-label'>N</span><input type='number' min='3' max='15' value='8' id='ctrl-gN' style='width:55px'>`));
    ctrl.appendChild(mkBtn('▶ Compute','btn-primary',()=>handleStartBtn(),'btn-start'));
    ctrl.appendChild(mkBtn('↺ Reset','btn-danger',()=>buildViz(id,a)));
  } else if(a.type==='cycle_u'||a.type==='cycle_d'){
    ctrl.appendChild(mkBtn('▶ Start','btn-primary',()=>handleStartBtn(),'btn-start'));
    ctrl.appendChild(mkBtn('↺ New','btn-danger',()=>buildViz(id,a)));
  }
  appendArena(ctrl);
  ctrl.appendChild(mkSep());
  ctrl.appendChild(mkBtn('📝 Custom Input','btn-input',()=>toggleInputPanel(id),'btn-input'));
  ctrl.appendChild(mkCtrl(`<span class='status-badge' id='status-badge'>Ready</span>`));
}

// ═══════════════════════════════════════════
// ARENA — Universal Step-Through
// ═══════════════════════════════════════════
function toggleArena(){
  state.arena=!state.arena;
  const b=document.getElementById('btn-arena');
  if(state.arena){
    state.running=false;clearTimeout(state.timer);
    if(b){b.classList.add('active');b.textContent='🎮 ON';}
    const a=ALGOS[state.current];
    if(!state.steps||!state.steps.length) regenSteps(a);
    setStatus(`Arena — step ${state.stepIdx||0} / ${(state.steps||[]).length}`);
  } else {
    if(b){b.classList.remove('active');b.textContent='🎮 Arena';}
    const a=ALGOS[state.current];
    if(a.type==='grid'){
      resumeGridViz(state.current);
    } else if(state.steps&&state.steps.length&&state.stepIdx<state.steps.length){
      startViz(true);
    } else {
      setStatus('Done ✓');
    }
  }
}
function stepFwd(){
  if(!state.steps||!state.steps.length){
    const a=ALGOS[state.current];regenSteps(a);
    if(!state.steps||!state.steps.length)return;
  }
  if(state.stepIdx>=state.steps.length)return;
  if(!state.arena){
    state.arena=true;state.running=false;clearTimeout(state.timer);
    const b=document.getElementById('btn-arena');if(b){b.classList.add('active');b.textContent='🎮 ON';}
  }
  const fr=state.steps[state.stepIdx++];
  if(state.renderFn)state.renderFn(fr);
  highlightCode(fr.code||[]);
  if(fr.explain)updateGraphExplain(fr.explain,fr.pathStr||'');
  setStatus(`Step ${state.stepIdx} / ${state.steps.length}`);
}
function stepBack(){
  if(!state.steps||state.stepIdx<=0)return;
  if(!state.arena){
    state.arena=true;state.running=false;clearTimeout(state.timer);
    const b=document.getElementById('btn-arena');if(b){b.classList.add('active');b.textContent='🎮 ON';}
  }
  state.stepIdx=Math.max(0,state.stepIdx-1);
  const fr=state.steps[state.stepIdx];
  if(state.renderFn)state.renderFn(fr);
  highlightCode(fr.code||[]);
  if(fr.explain)updateGraphExplain(fr.explain,fr.pathStr||'');
  setStatus(`Step ${state.stepIdx+1} / ${state.steps.length}`);
}

// ═══════════════════════════════════════════
// VIZ ROUTER + CANVAS HELPER
// ═══════════════════════════════════════════
function buildViz(id,a){
  state.running=false;state.paused=false;clearTimeout(state.timer);state.steps=[];state.stepIdx=0;state.arena=false;
  _restoreStartBtn();
  state.extra={};
  _lastExplain='';
  const b=document.getElementById('btn-arena');if(b){b.classList.remove('active');b.textContent='🎮 Arena';}
  document.getElementById('av-canvas').innerHTML='';
  if(a.type==='sort')initSort(id);
  else if(a.type==='array_sw')initArraySW();
  else if(a.type==='array_tp')initArrayTP();
  else if(a.type==='array_kadane')initKadane();
  else if(a.type==='array_bm')initBoyerMoore();
  else if(a.type==='grid')initGrid(id);
  else if(a.type==='graph')initGraph(id);
  else if(a.type==='dsu')initDSU();
  else if(a.type==='tree'||a.type==='tree_trav')initTree();
  else if(a.type==='dp_fib')initFib();
  else if(a.type==='dp_ks')initKnapsack();
  else if(a.type==='dp_lcs')initLCS();
  else if(a.type==='binexp')initBinExp();
  else if(a.type==='xor')initXOR();
  else if(a.type==='nim')initNim();
  else if(a.type==='grundy')initGrundy();
  else if(a.type==='cycle_u')initCycleU();
  else if(a.type==='cycle_d')initCycleD();
}
function getCanvas(w=700,h=340){
  const ca=document.getElementById('av-canvas');ca.innerHTML='';
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;cv.style.borderRadius='5px';
  ca.appendChild(cv);return cv;
}

// ═══════════════════════════════════════════
// START VIZ (universal)
// ═══════════════════════════════════════════
function startViz(resuming=false){
  if(state.running)return;
  const a=ALGOS[state.current];
  state.arena=false;
  const b=document.getElementById('btn-arena');if(b){b.classList.remove('active');b.textContent='🎮 Arena';}
  if(a.type==='dsu'){state.running=true;setStatus('Running',true);runGraphAnim_dsu();return;}
  if(a.type==='grid'){startGridViz(state.current,resuming);return;}
  if(a.type==='tree'||a.type==='tree_trav'){setStatus('Use Insert/Traversal buttons');return;}
  if(!resuming){
    state.steps=[];state.stepIdx=0;
    regenSteps(a);
  } else if(!state.steps||!state.steps.length){
    regenSteps(a);
  }
  if(!state.steps||!state.steps.length){setStatus('Ready');return;}
  state.running=true;setStatus('Running',true);
  function tick(){
    if(!state.running||state.stepIdx>=state.steps.length){
      state.running=false;state.paused=false;setStatus('Done ✓');highlightCode([]);_restoreStartBtn();return;
    }
    if(state.arena){state.running=false;return;}
    const fr=state.steps[state.stepIdx++];
    if(state.renderFn)state.renderFn(fr);
    highlightCode(fr.code||[]);
    state.timer=setTimeout(tick,Math.max(15,600-state.speed*55));
  }
  tick();
}
function regenSteps(a){
  state.stepIdx=0;
  if(a.type==='sort'){if(state.arr&&state.arr.length){state.steps=genSortSteps(state.current,[...state.arr]);state.renderFn=fr=>renderSort(fr.arr,fr.states);}}
  else if(a.type==='array_sw')genSWSteps();
  else if(a.type==='array_tp')genTPSteps();
  else if(a.type==='array_kadane')genKadaneSteps();
  else if(a.type==='array_bm')genBoyerMooreSteps();
  else if(a.type==='graph')genGraphSteps();
  else if(a.type==='dp_fib')genFibSteps();
  else if(a.type==='dp_ks')genKSSteps();
  else if(a.type==='dp_lcs')genLCSSteps();
  else if(a.type==='binexp')genBinExpSteps();
  else if(a.type==='xor')genXORSteps();
  else if(a.type==='nim')genNimSteps();
  else if(a.type==='grundy')genGrundySteps();
  else if(a.type==='cycle_u')genCycleUSteps();
  else if(a.type==='cycle_d')genCycleDSteps();
}

// ── Boot ──────────────────────────────────────────────────────────────────────
buildSidebar();
