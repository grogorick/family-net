
class Callbacks
{
  constructor()
  {
    this.cbs = [];
  }
  add(cb, priority = 10)
  {
    for (let idx = 0; idx < this.cbs.length; ++idx) {
      if (this.cbs[idx].prio > priority) {
        this.cbs.splice(idx, 0, { cb: cb, prio: priority });
        return;
      }
    }
    this.cbs.push({ cb: cb, prio: priority });
  }
  addOnce(cb, priority = 10)
  {
    let tmp = () =>
    {
      this.remove(tmp);
      cb();
    }
    this.add(tmp, priority);
  }
  remove(cb, priority = null)
  {
    for (let idx = 0; idx < this.cbs.length; ++idx) {
      let listedCb = this.cbs[idx];
      if (listedCb.cb === cb && (priority === null || listedCb.prio === priority)) {
        this.cbs.splice(idx, 1);
        return;
      }
    }
  }
  clear()
  {
    this.cbs = [];
  }
  call(...args)
  {
    this.cbs.slice(0).forEach(cb => cb.cb(...args));
  }
}

let callbacks = new Proxy({}, {
  get: function(obj, prop)
  {
    if(obj[prop] === undefined) {
      obj[prop] = new Callbacks();
    }
    return obj[prop];
  }
});
