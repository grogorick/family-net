let tutorialWindow = null;
let tutorialStepIdx = 0;
let tutorialSteps = [
  { m: 'Hallo!<p>Das scheint dein erster Besuch zu sein.<br />Wir starten mit einer kurzen Einführung, bevor du loslegen kannst.</p>' },
  { m: 'Das Netz besteht aus Personen (<div class="tutorial-person"></div>), und Verbindungen (<div class="tutorial-connection"></div>) zwischen Personen.<p>Diese können sich auf der gesamten Seite (dem weißen Hintergrund) und darüber hinaus befinden.</p>',
    before: () => tutorialWindow.modalBlocker.classList.remove('backdrop-blur') } ];
if (!currentUserIsViewer) { tutorialSteps = tutorialSteps.concat([
  { m: 'Durch Doppelklicken auf den Hintergrund kannst du neue Personen erstellen.<br />Mit einem einfachen Klick kannst du diese bearbeiten und verschieben.' } ]); }
tutorialSteps = tutorialSteps.concat([
  { m: 'Details einer Person ' + (currentUserIsViewer ? 'findest' : 'eintragen,<br />bzw. einer existierenden Person ändern,<br />kannst') + ' du hier unten rechts.',
    s: 420, el: '#person-form',
    before: (s) => { showForm(personMenuForm, 'opt-edit', false); },
    after: () => { hideForm(personMenuForm); } },
  { m: 'Die Details für Verbindungen zwischen den Personen<br />findest du ebenfalls dort.',
    s: 400, el: '#connection-form',
    before: (s) => { showForm(connectionMenuForm, 'opt-edit', false); },
    after: () => { hideForm(connectionMenuForm); } } ]);
if (!currentUserIsViewer) { tutorialSteps = tutorialSteps.concat([
  { m: 'Bevor du das Netz ändern kannst, musst du den Bearbeitungsmodus starten.<br />Das geht nur, wenn gerade kein anderer das Netz bearbeitet.',
    s: 80, el: '#start-edit' },
  { m: 'Vergiss nicht den Bearbeitungsmodus zu beenden, wenn du fertig bist.',
    s: 80, el: '#start-edit',
    before: (s) => { document.querySelector(s.el).innerHTML = 'Fertig'; },
    after: (s) => { document.querySelector(s.el).innerHTML = 'Bearbeiten'; } } ]); }
tutorialSteps = tutorialSteps.concat([
  { m: 'Oben rechts findest du den Verlauf aller Änderungen am Netz.' + (currentUserIsViewer ? '' : '<p>Deine eigenen Änderungen kannst du hier rückgängig machen,<br />solange nach dir kein anderer das Netz geändert hat.</p>'),
    s: 80, el: '#log' },
  { m: 'Gleich daneben findest du jederzeit eine Anleitung<br />mit weiteren Details zu allen wichtigen Funktionen.<p>Dort kannst du auch diese Anleitung noch einmal starten.</p>',
    s: 80, el: '#help' },
  { m: 'Wenn du fertig bist, halte den Mauscursor über deinen Namen,<br />um die Abmelden-Schaltfläche anzuzeigen.',
    s: 150, el: '#account a:last-child',
    before: (s) => { document.querySelector(s.el).style.display = 'inline-block'; },
    after: (s) => { document.querySelector(s.el).style.display = ''; } },
  { m: 'Das war\'s auch schon. Viel Spaß.' }
]);

document.getElementById('restart-tutorial').addEventListener('click', e =>
{
  document.getElementById('help').classList.toggle('box-minimized');
  tutorialStepIdx = 1;
  showTutorial();
});
if (firstLogin) {
  showTutorial();
}

function showTutorial()
{
  let tutorialStep = tutorialSteps[tutorialStepIdx];
  tutorialStepIdx = (tutorialStepIdx + 1) % tutorialSteps.length;
  if (tutorialWindow === null) {
    tutorialWindow = showMessage(tutorialStep.m, false);
  }
  else {
    tutorialWindow.content.innerHTML = tutorialStep.m;
  }
  if ('before' in tutorialStep) {
    tutorialStep.before(tutorialStep);
  }
  if ('el' in tutorialStep) {
    tutorialHighlight(tutorialStep.el, tutorialStep.s);
  }
  let fn = e =>
  {
    tutorialWindow.button.removeEventListener('click', fn);
    removeTutorialHighlights();
    if ('after' in tutorialStep) {
      tutorialStep.after(tutorialStep);
    }
    if (tutorialStepIdx === 0) {
      tutorialWindow.defaultButtonClickFn(null);
      tutorialWindow = null;
      tutorialStep = null;
    }
    else {
      showTutorial();
    }
  };
  tutorialWindow.button.addEventListener('click', fn);
}

function tutorialHighlight(el, sizePt)
{
  if (typeof el === 'object' && Array.isArray(el)) {
    let ret = [];
    el.forEach(e => { ret.push(tutorialHighlight(e, sizePt)) });
    return ret;
  }
  if (typeof el === 'string') {
    el = document.querySelector(el);
  }
  let b = el.getBoundingClientRect();
  return tutorialHighlightXY((b.left + el.clientWidth / 2) + 'px', (b.top + el.clientHeight / 2) + 'px', sizePt);
}

function tutorialHighlightXY(x, y, sizePt)
{
  let div = document.createElement('div');
  div.classList.add('tutorial-highlight');
  div.style.left = x;
  div.style.top = y;
  div.style.width = sizePt + 'pt';
  div.style.height = sizePt + 'pt';
  div.style.borderRadius = (sizePt / 2) + 'pt';
  let messageTemplate = document.getElementById('message-template');
  document.body.insertBefore(div, messageTemplate);
  return div;
}

function removeTutorialHighlights()
{
  document.querySelectorAll('.tutorial-highlight').forEach(el => el.parentElement.removeChild(el));
}
