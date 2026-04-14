// ═══════════════════════════════════════════
// TREE (BST + Tree Traversals)
// ═══════════════════════════════════════════
class TreeNode{constructor(v){this.val=v;this.left=null;this.right=null;}}
function initTree(){
  const vals=[50,30,70,20,40,60,80,10,25];
  state.extra.treeRoot=null;
  vals.forEach(v=>{state.extra.treeRoot=bstInsertNode(state.extra.treeRoot,v);});
  state.extra.treeHighlight=new Set();state.extra.traversalOrder=[];
  renderTree(new Set(),[]);
}
function bstInsertNode(root,val){
  if(!root)return new TreeNode(val);
  if(val<root.val)root.left=bstInsertNode(root.left,val);
  else if(val>root.val)root.right=bstInsertNode(root.right,val);
  return root;
}
function bstDeleteNode(root,val){
  if(!root)return null;
  if(val<root.val){root.left=bstDeleteNode(root.left,val);}
  else if(val>root.val){root.right=bstDeleteNode(root.right,val);}
  else{
    if(!root.left)return root.right;
    if(!root.right)return root.left;
    let succ=root.right;while(succ.left)succ=succ.left;
    root.val=succ.val;root.right=bstDeleteNode(root.right,succ.val);
  }
  return root;
}
function countTreeNodes(root){let c=0;function cnt(n){if(!n)return;c++;cnt(n.left);cnt(n.right);}cnt(root);return c;}
function treeInsert(){
  const v=+(document.getElementById('ctrl-tval')||{value:0}).value;
  if(!v){setStatus('Enter a value',false,true);return;}
  state.extra.treeRoot=bstInsertNode(state.extra.treeRoot,v);
  renderTree(new Set(),[]);setStatus(`Inserted ${v} ✓`);
}
function treeSearch(){
  const v=+(document.getElementById('ctrl-tval')||{value:0}).value;
  if(!v){setStatus('Enter a value',false,true);return;}
  const path=[];let node=state.extra.treeRoot;
  while(node){path.push(node.val);if(v===node.val)break;node=v<node.val?node.left:node.right;}
  let idx=0;
  function tick(){
    if(idx>=path.length){
      renderTree(new Set([path[path.length-1]]),path);
      setStatus(path[path.length-1]===v?`Found ${v} ✓`:`${v} not found ✗`,false,path[path.length-1]!==v);return;
    }
    renderTree(new Set([path[idx]]),path.slice(0,idx+1));
    idx++;state.timer=setTimeout(tick,400-state.speed*30);
  }
  tick();
}
function treeDelete(){
  const v=+(document.getElementById('ctrl-tval')||{value:0}).value;
  if(!v){setStatus('Enter a value to delete',false,true);return;}
  const cnt=countTreeNodes(state.extra.treeRoot);
  if(cnt<=1){setStatus('⚠ Cannot delete — only 1 node left',false,true);return;}
  let found=false;
  function checkExists(n){if(!n)return;if(n.val===v)found=true;checkExists(n.left);checkExists(n.right);}
  checkExists(state.extra.treeRoot);
  if(!found){setStatus(`✗ Node ${v} not in tree`,false,true);return;}
  state.extra.treeRoot=bstDeleteNode(state.extra.treeRoot,v);
  renderTree(new Set(),[]);setStatus(`Deleted ${v} ✓`);
}
function startTraversal(type){
  const order=[];
  function inn(n){if(!n)return;inn(n.left);order.push(n.val);inn(n.right);}
  function pre(n){if(!n)return;order.push(n.val);pre(n.left);pre(n.right);}
  function post(n){if(!n)return;post(n.left);post(n.right);order.push(n.val);}
  if(type==='inorder')inn(state.extra.treeRoot);
  else if(type==='preorder')pre(state.extra.treeRoot);
  else post(state.extra.treeRoot);
  state.steps=order.map((v,i)=>({hlSet:[v],order:order.slice(0,i+1),code:[type==='inorder'?1:type==='preorder'?5:9]}));
  state.stepIdx=0;
  state.renderFn=fr=>renderTree(new Set(fr.hlSet||[]),fr.order||[]);
  let idx=0;state.running=true;setStatus('Running',true);
  function tick(){
    if(!state.running||idx>=state.steps.length){state.running=false;setStatus('Done ✓');return;}
    const fr=state.steps[idx++];renderTree(new Set(fr.hlSet),fr.order);highlightCode(fr.code);
    state.timer=setTimeout(tick,Math.max(80,500-state.speed*45));
  }
  tick();
}
function getTreeLayout(root){
  const positions={};let x=0;
  function dfs(node,depth){if(!node)return;dfs(node.left,depth+1);positions[node.val]={x:x*65+50,y:depth*78+55};x++;dfs(node.right,depth+1);}
  dfs(root,0);return positions;
}
function renderTree(highlight,order){
  const root=state.extra.treeRoot;
  if(!root){const ca=document.getElementById('av-canvas');ca.innerHTML='<div style="color:#5a7099;font-size:12px;padding:20px;font-family:Fira Code">Tree is empty — insert values above.</div>';return;}
  const pos=getTreeLayout(root);
  const vals=Object.keys(pos).map(Number);
  const maxX=Math.max(...vals.map(v=>pos[v].x)),maxY=Math.max(...vals.map(v=>pos[v].y));
  const W=Math.max(700,maxX+80),H=Math.max(370,maxY+80);
  const cv=getCanvas(W,H);const ctx=cv.getContext('2d');
  ctx.fillStyle='#060b14';ctx.fillRect(0,0,W,H);
  const offX=Math.max(0,(W-maxX-50)/2);
  function drawEdges(node){
    if(!node)return;
    if(node.left){ctx.strokeStyle='#1e3058';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(pos[node.val].x+offX,pos[node.val].y);ctx.lineTo(pos[node.left.val].x+offX,pos[node.left.val].y);ctx.stroke();drawEdges(node.left);}
    if(node.right){ctx.strokeStyle='#1e3058';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(pos[node.val].x+offX,pos[node.val].y);ctx.lineTo(pos[node.right.val].x+offX,pos[node.right.val].y);ctx.stroke();drawEdges(node.right);}
  }
  function drawNodes(node){
    if(!node)return;
    const{x,y}=pos[node.val];const hl=highlight.has(node.val),inOrd=order.includes(node.val);
    ctx.beginPath();ctx.arc(x+offX,y,20,0,Math.PI*2);
    ctx.fillStyle=hl?'#ffc107':inOrd?'#00e67622':'#0d1526';ctx.fill();
    ctx.strokeStyle=hl?'#ffc107':inOrd?'#00e676':'#1e3058';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=hl?'#000':'#cdd8f0';ctx.font='bold 11px Fira Code';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(node.val,x+offX,y);
    drawNodes(node.left);drawNodes(node.right);
  }
  drawEdges(root);drawNodes(root);
  if(order.length){ctx.fillStyle='#00e676';ctx.font='11px Fira Code';ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText('Order: '+order.join(' → '),20,H-30);}
}
