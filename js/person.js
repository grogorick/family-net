
function convertPerson(p)
{
  if (isDataPersonDoppelganger(p)) {
    return new Doppelganger(p);
  }
  else {
    return new Person(p);
  }
}

function resetPerson(p)
{
  p.reset();
}

class PersonFunctions
{
  _ = this;

  get_rufName()
  {
    return this.get_nickName() || this.get_firstName();
  }

  // ... (xxx) ...
  get_nickName()
  {
    let f = this._.f.replaceAll('?', '').trim();
    let n = f.match(/\(([^()]+)\)/);
    return n ? n[1] : '';
  }

  // ... *xxx ...<br>
  // oder<br>
  // xxx ... ...
  get_firstName()
  {
    let f = this._.f.replaceAll('?', '').trim();
    let n = f.match(/[*]\s*([^-,()\s]+)([-,()\s]|$)/);
    if (!n) {
      n = f.match(/^([^-,()\s]+)([-,()\s]|$)/);
    }
    return n ? n[1] : '';
  }

  get_firstNames()
  {
    return this._.f.replaceAll(/[*?]|\([^()]*\)/g, '').replaceAll(/  +/g, ' ').trim();
  }

  get_birthName()
  {
    let m = this._.m;
    return m.length ? 'geb. ' + m : '';
  }

  get_lastNames()
  {
    return [this._.l, this._.get_birthName()].joinNotEmpty(' ');
  }

  get_fullName()
  {
    return [this._.get_firstNames(), this._.get_lastNames()].joinNotEmpty(' ');
  }

  get_birthYear()
  {
    return splitDate(this._.b)[0];
  }

  get_birthMonth()
  {
    return splitDate(this._.b)[1];
  }

  get_birthDay()
  {
    return splitDate(this._.b)[2];
  }

  get_shortDisplayString()
  {
    return this._.get_rufName() || this._.get_lastNames() || '???';
  }

  get_longDisplayString()
  {
    let n = this._.get_fullName();
    let b = splitDate(this._.b)[0];
    let d = splitDate(this._.d)[0];
    return n + ((b || d) ? ' \n ' + b + ' — ' + d : '');
  }

  get_nodeColor()
  {
    if ('color' in this) {
      return this._.color;
    }
    if (this._.t === PERSON_PREVIEW)
    {
      return settings.nodeColorPreview;
    }
    if ([this._.f, this._.l, this._.m, this._.o].some(v => (typeof v === 'string') && v.includes('???'))) {
      return settings.nodeColorWarning;
    }
    return settings.nodeColor;
  }
}

class Person extends PersonFunctions
{
  t = null;
  f = '';
  l = '';
  m = '';
  b = '';
  d = '';
  o = '';

  _parents = [];
  _children = [];
  _partners = [];
  _other = [];
  _doppelgangers = [];
  _all_connections = [];

  constructor(p)
  {
    super();

    if ('n' in p) {// backward compatibility for old log items with only one name attribute
      // console.log('upgrade old data format ' + p.n);
      if (p.n.includes(',')) {
        let i = p.n.indexOf(',');
        p.f = p.n.substr(0, i).trim();
        p.l = p.n.substr(i + 1).trim();
      }
      else {
        p.f = p.n;
      }
      delete p.n;
    }

    Object.assign(this, p);
  }

  prepare()
  {
  }

  reset()
  {
  }
}

class Doppelganger extends PersonFunctions
{
  t = null;
  p = null;

  _prepared = false;

  constructor(p)
  {
    super();

    Object.assign(this, p);
  }

  prepare()
  {
    if (!this._prepared) {
      this._ = getDataPerson(this.p);
      this._._doppelgangers.push(this);
      this._prepared = true;
    }
  }

  reset()
  {
    if (this._prepared) {
      this._._doppelgangers.splice(this._._doppelgangers.indexOf(this), 1);
      this._ = this;
      this._prepared = false;
    }
  }
}
