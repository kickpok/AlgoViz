// ═══════════════════════════════════════════
// SORT
// ═══════════════════════════════════════════
const COLORS={default:'#1e3058',comparing:'#ffc107',swapped:'#ff4081',sorted:'#00e676',pivot:'#ce93d8'};

function initSort(id){
  const n=Math.min(60,Math.max(5,+(document.getElementById('ctrl-size')||{value:30}).value||30));
  state.arr=Array.from({length:n},()=>Math.floor(Math.random()*90)+10);
  state.states=state.arr.map(()=>({color:COLORS.default}));
  state.steps=genSortSteps(id,[...state.arr]);state.stepIdx=0;
  state.renderFn=fr=>renderSort(fr.arr,fr.states);
  renderSort(state.arr,state.states);setStatus('Ready');
}
function renderSort(arr,states){
  const cv=getCanvas(700,320);const ctx=cv.getContext('2d');
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
}
function* bubbleSortGen(arr){
  const n=arr.length;const s=arr.map(()=>({color:COLORS.default}));
  for(let i=0;i<n;i++){let sw=false;
    for(let j=0;j<n-i-1;j++){
      s[j].color=COLORS.comparing;s[j+1].color=COLORS.comparing;
      yield{arr:[...arr],states:s.map(x=>({...x})),code:[4,5]};
      if(arr[j]>arr[j+1]){[arr[j],arr[j+1]]=[arr[j+1],arr[j]];sw=true;s[j].color=COLORS.swapped;s[j+1].color=COLORS.swapped;yield{arr:[...arr],states:s.map(x=>({...x})),code:[6,7,8]};}
      s[j].color=COLORS.default;s[j+1].color=COLORS.default;
    }
    s[n-1-i].color=COLORS.sorted;if(!sw)break;
  }
  s.forEach(x=>x.color=COLORS.sorted);yield{arr:[...arr],states:s.map(x=>({...x})),code:[]};
}
function* mergeSortGen(arr){
  const s=arr.map(()=>({color:COLORS.default}));
  function* ms(a,lo,hi){
    if(lo>=hi)return;const mid=Math.floor((lo+hi)/2);
    yield* ms(a,lo,mid);yield* ms(a,mid+1,hi);
    const L=a.slice(lo,mid+1),R=a.slice(mid+1,hi+1);let i=0,j=0,k=lo;
    while(i<L.length&&j<R.length){s[k].color=COLORS.comparing;if(L[i]<=R[j])a[k++]=L[i++];else a[k++]=R[j++];yield{arr:[...a],states:s.map(x=>({...x})),code:[9,10,11]};s[k-1].color=COLORS.sorted;}
    while(i<L.length){a[k++]=L[i++];s[k-1].color=COLORS.sorted;yield{arr:[...a],states:s.map(x=>({...x})),code:[12]};}
    while(j<R.length){a[k++]=R[j++];s[k-1].color=COLORS.sorted;yield{arr:[...a],states:s.map(x=>({...x})),code:[12]};}
  }
  yield* ms(arr,0,arr.length-1);
  s.forEach(x=>x.color=COLORS.sorted);yield{arr:[...arr],states:s.map(x=>({...x})),code:[]};
}
function* quickSortGen(arr){
  const s=arr.map(()=>({color:COLORS.default}));
  function* qs(a,lo,hi){
    if(lo>=hi)return;s[hi].color=COLORS.pivot;yield{arr:[...a],states:s.map(x=>({...x})),code:[7]};
    let i=lo-1;
    for(let j=lo;j<hi;j++){
      s[j].color=COLORS.comparing;yield{arr:[...a],states:s.map(x=>({...x})),code:[9]};
      if(a[j]<=a[hi]){i++;[a[i],a[j]]=[a[j],a[i]];s[i].color=COLORS.swapped;s[j].color=COLORS.swapped;yield{arr:[...a],states:s.map(x=>({...x})),code:[10,11,12]};}
      if(s[j].color!==COLORS.sorted)s[j].color=COLORS.default;
      if(s[i]&&s[i].color!==COLORS.sorted)s[i].color=COLORS.default;
    }
    [a[i+1],a[hi]]=[a[hi],a[i+1]];s[i+1].color=COLORS.sorted;s[hi].color=COLORS.default;
    yield{arr:[...a],states:s.map(x=>({...x})),code:[13]};
    const p=i+1;yield* qs(a,lo,p-1);yield* qs(a,p+1,hi);
  }
  yield* qs(arr,0,arr.length-1);
  s.forEach(x=>x.color=COLORS.sorted);yield{arr:[...arr],states:s.map(x=>({...x})),code:[]};
}
function* heapSortGen(arr){
  const n=arr.length;const s=arr.map(()=>({color:COLORS.default}));
  function* heapify(a,sz,i){
    let largest=i,l=2*i+1,r=2*i+2;
    s[i].color=COLORS.comparing;yield{arr:[...a],states:s.map(x=>({...x})),code:[11]};
    if(l<sz&&a[l]>a[largest])largest=l;if(r<sz&&a[r]>a[largest])largest=r;
    if(largest!==i){[a[i],a[largest]]=[a[largest],a[i]];s[i].color=COLORS.swapped;s[largest].color=COLORS.swapped;yield{arr:[...a],states:s.map(x=>({...x})),code:[12,13]};s[i].color=COLORS.default;s[largest].color=COLORS.default;yield* heapify(a,sz,largest);}
    else s[i].color=COLORS.default;
  }
  for(let i=Math.floor(n/2)-1;i>=0;i--)yield* heapify(arr,n,i);
  for(let i=n-1;i>0;i--){[arr[0],arr[i]]=[arr[i],arr[0]];s[i].color=COLORS.sorted;yield{arr:[...arr],states:s.map(x=>({...x})),code:[5,6]};yield* heapify(arr,i,0);}
  s[0].color=COLORS.sorted;yield{arr:[...arr],states:s.map(x=>({...x})),code:[]};
}
function genSortSteps(id,arr){
  const gen=id==='bubble'?bubbleSortGen(arr):id==='merge'?mergeSortGen(arr):id==='quick'?quickSortGen(arr):heapSortGen(arr);
  const steps=[];let r=gen.next();while(!r.done){steps.push(r.value);r=gen.next();}return steps;
}
