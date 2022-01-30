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
  a = {};   // annotations list

  _id = null;
  _ext = null;
  _filename = null;
  _description = null;
  _annotations = {};

  _prepared = false;

  prepare(id)
  {
    if (!this._prepared) {
      this._id = id;
      this._ext = this.e;
      this._filename = this.f;
      this._description = this.d;

      this._annotations = {};
      for (const [personOrConnectionID, annotations_raw] of Object.entries(this.a)) {
        this.linkTo(personOrConnectionID);
      }
      this._prepared = true;
    }
  }

  linkTo(personOrConnection)
  {
    if (typeof personOrConnection !== 'object') {
      personOrConnection = getDataPerson(personOrConnection) || getDataConnection(personOrConnection);
    }
    if (!(personOrConnection.t in this._annotations)) {
      this._annotations[personOrConnection.t] = [];
    }
    if (!(this._id in personOrConnection._sources)) {
      personOrConnection._sources[this._id] = [];
    }
  }

  reset()
  {
    if (this._prepared) {
      this._prepared = false;
    }
  }
}



let annotatorBox = document.getElementById('source-annotator');
let annotatorZoomContainer = annotatorBox.querySelector('.annotator-zoom-container');
let annotatorContent = annotatorBox.querySelector('.annotator-content');
let annotatorImg = annotatorBox.querySelector('.annotator-img');
let annotatorZoomInBtn = annotatorBox.querySelector('.annotator-zoom-in');
let annotatorZoomOutBtn = annotatorBox.querySelector('.annotator-zoom-out');
let annotationDetails = annotatorBox.querySelector('#source-annotation-details');

function showSourceDetails(source)
{
  annotatorImg.src = sourcesPath + source._id + source._ext;
  annotatorContent.style.transform = 'scale(' + (annotatorZoom = 1) + ')';
  annotatorContent.querySelectorAll('span').forEach(s => s.remove());
  annotatorBox.classList.remove('hidden');
  moveToFront(annotatorBox);
  annotationEditable = false;
}



let annotatorZoom = 1;
let annotatorZoomStep = .25;

let annotatorZoomFn = e =>
{
  annotatorZoom = Math.max(1, annotatorZoom + annotatorZoomStep * parseFloat(e.target.getAttribute('data-value')));
  annotatorContent.style.transform = 'scale(' + annotatorZoom + ')';
};
annotatorZoomInBtn.addEventListener('click', annotatorZoomFn);
annotatorZoomOutBtn.addEventListener('click', annotatorZoomFn);

annotatorZoomContainer.addEventListener('mousemove', e =>
{
  let pos = getRelativeEventPosition(e, annotatorZoomContainer);
  annotatorContent.style.transformOrigin = (pos.x * annotatorZoom) + 'px ' + (pos.y * annotatorZoom) + 'px';
});



let personMenuLinkSource = document.getElementById('person-form-link-source');
let personMenuSourcesListDiv = document.getElementById('person-form-sources-list');

if (personMenuLinkSource) {
  personMenuLinkSource.addEventListener('click', function(e)
  {
    e.preventDefault();

    let m;
    let list = document.createElement('div');
    for (const [id, source] of Object.entries(data.sources)) {
      let item = creatSourceDiv(source, e =>
      {
        m.dismiss();

        let person = activeState.nodes()[0]._my.p._;
        source.linkTo(person);
        addLinkedSourceItem(personMenuSourcesListDiv, source, person);
      });
      list.appendChild(item);
    }
    m = showMessage([list], { 'Abbrechen': DISMISS_MESSAGE });
  });
}

callbacks.showPersonInfo.add(person =>
{
  personMenuSourcesListDiv.innerHTML = '';
  console.log(['person source info', person]);
  for (const [sourceID, annotations] of Object.entries(person._sources)) {
    console.log([personMenuSourcesListDiv, annotations, person]);
    addLinkedSourceItem(personMenuSourcesListDiv, data.sources[sourceID], person);
  }
});

function addLinkedSourceItem(listDiv, source, personOrConnection)
{
  let li = document.createElement('div');
  li.innerHTML = source._description;
  li.classList.add('button');
  li.addEventListener('click', e =>
  {
    showSourceWithAnnotations(source, personOrConnection);
  });
  listDiv.appendChild(li);
}
