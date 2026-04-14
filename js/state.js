// ═══════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════
let state={
  current:null,running:false,paused:false,speed:5,timer:null,
  steps:[],stepIdx:0,renderFn:null,arena:false,
  arr:[],states:[],
  grid:null,gridRows:16,gridCols:22,startCell:null,endCell:null,drawingWalls:false,gridMode:'wall',
  extra:{}
};
let _lastExplain='';
