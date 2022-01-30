/*
let settings_personPreviewDisplayString = document.querySelector('#settings-person-preview-display-string');
if (settings_personPreviewDisplayString) {
settings_personPreviewDisplayString.addEventListener('change', e =>
{
  console.log("xhRequest('?action=settings&setting=personPreviewDisplayString&' + checkbox.value + '=' + (checkbox.checked ? '1' : '0'));");

  data.settings.personPreviewDisplayString = settings_personPreviewDisplayString.value || 'default';
  data.graph.persons.forEach(p => { p._graphNode.label = getPersonPreviewDisplayString(p); });
  s.refresh();
});
}



// !!
// TEST ONLY
// !!
callbacks.initialLoadComplete.add(() =>
{
  let s = data.sources['1634840820.0'];
  s.linkTo(1610248452);
  s.addAnnotation(1610248452, {
    x: .2,
    y: .3,
    w: .1,
    h: .02,
    d: 'test'
  });
}, 11);
*/