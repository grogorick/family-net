let tutorialWindow = null;
let tutorialStep = null;
let tutorialSteps = [
  { m: '<p>Hallo!</p>Das scheint dein erster Besuch zu sein.<br />Wir starten mit einer kurzen Einführung, bevor du loslegen kannst.',
    after: () => tutorialWindow.modalBlocker.classList.remove('backdrop-blur') },
  { m: 'Das Netz besteht aus Personen (<div style="display:inline-block; width:10pt; height:10pt; border-radius:5pt; background:' + settings.nodeColor + '"></div>), und Verbindungen zwischen Personen.<br />Es wird auf der gesamten Seite (dem weißen Hintergrund) angezeigt.' } ];
if (!currentUserIsViewer) {
  tutorialSteps = tutorialSteps.concat([
  { m: 'Durch Doppelklicken kannst du neue Personen erstellen.<br />Mit einem einfachen Klick kannst du diese bearbeiten und verschieben.' } ]);
}
tutorialSteps = tutorialSteps.concat([
  { s: 420, el: '#person-form', m: 'Details einer Person ' + (currentUserIsViewer ? 'findest' : 'eintragen,<br />bzw. einer existierenden Person ändern,<br />kannst') + ' du hier unten rechts.',
    before: (s) => { showForm(personMenuForm, 'opt-edit', false); },
    after: () => { hideForm(personMenuForm); } },
  { s: 400, el: '#connection-form', m: 'Die Details für Verbindungen zwischen den Personen<br />findest du ebenfalls dort.',
    before: (s) => { showForm(connectionMenuForm, 'opt-edit', false); },
    after: () => { hideForm(connectionMenuForm); } } ]);
if (!currentUserIsViewer) {
  tutorialSteps = tutorialSteps.concat([
  { s: 80, el: '#start-edit', m: 'Bevor du das Netz ändern kannst, musst du den Bearbeitungsmodus starten.' },
  { s: 80, el: '#start-edit', m: 'Und anschließend wieder beenden, wenn du fertig bist.',
    before: (s) => { document.querySelector(s.el).innerHTML = 'Fertig'; },
    after: (s) => { document.querySelector(s.el).innerHTML = 'Bearbeiten'; } } ]);
}
tutorialSteps = tutorialSteps.concat([
  { s: 80, el: '#log', m: 'Oben rechts findest du den Verlauf aller Änderungen am Netz.' + (currentUserIsViewer ? '' : '<br />Hier kannst du deine Änderungen rückgängig machen,<br />solange nach dir kein anderer das Netz geändert hat.') },
  { s: 80, el: '#help', m: 'Gleich daneben findest du jederzeit eine Anleitung<br />mit weiteren Details zu allen wichtigen Funktionen.' },
  { s: 150, el: '#account a:last-child', m: 'Wenn du fertig bist, halte den Mauscursor über deinen Namen,<br />um die Abmelden-Schaltfläche anzuzeigen.',
    before: (s) => { document.querySelector(s.el).style.display = 'inline-block'; },
    after: (s) => { document.querySelector(s.el).style.display = ''; } },
  { m: 'Das war\'s auch schon. Viel Spaß.' }
]);

if (firstLogin) {
  showTutorial();
}

function showTutorial()
{
  tutorialStep = tutorialSteps.shift();
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
    if (tutorialSteps.length === 0) {
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
