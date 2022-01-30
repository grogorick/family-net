
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

  // ... (xxx) ...
  get_nickName()
  {
    let f = this._.f.replaceAll('?', '');
    let n = f.match(/\(([^()]+)\)/);
    return n ? n[1].trim() : '';
  }

  // ... *xxx ...<br>
  // oder<br>
  // xxx ... ...
  get_rufName()
  {
    let f = this._.f.replaceAll('?', '');
    let n = f.match(/[*]\s*([^-,()\s]+)([-,()\s]|$)/);
    if (!n) {
      n = f.match(/^([^-,()\s]+)([-,()\s]|$)/);
    }
    return n ? n[1].trim() : '';
  }

  get_firstNames()
  {
    return this._.f.replaceAll(/[*?]|\([^()]*\)/g, '').replaceAll(/  +/g, ' ').trim();
  }

  get_lastNames()
  {
    return this._.l.trim();
  }

  get_birthNames()
  {
    return this._.m.trim();
  }

  get_lastAndBirthNames()
  {
    let l = this.get_lastNames();
    let m = this.get_birthNames();
    return l + ((l && m) ? ' geb. ' : '') + m;
  }

  get_fullName()
  {
    return [this.get_firstNames(), this.get_lastAndBirthNames()].joinNotEmpty(' ');
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

  get_birthDate()
  {
    return dateString(this._.b);
  }

  get_deathYear()
  {
    return splitDate(this._.d)[0];
  }

  get_deathMonth()
  {
    return splitDate(this._.d)[1];
  }

  get_deathDay()
  {
    return splitDate(this._.d)[2];
  }

  get_deathDate()
  {
    return dateString(this._.d);
  }

  get_notes()
  {
    return this._.o;
  }

  get_shortDisplayString()
  {
    let tmp = [
      'get_nickName',
      'get_rufName',
      'get_lastNames',
      'get_birthNames'];
    let ret = '';
    for (let i = 0; i < tmp.length; ++i) {
      let n = this[tmp[i]]();
      let n_a = isAnonymized(n);
      if (n && !n_a) {
        return n;
      }
      if (n_a) {
        ret = n;
      }
    }
    return ret;
  }

  get_longDisplayString()
  {
    let n = this.get_fullName();
    let b = this.get_birthYear();
    let d = this.get_deathYear();
    return n + ((b || d) ? ' \n ' + b + ' — ' + d : '');
  }

  get_allTextData()
  {
    return [this._.f, this._.l, this._.m, this._.o];
  }

  is_incomplete()
  {
    return this.get_allTextData().some(v => (typeof v === 'string') && v.includes('???'));
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
    if (this.is_incomplete()) {
      return settings.nodeColorWarning;
    }
    return settings.nodeColor;
  }
}

class Person extends PersonFunctions
{
  t = null; // ID (creation timestamp)
  f = '';   // nick and first name(s)
  l = '';   // last name(s)
  m = '';   // birth name(s)
  b = '';   // birth date (YYYY-MM-DD)
  d = '';   // death date (YYYY-MM-DD)
  o = '';   // notes

  _parents = [];
  _children = [];
  _partners = [];
  _other = [];
  _doppelgangers = [];
  _all_connections = [];
  _sources = {};

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
