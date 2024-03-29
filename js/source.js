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
  constructor()
  {
    this.e = null; // file extension
    this.f = null; // file name
    this.d = null; // description
    this.a = {};   // annotations list

    this._id = null;
    this._ext = null;
    this._filename = null;
    this._description = null;
    this._annotations = {};

    this._prepared = false;
  }

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
    if (!personOrConnection._sources.includes(this)) {
      personOrConnection._sources.push(this);
    }
  }

  isLinkedTo(personOrConnectionID)
  {
    return personOrConnectionID in this._annotations;
  }

  unlinkFrom(personOrConnection)
  {
    if (typeof personOrConnection !== 'object') {
      personOrConnection = getDataPerson(personOrConnection) || getDataConnection(personOrConnection);
    }
    if (personOrConnection.t in this._annotations) {
      delete this._annotations[personOrConnection.t];
    }
    if (personOrConnection._sources.includes(this)) {
      personOrConnection._sources.splice(personOrConnection._sources.indexOf(this), 1);
    }
  }

  addAnnotation(personOrConnectionID, a)
  {
    let annotation = convertAnnotation(a);
    annotation.prepare(this, personOrConnectionID);
    this._annotations[personOrConnectionID].push(annotation);
    return annotation;
  }

  removeAnnotation(annotation)
  {
    let annotations = this._annotations[annotation.get_personOrConnection().t];
    annotations.splice(annotations.indexOf(annotation), 1);
    annotation.reset();
  }

  reset()
  {
    if (this._prepared) {
      for (const [personOrConnectionID, annotations] of Object.entries(this._annotations)) {
        annotations.forEach(a => a.reset())
        this.unlinkFrom(personOrConnectionID);
      }
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
  constructor()
  {
    this.t = null; // creation timestamp
    this.x = null; // x position of top left corner
    this.y = null; // y position of top left corner
    this.w = null; // width
    this.h = null; // height
    this.d = null; // description

    this._description = null;
    this._source = null;
    this._person = null;
    this._connection = null;

    this._prepared = false;
  }

  prepare(source, personOrConnectionID)
  {
    if (!this._prepared) {
      this.t = parseInt(this.t);
      this._description = this.d;
      this._source = source;

      this._person = getDataPerson(personOrConnectionID);
      if (!this._person) {
        this._connection = getDataConnection(personOrConnectionID);
      }

      this._prepared = true;
    }
  }

  reset()
  {
    if (this._prepared) {
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

  get_person() {
    return this._person;
  }
  get_connection() {
    return this._connection;
  }

  get_personOrConnection()
  {
    return this._person || this._connection;
  }
}



class AnnotationBuilder
{
  constructor(pos)
  {
    this.firstPos = pos;
    this.annotation = new Annotation();
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
  constructor(newAnnotation)
  {
    this.annotationBuilder = newAnnotation;
    this.span = document.createElement('span');

    this.span.addEventListener('mousemove', e =>
    {
      this.setSecondPos(getRelativeEventPosition(e, annotatorImg).scale(annotatorZoomFactor));
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
  resetAnnotatorZoom();
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
    let btns = { 'OK': DISMISS_MESSAGE };
    if (currentUserIsEditing)
      btns['Entfernen'] = e =>
      {
        if (confirm('Markierung wirklich entfernen?')) {
          for (b in m.buttons) {
            m.buttons[b].remove();
          }
          toServerDataGraph('deleteAnnotation', {
              t: annotation.t,
              source_id: annotation._source._id,
              linked_id: annotation.get_personOrConnection().t,
            }, {
              toServer: true,
              toData: d =>
              {
                span.remove();
                annotation._source.removeAnnotation(annotation);
                m.dismiss()
              }
            });
        }
      };
    let m = showMessage(annotation._description, );
  });
}



let annotatorZoomStep = .25;
let annotatorZoomWheelStep = .01;
let annotatorZoomFactor = 1;
let annotatorZoomTransform = ['', '', ''];

function resetAnnotatorZoom()
{
  annotatorZoomFactor = 1;
  annotatorZoomTransform = ['', '', ''];
  annotatorContent.style.transform = '';
}

annotatorZoomInBtn.addEventListener('click', annotatorZoomFn);
annotatorZoomOutBtn.addEventListener('click', annotatorZoomFn);
function annotatorZoomFn(e)
{
  annotatorZoomFactor = Math.max(1, annotatorZoomFactor + annotatorZoomStep * parseFloat(e.target.getAttribute('data-value')));
  annotatorZoomTransform[0] = 'scale(' + annotatorZoomFactor + ')';
  annotatorContent.style.transform = annotatorZoomTransform.join(' ');
};
annotatorZoomContainer.addEventListener('wheel', e =>
{
  annotatorZoomFactor = Math.max(1, annotatorZoomFactor - annotatorZoomWheelStep * e.deltaY);
  annotatorZoomTransform[0] = 'scale(' + annotatorZoomFactor + ')';
  annotatorContent.style.transform = annotatorZoomTransform.join(' ');
});

annotatorZoomContainer.addEventListener('mousemove', e =>
{
  let pos = getRelativeEventPosition(e, annotatorZoomContainer);
  annotatorContent.style.transformOrigin = pos.x + 'px ' + pos.y + 'px';

  let rectImg = annotatorImg.getBoundingClientRect();
  let rectContainer = annotatorZoomContainer.getBoundingClientRect();
  annotatorZoomTransform[1] = 'translate(' +
    ((rectImg.width > rectContainer.width)
      ? ((pos.x / rectContainer.width) * (rectContainer.width - rectImg.width / annotatorZoomFactor))
      : '0') + 'px, ' +
    ((rectImg.height > rectContainer.height)
      ? ((pos.y / rectContainer.height) * (rectContainer.height - rectImg.height / annotatorZoomFactor))
      : '0') + 'px' +
    ')';
  annotatorContent.style.transform = annotatorZoomTransform.join(' ');
});



let annotationSpanBuilder = null;

if (currentUserIsEditing) {
  annotatorImg.addEventListener('click', e =>
  {
    if (annotationEditable) {
      if (annotationSpanBuilder === null) {
        annotationSpanBuilder = new AnnotationSpanBuilder(new AnnotationBuilder(getRelativeEventPosition(e).scale(annotatorZoomFactor)));
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
      annotationSpanBuilder.setSecondPos(getRelativeEventPosition(e).scale(annotatorZoomFactor));
    }
  });
}

function finishNewAnnotation()
{
  let tmpAnnotationSpanBuilder = annotationSpanBuilder;
  annotationSpanBuilder = null;
  let m = null;
  let cancelNewAnnotation = e =>
  {
    annotatorContent.removeChild(tmpAnnotationSpanBuilder.span);
    m.dismiss();
  };
  let input = null;
  m = showMessage('<input type="text" id="annotationDescription" placeholder="Beschreibung" />', {
    'Speichern': e =>
    {
      for (b in m.buttons) {
        m.buttons[b].remove();
      }
      let tmpAnnotation = tmpAnnotationSpanBuilder.annotationBuilder.annotation.convert_toRelative(annotatorImg);
      tmpAnnotation.d = input.value;
      toServerDataGraph('addAnnotation', {
          source_id: currentSource._id,
          linked_id: currentAnnotationPersonOrConnection.t,
          a: {
            x: tmpAnnotation.x,
            y: tmpAnnotation.y,
            w: tmpAnnotation.w,
            h: tmpAnnotation.h,
            d: tmpAnnotation.d
        }}, {
          toServer: (response, d) =>
          {
            response = splitServerResponse(response);
            d.a.t = response[0].substr(2);
          },
          toData: d =>
          {
            let newAnnotation = currentSource.addAnnotation(currentAnnotationPersonOrConnection.t, d.a);
            addAnnotationSpan(newAnnotation);
            cancelNewAnnotation();
          }
        });
    },
    'Verwerfen': cancelNewAnnotation
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

    let person = activeState.nodes()[0]._my.p._;

    let m;
    let list = document.createElement('div');
    for (const [id, source] of Object.entries(data.sources)) {
      if (source.isLinkedTo(person.t)) {
        continue;
      }
      let item = creatSourceDiv(source, e =>
      {
        m.dismiss();
        toServerDataGraph('linkSource', {
            source_id: source._id,
            person_or_connection_id: person.t
          }, {
            jsonServerResponse: true,
            toServer: true,
            toData: d =>
            {
              if (person._sources.length === 0) {
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

callbacks.showPersonInfo.add(person =>
{
  console.log(['person source info', person]);
  personMenuSourcesListDiv.innerHTML = '';
  if (person._sources.length > 0) {
    for (source of person._sources) {
      addLinkedSourceItem(personMenuSourcesListDiv, source, person);
    }
  }
  else if (!currentUserIsEditing) {
    personMenuSourcesListDiv.innerHTML = '&mdash;';
  }
});

function addLinkedSourceItem(listDiv, source, personOrConnection)
{
  let li = document.createElement('div');

  let showSourceDetailsBtn = document.createElement('button');
  showSourceDetailsBtn.innerHTML = source._description;
  showSourceDetailsBtn.addEventListener('click', e =>
  {
    e.preventDefault();
    showSourceWithAnnotations(source, personOrConnection);
  });
  li.appendChild(showSourceDetailsBtn);

  if (currentUserIsEditing && permissions.UNLINK_SOURCE) {
    let unlinkSourceBtn = document.createElement('button');
    unlinkSourceBtn.innerHTML = 'X';
    unlinkSourceBtn.addEventListener('click', e =>
    {
      e.preventDefault();
      console.log(['unlinkSource click', source, personOrConnection]);
      if (confirm('Quelle wirklich entfernen?')) {
        toServerDataGraph('unlinkSource', {
            source_id: source._id,
            person_or_connection_id: personOrConnection.t
          }, {
            jsonServerResponse: true,
            toServer: true,
            toData: d =>
            {
              source.unlinkFrom(personOrConnection)
              if (personOrConnection._sources.length === 0) {
                listDiv.innerHTML = '';
              }
              else {
                li.remove();
              }
            }
          });
      }
    });
    li.appendChild(unlinkSourceBtn);
  }

  listDiv.appendChild(li);
}
