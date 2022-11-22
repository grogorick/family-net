let tutorialHighlightColor = '#61B1B5';
let tutorialScrollTimeout = 1000;
let tutorialSet = null;
let tutorialStepIdx = 0;
let tutorialStep = null;
let tutorialWindow = null;
let tutorialCancelToPostpone = false;
let tutorialHighlights = [];

let tutorialSteps = [
  { m: firstLogin
      ? '<p>Hallo!</p><p>Das scheint dein erster Besuch zu sein.<br />Wir starten mit einer kurzen Einführung, bevor du loslegen kannst.</p><p>Du kannst dir die Einleitung auch bei deinem nächsten Besuch ansehen.</p>'
      : accountUpgraded
      ? '<p>Hallo!</p><p>Du darfst jetzt Änderungen am Netz vornehmen.<br />Dazu gibt es noch einmal eine kurze Einführung, bevor du loslegen kannst.</p><p>Du kannst dir die Einleitung auch bei deinem nächsten Besuch ansehen.</p>'
      : '<p>Alles klar, gehen wir die Einführung noch einmal durch.</p>',
    before: () => {
      doNotUpdateCamera = true;
      let rw = s.renderers[0].width / 2;
      let rh = s.renderers[0].height / (isMobile ? 3 : 4);
      tutorialSet = {
        P0:   getGraphPositionFromScreenPosition(   - 100,                            rh),

        P1:   getGraphPositionFromScreenPosition(rw -  50,                            rh),
        H1:   {                               x: rw -  50 + 'px',                 y:  rh + 'px' },

        P2:   getGraphPositionFromScreenPosition(rw +  50,                            rh),
        H2:   {                               x: rw +  50 + 'px',                 y:  rh + 'px' },
        H12:  {                               x: rw + 'px',                       y:  rh + 'px' },

        P3:   getGraphPositionFromScreenPosition(rw -  50,                            rh - 100),
        H3:   {                               x: rw -  50 + 'px',                 y:  rh - 100 + 'px' },
        P3_1: getGraphPositionFromScreenPosition(rw -  50 + 33,                       rh - 100 - 5),
        P3_2: getGraphPositionFromScreenPosition(rw -  50 + 66,                       rh - 100 - 5),

        P4:   getGraphPositionFromScreenPosition(rw +  50,                            rh - 100),
        H4:   {                               x: rw +  50 + 'px',                 y:  rh - 100 + 'px' },
        H24:  {                               x: rw +  50 + 'px',                 y:  rh - 50 + 'px' } };
      s.graph.clear(); s.refresh();
      tutorialWindow.buttons.Abbrechen.setAttribute('data-innerHTML', tutorialWindow.buttons.Abbrechen.innerHTML);
      tutorialWindow.buttons.Abbrechen.innerHTML = 'Später ansehen';
      tutorialWindow.buttons.Weiter.setAttribute('data-innerHTML', tutorialWindow.buttons.Weiter.innerHTML);
      tutorialWindow.buttons.Weiter.innerHTML = 'Los geht\'s';
      tutorialCancelToPostpone = true; },
    after: () => {
      addPerson({ t: 'p0', x: tutorialSet.P0.x, y: tutorialSet.P0.y, l: 'Person C', o: '' }, false, false, true, false);
      addPerson({ t: 'p1', x: tutorialSet.P1.x, y: tutorialSet.P1.y, l: 'Person A', o: '' }, false, false, true, false);
      addPerson({ t: 'p2', x: tutorialSet.P2.x, y: tutorialSet.P2.y, l: 'Person B', o: '' }, false, false, true, false);
      addConnection({ t: 'c12', p1: 'p1', p2: 'p2', r: 'verheiratet', d: '' }, false, false, true, true);
      tutorialWindow.buttons.Abbrechen.innerHTML = tutorialWindow.buttons.Abbrechen.getAttribute('data-innerHTML');
      tutorialWindow.buttons.Weiter.innerHTML = tutorialWindow.buttons.Weiter.getAttribute('data-innerHTML');
      tutorialWindow.modalBlocker.classList.remove('backdrop-blur');
      tutorialCancelToPostpone = false;  },
    delayNextStep: true } ];


// basics

if (!accountUpgraded) { tutorialSteps = tutorialSteps.concat([
  { m: '<p>Das Netz besteht aus Personen <span style="white-space: nowrap">(<span class="tutorial-person"></span>)</span><span class="invisible">, und Verbindungen <span style="white-space: nowrap">(<span class="tutorial-connection"></span>)</span> zwischen Personen.</span></p><p class="invisible">Diese können sich auf der gesamten Seite befinden (dem weißen Hintergrund) und darüber hinaus.</p>',
    before: () => {
      tutorialHighlight(tutorialSet.H1, 50); } },

  { m: '<p><span class="old">Das Netz besteht aus Personen <span style="white-space: nowrap">(<span class="tutorial-person"></span>)</span>,</span> und Verbindungen <span style="white-space: nowrap">(<span class="tutorial-connection"></span>)</span> zwischen Personen.</p><p class="invisible">Diese können sich auf der gesamten Seite befinden (dem weißen Hintergrund) und darüber hinaus.</p>',
    before: () => tutorialHighlight(tutorialSet.H12, 50) },

  { m: '<p class="old">Das Netz besteht aus Personen <span style="white-space: nowrap">(<span class="tutorial-person"></span>)</span>, und Verbindungen <span style="white-space: nowrap">(<span class="tutorial-connection"></span>)</span> zwischen Personen.</p><p>Diese können sich auf der gesamten Seite befinden (dem weißen Hintergrund)<span class="invisible"> und darüber hinaus.</span></p>' },

  { m: '<p class="old">Das Netz besteht aus Personen <span style="white-space: nowrap">(<span class="tutorial-person"></span>)</span>, und Verbindungen <span style="white-space: nowrap">(<span class="tutorial-connection"></span>)</span> zwischen Personen.</p><p><span class="old">Diese können sich auf der gesamten Seite befinden (dem weißen Hintergrund)</span> und darüber hinaus.</p>',
    before: () => {
      let tmpX = s.camera.x;
      let tmpY = s.camera.y;
      let tmpRatio = s.camera.ratio;
      let newX = - 100 - s.renderers[0].width / 2;
      sigma.misc.animation.camera(s.camera, { x: newX, y: tmpY, ratio: tmpRatio }, { duration: 1000, onComplete: () => {
          setTimeout(() => {
            sigma.misc.animation.camera(s.camera, { x: tmpX, y: tmpY, ratio: tmpRatio }, { duration: 1000 }); }, 2000); } }); },
    delayNextStep: true,
    buttonTimeout: 5000 } ]); }


// person details

tutorialSteps = tutorialSteps.concat([
  { m: '<p>Mit einem einfachen Klick auf eine Person, kannst du ihre Details anzeigen' + (currentUserIsViewer ? '' : ' bzw. bearbeiten') + '.</p><p class="invisible">Die Details findest du dann im Detailfenster.</p>',
    before: () => tutorialHighlight(tutorialSet.H1, 50),
    keepHighlights: !isMobile },

  { m: '<p class="old">Mit einem einfachen Klick auf eine Person, kannst du ihre Details anzeigen' + (currentUserIsViewer ? '' : ' bzw. bearbeiten') + '.</p><p>Die Details findest du dann im Detailfenster.</p>',
    before: () => {
      personMenuDelete.classList.add('hidden');
      personMenuEdit.classList.add('hidden');
      clearPersonMenu();
      showForm(personMenuForm, 'opt-edit', false);
      personMenuForm.style.zIndex = '';
      if (!isMobile)
        tutorialHighlight('#person-form > div:first-child', 420); },
    after: () => hideForm(personMenuForm),
    delayNextStep: true } ]);


// connection details

tutorialSteps = tutorialSteps.concat([
  { m: '<p>Auch Details von Verbindungen kannst du mit einem einfachen Klick anzeigen' + (currentUserIsViewer ? '' : ' bzw. bearbeiten') + '.</p><p class="invisible">Die Details findest du ebenfalls im Detailfenster.</p>',
    before: () => {
      activeState.addEdges('c12'); s.refresh();
      tutorialHighlight(tutorialSet.H12, 50); },
    keepHighlights: !isMobile },

  { m: '<p class="old">Auch Details von Verbindungen kannst du mit einem einfachen Klick anzeigen' + (currentUserIsViewer ? '' : ' bzw. bearbeiten') + '.</p><p>Die Details findest du ebenfalls im Detailfenster.</p>',
    before: () => {
      connectionMenuDelete.classList.add('hidden');
      connectionMenuEdit.classList.add('hidden');
      clearConnectionMenu();
      showForm(connectionMenuForm, 'opt-edit', false);
      connectionMenuForm.style.zIndex = '';
      if (!isMobile)
        tutorialHighlight('#connection-form', 400); },
    after: () => {
      activeState.dropEdges(); s.refresh();
      hideForm(connectionMenuForm); },
    delayNextStep: true } ]);


// mobile edit mode menu

if (!currentUserIsViewer) {
  if (isMobile) { tutorialSteps = tutorialSteps.concat([
    { m: '<p>Im Bearbeitungsmodus (mehr dazu später) findest du oben die 3 wichtigsten Aktionen.</p>',
      before: () => {
        document.querySelector('#mobile-action-new-person-tutorial').classList.remove('hidden');
        document.querySelector('#mobile-action-new-connection-tutorial').classList.remove('hidden');
        document.querySelector('#mobile-action-move-person-tutorial').classList.remove('hidden');
        tutorialHighlight({ el: '#mobile-action-new-connection-tutorial', dx: .7 }, { w: 180, h: 40 }); },
        delayNextStep: true },


// create person

    { m: '<p>Um eine neue Person zu erstellen, wähle zuerst die linke Aktion<span class="invisible"> und tippe anschließend an die gewünschte Position auf dem Hintergrund.</span></p>',
      before: () => tutorialHighlight('#mobile-action-new-person-tutorial', 40),
      keepHighlights: true },

    { m: '<p><span class="old">Um eine neue Person zu erstellen, wähle zuerst die linke Aktion</span> und tippe anschließend an die gewünschte Position auf dem Hintergrund.</p>',
      before: () => {
        tutorialHighlights.at(-1).adjustOpacity('88');
        tutorialHighlight(tutorialSet.H3, 50); },
      keepHighlights: true,
      delayNextStep: true } ]); }

  else {
    tutorialSteps = tutorialSteps.concat([
      { m: '<p>Durch Doppelklicken auf den Hintergrund <span class="invisible">erstellst du an dieser Stelle eine neue Person.</span></p>',
        before: () => {
          tutorialHighlight(tutorialSet.H3, 70, '88');
          tutorialHighlight(tutorialSet.H3, 50, '88'); },
        keepHighlights: true } ]); }

  tutorialSteps = tutorialSteps.concat([
    { m: isMobile
                  ? '<p>Für die neue Person wird dann automatisch das Fenster zum Eintragen der Details geöffnet.</p>'
                  : '<p><span class="old">Durch Doppelklicken auf den Hintergrund</span> erstellst du an dieser Stelle eine neue Person.</p>',
      before: () => addPerson({ t: 'p3', x: tutorialSet.P3.x, y: tutorialSet.P3.y, l: 'Neue Person', o: '' }, false, false, true, true),
      delayNextStep: true } ]);


// move person

  if (isMobile) {
    tutorialSteps = tutorialSteps.concat([
    { m: '<p>Um eine Person zu verschieben, wähle zuerst die rechte Bearbeiten-Aktion<span class="invisible">, dann die Person, und tippe anschließend auf die gewünschte neue Position.</span></p>',
      before: () => tutorialHighlight('#mobile-action-move-person-tutorial', 40),
      keepHighlights: true },

    { m: '<p><span class="old">Um eine Person zu verschieben, wähle zuerst die rechte Bearbeiten-Aktion, </span>dann die Person<span class="invisible">, und tippe anschließend auf die gewünschte neue Position.</span></p>',
      before: () => {
        activeState.addNodes('p3'); s.refresh();
        tutorialHighlights.at(-1).adjustOpacity('88');
        tutorialHighlight(tutorialSet.H3, 50); },
      keepHighlights: true },

    { m: '<p><span class="old">Um eine Person zu verschieben, wähle zuerst die rechte Bearbeiten-Aktion, dann die Person, </span>und tippe anschließend auf die gewünschte neue Position.</p>',
      before: () => {
        tutorialHighlights.at(-1).adjustOpacity('88');
        tutorialHighlight(tutorialSet.H4, 50); },
      keepHighlights: true } ]); }

  tutorialSteps = tutorialSteps.concat([
    { m: isMobile
                  ? ('<p><span class="old">Um eine Person zu verschieben, wähle zuerst die rechte Bearbeiten-Aktion, dann die Person, </span>und tippe anschließend auf die gewünschte neue Position.</p>')
                  : ('<p>Während du die ' + modKeys + '-Taste drückst, kannst du Personen mit der Maus verschieben.</p>'),
      before: () => {
        if (!isMobile) {
          activeState.addNodes('p3'); s.refresh();
          tutorialHighlight(tutorialSet.H4, 50);
        }
        let n = s.graph.nodes('p3');
        addPerson({ t: 'pm1', x: n.x, y: n.y, o: '', color: '#eee' }, false, false, true, false);
        addPerson({ t: 'pm2', x: tutorialSet.P3_1.x, y: tutorialSet.P3_1.y, o: '', color: '#ddd' }, false, false, true, false);
        addPerson({ t: 'pm3', x: tutorialSet.P3_2.x, y: tutorialSet.P3_2.y, o: '', color: '#ccc' }, false, false, true, true);
        n.x = tutorialSet.P4.x; n.y = tutorialSet.P4.y; s.refresh(); },
      after: () => {
        activeState.dropNodes(); s.refresh();
        deletePerson('pm1', false, false, true, false);
        deletePerson('pm2', false, false, true, false);
        deletePerson('pm3', false, false, true, true); },
      delayNextStep: true } ]);


// create connection

  if (isMobile) {
    tutorialSteps = tutorialSteps.concat([
      { m: '<p>Um zwei Personen zu verbinden, wähle zuerst die mittlere Bearbeiten-Aktion<span class="invisible">, dann die erste Person, und anschließend die zweite Person.</span></p><p class="invisible">Für die neue Verbindung wird dann automatisch das Fenster zum Eintragen der Details geöffnet.</p>',
        before: () => tutorialHighlight('#mobile-action-new-connection-tutorial', 40),
        keepHighlights: true } ]); }

  tutorialSteps = tutorialSteps.concat([
    { m: isMobile
                  ? ('<p><span class="old">Um zwei Personen zu verbinden, wähle zuerst die mittlere Bearbeiten-Aktion, </span>dann die erste Person<span class="invisible">, und anschließend die zweite Person.</span></p><p class="invisible">Für die neue Verbindung wird dann automatisch das Fenster zum Eintragen der Details geöffnet.</p>')
                  : ('<p>Für eine neue Verbindung, halte die ' + modKeys + '-Taste gedrückt und klicke auf die erste Person, um sie auszuwählen.</p><p class="invisible">Wähle danach die zweite Person aus, um beide Personen zu verbinden.</p>'),
      before: () => {
        activeState.addNodes('p3'); s.refresh();
        if (isMobile)
          tutorialHighlights.at(-1).adjustOpacity('88');
        tutorialHighlight(tutorialSet.H4, 50); },
      keepHighlights: true },

    { m: isMobile
                  ? ('<p><span class="old">Um zwei Personen zu verbinden, wähle zuerst die mittlere Bearbeiten-Aktion, dann die erste Person, </span>und anschließend die zweite Person.</p><p class="invisible">Für die neue Verbindung wird dann automatisch das Fenster zum Eintragen der Details geöffnet.</p>')
                  : ('<p class="old">Für eine neue Verbindung, halte die ' + modKeys + '-Taste gedrückt und klicke auf die erste Person, um sie auszuwählen.</p><p>Wähle danach die zweite Person aus<span class="invisible">, um beide Personen zu verbinden.</span></p>'),
      before: () => {
        activeState.addNodes('p2'); s.refresh();
        tutorialHighlights.at(-1).adjustOpacity('88');
        tutorialHighlight(tutorialSet.H2, 50); } },

    { m: isMobile
                  ? ('<p class="old">Um zwei Personen zu verbinden, wähle zuerst die mittlere Bearbeiten-Aktion, dann die erste Person, und anschließend die zweite Person.</p><p>Für die neue Verbindung wird dann automatisch das Fenster zum Eintragen der Details geöffnet.</p>')
                  : ('<p class="old">Für eine neue Verbindung, halte die ' + modKeys + '-Taste gedrückt und klicke auf die erste Person, um sie auszuwählen.</p><p><span class="old">Wähle danach die zweite Person aus, </span>um beide Personen zu verbinden.</p>'),
      before: () => {
        addConnection({ t: 'c23', p1: 'p3', p2: 'p2', r: '', d: '' }, false, false, true, true);
        tutorialHighlight(tutorialSet.H24, 50); },
      after: () => { activeState.dropNodes(); s.refresh(); },
      delayNextStep: true } ]);
}


// mobile menu

if (isMobile) { tutorialSteps = tutorialSteps.concat([
  { m: '<p>Oben links findest du das Menü. <span class="invisible">mit den wichtigsten Funktionen.</span></p>',
    before: () => tutorialHighlight('#mobile-menu-toggle', 40),
    after: () => document.querySelector('#mobile-menu-toggle').click() },

  { m: '<p><span class="old">Oben links findest du das Menü</span> mit den wichtigsten Funktionen.</p>',
    delayNextStep: true } ]); }


// toggle edit mode

if (!currentUserIsViewer) { tutorialSteps = tutorialSteps.concat([
  { m: '<p>Bevor du das Netz verändern kannst, musst du den Bearbeitungsmodus starten.</p><p>(Das geht nur, wenn gerade kein anderer das Netz bearbeitet)</p>',
    before: () => tutorialHighlight('#start-edit span', 70) },

  { m: '<p>Vergiss nicht den Bearbeitungsmodus zu beenden, wenn du fertig bist, sonst blockierst du die Bearbeitung für andere.</p>',
    before: () => {
      let btn = document.querySelector('#start-edit span');
      if (btn)
        btn.innerHTML = 'Fertig';
      tutorialHighlight('#start-edit span', 60); },
    after: () => {
      let btn = document.querySelector('#start-edit span');
      if (btn)
        btn.innerHTML = 'Bearbeiten'; },
    delayNextStep: true } ]); }


// layouts

tutorialSteps = tutorialSteps.concat([
  { m: '<p>' + (isMobile ? 'Hier' : 'Oben links') + ' kannst du außerdem zwischen folgenden Ansichten wechseln: <i>Netz, Baum, Jahresbaum</i>.</p>' + (currentUserIsViewer ? '' : '<p class="invisible">Der Bearbeitungsmodus ist nur in der Netz-Ansicht verfügbar.</p>'),
    before: () => {
      if (isMobile) {
        document.querySelector('#account').style.paddingBottom = '50vh';
        if (!currentUserIsViewer)
          document.querySelector('#account').scrollBy({ behavior: 'smooth', left: 0, top: document.querySelector('#start-edit').getBoundingClientRect().top });
        setTimeout(() => tutorialHighlight({ el: '#mobile-switch-layout-tree span', dx: .9 }, 120), currentUserIsViewer ? 0 : tutorialScrollTimeout);
      }
      else
        tutorialHighlight('#layouts', 60); },
    delayNextStep: currentUserIsViewer } ]);

if (!currentUserIsViewer) { tutorialSteps = tutorialSteps.concat([
  { m: '<p class="old">' + (isMobile ? 'Hier' : 'Oben links') + ' kannst du außerdem zwischen folgenden Ansichten wechseln: <i>Netz, Baum, Jahresbaum</i>.</p><p>Der Bearbeitungsmodus ist nur in der Netz-Ansicht verfügbar.</p>',
    before: () => {
      if (!isMobile)
        document.querySelector('#layouts .box-restore').click();
      tutorialHighlight(isMobile ? '#mobile-switch-layout-net span' : '#switch-layout-net', 60); },
    after: () => {
      if (!isMobile)
        document.querySelector('#layouts .box-minimize').click(); },
    delayNextStep: true } ]); }


// sources

tutorialSteps = tutorialSteps.concat([
  { m: '<p>' + (isMobile ? 'Hier' : 'Direkt darunter') + ' kannst du hochgeladene Dokumente anzeigen' + (currentUserIsViewer ? '' : ' bzw. bearbeiten') + '.</p>',
    before: () => {
      if (isMobile) {
        document.querySelector('#account').scrollBy({ behavior: 'smooth', left: 0, top: document.querySelector('#mobile-switch-layout-treeYearBased').getBoundingClientRect().top });
        setTimeout(() => tutorialHighlight('#mobile-sources span', 60), tutorialScrollTimeout);
      }
      else
        tutorialHighlight('#sources', 60); },
    delayNextStep: true },


// log

  { m: '<p>' + (isMobile ? 'Hier' : 'Oben rechts') + ' findest du den Verlauf aller Änderungen.</p>' + (currentUserIsViewer ? '' : '<p class="invisible">Deine eigenen Änderungen kannst du hier rückgängig machen, solange nach dir kein anderer das Netz geändert hat.</p>'),
    before: () => tutorialHighlight(isMobile ? '#mobile-log span' : '#log', 60),
    keepHighlights: !currentUserIsViewer,
    delayNextStep: currentUserIsViewer } ]);

if (!currentUserIsViewer) { tutorialSteps = tutorialSteps.concat([
  { m: '<p class="old">' + (isMobile ? 'Hier' : 'Oben rechts') + ' findest du den Verlauf aller Änderungen.</p>' + (currentUserIsViewer ? '' : '<p>Deine eigenen Änderungen kannst du hier rückgängig machen, solange nach dir kein anderer das Netz geändert hat.</p>'),
    delayNextStep: true } ]); }


// help

tutorialSteps = tutorialSteps.concat([
  { m: '<p>Gleich ' + (isMobile ? 'darunter' : 'daneben') + ' findest du jederzeit die Hilfe mit Anleitungen zu allen wichtigen Funktionen.</p><p class="invisible">Dort kannst du auch diese Einführung jederzeit noch einmal starten.</p>',
    before: () => tutorialHighlight(isMobile ? '#mobile-help span' : '#help', 60),
    keepHighlights: true },

  { m: '<p class="old">Gleich ' + (isMobile ? 'darunter' : 'daneben') + ' findest du jederzeit die Hilfe mit Anleitungen zu allen wichtigen Funktionen.</p><p>Dort kannst du auch diese Einführung jederzeit noch einmal starten.</p>',
    delayNextStep: true },



  { m: '<p>Das war\'s auch schon. Viel Spaß.</p>',
    before: () => {
      tutorialWindow.buttons.Abbrechen.classList.add('hidden');
      tutorialWindow.buttons.Weiter.innerHTML = 'OK';
      xhRequest('?action=tutorial-completed'); },
    after: () => {
      if (tutorialCancelToPostpone) {
        loadData();
        doNotUpdateCamera = false;
      } else
        location = location.href;
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
  tutorialWindow.buttons.Weiter.disabled = true;
  setTimeout(() => { if (tutorialWindow) { tutorialWindow.buttons.Weiter.disabled = false; } }, 'buttonTimeout' in tutorialStep ? tutorialStep.buttonTimeout : 2000);
}

function tutorialHighlight(el, sizePt, opacity = 'FF')
{
  let x, y;
  let dx = .5, dy = .5;
  if (typeof el === 'object') {
    if (Array.isArray(el)) {
      let ret = [];
      el.forEach(e => { ret.push(tutorialHighlight(e, sizePt, opacity)); });
      return ret;
    }
    else if ('x' in el && 'y' in el) {
      x = el.x;
      y = el.y;
      el = null;
    }
    else if ('el' in el) {
      if ('dx' in el) {
        dx = el.dx;
      }
      if ('dy' in el) {
        dy = el.dy;
      }
      el = el.el;
    }
  }
  if (typeof el === 'string') {
    el = document.querySelector(el);
  }
  if (el !== null) {
    let b = el.getBoundingClientRect();
    x = (b.left + b.width * dx) + 'px';
    y = (b.top + b.height * dy) + 'px';
  }
  let div = document.createElement('div');
  div.classList.add('tutorial-highlight');
  div.style.left = x;
  div.style.top = y;
  let effectSizePt;
  if (typeof sizePt === 'object' && 'w' in sizePt && 'h' in sizePt) {
    console.log('ellipse highlight');
    div.style.width = sizePt.w + 'pt';
    div.style.height = sizePt.h + 'pt';
    effectSizePt = Math.min(sizePt.w, sizePt.h);
  } else {
    console.log('circle highlight');
    div.style.width = div.style.height = sizePt + 'pt';
    effectSizePt = sizePt;
  }
  div.style.setProperty('--box-shadow-size', div.style.borderRadius = (effectSizePt / 2) + 'pt');
  // div.style.setProperty('--box-shadow-color', tutorialHighlightColor + opacity);
  let messageTemplate = document.getElementById('message-template');
  document.body.insertBefore(div, messageTemplate);

  div.adjustOpacity = (newOpacity) => { div.style.setProperty('--box-shadow-color', tutorialHighlightColor + newOpacity); };
  div.adjustOpacity(opacity);

  tutorialHighlights.push(div);
  return div;
}

function removeTutorialHighlights()
{
  document.querySelectorAll('.tutorial-highlight').forEach(el => el.parentElement.removeChild(el));
  tutorialHighlights = [];
}
