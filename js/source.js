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
        annotations_raw.forEach(a => this.addAnnotation(personOrConnectionID, a));
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

  addAnnotation(personOrConnectionID, a)
  {
    let annotation = convertAnnotation(a);
    annotation.prepare(this, personOrConnectionID);
    this._annotations[personOrConnectionID].push(annotation);
    return annotation;
  }

  reset()
  {
    if (this._prepared) {
      Object.values(this._annotations).forEach(annotations => annotations.forEach(a => a.reset()));
      this._prepared = false;
    }
  }
}



function convertAnnotation(a)
{
  return Object.assign(new Annotation(), a);
}

function resetAnnotation(a)
{
  a.reset();
}

class Annotation
{
  t = null; // creation timestamp
  x = null; // x position of top left corner
  y = null; // y position of top left corner
  w = null; // width
  h = null; // height
  d = null; // description

  _description = null;
  _source = null;
  _person = null;
  _forPerson = false;
  _connection = null;
  _forConnection = false;

  _prepared = false;

  prepare(source, personOrConnectionID)
  {
    if (!this._prepared) {
      this._description = this.d;
      this._source = source;

      this._person = getDataPerson(personOrConnectionID);
      if (this._person) {
        this._forPerson = true;
      }
      else {
        this._connection = getDataConnection(personOrConnectionID);
        if (this._connection) {
          this._forConnection = true;
        }
      }

      (this._person || this._connection)._sources[this._source._id].push(this);

      this._prepared = true;
    }
  }

  reset()
  {
    if (this._prepared) {
      let sources = (this._person || this._connection)._sources;
      sources[this._source._id].splice(sources[this._source._id].indexOf(this), 1);
      this._prepared = false;
    }
  }

  get_relativePlacement(img)
  {
    return {
      x: this.x / img.clientWidth,
      y: this.y / img.clientHeight,
      w: this.w / img.clientWidth,
      h: this.h / img.clientHeight
    };
  }
  get_imagePlacement(img)
  {
    return {
      x: this.x * img.clientWidth,
      y: this.y * img.clientHeight,
      w: this.w * img.clientWidth,
      h: this.h * img.clientHeight
    };
  }

  convert_toRelative(img, target = new Annotation())
  {
    return Object.assign(target, this.get_relativePlacement(img));
  }
  convert_toImage(img, target = new Annotation())
  {
    return Object.assign(target, this.get_imagePlacement(img));
  }

  applyToSpan(span)
  {
    span.style.left = this.x + 'px';
    span.style.top = this.y + 'px';
    span.style.width = this.w + 'px';
    span.style.height = this.h + 'px';
  }

  get_forPerson() {
    return this._forPerson;
  }
  get_forConnection() {
    return this._forConnection;
  }

  get_person() {
    return this._person;
  }
  get_connection() {
    return this._connection;
  }
}



class AnnotationBuilder
{
  firstPos = null;
  annotation = new Annotation();

  constructor(pos) {
    this.firstPos = pos;
  }
  setSecondPos(pos)
  {
    this.annotation.x = Math.min(this.firstPos.x, pos.x);
    this.annotation.y = Math.min(this.firstPos.y, pos.y);
    this.annotation.w = Math.abs(this.firstPos.x - pos.x);
    this.annotation.h = Math.abs(this.firstPos.y - pos.y);
  }
}

class AnnotationSpanBuilder
{
  annotationBuilder = null;
  span = null;

  constructor(newAnnotation)
  {
    this.annotationBuilder = newAnnotation;
    this.span = document.createElement('span');

    this.span.addEventListener('mousemove', e =>
    {
      this.setSecondPos(getRelativeEventPosition(e, annotatorImg));
    });
    addOneTimeEventListener(this.span, 'click', e =>
    {
      finishNewAnnotation();
    });
  }
  setSecondPos(pos)
  {
    this.annotationBuilder.setSecondPos(pos);
    this.update();
  }
  update()
  {
    this.annotationBuilder.annotation.applyToSpan(this.span);
  }
}



let annotatorBox = document.getElementById('source-annotator');
let annotatorZoomContainer = annotatorBox.querySelector('.annotator-zoom-container');
let annotatorContent = annotatorBox.querySelector('.annotator-content');
let annotatorImg = annotatorBox.querySelector('.annotator-img');
let annotatorZoomInBtn = annotatorBox.querySelector('.annotator-zoom-in');
let annotatorZoomOutBtn = annotatorBox.querySelector('.annotator-zoom-out');
let annotationDetails = annotatorBox.querySelector('#source-annotation-details');

let currentSource = null;
let currentAnnotationPersonOrConnection = null;
let annotationEditable = false;

function showSourceDetails(source)
{
  annotatorImg.src = sourcesPath + source._id + source._ext;
  annotatorContent.style.transform = 'scale(' + (annotatorZoom = 1) + ')';
  annotatorContent.querySelectorAll('span').forEach(s => s.remove());
  annotatorBox.classList.remove('hidden');
  moveToFront(annotatorBox);
  annotationEditable = false;
}

function showSourceWithAnnotations(source, personOrConnection)
{
  showSourceDetails(source);

  currentSource = source;
  currentAnnotationPersonOrConnection = personOrConnection;
  setTimeout(() =>
  {
    if (personOrConnection.t in source._annotations) {
      source._annotations[personOrConnection.t].forEach(addAnnotationSpan);
    }
  }, 200);
  annotationEditable = true;
}

function addAnnotationSpan(annotation)
{
  let span = document.createElement('span');
  annotation.convert_toImage(annotatorImg).applyToSpan(span);
  annotatorContent.appendChild(span);

  span.addEventListener('click', e =>
  {
    showMessage(annotation._description);
  });
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



let annotationSpanBuilder = null;

if (currentUserIsEditing) {
  annotatorImg.addEventListener('click', e =>
  {
    if (annotationEditable) {
      if (annotationSpanBuilder === null) {
        annotationSpanBuilder = new AnnotationSpanBuilder(new AnnotationBuilder(getRelativeEventPosition(e)));
        annotatorContent.appendChild(annotationSpanBuilder.span);
      }
      else {
        finishNewAnnotation();
      }
    }
  });

  annotatorImg.addEventListener('mousemove', e =>
  {
    if (annotationSpanBuilder !== null) {
      annotationSpanBuilder.setSecondPos(getRelativeEventPosition(e));
    }
  });
}

function finishNewAnnotation()
{
  let tmpAnnotationSpanBuilder = annotationSpanBuilder;
  annotationSpanBuilder = null;
  let m = null;
  let closeInput = e =>
  {
    annotatorContent.removeChild(tmpAnnotationSpanBuilder.span);
    m.dismiss();
  };
  let input = null;
  m = showMessage('<input type="text" id="annotationDescription" placeholder="Beschreibung" />', {
    'Speichern': e =>
    {
      let tmpAnnotation = tmpAnnotationSpanBuilder.annotationBuilder.annotation.convert_toRelative(annotatorImg);
      tmpAnnotation.d = input.value;
      let newAnnotation = currentSource.addAnnotation(currentAnnotationPersonOrConnection.t, tmpAnnotation);
      addAnnotationSpan(newAnnotation);
      closeInput();
    },
    'Verwerfen': closeInput
  });
  input = m.content.querySelector('#annotationDescription');
  input.focus();
}



let personMenuSourcesListDiv = document.getElementById('person-form-sources-list');
let personMenuLinkSource = document.getElementById('person-form-link-source');

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

        xhRequest('?action=link-source&source-id=' + source._id + '&person-or-connection-id=' + person.t, responseText =>
        {
          let response = JSON.parse(responseText);
          if ('linked_source' in response && response.linked_source === source._id && parseInt(response.linked_to) === person.t) {
            if (Object.keys(person._sources).length === 0) {
              personMenuSourcesListDiv.innerHTML = '';
            }
            source.linkTo(person);
            addLinkedSourceItem(personMenuSourcesListDiv, source, person);
          }
        });
      });
      list.appendChild(item);
    }
    m = showMessage([list], { 'Abbrechen': DISMISS_MESSAGE });
  });
}

if (BETA) {
callbacks.showPersonInfo.add(person =>
{
  console.log(['person source info', person]);
  personMenuSourcesListDiv.innerHTML = '';
  if (Object.keys(person._sources).length > 0) {
    for (const [sourceID, annotations] of Object.entries(person._sources)) {
      console.log([personMenuSourcesListDiv, annotations, person]);
      addLinkedSourceItem(personMenuSourcesListDiv, data.sources[sourceID], person);
    }
  }
  else if (!currentUserIsEditing) {
    personMenuSourcesListDiv.innerHTML = '&mdash;';
  }
});
}

function addLinkedSourceItem(listDiv, source, personOrConnection)
{
  let showSourceDetailsBtn = document.createElement('button');
  showSourceDetailsBtn.innerHTML = source._description;
  showSourceDetailsBtn.addEventListener('click', e =>
  {
    e.preventDefault();
    showSourceWithAnnotations(source, personOrConnection);
  });

  let li = document.createElement('div');
  li.appendChild(showSourceDetailsBtn);
  listDiv.appendChild(li);
}
