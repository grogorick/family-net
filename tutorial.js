let tutorialHightlightColor = '#61B1B5';
let tutorialSet = null;
let tutorialWindow = null;
let tutorialStepIdx = 0;
let tutorialSteps = [
  { m: firstLogin
      ? 'Hallo!<p>Das scheint dein erster Besuch zu sein.<br />Wir starten mit einer kurzen Einführung, bevor du loslegen kannst.</p>'
      : 'Alles klar, gehen wir die Schritte noch ein mal durch.',
    before: () => { s.graph.clear(); s.refresh(); },
    after: () => { tutorialWindow.modalBlocker.classList.remove('backdrop-blur'); } },
  { m: 'Das Netz besteht aus Personen (<div class="tutorial-person"></div>)',
    before: () => {
      tutorialSet = {
        xyP1: getGraphPositionFromScreenPosition(-50, - s.renderers[0].height / 4),
        xyP2: getGraphPositionFromScreenPosition(+50, - s.renderers[0].height / 4),
        xyP3: getGraphPositionFromScreenPosition(+150, - s.renderers[0].height / 4),
        xyH1: { x: s.renderers[0].width / 2 - 50 + 'px', y: s.renderers[0].height / 4 + 'px' },
        xyH2: { x: s.renderers[0].width / 2 + 'px', y: s.renderers[0].height / 4 + 'px' },
        xyH3: { x: s.renderers[0].width / 2 + 150 + 'px', y: s.renderers[0].height / 4 + 'px' }
      };
      addPerson({ t: 'p1', x: tutorialSet.xyP1.x, y: tutorialSet.xyP1.y, n: 'Person A', o: '' }, false, false, true, false);
      addPerson({ t: 'p2', x: tutorialSet.xyP2.x, y: tutorialSet.xyP2.y, n: 'Person B', o: '' }, false, false, true, false);
      addConnection({ t: 'c', p1: 'p1', p2: 'p2', r: '', d: '' }, false, false, true, true);
      tutorialHighlight(tutorialSet.xyH1, 50); } },
  { m: 'Das Netz besteht aus Personen (<div class="tutorial-person"></div>), und Verbindungen (<div class="tutorial-connection"></div>) zwischen Personen.',
    before: () => tutorialHighlight(tutorialSet.xyH2, 50) },
  { m: 'Das Netz besteht aus Personen (<div class="tutorial-person"></div>), und Verbindungen (<div class="tutorial-connection"></div>) zwischen Personen.<p>Diese können sich auf der gesamten Seite (dem weißen Hintergrund) und darüber hinaus befinden.</p>' } ];
if (!currentUserIsViewer) { tutorialSteps = tutorialSteps.concat([
  { m: 'Durch Doppelklicken auf den Hintergrund kannst du neue Personen erstellen',
    before: () => tutorialHighlight(tutorialSet.xyH3, 50),
    after: () => addPerson({ t: 'p3', x: tutorialSet.xyP3.x, y: tutorialSet.xyP3.y, n: 'Neue Person', o: '' }, false, false, true, true),
    keepHighlights: true },
  { m: 'Durch Doppelklicken auf den Hintergrund kannst du neue Personen erstellen,<p>während du die Strg-Taste drückst, kannst du sie verschieben</p>',
    keepHighlights: true },
  { m: 'Durch Doppelklicken auf den Hintergrund kannst du neue Personen erstellen,<p>während du die Strg-Taste drückst, kannst du sie verschieben,</p><p>und mit einem einfachen Klick die Details anzeigen bzw. bearbeiten.</p>',
    keepHighlights: true } ]); }
tutorialSteps = tutorialSteps.concat([
  { m: 'Details einer Person findest du hier unten rechts.',
    before: () => { showForm(personMenuForm, 'opt-edit', false); tutorialHighlight('#person-form', 420); },
    after: () => { hideForm(personMenuForm); } },
  { m: 'Details von Verbindungen kannst du ebenfalls mit einem einfachen Klick anzeigen bzw. bearbeiten.',
    before: () => tutorialHighlight(tutorialSet.xyH2, 30),
    keepHighlights: true },
  { m: 'Die Details für Verbindungen findest du ebenfalls unten rechts.',
    before: () => { showForm(connectionMenuForm, 'opt-edit', false); tutorialHighlight('#connection-form', 400); },
    after: () => { hideForm(connectionMenuForm); } } ]);
if (!currentUserIsViewer) { tutorialSteps = tutorialSteps.concat([
  { m: 'Bevor du das Netz ändern kannst, musst du den Bearbeitungsmodus starten.<br />Das geht nur, wenn gerade kein anderer das Netz bearbeitet.',
    before: () => tutorialHighlight('#start-edit', 80) },
  { m: 'Vergiss nicht den Bearbeitungsmodus zu beenden, wenn du fertig bist.',
    before: () => { document.querySelector('#start-edit').innerHTML = 'Fertig'; tutorialHighlight('#start-edit', 80); },
    after: () => { document.querySelector('#start-edit').innerHTML = 'Bearbeiten'; } } ]); }
tutorialSteps = tutorialSteps.concat([
  { m: 'Oben rechts findest du den Verlauf aller Änderungen am Netz.' + (currentUserIsViewer ? '' : '<p>Deine eigenen Änderungen kannst du hier rückgängig machen,<br />solange nach dir kein anderer das Netz geändert hat.</p>'),
    before: () => tutorialHighlight('#log', 80) },
  { m: 'Gleich daneben findest du jederzeit eine Anleitung<br />mit weiteren Details zu allen wichtigen Funktionen.<p>Dort kannst du auch diese Anleitung noch einmal starten.</p>',
    before: () => tutorialHighlight('#help', 80) },
  { m: 'Wenn du fertig bist, halte den Mauscursor über deinen Namen,<br />um die Abmelden-Schaltfläche anzuzeigen.',
    before: () => { document.querySelector('#account a:last-child').style.display = 'inline-block'; tutorialHighlight('#account a:last-child', 150); },
    after: () => { document.querySelector('#account a:last-child').style.display = ''; } },
  { m: 'Das war\'s auch schon. Viel Spaß.',
    after: () => loadData() }
]);

document.getElementById('restart-tutorial').addEventListener('click', e =>
{
  document.getElementById('help').classList.toggle('box-minimized');
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
  let fn = e =>
  {
    tutorialWindow.button.removeEventListener('click', fn);
    if (!('keepHighlights' in tutorialStep)) {
      removeTutorialHighlights();
    }
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
  let x, y;
  if (typeof el === 'string') {
    el = document.querySelector(el);
  }
  else if (typeof el === 'object') {
    if ('x' in el && 'y' in el) {
      x = el.x;
      y = el.y;
      el = null;
    }
    else if (Array.isArray(el)) {
      let ret = [];
      el.forEach(e => { ret.push(tutorialHighlight(e, sizePt)); });
      return ret;
    }
    else if (!('getBoundingClientRect' in el) || typeof el.getBoundingClientRect !== 'function') {
      return null;
    }
  }
  else {
    return null;
  }
  if (el !== null) {
    let b = el.getBoundingClientRect();
    x = (b.left + b.width / 2) + 'px';
    y = (b.top + b.height / 2) + 'px';
  }
  let div = document.createElement('div');
  div.classList.add('tutorial-highlight');
  div.style.left = x;
  div.style.top = y;
  div.style.width = sizePt + 'pt';
  div.style.height = sizePt + 'pt';
  div.style.borderRadius = (sizePt / 2) + 'pt';
  div.style.boxShadow = '0 0 ' + (sizePt / 2) + 'pt ' + tutorialHightlightColor;
  let messageTemplate = document.getElementById('message-template');
  document.body.insertBefore(div, messageTemplate);
  return div;
}

function removeTutorialHighlights()
{
  document.querySelectorAll('.tutorial-highlight').forEach(el => el.parentElement.removeChild(el));
}
