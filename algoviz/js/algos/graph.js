// ═══════════════════════════════════════════
// GRAPH TRAVERSAL (BFS / DFS / Topo)
// ═══════════════════════════════════════════
function initGraph(id){
  const algo=ALGOS[id].algo;
  const n=algo==='topo'?8:9;
  const cx=350,cy=195,rx=200,ry=145;
  const nodes=Array.from({length:n},(_,i)=>({
    id:i,
    x:cx+Math.cos(i/n*2*Math.PI-Math.PI/2)*rx+(Math.random()-.5)*18,
    y:cy+Math.sin(i/n*2*Math.PI-Math.PI/2)*ry+(Math.random()-.5)*14,
    label:algo==='topo'?String.fromCharCode(65+i):i
  }));
  let edges=[];
  if(algo==='topo'){
    edges=[[0,2],[0,3],[1,3],[1,4],[2,5],[3,5],[3,6],[4,6],[5,7],[6,7]];
    const layers=[[0,1],[2,3,4],[5,6],[7]];
    layers.forEach((layer,li)=>layer.forEach((ni,ei)=>{
      nodes[ni].x=100+(ei+1)*(560/(layer.length+1));
      nodes[ni].y=55+li*112;
    }));
  } else {
    for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(Math.random()<0.30)edges.push([i,j]);
    if(!edges.some(e=>e[0]===0||e[1]===0))edges.push([0,1]);
    if(!edges.some(e=>e[0]===1||e[1]===1))edges.push([1,2]);
  }
  state.extra.graphNodes=nodes;state.extra.graphEdges=edges;state.extra.graphAlgo=algo;
  genGraphSteps();
  renderGraph([],[],null,[]);
}
function genGraphSteps(){
  const{graphNodes:nodes,graphEdges:edges,graphAlgo:algo}=state.extra;
  if(!nodes)return;
  const n=nodes.length;
  const lbl=i=>nodes[i].label;
  const adj=Array.from({length:n},()=>[]);
  edges.forEach(([a,b])=>{adj[a].push(b);if(algo!=='topo')adj[b].push(a);});
  const steps=[],visited=[];

  if(algo==='bfs'){
    const vis=new Set([0]);const q=[0];visited.push(0);
    const nbStr=node=>{
      const nbs=adj[node].map(nb=>lbl(nb));
      return nbs.length?nbs.join(', '):'(none)';
    };
    steps.push({
      visited:[...visited],frontier:[...q],current:0,topo:[],pathStr:'',
      queueStr:`Queue: [${lbl(0)}]`,
      explain:`Start: enqueue node <b style="color:var(--cyan)">${lbl(0)}</b>. Mark visited.\nQueue: [${lbl(0)}]`,
      code:[1,2]
    });
    while(q.length){
      const node=q.shift();
      const newNbs=adj[node].filter(nb=>!vis.has(nb));
      steps.push({
        visited:[...visited],frontier:[...q],current:node,topo:[],
        pathStr:visited.map(v=>lbl(v)).join(' → '),
        queueStr:`Queue: [${q.map(x=>lbl(x)).join(', ')||'empty'}]`,
        explain:`Dequeue <b style="color:var(--amber)">${lbl(node)}</b>. Visit it.\nNeighbors of ${lbl(node)}: ${nbStr(node)}\nUnvisited → push: [${newNbs.map(x=>lbl(x)).join(', ')||'none'}]`,
        code:[4,5]
      });
      adj[node].forEach(nb=>{if(!vis.has(nb)){vis.add(nb);visited.push(nb);q.push(nb);}});
      steps.push({
        visited:[...visited],frontier:[...q],current:node,topo:[],
        pathStr:visited.map(v=>lbl(v)).join(' → '),
        queueStr:`Queue: [${q.map(x=>lbl(x)).join(', ')||'empty'}]`,
        explain:`After processing <b style="color:var(--amber)">${lbl(node)}</b>:\nVisited: ${visited.map(v=>lbl(v)).join(' → ')}\nQueue: [${q.map(x=>lbl(x)).join(', ')||'empty'}]`,
        code:[6,7,8]
      });
    }
  } else if(algo==='dfs'){
    const vis=new Set();const callStack=[];
    function dfs(node,depth=0){
      vis.add(node);visited.push(node);callStack.push(lbl(node));
      steps.push({
        visited:[...visited],frontier:[],current:node,topo:[],
        pathStr:visited.map(v=>lbl(v)).join(' → '),
        queueStr:`Stack: [${[...callStack].reverse().join(', ')}]`,
        explain:`Visit <b style="color:var(--amber)">${lbl(node)}</b> (depth ${depth}).\nMark as visited. Recurse into unvisited neighbors.\nCall stack: [${[...callStack].reverse().join(' → ')}]`,
        code:[1,2]
      });
      adj[node].forEach(nb=>{
        if(!vis.has(nb)){
          steps.push({
            visited:[...visited],frontier:[nb],current:node,topo:[],
            pathStr:visited.map(v=>lbl(v)).join(' → '),
            queueStr:`Next: ${lbl(nb)} (unvisited neighbor of ${lbl(node)})`,
            explain:`From <b>${lbl(node)}</b>: neighbor <b style="color:var(--purple)">${lbl(nb)}</b> is unvisited → call DFS(${lbl(nb)})`,
            code:[3,4,5]
          });
          dfs(nb,depth+1);
        }
      });
      callStack.pop();
    }
    for(let i=0;i<n;i++)if(!vis.has(i))dfs(i);
  } else if(algo==='topo'){
    const inDeg=Array(n).fill(0);edges.forEach(([a,b])=>inDeg[b]++);
    const q=[],topo=[];
    for(let i=0;i<n;i++)if(inDeg[i]===0)q.push(i);
    const inDegStr=()=>nodes.map((_,i)=>`${lbl(i)}:${inDeg[i]}`).join(' ');
    steps.push({
      visited:[],frontier:[...q],current:-1,topo:[],
      pathStr:'',queueStr:`Queue: [${q.map(x=>lbl(x)).join(', ')}]`,
      explain:`Compute in-degrees: ${inDegStr()}\nNodes with in-degree 0 → start queue: [${q.map(x=>lbl(x)).join(', ')}]`,
      code:[1,2]
    });
    while(q.length){
      const node=q.shift();topo.push(node);
      const nbs=adj[node];
      steps.push({
        visited:[...topo],frontier:[...q],current:node,topo:[...topo],
        pathStr:topo.map(v=>lbl(v)).join(' → '),
        queueStr:`Queue: [${q.map(x=>lbl(x)).join(', ')||'empty'}]`,
        explain:`Dequeue <b style="color:var(--amber)">${lbl(node)}</b>. Add to result.\nResult so far: ${topo.map(v=>lbl(v)).join(' → ')}\nDecrement in-degree of neighbors: ${nbs.map(x=>lbl(x)).join(', ')||'(none)'}`,
        code:[5,6]
      });
      adj[node].forEach(nb=>{inDeg[nb]--;if(inDeg[nb]===0)q.push(nb);});
      steps.push({
        visited:[...topo],frontier:[...q],current:node,topo:[...topo],
        pathStr:topo.map(v=>lbl(v)).join(' → '),
        queueStr:`Queue: [${q.map(x=>lbl(x)).join(', ')||'empty'}]`,
        explain:`After processing <b>${lbl(node)}</b>:\nIn-degrees now: ${inDegStr()}\nNewly zero → pushed: [${adj[node].filter(x=>inDeg[x]===0).map(x=>lbl(x)).join(', ')||'none'}]`,
        code:[8,9,10]
      });
    }
  }
  state.steps=steps;state.stepIdx=0;
  state.renderFn=fr=>{
    renderGraph(fr.visited,fr.frontier,fr.current,fr.topo);
    updateGraphExplain(fr.explain||'',fr.pathStr||'',fr.queueStr||'');
  };
}

// ── Graph explain panel helpers ────────────────────────────────────────────────
function ensureGraphExplainPanel(){
  let wrap=document.getElementById('graph-explain-wrap');
  if(wrap)return wrap;
  wrap=document.createElement('div');
  wrap.id='graph-explain-wrap';wrap.className='graph-explain-wrap';
  wrap.style.cssText='width:700px;max-width:100%;margin-top:8px;';
  const pathBar=document.createElement('div');
  pathBar.id='graph-path-bar';pathBar.className='graph-path-bar';
  pathBar.innerHTML='<span style="color:var(--text-dim);font-size:9px;letter-spacing:1px;">TRAVERSAL PATH </span>';
  const backend=document.createElement('div');
  backend.id='graph-backend';backend.className='graph-backend';
  backend.innerHTML='<div class="graph-backend-title">⚙ BACKEND LOG</div><div id="graph-explain-lines"></div>';
  wrap.appendChild(pathBar);wrap.appendChild(backend);
  document.getElementById('av-canvas').appendChild(wrap);
  return wrap;
}
function updateGraphExplain(explain,pathStr,queueStr=''){
  ensureGraphExplainPanel();
  const pathBar=document.getElementById('graph-path-bar');
  if(pathBar){
    pathBar.innerHTML=`<span style="color:var(--text-dim);font-size:9px;letter-spacing:1px;">TRAVERSAL PATH </span>`+
      (pathStr?`<span style="color:var(--amber)">${pathStr}</span>`:`<span style="color:var(--text-dim)">—</span>`);
  }
  const linesEl=document.getElementById('graph-explain-lines');
  if(!linesEl)return;
  if(explain===_lastExplain)return;
  _lastExplain=explain;
  const lines=explain.split('\n').filter(Boolean);
  const prevLines=linesEl.querySelectorAll('.graph-explain-line:not(.old)');
  prevLines.forEach(el=>{el.classList.add('old');setTimeout(()=>el.remove(),380);});
  lines.forEach((txt,i)=>{
    const div=document.createElement('div');
    div.className='graph-explain-line '+(i===0?'cur':'prev');
    div.innerHTML=txt;
    div.style.opacity='0';div.style.transform='translateY(4px)';
    linesEl.appendChild(div);
    setTimeout(()=>{div.style.transition='opacity .3s,transform .3s';div.style.opacity='1';div.style.transform='translateY(0)';},i*60+80);
  });
  if(queueStr){
    const qDiv=document.createElement('div');
    qDiv.className='graph-explain-line prev';
    qDiv.innerHTML=`<span class="ds-badge">${queueStr}</span>`;
    qDiv.style.cssText='opacity:0;transform:translateY(4px);margin-top:3px;';
    linesEl.appendChild(qDiv);
    setTimeout(()=>{qDiv.style.transition='opacity .3s,transform .3s';qDiv.style.opacity='1';qDiv.style.transform='translateY(0)';},lines.length*60+100);
  }
}
function renderGraph(visited,frontier,current,topoOrder){
  const{graphNodes:nodes,graphEdges:edges,graphAlgo:algo}=state.extra;
  if(!nodes)return;
  const cv=getCanvas(700,370);const ctx=cv.getContext('2d');
  ctx.fillStyle='#060b14';ctx.fillRect(0,0,cv.width,cv.height);
  edges.forEach(([a,b])=>{
    const na=nodes[a],nb=nodes[b];
    const bothVisited=visited&&visited.includes(a)&&visited.includes(b);
    ctx.strokeStyle=bothVisited?'#00e67644':'#253d6a';
    ctx.lineWidth=bothVisited?2.5:1.8;
    if(algo==='topo'){
      const dx=nb.x-na.x,dy=nb.y-na.y,len=Math.sqrt(dx*dx+dy*dy)||1;
      const ux=dx/len,uy=dy/len,ex=nb.x-ux*20,ey=nb.y-uy*20;
      ctx.beginPath();ctx.moveTo(na.x,na.y);ctx.lineTo(ex,ey);ctx.stroke();
      ctx.fillStyle=bothVisited?'#00e67644':'#253d6a';
      ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex-uy*7-ux*11,ey+ux*7-uy*11);ctx.lineTo(ex+uy*7-ux*11,ey-ux*7-uy*11);ctx.fill();
    } else {ctx.beginPath();ctx.moveTo(na.x,na.y);ctx.lineTo(nb.x,nb.y);ctx.stroke();}
  });
  nodes.forEach((nd,i)=>{
    let col='#1e3058';
    if(visited&&visited.includes(i))col='#00e676';
    if(frontier&&frontier.includes(i))col='#ce93d8';
    if(current===i)col='#ffc107';
    ctx.beginPath();ctx.arc(nd.x,nd.y,20,0,Math.PI*2);
    ctx.fillStyle=col+'cc';ctx.fill();
    ctx.strokeStyle=col;ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=current===i?'#000':'#fff';ctx.font='bold 12px Fira Code';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(nd.label,nd.x,nd.y);
  });
  if(topoOrder&&topoOrder.length){
    ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(10,338,680,26);
    ctx.fillStyle='#ffc107';ctx.font='11px Fira Code';ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillText('Topo Order: '+topoOrder.map(i=>nodes[i].label).join(' → '),18,351);
  }
  ctx.textBaseline='top';
  [['#1e3058','Unvisited'],['#ce93d8','Frontier'],['#ffc107','Current'],['#00e676','Visited']].forEach(([col,lbl],i)=>{
    ctx.fillStyle=col;ctx.beginPath();ctx.arc(22+i*130,18,6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#5a7099';ctx.font='10px Fira Code';ctx.fillText(lbl,33+i*130,13);
  });
  ensureGraphExplainPanel();
}

// ═══════════════════════════════════════════
// DSU
// ═══════════════════════════════════════════
function initDSU(){
  const n=10;state.extra.dsuN=n;
  state.extra.dsuParent=Array.from({length:n},(_,i)=>i);
  state.extra.dsuRank=Array(n).fill(0);state.extra.dsuEdges=[];
  state.extra.dsuPos=Array.from({length:n},(_,i)=>({x:65+i%5*125+(Math.random()-.5)*20,y:90+Math.floor(i/5)*200+(Math.random()-.5)*20}));
  state.steps=[];state.stepIdx=0;
  renderDSU([]);
}
function dsuFind(parent,x){if(parent[x]!==x)parent[x]=dsuFind(parent,parent[x]);return parent[x];}
function renderDSU(highlight){
  const{dsuN:n,dsuParent:par,dsuPos:pos,dsuEdges:edges}=state.extra;
  const cv=getCanvas(700,400);const ctx=cv.getContext('2d');
  ctx.fillStyle='#060b14';ctx.fillRect(0,0,cv.width,cv.height);
  const comp={},compColors=['#00e5ff','#ffc107','#00e676','#ff4081','#ce93d8','#ff7043','#26c6da','#66bb6a'];
  const rootMap={};let ci=0;
  for(let i=0;i<n;i++){const root=dsuFind([...par],i);if(!(root in rootMap)){rootMap[root]=compColors[ci%compColors.length];ci++;}comp[i]=rootMap[root];}
  edges.forEach(([a,b])=>{ctx.strokeStyle=comp[a];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(pos[a].x,pos[a].y);ctx.lineTo(pos[b].x,pos[b].y);ctx.stroke();});
  for(let i=0;i<n;i++){
    const hl=highlight.includes(i);
    ctx.beginPath();ctx.arc(pos[i].x,pos[i].y,22,0,Math.PI*2);
    ctx.fillStyle=hl?'#fff':comp[i]+'44';ctx.fill();
    ctx.strokeStyle=comp[i];ctx.lineWidth=hl?3:2;ctx.stroke();
    ctx.fillStyle=hl?'#000':comp[i];ctx.font='bold 13px Fira Code';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(i,pos[i].x,pos[i].y);
    if(par[i]!==i){ctx.strokeStyle='#1e3058';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(pos[i].x,pos[i].y-24);ctx.lineTo(pos[par[i]].x,pos[par[i]].y+24);ctx.stroke();ctx.setLineDash([]);}
  }
  const nr=Object.keys(rootMap).length;
  ctx.fillStyle='#5a7099';ctx.font='10px Fira Code';ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText(`${nr} component(s) — click ▶ Run Unions to animate`,20,370);
}
function runGraphAnim_dsu(){
  const n=state.extra.dsuN;
  const parent=[...Array(n).keys()],rank=Array(n).fill(0);
  const pairs=[];for(let i=0;i<Math.floor(n*0.85);i++)pairs.push([Math.floor(Math.random()*n),Math.floor(Math.random()*n)]);
  const steps=[];state.extra.dsuEdges=[];
  pairs.forEach(([a,b])=>{
    let ra=dsuFind(parent,a),rb=dsuFind(parent,b);
    if(ra!==rb){
      if(rank[ra]<rank[rb]){let t=ra;ra=rb;rb=t;}
      parent[rb]=ra;if(rank[ra]===rank[rb])rank[ra]++;
      state.extra.dsuEdges.push([a,b]);
      steps.push({highlight:[a,b],par:[...parent],code:[7,8,9,10,11,12]});
    }
  });
  state.steps=steps;state.stepIdx=0;
  state.renderFn=fr=>{state.extra.dsuParent=fr.par;renderDSU(fr.highlight);};
  let idx=0;
  function tick(){
    if(!state.running||idx>=steps.length){state.running=false;state.paused=false;setStatus('Done ✓');_restoreStartBtn();return;}
    const fr=steps[idx++];state.extra.dsuParent=fr.par;renderDSU(fr.highlight);highlightCode(fr.code);
    state.timer=setTimeout(tick,Math.max(150,800-state.speed*70));
  }
  tick();
}
