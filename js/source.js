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
