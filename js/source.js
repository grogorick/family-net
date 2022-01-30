function convertSource(s)
{
  return Object.assign(new Source(), s);
}

function resetSource(s)
{
  s.reset();
}

class Source
{
  e = null; // file extension
  f = null; // file name
  d = null; // description

  _id = null;
  _ext = null;
  _filename = null;
  _description = null;

  _prepared = false;

  prepare(id)
  {
    if (!this._prepared) {
      this._id = id;
      this._ext = this.e;
      this._filename = this.f;
      this._description = this.d;
      this._prepared = true;
    }
  }

  reset()
  {
    if (this._prepared) {
      this._prepared = false;
    }
  }
}
