'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..', '..');

// A minimal DOM for running all classic game scripts in their production order.
// These checks exercise game state, queueing and controls, not browser layout.
class Node {
  constructor() { this.children = []; this.style = {}; this.dataset = {}; this.hidden = true; this.value = ''; this.classList = { add() {}, remove() {}, contains() { return false; }, toggle() {} }; this.parentNode = this; this.content = { firstChild: this }; this.options = []; }
  appendChild(n) { this.children.push(n); return n; }
  append(...nodes) { this.children.push(...nodes); }
  prepend(...nodes) { this.children.unshift(...nodes); }
  insertBefore(n) { return this.appendChild(n); }
  addEventListener() {}
  removeEventListener() {}
  setAttribute() {}
  querySelector() { return new Node(); }
  querySelectorAll() { return []; }
  closest() { return new Node(); }
  remove() {}
  scrollIntoView() {}
  getBoundingClientRect() { return { width: 390, height: 844 }; }
  set innerHTML(s) { this._html = s; this.children = []; }
  get innerHTML() { return this._html || ''; }
}
function game() {
  const nodes = new Map(), storage = new Map();
  const node = key => { if (!nodes.has(key)) nodes.set(key, new Node()); return nodes.get(key); };
  const context = vm.createContext({
    console, URL, URLSearchParams, Math: Object.create(Math), Date,
    localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v), removeItem: k => storage.delete(k) },
    document: { querySelector: node, getElementById: id => node('#' + id), querySelectorAll: () => [], createElement: () => new Node(), addEventListener() {}, removeEventListener() {}, documentElement: new Node(), body: new Node() },
    navigator: {}, location: { protocol: 'http:', search: '', hash: '', origin: 'http://localhost', pathname: '/', href: 'http://localhost/' },
    matchMedia: () => ({ matches: false }), setTimeout: () => 1, clearTimeout() {}, setInterval: () => 1, clearInterval() {}, requestAnimationFrame: () => {}, addEventListener() {},
  });
  context.window = context;
  context.confirm = () => true;
  const run = s => vm.runInContext(s, context);
  const scripts = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/<script src="([^"?]+)(?:\?[^\"]*)?"><\/script>/g)].map(x => x[1]);
  for (const filename of scripts) vm.runInContext(fs.readFileSync(path.join(root, filename), 'utf8'), context, { filename });
  run(`render = () => {}; scrollLog = () => {}; sfx = () => {}; refreshSheet = () => {}; toast = () => {};`);
  return { run, nodes, context };
}
function plain(v) { return JSON.parse(JSON.stringify(v)); }
module.exports = { game };
