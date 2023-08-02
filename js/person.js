
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
  constructor()
  {
    this._ = this;
  }

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

  get_age()
  {
    let from = splitDate(this._.b);
    if (!from[0])
      return '';

    let to = splitDate(this._.d);
    if (!to[0] && (to[1] || to[2]))
      return '';

    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    let approx = false;
    if      (!from[1]) {             from[1] = month; from[2] = day; approx = true; }
    else if (!from[2]) {                              from[2] = day; approx = true; }
    if      (  !to[0]) { to[0] = year; to[1] = month;   to[2] = day; }
    else if (  !to[1]) {               to[1] = month;   to[2] = day; }
    else if (  !to[2]) {                                to[2] = day; }

    from = (new Date(from[0], from[1] - 1, from[2]));
    to   = new Date(  to[0],   to[1] - 1,   to[2]);

    {
      let ynew = to.getFullYear();
      let mnew = to.getMonth();
      let dnew = to.getDate();
      let yold = from.getFullYear();
      let mold = from.getMonth();
      let dold = from.getDate();
      var years = ynew - yold;
      if (mold > mnew)
        years--;
      else {
          if (mold == mnew) {
              if (dold > dnew)
                years--;
          }
      }
    }

    let ret = approx ? '> ' + (years - 1) : years;
    if (!to[0]) {
      if (years > 120) return '';
      if (years > 100) ret += ' ?';
    }
    return ret;
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

  get_longDetailedDisplayString()
  {
    let n = this.get_fullName();
    let b = this.get_birthDate();
    let d = this.get_deathDate();
    let a = this.get_age();
    let o = this.get_notes();
    return n + ((b || d) ? ' \n ' + b + ' — ' + d + (a ? ' \n (' + a + ')' : '') : '') + (o.length ? ' \n\n ' + o : '');
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
  constructor(p)
  {
    super();

    this.t = null; // ID (creation timestamp)
    this.f = '';   // nick and first name(s)
    this.l = '';   // last name(s)
    this.m = '';   // birth name(s)
    this.b = '';   // birth date (YYYY-MM-DD)
    this.d = '';   // death date (YYYY-MM-DD)
    this.o = '';   // notes

    this._parents = [];
    this._children = [];
    this._partners = [];
    this._other = [];
    this._doppelgangers = [];
    this._all_connections = [];
    this._sources = [];

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
    this.t = parseInt(this.t);
  }

  reset()
  {
  }
}

class Doppelganger extends PersonFunctions
{
  constructor(p)
  {
    super();

    this.t = null;
    this.p = null;

    this._prepared = false;

    Object.assign(this, p);
  }

  prepare()
  {
    if (!this._prepared) {
      this.t = parseInt(this.t);
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
