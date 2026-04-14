// ═══════════════════════════════════════════
// GRID (Pathfinding — BFS / DFS / Dijkstra / A*)
// ═══════════════════════════════════════════
function applyGridSize(id){
  const r=Math.min(28,Math.max(6,+(document.getElementById('ctrl-gr')||{value:16}).value||16));
  const c=Math.min(36,Math.max(8,+(document.getElementById('ctrl-gc')||{value:22}).value||22));
  state.gridRows=r;state.gridCols=c;initGrid(id);
}
function setGridMode(mode,id){
  state.gridMode=mode;
  ['wall','start','end'].forEach(m=>{const b=document.getElementById('gm-'+m);if(b)b.className='btn btn-mode'+(m===mode?' active':'');});
}
function initGrid(id){
  const R=state.gridRows,C=state.gridCols;
  state.grid=Array.from({length:R},(_,r)=>Array.from({length:C},(_,c)=>({wall:false,visited:false,path:false,frontier:false,r,c,dist:Infinity,prev:null})));
  state.startCell={r:2,c:2};state.endCell={r:R-3,c:C-3};
  state.extra.weights=Array.from({length:R},()=>Array.from({length:C},()=>Math.floor(Math.random()*4)+1));
  state.steps=[];state.stepIdx=0;state.gridMode='wall';
  renderGrid(id);setStatus('Click=wall | 🟢Start | 🔴End → then Visualize');
}
function renderGrid(id){
  const ca=document.getElementById('av-canvas');ca.innerHTML='';
  const R=state.gridRows,C=state.gridCols;
  const gc=document.createElement('div');gc.className='grid-container';
  gc.style.gridTemplateColumns=`repeat(${C},22px)`;
  for(let r=0;r<R;r++)for(let c=0;c<C;c++){
    const cell=document.createElement('div');cell.className='grid-cell';cell.id=`gc-${r}-${c}`;
    updateCellClass(cell,r,c);
    cell.onmousedown=()=>{state.drawingWalls=true;handleGridClick(r,c,id);};
    cell.onmouseover=()=>{if(state.drawingWalls&&state.gridMode==='wall')toggleWall(r,c,id);};
    cell.onmouseup=()=>{state.drawingWalls=false;};
    gc.appendChild(cell);
  }
  document.onmouseup=()=>state.drawingWalls=false;
  ca.appendChild(gc);
}
function handleGridClick(r,c,id){
  const m=state.gridMode;
  if(m==='start'){
    state.startCell={r,c};
    document.querySelectorAll('.grid-cell').forEach(el=>el.classList.remove('start'));
    const el=document.getElementById(`gc-${r}-${c}`);if(el)updateCellClass(el,r,c);
    setGridMode('wall',id);setStatus(`Start set at (${r},${c})`);
  } else if(m==='end'){
    state.endCell={r,c};
    document.querySelectorAll('.grid-cell').forEach(el=>el.classList.remove('end'));
    const el=document.getElementById(`gc-${r}-${c}`);if(el)updateCellClass(el,r,c);
    setGridMode('wall',id);setStatus(`End set at (${r},${c})`);
  } else toggleWall(r,c,id);
}
function toggleWall(r,c,id){
  const s=state.startCell,e=state.endCell;
  if(s&&r===s.r&&c===s.c)return;if(e&&r===e.r&&c===e.c)return;
  state.grid[r][c].wall=!state.grid[r][c].wall;
  const el=document.getElementById(`gc-${r}-${c}`);if(el)updateCellClass(el,r,c);
}
function updateCellClass(el,r,c){
  const{startCell,endCell,grid}=state;el.className='grid-cell';
  if(startCell&&r===startCell.r&&c===startCell.c)el.classList.add('start');
  else if(endCell&&r===endCell.r&&c===endCell.c)el.classList.add('end');
  else if(grid[r][c].path)el.classList.add('path');
  else if(grid[r][c].visited)el.classList.add('visited');
  else if(grid[r][c].frontier)el.classList.add('frontier');
  else if(grid[r][c].wall)el.classList.add('wall');
}
function clearGridWalls(id){
  const R=state.gridRows,C=state.gridCols;
  for(let r=0;r<R;r++)for(let c=0;c<C;c++)Object.assign(state.grid[r][c],{wall:false,visited:false,path:false,frontier:false,prev:null,dist:Infinity});
  renderGrid(id||state.current);setStatus('Cleared');
}
function getNeighbors(r,c){return[[0,1],[1,0],[0,-1],[-1,0]].map(([dr,dc])=>[r+dr,c+dc]).filter(([nr,nc])=>nr>=0&&nr<state.gridRows&&nc>=0&&nc<state.gridCols&&!state.grid[nr][nc].wall);}
function runGridTick(id){
  if(!state.running||state.stepIdx>=state.steps.length){
    state.running=false;state.paused=false;
    const paths=state.steps.filter(s=>s.type==='path').length;
    setStatus(paths?`Done ✓ — path: ${paths} cells`:'⚠ No path found!',false,!paths);
    _restoreStartBtn();return;
  }
  if(state.arena){state.running=false;return;}
  const fr=state.steps[state.stepIdx++];
  if(state.renderFn)state.renderFn(fr);
  state.timer=setTimeout(()=>runGridTick(id),Math.max(5,60-state.speed*5));
}
function resumeGridViz(id){
  if(state.running)return;
  if(!state.steps||!state.steps.length){setStatus('Ready');return;}
  state.running=true;state.arena=false;setStatus('Running',true);
  runGridTick(id);
}
function startGridViz(id,resume=false){
  if(state.running)return;
  if(!state.grid)initGrid(id);
  if(!resume){
    const R=state.gridRows,C=state.gridCols;
    for(let r=0;r<R;r++)for(let c=0;c<C;c++)Object.assign(state.grid[r][c],{visited:false,path:false,frontier:false,prev:null,dist:Infinity});
    renderGrid(id);
    const{startCell,endCell,grid}=state;
    const algo=ALGOS[id].algo;
    const steps=[];
    const key=(r,c)=>`${r},${c}`;
    if(algo==='bfs'){
      const queue=[[startCell.r,startCell.c]];grid[startCell.r][startCell.c].visited=true;
      while(queue.length){
        const[r,c]=queue.shift();steps.push({type:'visit',r,c});
        if(r===endCell.r&&c===endCell.c)break;
        getNeighbors(r,c).forEach(([nr,nc])=>{if(!grid[nr][nc].visited){grid[nr][nc].visited=true;grid[nr][nc].prev=[r,c];queue.push([nr,nc]);steps.push({type:'frontier',r:nr,c:nc});}});
      }
    } else if(algo==='dfs'){
      const stack=[[startCell.r,startCell.c]];const vis=new Set([key(startCell.r,startCell.c)]);
      while(stack.length){
        const[r,c]=stack.pop();grid[r][c].visited=true;steps.push({type:'visit',r,c});
        if(r===endCell.r&&c===endCell.c)break;
        getNeighbors(r,c).forEach(([nr,nc])=>{if(!vis.has(key(nr,nc))){vis.add(key(nr,nc));grid[nr][nc].prev=[r,c];stack.push([nr,nc]);steps.push({type:'frontier',r:nr,c:nc});}});
      }
    } else {
      const dist={};dist[key(startCell.r,startCell.c)]=0;grid[startCell.r][startCell.c].dist=0;
      const pq=[[0,startCell.r,startCell.c]];
      const h=(r,c)=>algo==='astar'?Math.abs(r-endCell.r)+Math.abs(c-endCell.c):0;
      while(pq.length){
        pq.sort((a,b)=>a[0]-b[0]);const[d,r,c]=pq.shift();
        if(grid[r][c].visited)continue;
        grid[r][c].visited=true;steps.push({type:'visit',r,c});
        if(r===endCell.r&&c===endCell.c)break;
        getNeighbors(r,c).forEach(([nr,nc])=>{
          const w=state.extra.weights[nr][nc],nd=d+w;
          if(nd<(dist[key(nr,nc)]||Infinity)){dist[key(nr,nc)]=nd;grid[nr][nc].prev=[r,c];grid[nr][nc].dist=nd;pq.push([nd+h(nr,nc),nr,nc]);steps.push({type:'frontier',r:nr,c:nc});}
        });
      }
    }
    let cur=[endCell.r,endCell.c];
    while(cur){
      if(cur[0]===startCell.r&&cur[1]===startCell.c)break;
      steps.push({type:'path',r:cur[0],c:cur[1]});
      const prev=grid[cur[0]][cur[1]].prev;cur=prev;
    }
    state.steps=steps;state.stepIdx=0;
    state.renderFn=fr=>{
      const el=document.getElementById(`gc-${fr.r}-${fr.c}`);if(!el)return;
      if(fr.type==='visit')el.className='grid-cell visited';
      else if(fr.type==='frontier')el.className='grid-cell frontier';
      else if(fr.type==='path')el.className='grid-cell path';
      updateCellClass(document.getElementById(`gc-${startCell.r}-${startCell.c}`),startCell.r,startCell.c);
      updateCellClass(document.getElementById(`gc-${endCell.r}-${endCell.c}`),endCell.r,endCell.c);
    };
  }
  state.running=true;setStatus('Running',true);
  runGridTick(id);
}
