let tutorialHighlightColor = '#61B1B5';
let tutorialSet = null;
let tutorialStepIdx = 0;
let tutorialStep = null;
let tutorialWindow = null;

let tutorialSteps = [
  { m: firstLogin
      ? '<p>Hallo!</p><p>Das scheint dein erster Besuch zu sein.<br />Wir starten mit einer kurzen Einführung, bevor du loslegen kannst.</p><p>Du kannst dir die Einleitung auch bei deinem nächsten Besuch ansehen.</p>'
      : accountUpgraded
      ? '<p>Hallo!</p><p>Du darfst jetzt Änderungen am Netz vornehmen.<br />Dazu gibt es noch einmal eine kurze Einführung, bevor du loslegen kannst.</p><p>Du kannst dir die Einleitung auch bei deinem nächsten Besuch ansehen.</p>'
      : '<p>Alles klar, gehen wir die Einführung noch einmal durch.</p>',
    before: () => {
      doNotUpdateCamera = true;
      let rw = s.renderers[0].width / 2;
      let rh = s.renderers[0].height / 4;
      tutorialSet = {
        P0:   getGraphPositionFromScreenPosition(- rw - 100,                      -rh),
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
        H4:   {                            x: rw + 150 + 60 + 'px',            y:  rh - 15 + 'px' } };
      s.graph.clear(); s.refresh();
      tutorialWindow.button_Abbrechen.setAttribute('data-innerHTML', tutorialWindow.button_Abbrechen.innerHTML);
      tutorialWindow.button_Abbrechen.innerHTML = 'Später ansehen';
      tutorialWindow.button_Weiter.setAttribute('data-innerHTML', tutorialWindow.button_Weiter.innerHTML);
      tutorialWindow.button_Weiter.innerHTML = 'Los geht\'s'; },
    after: () => {
      addPerson({ t: 'p0', x: tutorialSet.P0.x, y: tutorialSet.P0.y, l: 'Person C', o: '' }, false, false, true, false);
      addPerson({ t: 'p1', x: tutorialSet.P1.x, y: tutorialSet.P1.y, l: 'Person A', o: '' }, false, false, true, false);
      addPerson({ t: 'p2', x: tutorialSet.P2.x, y: tutorialSet.P2.y, l: 'Person B', o: '' }, false, false, true, false);
      addConnection({ t: 'c12', p1: 'p1', p2: 'p2', r: '', d: '' }, false, false, true, true);
      tutorialWindow.button_Abbrechen.innerHTML = tutorialWindow.button_Abbrechen.getAttribute('data-innerHTML');
      tutorialWindow.button_Weiter.innerHTML = tutorialWindow.button_Weiter.getAttribute('data-innerHTML');
      tutorialWindow.modalBlocker.classList.remove('backdrop-blur'); },
    delayNextStep: true } ];

if (!accountUpgraded) { tutorialSteps = tutorialSteps.concat([
  { m: '<p>Das Netz besteht aus Personen (<span class="tutorial-person"></span>)<span class="invisible">, und Verbindungen (<span class="tutorial-connection"></span>) zwischen Personen.</span></p><p class="invisible">Diese können sich auf der gesamten Seite befinden (dem weißen Hintergrund) und darüber hinaus.</p>',
    before: () => {
      tutorialHighlight(tutorialSet.H1, 50); } },

  { m: '<p><span class="old">Das Netz besteht aus Personen (<span class="tutorial-person"></span>),</span> und Verbindungen (<span class="tutorial-connection"></span>) zwischen Personen.</p><p class="invisible">Diese können sich auf der gesamten Seite befinden (dem weißen Hintergrund) und darüber hinaus.</p>',
    before: () => tutorialHighlight(tutorialSet.H12, 50) },

  { m: '<p class="old">Das Netz besteht aus Personen (<span class="tutorial-person"></span>), und Verbindungen (<span class="tutorial-connection"></span>) zwischen Personen.</p><p>Diese können sich auf der gesamten Seite befinden (dem weißen Hintergrund)<span class="invisible"> und darüber hinaus.</span></p>' },

  { m: '<p class="old">Das Netz besteht aus Personen (<span class="tutorial-person"></span>), und Verbindungen (<span class="tutorial-connection"></span>) zwischen Personen.</p><p><span class="old">Diese können sich auf der gesamten Seite befinden (dem weißen Hintergrund)</span> und darüber hinaus.</p>',
    before: () => {
      let tmpX = s.camera.x;
      let tmpY = s.camera.y;
      let tmpRatio = s.camera.ratio;
      let newX = getGraphPositionFromScreenPosition(-s.renderers[0].width / 2 - 100 + (300 / tmpRatio), 0).x - getGraphPositionFromScreenPosition(-s.renderers[0].width / 2 - 100, 0).x;
      sigma.misc.animation.camera(s.camera, { x: -newX, y: tmpY, ratio: tmpRatio }, { duration: 1000, onComplete: () => {
          setTimeout(() => {
            sigma.misc.animation.camera(s.camera, { x: tmpX, y: tmpY, ratio: tmpRatio }, { duration: 1000 }); }, 2000); } }); },
    delayNextStep: true,
    buttonTimeout: 5000 } ]); }

if (!currentUserIsViewer) { tutorialSteps = tutorialSteps.concat([
  { m: '<p>Durch Doppelklicken auf den Hintergrund <span class="invisible">erstellst du eine neue Person.</span></p>',
    before: () => {
      tutorialHighlight(tutorialSet.H3, 70, '88');
      tutorialHighlight(tutorialSet.H3, 50, '88'); },
    keepHighlights: true },

  { m: '</p><span class="old">Durch Doppelklicken auf den Hintergrund</span> erstellst du eine neue Person.</p>',
    before: () => addPerson({ t: 'p3', x: tutorialSet.P3.x, y: tutorialSet.P3.y, l: 'Neue Person', o: '' }, false, false, true, true),
    delayNextStep: true },

  { m: '<p>Während du die ' + modKeys + '-Taste drückst, kannst du Personen mit der Maus verschieben.</p>',
    before: () => {
      let n = s.graph.nodes('p3'); n.x = tutorialSet.P4.x; n.y = tutorialSet.P4.y;
      addPerson({ t: 'pm1', x: tutorialSet.P3.x, y: tutorialSet.P3.y, o: '', color: '#eee' }, false, false, true, false);
      addPerson({ t: 'pm2', x: tutorialSet.P3_1.x, y: tutorialSet.P3_1.y, o: '', color: '#ddd' }, false, false, true, false);
      addPerson({ t: 'pm3', x: tutorialSet.P3_2.x, y: tutorialSet.P3_2.y, o: '', color: '#ccc' }, false, false, true, true);
      tutorialHighlight(tutorialSet.H3_2, 100); },
    after: () => {
      deletePerson('pm1', false, false, true, false);
      deletePerson('pm2', false, false, true, false);
      deletePerson('pm3', false, false, true, true); },
    delayNextStep: true } ]); }

tutorialSteps = tutorialSteps.concat([
  { m: '<p>Mit einem einfachen Klick auf eine Person, kannst du ihre Details anzeigen' + (currentUserIsViewer ? '.' : ' bzw. bearbeiten.') + '</p><p class="invisible">Die Details findest du dann im Detailfenster.</p>',
    before: () => tutorialHighlight(tutorialSet.H1, 50),
    keepHighlights: true },

  { m: '<p class="old">Mit einem einfachen Klick auf eine Person, kannst du ihre Details anzeigen' + (currentUserIsViewer ? '.' : ' bzw. bearbeiten.') + '</p><p>Die Details findest du dann im Detailfenster.</p>',
    before: () => {
      personMenuDelete.classList.add('hidden');
      personMenuEdit.classList.add('hidden');
      clearPersonMenu();
      showForm(personMenuForm, 'opt-edit', false);
      tutorialHighlight('#person-form', 420); },
    after: () => hideForm(personMenuForm),
    delayNextStep: true } ]);

if (!currentUserIsViewer) { tutorialSteps = tutorialSteps.concat([
  { m: '<p>Halte die ' + modKeys + '-Taste gedrückt und klicke auf eine Person, um sie auszuwählen.</p><p class="invisible">Wähle danach eine zweite Person aus, um die beiden zu verbinden.</p>',
    before: () => {
      activeState.addNodes('p2'); s.refresh();
      tutorialHighlight(tutorialSet.H2, 50); },
    keepHighlights: true },

  { m: '<p class="old">Halte die ' + modKeys + '-Taste gedrückt und klicke auf eine Person, um sie auszuwählen.</p><p>Wähle danach eine zweite Person aus<span class="invisible">, um die beiden zu verbinden.</span></p>',
    before: () => {
      activeState.addNodes('p3'); s.refresh();
      tutorialHighlight(tutorialSet.H4, 50); } },

  { m: '<p class="old">Halte die ' + modKeys + '-Taste gedrückt und klicke auf eine Person, um sie auszuwählen.</p><p><span class="old">Wähle danach eine zweite Person aus,</span> um die beiden zu verbinden.</p>',
    before: () => {
      addConnection({ t: 'c23', p1: 'p2', p2: 'p3', r: '', d: '' }, false, false, true, true);
      tutorialHighlight(tutorialSet.H24, 50); },
    after: () => { activeState.dropNodes(); s.refresh(); },
    delayNextStep: true } ]); }

tutorialSteps = tutorialSteps.concat([
  { m: '<p>Auch Details von Verbindungen kannst du mit einem einfachen Klick anzeigen' + (currentUserIsViewer ? '.' : ' bzw. bearbeiten.') + '</p><p class="invisible">Die Details findest du ebenfalls im Detailfenster.</p>',
    before: () => {
      activeState.addEdges('c12'); s.refresh();
      tutorialHighlight(tutorialSet.H12, 50); },
    keepHighlights: true },

  { m: '<p class="old">Auch Details von Verbindungen kannst du mit einem einfachen Klick anzeigen' + (currentUserIsViewer ? '.' : ' bzw. bearbeiten.') + '</p><p>Die Details findest du ebenfalls im Detailfenster.</p>',
    before: () => {
      connectionMenuDelete.classList.add('hidden');
      connectionMenuEdit.classList.add('hidden');
      clearConnectionMenu();
      showForm(connectionMenuForm, 'opt-edit', false);
      tutorialHighlight('#connection-form', 400); },
    after: () => {
      activeState.dropEdges(); s.refresh();
      hideForm(connectionMenuForm); },
    delayNextStep: true } ]);

if (!currentUserIsViewer) { tutorialSteps = tutorialSteps.concat([
  { m: '<p>Bevor du das Netz verändern kannst, musst du den Bearbeitungsmodus starten.</p><p>Das geht nur, wenn gerade kein anderer das Netz bearbeitet.</p>',
    before: () => tutorialHighlight('#start-edit, #stop-edit', 80),
    delayNextStep: true },

  { m: '<p>Vergiss nicht den Bearbeitungsmodus zu beenden, wenn du fertig bist,<br />sonst blockierst du die Bearbeitung für alle anderen.</p>',
    before: () => {
      let btn = document.querySelector('#start-edit');
      if (btn) {
        btn.innerHTML = 'Fertig';
      }
      tutorialHighlight('#start-edit, #stop-edit', 80); },
    after: () => {
      let btn = document.querySelector('#start-edit');
      if (btn) {
        btn.innerHTML = 'Bearbeiten';
      } },
    delayNextStep: true } ]); }

tutorialSteps = tutorialSteps.concat([
  { m: '<p>Oben links findest du den kannst du zwischen verschiedenen Ansichten wechseln.</p>',
    before: () => tutorialHighlight('#layouts', 70),
    delayNextStep: true },

  { m: '<p>Oben rechts findest du den Verlauf aller Änderungen am Netz.</p>' + (currentUserIsViewer ? '' : '<p class="invisible">Deine eigenen Änderungen kannst du hier rückgängig machen,<br />solange nach dir kein anderer das Netz geändert hat.</p>'),
    before: () => tutorialHighlight('#log', 70),
    keepHighlights: !currentUserIsViewer,
    delayNextStep: currentUserIsViewer } ]);

if (!currentUserIsViewer) { tutorialSteps = tutorialSteps.concat([
  { m: '<p class="old">Oben rechts findest du den Verlauf aller Änderungen am Netz.</p>' + (currentUserIsViewer ? '' : '<p>Deine eigenen Änderungen kannst du hier rückgängig machen,<br />solange nach dir kein anderer das Netz geändert hat.</p>'),
    delayNextStep: true } ]); }

tutorialSteps = tutorialSteps.concat([
  { m: '<p>Gleich daneben findest du jederzeit eine Hilfe mit Anleitungen<br />zu allen wichtigen Funktionen.</p><p class="invisible">Dort kannst du auch diese Einführung jederzeit noch einmal starten.</p>',
    before: () => tutorialHighlight('#help', 70),
    keepHighlights: true },

  { m: '<p class="old">Gleich daneben findest du jederzeit eine Hilfe mit Anleitungen<br />zu allen wichtigen Funktionen.</p><p>Dort kannst du auch diese Einführung jederzeit noch einmal starten.</p>',
    delayNextStep: true },

  { m: '<p>Das war\'s auch schon. Viel Spaß.</p>',
    before: () => {
      tutorialWindow.button_Abbrechen.classList.add('hidden');
      tutorialWindow.button_Weiter.innerHTML = 'OK';
      xhRequest('?action=tutorial-completed'); },
    after: () => {
      loadData();
      doNotUpdateCamera = false;
    },
    buttonTimeout: 10 }
]);

document.getElementById('restart-tutorial').addEventListener('click', () =>
{
  document.getElementById('help').classList.toggle('box-minimized');
  showTutorial();
});
if (firstLogin || accountUpgraded) {
  showTutorial();
}

function showTutorial()
{
  tutorialStep = tutorialSteps[tutorialStepIdx];
  tutorialStepIdx = (tutorialStepIdx + 1) % tutorialSteps.length;
  if (tutorialWindow === null) {
    tutorialWindow = showMessage(tutorialStep.m, {
      'Abbrechen': () =>
      {
        removeTutorialHighlights();
        tutorialSteps[tutorialSteps.length - 1].after();
        tutorialStepIdx = 0;
        tutorialWindow.dismiss();
        tutorialWindow = null;
        tutorialStep = null;
      },
      'Weiter': () =>
      {
        if (!('keepHighlights' in tutorialStep && tutorialStep.keepHighlights)) {
          removeTutorialHighlights();
        }
        if ('after' in tutorialStep) {
          tutorialStep.after(tutorialStep);
        }
        if (tutorialStepIdx === 0) {
          tutorialWindow.dismiss();
          tutorialWindow = null;
          tutorialStep = null;
        }
        else {
          if ('delayNextStep' in tutorialStep) {
            tutorialWindow.modalBlocker.classList.add('hidden');
            setTimeout(showTutorial, tutorialStep.delayNextStep === true ? 200 : tutorialStep.delayNextStep);
          }
          else {
            showTutorial();
          }
        }
      }});
    tutorialWindow.modalBlocker.id = 'tutorial';
  }
  else {
    tutorialWindow.content.innerHTML = tutorialStep.m;
    tutorialWindow.modalBlocker.classList.remove('hidden');
  }
  if ('before' in tutorialStep) {
    tutorialStep.before(tutorialStep);
  }
  tutorialWindow.button_Weiter.disabled = true;
  setTimeout(() => { if (tutorialWindow) { tutorialWindow.button_Weiter.disabled = false; } }, 'buttonTimeout' in tutorialStep ? tutorialStep.buttonTimeout : 2000);
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
  div.style.setProperty('--box-shadow-color', tutorialHighlightColor + opacity);
  div.style.setProperty('--box-shadow-size', sizePt / 2 + 'pt');
  let messageTemplate = document.getElementById('message-template');
  document.body.insertBefore(div, messageTemplate);
  return div;
}

function removeTutorialHighlights()
{
  document.querySelectorAll('.tutorial-highlight').forEach(el => el.parentElement.removeChild(el));
}
