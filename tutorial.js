let tutorialHightlightColor = '#61B1B5';
let tutorialSet = null;
let tutorialWindow = null;
let tutorialStepIdx = 0;
let tutorialSteps = [
  { m: firstLogin
      ? 'Hallo!<p>Das scheint dein erster Besuch zu sein.<br />Wir starten mit einer kurzen Einführung, bevor du loslegen kannst.</p>'
      : 'Alles klar, gehen wir die Einführung noch einmal durch.',
    before: () => {
      let rw = s.renderers[0].width / 2;
      let rh = s.renderers[0].height / 4;
      tutorialSet = {
        P1:   getGraphPositionFromScreenPosition(- 50,                            -rh),
        H1:   {                            x: rw - 50 + 'px',                  y:  rh + 'px' },
        H12:  {                            x: rw + 'px',                       y:  rh + 'px' },
        P2:   getGraphPositionFromScreenPosition(+ 50,                            -rh),
        H2:   {                            x: rw + 50 + 'px',                  y:  rh + 'px' },
        P3:   getGraphPositionFromScreenPosition(+ 150,                           -rh),
        H3:   {                            x: rw + 150 + 'px',                 y:  rh + 'px' },
        P3_1: getGraphPositionFromScreenPosition(+ 150 + 20,                      -rh - 10),
        P3_2: getGraphPositionFromScreenPosition(+ 150 + 40,                      -rh - 15),
        H3_2: {                            x: rw + 150 + 40 + 'px',            y:  rh - 15 + 'px' },
        H24:  {                            x: rw + (50 + 150 + 60) / 2 + 'px', y:  rh - 15 / 2 + 'px' },
        P4:   getGraphPositionFromScreenPosition(+ 150 + 60,                      -rh - 15),
        H4:   {                            x: rw + 150 + 60 + 'px',            y:  rh - 15 + 'px' }
      };
      s.graph.clear(); s.refresh(); },
    after: () => { tutorialWindow.modalBlocker.classList.remove('backdrop-blur'); } },

  { m: 'Das Netz besteht aus Personen (<div class="tutorial-person"></div>)',
    before: () => {
      addPerson({ t: 'p1', x: tutorialSet.P1.x, y: tutorialSet.P1.y, n: 'Person A', o: '' }, false, false, true, false);
      addPerson({ t: 'p2', x: tutorialSet.P2.x, y: tutorialSet.P2.y, n: 'Person B', o: '' }, false, false, true, false);
      addConnection({ t: 'c12', p1: 'p1', p2: 'p2', r: '', d: '' }, false, false, true, true);
      tutorialHighlight(tutorialSet.H1, 50); } },

  { m: '<div class="old">Das Netz besteht aus Personen (<div class="tutorial-person"></div>),</div> und Verbindungen (<div class="tutorial-connection"></div>) zwischen Personen.',
    before: () => tutorialHighlight(tutorialSet.H12, 50) },

  { m: '<div class="old">Das Netz besteht aus Personen (<div class="tutorial-person"></div>), und Verbindungen (<div class="tutorial-connection"></div>) zwischen Personen.</div><p>Diese können sich auf der gesamten Seite (dem weißen Hintergrund) und darüber hinaus befinden.</p>' } ];

if (!currentUserIsViewer) { tutorialSteps = tutorialSteps.concat([
  { m: 'Durch Doppelklicken auf den Hintergrund',
    before: () => {
      tutorialHighlight(tutorialSet.H3, 70, '88');
      tutorialHighlight(tutorialSet.H3, 50, '88'); },
    keepHighlights: true },

  { m: '<div class="old">Durch Doppelklicken auf den Hintergrund</div> erstellst du eine neue Person.',
    before: () => addPerson({ t: 'p3', x: tutorialSet.P3.x, y: tutorialSet.P3.y, n: 'Neue Person', o: '' }, false, false, true, true) },

  { m: 'Während du die Strg-Taste drückst, kannst du Personen mit der Maus verschieben.',
    before: () => {
      let n = s.graph.nodes('p3'); n.x = tutorialSet.P4.x; n.y = tutorialSet.P4.y;
      addPerson({ t: 'pm1', x: tutorialSet.P3.x, y: tutorialSet.P3.y, n: '', o: '', color: '#eee' }, false, false, true, false);
      addPerson({ t: 'pm2', x: tutorialSet.P3_1.x, y: tutorialSet.P3_1.y, n: '', o: '', color: '#ddd' }, false, false, true, false);
      addPerson({ t: 'pm3', x: tutorialSet.P3_2.x, y: tutorialSet.P3_2.y, n: '', o: '', color: '#ccc' }, false, false, true, true);
      tutorialHighlight(tutorialSet.H3_2, 100); },
    after: () => {
      deletePerson('pm1', false, false, true, false);
      deletePerson('pm2', false, false, true, false);
      deletePerson('pm3', false, false, true, true);
    }},

  { m: 'Mit einem einfachen Klick auf eine Person, kannst du ihre Details anzeigen bzw. bearbeiten.',
    before: () => tutorialHighlight(tutorialSet.H4, 50),
    keepHighlights: true } ]); }

tutorialSteps = tutorialSteps.concat([
  { m: '<div class="old">Mit einem einfachen Klick auf eine Person, kannst du ihre Details anzeigen bzw. bearbeiten.</div><p>Die Details findest du dann hier unten rechts.</p>',
    before: () => { showForm(personMenuForm, 'opt-edit', false); tutorialHighlight('#person-form', 420); },
    after: () => { hideForm(personMenuForm); } },

  { m: 'Halte die Strg-Taste gedrückt und klicke auf eine Person, um sie auszuwählen.',
    before: () => {
      activeState.addNodes('p2');
      tutorialHighlight(tutorialSet.H2, 50); },
    keepHighlights: true },

  { m: '<div class="old">Halte die Strg-Taste gedrückt und klicke auf eine Person, um sie auszuwählen.</div><p>Wähle danach eine zweite Person aus</p>',
    before: () => {
      activeState.addNodes('p3');
      tutorialHighlight(tutorialSet.H4, 50); } },

  { m: '<div class="old">Halte die Strg-Taste gedrückt und klicke auf eine Person, um sie auszuwählen.</div><p><span class="old">Wähle eine zweite Person aus,</span> um die beiden zu verbinden.</p>',
    before: () => {
      addConnection({ t: 'c23', p1: 'p2', p2: 'p3', r: '', d: '' }, false, false, true, true);
      tutorialHighlight(tutorialSet.H24, 50); },
    after: () => activeState.dropNodes(),
    keepHighlights: true },

  { m: 'Auch Details von Verbindungen kannst du mit einem einfachen Klick anzeigen bzw. bearbeiten.',
    keepHighlights: true },

  { m: '<div class="old">Auch von Verbindungen kannst du die Details mit einem einfachen Klick anzeigen bzw. bearbeiten.</div><p>Die Details findest du ebenfalls unten rechts.</p>',
    before: () => { showForm(connectionMenuForm, 'opt-edit', false); tutorialHighlight('#connection-form', 400); },
    after: () => { hideForm(connectionMenuForm); } } ]);

if (!currentUserIsViewer) { tutorialSteps = tutorialSteps.concat([
  { m: 'Bevor du das Netz verändern kannst, musst du den Bearbeitungsmodus starten.<br />Das geht nur, wenn gerade kein anderer das Netz bearbeitet.',
    before: () => tutorialHighlight('#start-edit', 80) },

  { m: 'Vergiss nicht den Bearbeitungsmodus zu beenden, wenn du fertig bist.<br />Sonst blockierst du die Bearbeitung für alle anderen.',
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
    tutorialWindow.modalBlocker.id = 'tutorial';
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

function tutorialHighlight(el, sizePt, opacity = 'FF')
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
  div.style.boxShadow = '0 0 ' + (sizePt / 2) + 'pt ' + tutorialHightlightColor + opacity;
  let messageTemplate = document.getElementById('message-template');
  document.body.insertBefore(div, messageTemplate);
  return div;
}

function removeTutorialHighlights()
{
  document.querySelectorAll('.tutorial-highlight').forEach(el => el.parentElement.removeChild(el));
}
