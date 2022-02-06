
function convertConnection(c)
{
  return Object.assign(new Connection(), c);
}

function resetConnection(c)
{
  c.reset();
}

class Connection
{
  t = null;
  p1 = null;
  p2 = null;
  r = '';
  d = '';

  _persons = [];
  _children = [];
  _sources = [];

  _prepared = false;

  get_edgeColor()
  {
    if ('color' in this) {
      return this._.color;
    }
    if (this.t === CONNECTION_PREVIEW)
    {
      return settings.edgeColorPreview;
    }
    if (this.d.includes('???')) {
      return settings.edgeColorWarning;
    }
    return settings.edgeColor;
  }

  prepare()
  {
    this.t = parseInt(this.t);
    let p2 = getDataPerson(this.p2)._;
    let isChildConnection = isChildConnectionNodeId(this.p1);
    let level = getConnectionRelationSettings(this.r).level;
    let tmp = null;
    if (isChildConnection || level === 'v') {
      if (isChildConnection) {
        this._parentConnection = getParentConnectionFromChildConnectionNode(this.p1);
        this._parentConnection._children.push({ p: p2, c: this });
        getParentTsFromChildConnectionNode(this.p1).map(p_t => getDataPerson(p_t)._).forEach(p1 =>
        {
          tmp = { p: p2, c: this, pc: this._parentConnection };
          p1._children.push(tmp);
          p1._all_connections.push(tmp);
          tmp = { p: p1, c: this, pc: this._parentConnection };
          p2._parents.push(tmp);
          p2._all_connections.push(tmp);
          this._persons.push(p1);
        });
      }
      else {
        let p1 = getDataPerson(this.p1)._;
        tmp = { p: p2, c: this };
        p1._children.push(tmp);
        p1._all_connections.push(tmp);
        tmp = { p: p1, c: this };
        p2._parents.push(tmp);
        p2._all_connections.push(tmp);
        this._persons.push(p1);
      }
    }
    else {
      let p1 = getDataPerson(this.p1)._;
      if (level === 'h') {
        tmp = { p: p2, c: this };
        p1._partners.push(tmp);
        p1._all_connections.push(tmp);
        tmp = { p: p1, c: this };
        p2._partners.push(tmp);
        p2._all_connections.push(tmp);
      }
      else {
        tmp = { p: p2, c: this };
        p1._other.push(tmp);
        p1._all_connections.push(tmp);
        tmp = { p: p1, c: this };
        p2._other.push(tmp);
        p2._all_connections.push(tmp);
      }
      this._persons.push(p1);
    }
    this._persons.push(p2);
    this._prepared = true;
  }

  reset()
  {
    if ('_parentConnection' in this) {
      this._parentConnection._children = this._parentConnection._children.filter(pcc => pcc.c !== this);
      delete this._parentConnection;
    }
    this._persons.forEach(p =>
    {
      p._children = p._children.filter(pc => pc.c !== this);
      p._parents = p._parents.filter(pp => pp.c !== this);
      p._partners = p._partners.filter(pp => pp.c !== this);
      p._other = p._other.filter(po => pp.c !== this);
    });
    this._prepared = false;
  }
}