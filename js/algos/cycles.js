// ═══════════════════════════════════════════
// CYCLE DETECTION — UNDIRECTED
// ═══════════════════════════════════════════
function _buildCycleUGraph(){
  const n=8;
  const cx=350,cy=195,rx=200,ry=145;
  const nodes=Array.from({length:n},(_,i)=>({
    id:i,x:cx+Math.cos(i/n*2*Math.PI-Math.PI/2)*rx+(Math.random()-.5)*16,
    y:cy+Math.sin(i/n*2*Math.PI-Math.PI/2)*ry+(Math.random()-.5)*12,label:i
  }));
  let edges=[];
  for(let i=1;i<n;i++)edges.push([i,Math.floor(Math.random()*i)]);
  const a=Math.floor(Math.random()*(n-2))+1,b=Math.floor(Math.random()*(n-a-1))+a+1;
  edges.push([a,b]);
  const eSet=new Set();edges=edges.filter(([u,v])=>{const k=Math.min(u,v)+','+Math.max(u,v);if(eSet.has(k))return false;eSet.add(k);return true;});
  state.extra.graphNodes=nodes;state.extra.graphEdges=edges;
}
function initCycleU(){
  _buildCycleUGraph();
  genCycleUSteps();
  renderCycleU({color:Array(state.extra.graphNodes.length).fill(0),current:-1,parent:{},backEdge:null,done:false,hasCycle:false});
  setStatus('Ready — click ▶ Start');
}
function genCycleUSteps(){
  const{graphNodes:nodes,graphEdges:edges}=state.extra;
  if(!nodes)return;
  const n=nodes.length;
  const adj=Array.from({length:n},()=>[]);
  edges.forEach(([a,b])=>{adj[a].push(b);adj[b].push(a);});
  const color=Array(n).fill(0);
  const parent=Array(n).fill(-1);
  const steps=[];
  let cycleFound=false,backEdge=null;
  function dfs(u){
    color[u]=1;
    steps.push({
      color:[...color],current:u,parent:{...parent},backEdge:null,done:false,hasCycle:false,
      explain:`Visit node <b style="color:var(--amber)">${u}</b> → mark GRAY (in stack)\nParent of ${u}: ${parent[u]>=0?parent[u]:'—'}`,
      code:[3,4]
    });
    for(const v of adj[u]){
      if(color[v]===0){
        parent[v]=u;
        steps.push({
          color:[...color],current:u,parent:{...parent},backEdge:null,done:false,hasCycle:false,
          explain:`From <b>${u}</b>: neighbor <b style="color:var(--purple)">${v}</b> is WHITE → recurse DFS(${v})`,
          code:[5,6,7]
        });
        if(dfs(v))return true;
        if(cycleFound)return true;
      } else if(v!==parent[u]){
        cycleFound=true;backEdge=[u,v];
        steps.push({
          color:[...color],current:u,parent:{...parent},backEdge:[u,v],done:false,hasCycle:true,
          explain:`From <b style="color:var(--pink)">${u}</b>: neighbor <b style="color:var(--pink)">${v}</b> is GRAY and not parent → <b style="color:var(--pink)">BACK EDGE!</b>\nCycle detected: ${v} ← … ← ${u} ← ${v}`,
          code:[8,9]
        });
        return true;
      } else {
        steps.push({
          color:[...color],current:u,parent:{...parent},backEdge:null,done:false,hasCycle:false,
          explain:`From <b>${u}</b>: neighbor <b>${v}</b> is GRAY but is parent → skip (tree edge)`,
          code:[8]
        });
      }
    }
    color[u]=2;
    steps.push({
      color:[...color],current:u,parent:{...parent},backEdge:null,done:false,hasCycle:false,
      explain:`Done with node <b>${u}</b> → mark BLACK\nNo back edges found from ${u}`,
      code:[10]
    });
    return false;
  }
  for(let i=0;i<n;i++){
    if(color[i]===0){
      if(dfs(i))break;
      if(cycleFound)break;
    }
  }
  steps.push({
    color:[...color],current:-1,parent:{...parent},backEdge:cycleFound?backEdge:null,done:true,hasCycle:cycleFound,
    explain:cycleFound
      ?`<b style="color:var(--pink)">✗ Cycle detected!</b> Back edge: ${backEdge[0]} ↔ ${backEdge[1]}\nThis edge connects to an ancestor — cycle confirmed.`
      :`<b style="color:var(--green)">✓ No cycle found.</b> All nodes finished BLACK.\nEvery neighbour was either tree-edge or parent → acyclic graph.`,
    code:[]
  });
  state.extra.cycleBackEdge=backEdge;
  state.steps=steps;state.stepIdx=0;
  state.renderFn=fr=>renderCycleU(fr);
}
function renderCycleU(fr){
  const{graphNodes:nodes,graphEdges:edges}=state.extra;
  if(!nodes)return;
  const{color,current,parent,backEdge,done,hasCycle}=fr;
  const cv=getCanvas(700,370);const ctx=cv.getContext('2d');
  ctx.fillStyle='#060b14';ctx.fillRect(0,0,cv.width,cv.height);
  const nodeCol=c=>c===1?'#ffc107':c===2?'#00e676':'#1e3058';
  edges.forEach(([a,b])=>{
    const na=nodes[a],nb=nodes[b];
    const isBack=backEdge&&((backEdge[0]===a&&backEdge[1]===b)||(backEdge[0]===b&&backEdge[1]===a));
    const isTree=parent&&(parent[b]===a||parent[a]===b);
    ctx.strokeStyle=isBack?'#ff4081':isTree&&color[a]>=1&&color[b]>=1?'#00e67644':'#253d6a';
    ctx.lineWidth=isBack?3:isTree&&color[a]>=1&&color[b]>=1?2.5:1.8;
    if(isBack){ctx.setLineDash([6,3]);}else{ctx.setLineDash([]);}
    ctx.beginPath();ctx.moveTo(na.x,na.y);ctx.lineTo(nb.x,nb.y);ctx.stroke();
    ctx.setLineDash([]);
  });
  nodes.forEach((nd,i)=>{
    const col=nodeCol(color?color[i]:0);
    const isCur=current===i;
    const isBack=backEdge&&(backEdge[0]===i||backEdge[1]===i);
    const fillCol=isBack&&done?'#ff4081':col;
    ctx.beginPath();ctx.arc(nd.x,nd.y,20,0,Math.PI*2);
    ctx.fillStyle=fillCol+'cc';ctx.fill();
    ctx.strokeStyle=isCur?'#ffc107':isBack&&done?'#ff4081':fillCol;
    ctx.lineWidth=isCur?3:2;ctx.stroke();
    ctx.fillStyle='#fff';ctx.font='bold 12px Fira Code';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(nd.label,nd.x,nd.y);
    const stateLabel=color?['','GRAY','BLK'][color[i]]:'';
    if(stateLabel){ctx.fillStyle=nodeCol(color[i]);ctx.font='8px Fira Code';ctx.fillText(stateLabel,nd.x,nd.y+28);}
  });
  if(done){
    const bannerCol=hasCycle?'rgba(255,64,129,.15)':'rgba(0,230,118,.12)';
    const textCol=hasCycle?'#ff4081':'#00e676';
    ctx.fillStyle=bannerCol;ctx.fillRect(10,338,680,26);
    ctx.fillStyle=textCol;ctx.font='bold 12px Fira Code';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(hasCycle?`✗ Cycle Found! Back edge: ${backEdge[0]} ↔ ${backEdge[1]}`:'✓ No Cycle — Graph is Acyclic',350,351);
  }
  ctx.textBaseline='top';
  [['#1e3058','WHITE (unvisited)'],['#ffc107','GRAY (in stack)'],['#00e676','BLACK (done)'],['#ff4081','Back edge']].forEach(([col,lbl],i)=>{
    ctx.fillStyle=col;ctx.beginPath();ctx.arc(20+i*160,16,6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#5a7099';ctx.font='10px Fira Code';ctx.fillText(lbl,32+i*160,11);
  });
  ensureGraphExplainPanel();
  if(fr.explain)updateGraphExplain(fr.explain,'');
}

// ═══════════════════════════════════════════
// CYCLE DETECTION — DIRECTED
// ═══════════════════════════════════════════
function _buildCycleDGraph(){
  const n=8;
  const cx=350,cy=195,rx=200,ry=145;
  const nodes=Array.from({length:n},(_,i)=>({
    id:i,x:cx+Math.cos(i/n*2*Math.PI-Math.PI/2)*rx+(Math.random()-.5)*16,
    y:cy+Math.sin(i/n*2*Math.PI-Math.PI/2)*ry+(Math.random()-.5)*12,label:i
  }));
  let edges=[];
  for(let i=1;i<n;i++){const src=Math.floor(Math.random()*i);edges.push([src,i]);}
  for(let k=0;k<3;k++){const a=Math.floor(Math.random()*(n-1));const b=Math.floor(Math.random()*(n-a-1))+a+1;edges.push([a,b]);}
  edges.push([n-1,Math.floor(Math.random()*(n-2))]);
  const eSet=new Set();edges=edges.filter(([u,v])=>{const k=u+','+v;if(eSet.has(k))return false;eSet.add(k);return true;});
  state.extra.graphNodes=nodes;state.extra.graphEdges=edges;
}
function initCycleD(){
  _buildCycleDGraph();
  genCycleDSteps();
  renderCycleD({color:Array(state.extra.graphNodes.length).fill(0),current:-1,backEdge:null,done:false,hasCycle:false});
  setStatus('Ready — click ▶ Start');
}
function genCycleDSteps(){
  const{graphNodes:nodes,graphEdges:edges}=state.extra;
  if(!nodes)return;
  const n=nodes.length;
  const adj=Array.from({length:n},()=>[]);
  edges.forEach(([a,b])=>adj[a].push(b));
  const color=Array(n).fill(0);
  const steps=[];
  let cycleFound=false,backEdge=null;
  function dfs(u){
    color[u]=1;
    steps.push({
      color:[...color],current:u,backEdge:null,done:false,hasCycle:false,
      explain:`Visit node <b style="color:var(--amber)">${u}</b> → color = GRAY (on recursion stack)\nGray means: currently being explored`,
      code:[4,5]
    });
    for(const v of adj[u]){
      if(color[v]===1){
        cycleFound=true;backEdge=[u,v];
        steps.push({
          color:[...color],current:u,backEdge:[u,v],done:false,hasCycle:true,
          explain:`From <b style="color:var(--pink)">${u}</b> → <b style="color:var(--pink)">${v}</b>: neighbor is GRAY!\n<b style="color:var(--pink)">Back edge detected → Cycle: ${v} → … → ${u} → ${v}</b>`,
          code:[6,7,8]
        });
        return true;
      }
      if(color[v]===0){
        steps.push({
          color:[...color],current:u,backEdge:null,done:false,hasCycle:false,
          explain:`From <b>${u}</b> → <b style="color:var(--purple)">${v}</b>: WHITE → recurse DFS(${v})`,
          code:[9,10,11]
        });
        if(dfs(v))return true;
        if(cycleFound)return true;
      } else {
        steps.push({
          color:[...color],current:u,backEdge:null,done:false,hasCycle:false,
          explain:`From <b>${u}</b> → <b>${v}</b>: BLACK (already fully explored) → safe, skip`,
          code:[6]
        });
      }
    }
    color[u]=2;
    steps.push({
      color:[...color],current:u,backEdge:null,done:false,hasCycle:false,
      explain:`Node <b>${u}</b> fully explored → color = BLACK\nAll outgoing edges checked, no back edge from ${u}`,
      code:[11,12]
    });
    return false;
  }
  for(let i=0;i<n;i++){
    if(color[i]===0){
      if(dfs(i))break;
      if(cycleFound)break;
    }
  }
  steps.push({
    color:[...color],current:-1,backEdge:cycleFound?backEdge:null,done:true,hasCycle:cycleFound,
    explain:cycleFound
      ?`<b style="color:var(--pink)">✗ Cycle detected!</b> Back edge: ${backEdge[0]} → ${backEdge[1]}\nNode ${backEdge[1]} was GRAY when reached from ${backEdge[0]} — still on the call stack.`
      :`<b style="color:var(--green)">✓ No cycle found.</b> All nodes are BLACK.\nThis is a valid DAG (Directed Acyclic Graph).`,
    code:[]
  });
  state.extra.cycleBackEdge=backEdge;
  state.steps=steps;state.stepIdx=0;
  state.renderFn=fr=>renderCycleD(fr);
}
function renderCycleD(fr){
  const{graphNodes:nodes,graphEdges:edges}=state.extra;
  if(!nodes)return;
  const{color,current,backEdge,done,hasCycle}=fr;
  const cv=getCanvas(700,370);const ctx=cv.getContext('2d');
  ctx.fillStyle='#060b14';ctx.fillRect(0,0,cv.width,cv.height);
  const nodeCol=c=>c===1?'#ffc107':c===2?'#00e676':'#1e3058';
  edges.forEach(([a,b])=>{
    const na=nodes[a],nb=nodes[b];
    const isBack=backEdge&&backEdge[0]===a&&backEdge[1]===b;
    const bothDone=color&&color[a]>=1&&color[b]>=1;
    ctx.strokeStyle=isBack?'#ff4081':bothDone&&!isBack?'#00e67644':'#253d6a';
    ctx.lineWidth=isBack?3:bothDone?2.5:1.8;
    if(isBack){ctx.setLineDash([6,3]);}else{ctx.setLineDash([]);}
    const dx=nb.x-na.x,dy=nb.y-na.y,len=Math.sqrt(dx*dx+dy*dy)||1;
    const ux=dx/len,uy=dy/len;
    const ex=nb.x-ux*22,ey=nb.y-uy*22;
    ctx.beginPath();ctx.moveTo(na.x,na.y);ctx.lineTo(ex,ey);ctx.stroke();
    ctx.setLineDash([]);
    const arrowCol=isBack?'#ff4081':bothDone?'#00e67644':'#253d6a';
    ctx.fillStyle=arrowCol;
    ctx.beginPath();
    ctx.moveTo(ex,ey);
    ctx.lineTo(ex-uy*7-ux*12,ey+ux*7-uy*12);
    ctx.lineTo(ex+uy*7-ux*12,ey-ux*7-uy*12);
    ctx.fill();
  });
  nodes.forEach((nd,i)=>{
    const col=nodeCol(color?color[i]:0);
    const isCur=current===i;
    const isBackNode=backEdge&&(backEdge[0]===i||backEdge[1]===i)&&done;
    const fillCol=isBackNode?'#ff4081':col;
    ctx.beginPath();ctx.arc(nd.x,nd.y,20,0,Math.PI*2);
    ctx.fillStyle=fillCol+'cc';ctx.fill();
    ctx.strokeStyle=isCur?'#fff':isBackNode?'#ff4081':fillCol;
    ctx.lineWidth=isCur?3:2;ctx.stroke();
    ctx.fillStyle='#fff';ctx.font='bold 12px Fira Code';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(nd.label,nd.x,nd.y);
    const stateLabel=color?['','GRAY','BLK'][color[i]]:'';
    if(stateLabel){ctx.fillStyle=nodeCol(color[i]);ctx.font='8px Fira Code';ctx.fillText(stateLabel,nd.x,nd.y+28);}
  });
  if(done){
    const bannerCol=hasCycle?'rgba(255,64,129,.15)':'rgba(0,230,118,.12)';
    const textCol=hasCycle?'#ff4081':'#00e676';
    ctx.fillStyle=bannerCol;ctx.fillRect(10,338,680,26);
    ctx.fillStyle=textCol;ctx.font='bold 12px Fira Code';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(hasCycle?`✗ Cycle Found! Back edge: ${backEdge[0]} → ${backEdge[1]}`:'✓ No Cycle — This is a Valid DAG',350,351);
  }
  ctx.textBaseline='top';
  [['#1e3058','WHITE (unvisited)'],['#ffc107','GRAY (in stack)'],['#00e676','BLACK (done)'],['#ff4081','Back edge']].forEach(([col,lbl],i)=>{
    ctx.fillStyle=col;ctx.beginPath();ctx.arc(20+i*160,16,6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#5a7099';ctx.font='10px Fira Code';ctx.fillText(lbl,32+i*160,11);
  });
  ensureGraphExplainPanel();
  if(fr.explain)updateGraphExplain(fr.explain,'');
}
