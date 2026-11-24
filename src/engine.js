/* Fourth Space: a finite, orthogonal four-dimensional cell complex. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FourthSpace = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const AXES = ['X', 'Y', 'Z', 'W'];
  const key = p => p.join(',');
  const edgeKey = (a,b) => [key(a),key(b)].sort().join('|');
  const point = k => k.split(',').map(Number);
  const same = (a, b) => a.every((v, i) => v === b[i]);
  function delta(a, b) {
    const diff = b.map((v, i) => v - a[i]);
    if (diff.reduce((n, v) => n + Math.abs(v), 0) !== 1) return null;
    const axis = diff.findIndex(v => v !== 0);
    return { axis, sign: diff[axis] };
  }
  function makeGraph(dims) { return { dims: [...dims], cells: new Map(), edges: new Map() }; }
  function addCell(g, p) {
    if (p.length !== 4 || p.some((v, i) => !Number.isInteger(v) || v < 0 || v >= g.dims[i])) throw Error('Cell outside four-dimensional bounds');
    const k = key(p);
    if (!g.cells.has(k)) { g.cells.set(k, [...p]); g.edges.set(k, new Set()); }
  }
  function connect(g, a, b) {
    if (!delta(a, b)) throw Error('A passage must change exactly one coordinate by one');
    addCell(g, a); addCell(g, b);
    g.edges.get(key(a)).add(key(b)); g.edges.get(key(b)).add(key(a));
  }
  function addPath(g, path) { path.forEach(p => addCell(g, p)); for (let i = 1; i < path.length; i++) connect(g, path[i - 1], path[i]); }
  function next(g, p, axis, sign) {
    if (!Number.isInteger(axis) || axis < 0 || axis > 3 || (sign !== 1 && sign !== -1)) return null;
    const q = [...p]; q[axis] += sign;
    return g.edges.get(key(p))?.has(key(q)) ? q : null;
  }
  function shortest(g, start, goal, bannedAxis = -1) {
    if (!g.cells.has(key(start)) || !g.cells.has(key(goal))) return null;
    const queue = [key(start)], previous = new Map([[key(start), null]]);
    for (let i = 0; i < queue.length; i++) {
      const k = queue[i]; if (k === key(goal)) break;
      for (const n of g.edges.get(k)) {
        if (previous.has(n) || delta(point(k), point(n)).axis === bannedAxis) continue;
        previous.set(n, k); queue.push(n);
      }
    }
    if (!previous.has(key(goal))) return null;
    const path = []; let cursor = key(goal);
    while (cursor !== null) { path.push(point(cursor)); cursor = previous.get(cursor); }
    return path.reverse();
  }
  function rng(seed) { let a = seed >>> 0; return function () { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function generated(seed, dims = [4, 4, 3, 3]) {
    const g = makeGraph(dims), random = rng(seed), start = [0, 0, 0, 0];
    addCell(g, start); const stack = [start];
    while (stack.length) {
      const p = stack[stack.length - 1], options = [];
      for (let axis = 0; axis < 4; axis++) for (const sign of [-1, 1]) {
        const q = [...p]; q[axis] += sign;
        if (q[axis] >= 0 && q[axis] < dims[axis] && !g.cells.has(key(q))) options.push(q);
      }
      if (!options.length) { stack.pop(); continue; }
      const q = options[Math.floor(random() * options.length)]; connect(g, p, q); stack.push(q);
    }
    // A perfect 4D maze: connected, no cycles, one route between any two cells.
    const candidates = [...g.cells.values()].filter(p => p[3] === 0 && p[2] > 0 && p[0] > 0 && p[1] > 0);
    let goal = start, distance = -1;
    for (const p of candidates) {
      const path = shortest(g, start, p), used = new Set(path.slice(1).map((q, i) => delta(path[i], q).axis));
      if (used.size === 4 && path.length > distance) { goal = p; distance = path.length; }
    }
    return { ...g, start, goal: [...goal], seed };
  }
  function level(id, seed = 2048) {
    if (id === 0) {
      const g = makeGraph([5, 3, 1, 2]);
      addPath(g, [[0,1,0,0],[1,1,0,0],[1,1,0,1],[2,1,0,1],[3,1,0,1],[3,1,0,0],[4,1,0,0]]);
      addPath(g, [[0,1,0,0],[0,2,0,0],[1,2,0,0]]);
      addPath(g, [[2,1,0,1],[2,0,0,1]]);
      return { ...g, start:[0,1,0,0], goal:[4,1,0,0], title:'Beyond the wall', subtitle:'Meet a new direction', lesson:'A wall blocks the X route. Step along W, walk around its edge, then return to W = 0.', insight:'You went around a wall in a direction that does not exist in XYZ space. W was a spatial step, not time or teleportation.' };
    }
    if (id === 1) {
      const g = makeGraph([4, 3, 3, 3]);
      addPath(g, [[0,0,0,0],[1,0,0,0],[1,1,0,0],[1,1,1,0],[1,1,1,1],[2,1,1,1],[2,1,1,2],[2,2,1,2],[2,2,2,2],[3,2,2,2],[3,2,2,1],[3,2,2,0]]);
      addPath(g, [[1,1,1,0],[0,1,1,0],[0,2,1,0]]);
      addPath(g, [[2,1,1,1],[2,0,1,1],[3,0,1,1]]);
      addPath(g, [[2,2,1,2],[1,2,1,2]]);
      return { ...g, start:[0,0,0,0], goal:[3,2,2,0], title:'Four directions', subtitle:'Use every spatial axis', lesson:'Now Z has room to move, too. Use Z to change height and W to move perpendicular to all three familiar axes.', insight:'Z and W are independent. Moving in W preserved X, Y and Z; moving in Z preserved X, Y and W.' };
    }
    if (id === 2) {
      const g = generated(seed);
      return { ...g, title:'The hypermaze', subtitle:'Find your own route', lesson:'A seeded maze spanning all four axes. Follow passages, use other planes when they help, and ask for one step if you get stuck.', insight:'You navigated a connected four-dimensional maze. Try a different seed, or reduce visual assistance and build a mental map.' };
    }
    const g = makeGraph([3,3,3,3]);
    for (let x=0;x<3;x++) for(let y=0;y<3;y++) for(let z=0;z<3;z++) for(let w=0;w<3;w++) addCell(g,[x,y,z,w]);
    for(const p of g.cells.values()) for(let a=0;a<4;a++) { const q=[...p]; q[a]++; if(q[a]<3) connect(g,p,q); }
    return { ...g, start:[1,1,1,1], goal:null, title:'Open space', subtitle:'Explore without walls', lesson:'Eight possible directions at each interior cell: ±X, ±Y, ±Z and ±W. Switch planes and notice that W behaves just like another spatial axis.', insight:'' };
  }
  function rotate4(p, axisA, axisB, radians) {
    const q = [...p], c = Math.cos(radians), s = Math.sin(radians);
    q[axisA] = p[axisA]*c - p[axisB]*s;
    q[axisB] = p[axisA]*s + p[axisB]*c; return q;
  }
  return { AXES, key, edgeKey, point, same, delta, makeGraph, addCell, connect, addPath, next, shortest, rng, generated, level, rotate4 };
});
