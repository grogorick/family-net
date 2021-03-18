const settings = {
  nodeSize: isMobile ? 3 : 5,
  nodeColor: '#78D384',
  nodeColorWarning: '#D0D480',
  nodeColorHighlight: '#3BAA49',
  nodeColorPreview: '#ddd',

  edgeSize: .25,
  edgeColor: '#DDD',
  edgeColorWarning: '#E6AD92',
  edgeColorHighlight: '#000',
  edgeColorPreview: '#ddd',

  gridStep: 20,
  mobileGraphClickDelay: 500,
  saveCameraTimeout: 5000,
  checkOtherEditorInterval: 10000,
  stopEditWarningCountdown: 60,
  logPlaybackDelay: 200,

  relations: {
    Kind: { lineType: 'arrow', level: 'v' },
    adoptiert: { lineType: 'dashedarrow', level: 'v' },
    verheiratet: { lineType: 'line', level: 'h' },
    geschieden: { lineType: 'dashed', level: 'h' },
    verwitwet: { lineType: 'dashed', level: 'h' },
    unverheiratet: { lineType: 'dotted', level: 'h' },
    unknown: { lineType: 'dotted', level: 'h' } }
};

let callbacks = {
  graphLoaded: new Callbacks(),
  logPlayStopped: new Callbacks()
};

let layouts = {};

let windowSize = { height: window.innerHeight, width: window.innerWidth };
document.body.style.height = windowSize.height + 'px';

let urlParams = new URLSearchParams(window.location.search);

let graphElement = document.getElementById('graph');

let s = new sigma({
  renderers: [{
    container: graphElement,
    type: 'canvas'
  }],
  settings: {
    doubleClickEnabled: isMobile,
    rescaleIgnoreSize: true,
    edgeHoverExtremities: false,

    font: '"Josefin Sans", "Trebuchet MS", sans-serif',
    fontStyle: '',
    activeFontStyle: 'bold',

    zoomingRatio: 1.2,
    doubleClickZoomingRatio: 2,
    zoomMin: 1,
    zoomMax: 10,

    // person
    minNodeSize: .1,
    maxNodeSize: 10,
    nodeBorderColor: 'default',
    nodeOuterBorderColor: 'default',
    defaultNodeColor: settings.nodeColor,
    defaultNodeBorderColor: 'transparent',
    nodeBorderSize: 2,
    nodeOuterBorderSize: 0,

    // person hover
    nodeHoverBorderColor: 'default',
    defaultNodeHoverBorderColor: settings.nodeColor,
    nodeHoverBorderSize: 2,

    // person selected
    nodeActiveColor: 'default',
    nodeActiveBorderColor: 'default',
    defaultNodeActiveColor: settings.nodeColorHighlight,
    defaultNodeActiveBorderColor: 'transparent',
    nodeActiveBorderSize: 2,

    // person label
    labelAlignment: 'bottom',
    labelHoverShadow: true,
    labelHoverShadowColor: '#ddd',
    labelSize: 'proportional',
    defaultLabelSize: 12,
    labelSizeRatio: isMobile ? 1.5 : 1.7,
    labelThreshold: isMobile ? 3 : 5,

    // connection
    edgeColor: 'default',
    defaultEdgeColor: settings.edgeColor,
    minEdgeSize: .1,
    maxEdgeSize: 5,
    minArrowSize: 5,

    // connection hover
    enableEdgeHovering: !isMobile,
    edgeHoverPrecision: 5,
    // edgeHoverSizeRatio: 5
    // edgeHoverExtremities: true,
    edgeHoverColor: 'default',
    defaultEdgeHoverColor: settings.edgeColorHighlight,

    // connection selected
    edgeActiveColor: 'default',
    defaultEdgeActiveColor: settings.edgeColorHighlight,

    // connection label
    edgeLabelThreshold: 10,
    edgeLabelHoverShadow: true,
    edgeLabelHoverShadowColor: '#ddd',
    edgeLabelSize: 'proportional',
    defaultEdgeLabelSize: 12,
    edgeLabelSizePowRatio: 5
  }
});

let activeState = sigma.plugins.activeState(s);

let dragListener = sigma.plugins.dragNodes(s, s.renderers[0], activeState);

const bounds = {
  minX: -500,
  minY: -500,
  maxX: 500,
  maxY: 500,
  sizeMax: 5,
  weightMax: 1};
s.settings('bounds', bounds);

let PERSON_PREVIEW = 'person-preview';
let CONNECTION_PREVIEW = 'connection-preview';

let data = {
  settings: { camera: { x: 0, y: 0, z: 0 }},
  graph: { persons: [], doppelgangers: [], connections: [] },
  log: [],
  currentHash: '' };

function currentUserCanEdit()
{
  return currentUserIsEditing && !currentLayoutId && !logPreviewActive;
}

function durationToString(duration)
{
  return (duration >= 60) ? Math.floor(duration / 60) + 'min' : (Math.floor(duration % 60) + 's')
}

let startEdit = document.getElementById('start-edit');
if (startEdit) {
  if (!currentUserIsViewer) {
    let otherEditorDiv = document.getElementById('other-editor');
    let checkOtherEditor = () =>
    {
      console.log('check other editor');
      xhRequest('?action=get-editor', responseText =>
      {
        let otherEditor = JSON.parse(responseText);
        if (otherEditor !== false) {
          if (!currentUserIsViewer) {
            startEdit.classList.add('hidden');
          }
          let otherEditorTimeout = otherEditor[0] + editingTimeoutDuration - Math.floor(new Date().getTime() / 1000);
          otherEditorDiv.innerHTML = otherEditor[1] + ' bearbeitet gerade (' + durationToString(otherEditorTimeout) + ')';
          otherEditorDiv.classList.remove('hidden');
        }
        else {
          otherEditorDiv.classList.add('hidden');
          if (!currentUserIsViewer) {
            startEdit.classList.remove('hidden');
          }
        }
      });
    };
    setInterval(checkOtherEditor, settings.checkOtherEditorInterval);
    checkOtherEditor();
  }
}

let stopEditTimer = document.getElementById('stop-edit-timer');
if (stopEditTimer && editingTimeout) {
  let stopEditCountdownMessage = null;
  setInterval(() =>
  {
    let remainingDuration = editingTimeout + editingTimeoutDuration - Math.floor(new Date().getTime() / 1000);
    let remainingDurationStr = durationToString(remainingDuration);
    stopEditTimer.innerHTML = ' (' + remainingDurationStr + ')';
    if (stopEditCountdownMessage !== null) {
      if (remainingDuration < 1) {
        window.location.reload();
      }
      else {
        stopEditCountdownMessage.content.querySelector('.stop-edit-countdown').innerHTML = remainingDurationStr;
      }
    }
    else if (remainingDuration < settings.stopEditWarningCountdown + 1) {
      stopEditCountdownMessage = showMessage(
        'Deine Bearbeitungszeit endet in <span class="stop-edit-countdown">' + durationToString(settings.stopEditWarningCountdown) + '</span>',
        {
          'Weiter bearbeiten': e =>
          {
            stopEditCountdownMessage.content.innerHTML = 'Bearbeitungsmodus wird verlängert...';
            stopEditCountdownMessage['button_Weiter bearbeiten'].remove();
            xhRequest('?action=restart-edit-timer', responseText =>
            {
              if (responseText.startsWith('restarted ')) {
                restartEditingStopTimer(parseInt(responseText.substr('restarted '.length)));
                stopEditCountdownMessage.dismiss();
                stopEditCountdownMessage = null;
              }
              else {
                window.location.reload();
              }
            });
          }
        });
    }
  }, 1000);
}

function restartEditingStopTimer(timestamp = null)
{
  if (timestamp === null) {
    timestamp = Math.floor(new Date().getTime() / 1000);
  }
  editingTimeout = timestamp;
}


function getDataPerson(t)
{
  let person = null;
  data.graph.persons.forEach(p => { if (p.t == t) person = p; });
  return person;
}
function getDataPersonIndex(t)
{
  return data.graph.persons.findIndex(p => p.t == t);
}
function getDataDoppelganger(t)
{
  return data.graph.doppelgangers.findIndex(d => d.t == t);
}
function getDataConnection(t)
{
  let connection = null;
  data.graph.connections.forEach(c => { if (c.t == t) connection = c; });
  return connection;
}
function getDataConnectionIndex(t)
{
  return data.graph.connections.findIndex(c => c.t == t);
}

function deleteDataPerson(t)
{
  return data.graph.persons.splice(data.graph.persons.findIndex(d => d.t == t), 1);
}
function deleteDataConnection(t)
{
  data.graph.connections.splice(data.graph.connections.findIndex(d => d.t == t), 1);
}

function compareTs(c_p_t, p_t)
{
  return isChildConnectionNode(c_p_t) ? c_p_t.includes(p_t) : (c_p_t == p_t);
}

function getDataPersonConnections(t)
{
  let connections = [];
  data.graph.connections.forEach(c =>
  {
    if ([c.p1, c.p2].some(p_t => compareTs(p_t, t))) {
      connections.push(c);
    }
  });
  return connections;
}

function getDataPersonParents(p_t)
{
  let parents = [];
  getDataPersonConnections(p_t).forEach(c =>
  {
    if (c.p2 == p_t && getConnectionRelationSettings(c.r).level === 'v') {
      if (isChildConnectionNode(c.p1)) {
        getParentTsFromChildConnectionNode(c.p1).forEach(pp_t => parents.push(getDataPerson(pp_t)));
      }
      else {
        parents.push(c.p1);
      }
    }
  });
  return parents;
}

function getDataPersonChildren(p_t)
{
  let children = [];
  getDataPersonConnections(p_t).forEach(c =>
  {
    if (compareTs(c.p1, p_t) && getConnectionRelationSettings(c.r).level === 'v') {
      children.push(getDataPerson(c.p2));
    }
  });
  return children;
}

function checkPersonsConnected(p1_t, p2_t)
{
  return data.graph.connections.some(c =>
    (compareTs(c.p1, p1_t) && compareTs(c.p2, p2_t)) ||
    (compareTs(c.p1, p2_t) && compareTs(c.p2, p1_t)));
}

function getScreenPositionFromGraphPosition(x, y)
{
  let r = s.renderers[0];
  let c = s.camera;
  let factor = Math.max((bounds.maxX - bounds.minX) / r.width, (bounds.maxY - bounds.minY) / r.height);
  return {
    x: (x - c.x * factor) / factor / c.ratio + r.width / 2,
    y: (y - c.y * factor) / factor / c.ratio + r.height / 2
  };
}

function getGraphPositionFromScreenPosition(x, y)
{
  let r = s.renderers[0];
  let c = s.camera;
  let factor = Math.max((bounds.maxX - bounds.minX) / r.width, (bounds.maxY - bounds.minY) / r.height);
  return {
    x: c.x * factor + x * factor * c.ratio,
    y: c.y * factor + y * factor * c.ratio
  };
}

function getGraphPositionFromEvent(e)
{
  return getGraphPositionFromScreenPosition(e.data.captor.x, e.data.captor.y);
}

function getPersonDisplayFirstName(p)
{
  return p.f.replaceAll(/[*?]|\([^()]*\)/g, '').replaceAll(/  +/g, ' ');
}

function getPersonFullName(p)
{
  return [getPersonDisplayFirstName(p), p.l].join(', ') + (p.m.length ? ' geb. ' + p.m : '');
}

function getPersonRufname(p)
{
  let p_n = p.f;
  let n = p_n.match(/\(([^ ,-?()]+)\)/);
  if (!n) {
    n = p_n.match(/[*]\s*([^ ,-?()]+)(,|-|\s|$)/);
    if (!n) {
      n = p_n.match(/^([^ ,-?()]+)(,|-|\s|$)/);
    }
  }
  return n ? n[1] : '';
}

function getPersonExtendedDisplayString(p)
{
  let n = [getPersonDisplayFirstName(p), p.l].join(' ') + (p.m.length ? ' geb. ' + p.m : '');
  let b = splitDate(p.b)[0];
  let d = splitDate(p.d)[0];
  return n + ((b || d) ? ' \n ' + b + ' — ' + d : '');
}

function getNodeColorFromPerson(p)
{
  return 'color' in p ? p.color : (p.t === PERSON_PREVIEW ? settings.nodeColorPreview : ([p.f, p.l, p.m, p.o].some(v => (typeof v === 'string') && v.includes('???')) ? settings.nodeColorWarning : ''));
}

function getEdgeColorFromConnection(c)
{
  return c.t === CONNECTION_PREVIEW ? settings.edgeColorPreview : (c.d.includes('???') ? settings.edgeColorWarning : '');
}

function getConnectionRelationSettings(r)
{
  if (r in settings.relations) {
    return settings.relations[r];
  }
  return settings.relations.unknown;
}

function alignToGrid(n)
{
  n.x = Math.round(n.x / settings.gridStep) * settings.gridStep;
  n.y = Math.round(n.y / settings.gridStep) * settings.gridStep;
}

function createChildConnectionNodeId(p1_t, p2_t)
{
  return p1_t + '-' + p2_t;
}
function isChildConnectionNode(p_t)
{
  return (typeof p_t === 'string') && p_t.includes('-');
}

function isPerson(n)
{
  return 'isPerson' in n._my;
}
function isDoppelganger(n)
{
  return 'isDoppelganger' in n._my;
}
function isPersonConnection(e)
{
  return 'isPersonConnection' in e._my;
}
function isChildConnection(e)
{
  return 'isChildConnection' in e._my;
}
function isExtension(n_or_e)
{
  return 'isExtension' in n_or_e._my;
  // return (typeof n_or_e === 'string') && graphElement[0] === '*';
}

function getDataChildConnections(c)
{
  return getDataPersonConnections(createChildConnectionNodeId(c.p1, c.p2));
}
function getParentConnectionFromChildConnectionNode(t)
{
  let p_ts = getParentTsFromChildConnectionNode(t);
  let p1_cs = getDataPersonConnections(p_ts[0]);
  let p1_cs_p2 = p1_cs.filter(c => c.p1 == p_ts[1] || c.p2 == p_ts[1]);
  if (p1_cs_p2.length === 1)
    return p1_cs_p2[0];
  return null;
}
function getParentTsFromChildConnectionNode(t)
{
  return t.split('-');
}
function getChildConnectionNodePosition(p1, p2)
{
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2 };
}
function moveChildConnectionNodes(nodes)
{
  let alreadyDone = [];
  nodes.forEach(n1 =>
  {
    getDataPersonConnections(n1.id).forEach(c =>
    {
      [c.p1, c.p2].forEach(p_t =>
      {
        if (isChildConnectionNode(p_t) && c.p2 != n1.id) {
          if (alreadyDone.includes(p_t)) {
            // console.log('child ' + childConnectionNodeId + ' already moved');
            return;
          }
          alreadyDone.push(p_t);
          let childConnectionNode = s.graph.nodes(p_t);
          let ps = getParentTsFromChildConnectionNode(p_t);
          let n2 = s.graph.nodes((ps[0] == n1.id) ? ps[1] : ps[0]);
          let newPos = getChildConnectionNodePosition(n1, n2);
          childConnectionNode.x = newPos.x;
          childConnectionNode.y = newPos.y;
        }
      });
    });
  });
}


// load from file
// ------------------------------------
let dataCache = {};
function loadData(previewHash = null)
{
  activeState.dropNodes();
  activeState.dropEdges();
  s.graph.clear();

  if (previewHash && previewHash in dataCache) {
    console.log('load cached data ' + previewHash);
    applyLoadedData(dataCache[previewHash], false, false);
    return;
  }

  let msg = null;
  let delayedMsg = setTimeout(() =>
  {
    msg = showMessage((m => m[Math.floor(Math.random() * m.length)])([
      'Einen gaaanz kurzen Moment bitte...',
      'Gleich geht\'s bestimmt los...',
      'Das Netz wird gesponnen...',
      'Die Alten werden mit Fragen gelöchert...',
      'Uralte Aufzeichnungen werden entstaubt...',
      'Die Ahnen werden erforscht...',
      'Altdeutsch wird entziffert...'
    ]), {});
  }, 500);

  console.log('load data from server ' + previewHash);
  xhRequest(previewHash
    ? '?action=preview&hash=' + previewHash
    : '?action=init', responseText =>
  {
    clearTimeout(delayedMsg);
    let d = JSON.parse(responseText);
    let hash = previewHash ? previewHash : d.currentHash;
    applyLoadedData(d, previewHash === null, previewHash === null);
    dataCache[hash] = d;
    if (msg !== null) {
      setTimeout(msg.dismiss, 1000);
    }
  }, false);
}
if (!firstLogin && !accountUpgraded) {
  loadData();
}

function applyLoadedData(loadedData, addLogItems, adjustCamera)
{
  data = loadedData;
  // console.log(data);
  prepareGraphData();
  if (adjustCamera) {
    moveCamera({
        x: parseFloat(data.settings.camera.x),
        y: parseFloat(data.settings.camera.y),
        z: parseFloat(data.settings.camera.z)
      },
      false, false, true, false);
  }
  logAddPerson = addLogItems ? 3 : false;
  data.graph.persons.forEach(p =>
  {
    addPerson(p, false, false, true, false);
    if (logAddPerson) {
      --logAddPerson;
      if (!logAddPerson) {
        console.log('...');
      }
    }
  });
  logAddPerson = true;

  logAddDoppelganger = addLogItems ? 3 : false;
  data.graph.doppelgangers.forEach(d =>
  {
    addDoppelganger(d, false, false, true, false);
    if (logAddDoppelganger) {
      --logAddDoppelganger;
      if (!logAddDoppelganger) {
        console.log('...');
      }
    }
  });
  logAddDoppelganger = true;

  logAddConnection = addLogItems ? 3 : false;
  data.graph.connections.forEach(c =>
  {
    addConnection(c, false, false, true, false);
    if (logAddConnection) {
      --logAddConnection;
      if (!logAddConnection) {
        console.log('...');
      }
    }
  });
  logAddConnection = true;
  s.refresh();

  callbacks.graphLoaded.call();

  if (addLogItems) {
    if (data.log.length > 0) {
      let logItemRestorable = currentUserIsEditing && (data.log[0][2] === currentUser || currentUserIsAdmin);
      logAddLogItem = 3;
      let i = 0;
      let addLog = (continueAdding = true) => {
        let j = Math.min(i + 10, data.log.length);
        for (; i < j; ++i) {
          let l = data.log[i];
          addLogItem(l, false, logItemRestorable);
          logItemRestorable = logItemRestorable && currentUserIsEditing && (l[2] === currentUser || currentUserIsAdmin);
          if (logAddLogItem) --logAddLogItem;
        }
        if (continueAdding && i < data.log.length - 1) {
          setTimeout(addLog, 500);
        }
        else {
          logAddLogItem = true;
        }
      };
      addLog(false);
      let logButton = document.querySelector('#log .box-restore');
      let fn = () =>
      {
        logButton.removeEventListener('click', fn)
        addLog();
      };
      logButton.addEventListener('click', fn);
    }
  }
}

let nodeCenterY = 0;
function prepareGraphData()
{
  data.graph.persons.forEach(p =>
  {
    p._parents = [];
    p._children = [];
    p._partners = [];
    p._other = [];
    p._doppelgangers = [];
    nodeCenterY += p.y;
  });
  nodeCenterY /= data.graph.persons.length;
  data.graph.doppelgangers.forEach(d =>
  {
    d._p = getDataPerson(d.p);
    d._p._doppelgangers.push(d);
  });
  data.graph.connections.forEach(c =>
  {
    c._persons = [];
    c._children = [];
    let p2 = getDataPerson(c.p2);
    let isChildConnection = isChildConnectionNode(c.p1);
    let level = getConnectionRelationSettings(c.r).level;
    if (isChildConnection || level === 'v') {
      if (isChildConnection) {
        let pc = getParentConnectionFromChildConnectionNode(c.p1);
        getParentTsFromChildConnectionNode(c.p1).map(getDataPerson).forEach(p1 =>
        {
          p1._children.push({ p: p2, c: c, pc: pc });
          p2._parents.push({ p: p1, c: c, pc: pc });
          c._persons.push(p1);
        });
        pc._children.push({ p: p2, c: c });
      }
      else {
        let p1 = getDataPerson(c.p1);
        p1._children.push({ p: p2, c: c });
        p2._parents.push({ p: p1, c: c });
        c._persons.push(p1);
      }
    }
    else {
      let p1 = getDataPerson(c.p1);
      if (level === 'h') {
        p1._partners.push({ p: p2, c: c });
        p2._partners.push({ p: p1, c: c });
      }
      else {
        p1._other.push({ p: p2, c: c });
        p2._other.push({ p: p1, c: c });
      }
      c._persons.push(p1);
    }
    c._persons.push(p2);
  });
}


// log history
// ------------------------------------
let logListUL = document.getElementById('log-list');
let logPlayBackward = document.querySelector('#log .log-play-backward');
let logPlayStop = document.querySelector('#log .log-play-stop');
let logPlayForward = document.querySelector('#log .log-play-forward');
let logRestoreSelectedItem = document.getElementById('log-restore-selected-item');

let logPreviewActive = false;
let logCacheUserSelectedNodes = [];
let logCacheUserSelectedEdges = [];

logListUL.addEventListener('mouseenter', e =>
{
  console.log('enter ul');
  if (!logPreviewActive) {
    logCacheUserSelectedNodes = activeState.nodes().map(n => n.id);
    logCacheUserSelectedEdges = activeState.edges().map(e => e.id);
    activeState.dropNodes();
    activeState.dropEdges();
    s.refresh();
  }
  hideForm(personMenuForm);
  hideForm(connectionMenuForm);
});
logListUL.addEventListener('mouseleave', e =>
{
  console.log('leave ul');
  if (!logPreviewActive) {
    activeState.addNodes(logCacheUserSelectedNodes);
    activeState.addEdges(logCacheUserSelectedEdges);
    s.refresh();
  }
});

if (currentUserIsAdmin) {
  document.getElementById('log-extended').addEventListener('change', () =>
  {
    xhRequest('?action=toggle-extended-log', () => window.location.reload());
  });
}

let logAddLogItem = true;
let logItemSelectedMaster = null;
let logItemSelectedPreview = null;
function addLogItem(l, prepend, itemRestorable)
{
  console.log(logAddLogItem ? ['addLogItem', l, 'prepend:', prepend, 'itemRestorable:', itemRestorable] : '...');
  let hash = l[0];
  let logDate = l[1];
  let logAuthor = l[2];
  let logM = l[3].split(' :: ');
  let logMsg = logM[0];
  let li = document.createElement('li');
  if (prepend) {
    data.currentHash = hash;
    logListUL.querySelectorAll('.log-item-master').forEach(li =>
    {
      li.classList.remove('log-item-master');
    });
    logListUL.prepend(li);
  }
  else {
    logListUL.appendChild(li);
  }
  li.innerHTML = logAuthor + '<span>' + new Date(logDate).toLocaleString() + '</span>';
  li.title = currentUserIsAdmin ? l[3] : logMsg;
  li.classList.add('button');
  let logPC = '';
  let logTs = [];
  if (logM.length === 2) {
    logPC = logM[1].substr(0, 2);
    if (['p ', 'P ', 'c ', 'C ', 'm '].includes(logPC)) {
      logTs = logM[1].substr(2).split(/, | /);
    }
    else {
      logPC = '';
    }
  }
  if (hash === data.currentHash) {
    if (logItemSelectedMaster) {
      logItemSelectedMaster.classList.remove('log-item-master');
    }
    if (logItemSelectedPreview) {
      logItemSelectedPreview.classList.remove('log-item-preview');
    }
    logItemSelectedMaster = li;
    logItemSelectedPreview = li;
    logItemSelectedMaster.classList.add('log-item-master');
    logItemSelectedPreview.classList.add('log-item-preview');
  }
  li.setAttribute('data-log-pc', logPC);
  li.setAttribute('data-log-ts', logTs.join(','));
  li.addEventListener('mouseenter', e =>
  {
    // console.log('enter li');
    if (li.classList.contains('log-item-preview') && !('forceLogItemPreview' in e)) {
      console.log('cancel hover preview - already selected');
      return;
    }
    let previewLogPC = logPC;
    let previewLogTs = logTs;
    let prevLi = li;
    while ((prevLi = prevLi.previousElementSibling) != null) {
      if (prevLi.classList.contains('log-item-preview')) {
        prevLi = li.previousElementSibling;
        previewLogPC = prevLi.getAttribute('data-log-pc');
        previewLogTs = prevLi.getAttribute('data-log-ts').split(',');
        break;
      }
    }
    // console.log([previewLogPC, previewLogTs]);
    if (previewLogPC !== '') {
      if (['p ', 'P ', 'm '].includes(previewLogPC)) {
        let existingNodeIDs = s.graph.nodes(previewLogTs).filter(n => n !== undefined).map(n => n.id);
        activeState.addNodes(existingNodeIDs);
      }
      else if (['c ', 'C '].includes(previewLogPC)) {
        let existingEdgeIDs = s.graph.edges(previewLogTs).filter(e => e !== undefined).map(e => e.id);
        activeState.addEdges(existingEdgeIDs);
      }
      s.refresh();
    }
  });
  li.addEventListener('mouseleave', e =>
  {
    // console.log('leave li');
    activeState.dropNodes();
    activeState.dropEdges();
    s.refresh();
  });
  li.addEventListener('click', e =>
  {
    // console.log('log click');
    if (li === logItemSelectedPreview) {
      console.log('cancel restore log item - already restored');
      return;
    }
    logItemSelectedPreview.classList.remove('log-item-preview');
    logItemSelectedPreview = li;
    logItemSelectedPreview.classList.add('log-item-preview');
    loadData(hash);
    logPreviewActive = hash !== data.currentHash;
    if (logPreviewActive) {
      dragListener.disable();
    }
    else {
      dragListener.enable();
    }
    if (logPreviewActive && itemRestorable) {
      logRestoreSelectedItem.href = '?action=reset&hash=' + hash;
      logRestoreSelectedItem.classList.remove('hidden');
    }
    else {
      logRestoreSelectedItem.href = '';
      logRestoreSelectedItem.classList.add('hidden');
    }
  });
  return li;
}

function removeLatestLogItem()
{
  logListUL.children[0].remove();
}

function addLogItemFromServerResponse(responseStr)
{
  let response = responseStr.split(' ;;; ');
  if (response[2].includes('UPDATED') || response[2].includes('EXTENDED')) {
    removeLatestLogItem();
  }
  addLogItem(JSON.parse(response[1]), true, true);
  return response;
}

let logPlaying = false;
let LOG_PLAYING_FORWARD = 'forward';
let LOG_PLAYING_BACKWARD = 'backward';
function logPlayStep()
{
  let hovering = new MouseEvent('mouseenter', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  hovering.forceLogItemPreview = true;
  logItemSelectedPreview.dispatchEvent(hovering);
  setTimeout(() =>
  {
    let nextItem = (!logPlaying) ? null : ((logPlaying === LOG_PLAYING_FORWARD) ? logItemSelectedPreview.previousElementSibling : logItemSelectedPreview.nextElementSibling);
    if (nextItem !== null) {
      activeState.dropNodes();
      activeState.dropEdges();
      nextItem.click();
    }
    else {
      callbacks.graphLoaded.remove(logPlayStep);
      logPlaying = false;
      console.log('log play stopped');
      callbacks.logPlayStopped.call();
    }
  }, settings.logPlaybackDelay);
}
logPlayBackward.addEventListener('click', () =>
{
  console.log('log play click backward');
  if (logPlaying) {
    if (logPlaying === LOG_PLAYING_FORWARD) {
      callbacks.logPlayStopped.addOnce(() => logPlayBackward.click());
      logPlaying = false;
    }
    return;
  }
  console.log('log play start backward');
  logPlaying = LOG_PLAYING_BACKWARD;
  callbacks.graphLoaded.add(logPlayStep);
  logPlayStep();
});
logPlayStop.addEventListener('click', () =>
{
  console.log('log play stopping...');
  logPlaying = false;
});
logPlayForward.addEventListener('click', () =>
{
  console.log('log play click forward');
  if (logPlaying) {
    if (logPlaying === LOG_PLAYING_BACKWARD) {
      callbacks.logPlayStopped.addOnce(() => logPlayForward.click());
      logPlaying = false;
    }
    return;
  }
  console.log('log play start forward');
  logPlaying = LOG_PLAYING_FORWARD;
  callbacks.graphLoaded.add(logPlayStep);
  logPlayStep();
});


// move camera
// ------------------------------------
let saveCameraTimeout = null;
function cameraMoved(e)
{
  // console.log('camera moved');
  if (saveCameraTimeout) {
    clearTimeout(saveCameraTimeout);
  }
  saveCameraTimeout = setTimeout(() =>
  {
    saveCameraTimeout = null;
    moveCamera({
        x: s.camera.x,
        y: s.camera.y,
        z: s.camera.ratio
      },
      true, true, false, false);
  },
  settings.saveCameraTimeout);
}

function moveCamera(xyz, toData, toServer, toGraph, refreshGraph)
{
  toServerDataGraph('moveCamera', xyz, {
      toServer: toServer,
      toData: !toData ? null : () => { data.settings.camera = xyz; },
      toGraph: !toGraph ? null : () => {
        s.camera.x = xyz.x;
        s.camera.y = xyz.y;
        s.camera.ratio = xyz.z; },
      refreshGraph: refreshGraph
    });
  if (toServer) {
    restartEditingStopTimer();
  }
}


// select
// ------------------------------------
function deselectAll(e = null, refreshGraph = true, except = [])
{
  deselectPersons(e, false, except);
  deselectConnections(e, false, except);
  if (refreshGraph) {
    s.refresh();
  }
}


// select persons
// ------------------------------------
function deselectPersons(e = null, refreshGraph = true, except = [])
{
  if (except.length) {
    activeState.dropNodes(
      activeState.nodes()
        .filter(n => !except.includes(n.id))
        .map(n => n.id));
  }
  else {
    activeState.dropNodes();
  }
  if (refreshGraph) {
    s.refresh();
  }
}

function selectDirectRelatives(e)
{
  console.log('select direct relatives of ' + e.data.node.id);
  let recurseUp = p_t =>
  {
    // console.log('p ' + p_t);
    activeState.addNodes(p_t);
    getDataPersonConnections(p_t).forEach(c =>
    {
      // console.log('c ' + c.r);
      if (c.p2 == p_t && getConnectionRelationSettings(c.r).level === 'v') {
        activeState.addEdges(c.t);
        if (isChildConnectionNode(c.p1)) {
          activeState.addEdges(getParentConnectionFromChildConnectionNode(c.p1).t);
          getParentTsFromChildConnectionNode(c.p1).forEach(recurseUp);
        }
        else {
          recurseUp(c.p1);
        }
      }
      // else {
      //   console.log('-');
      // }
    });
  };
  let recurseDown = p_t =>
  {
    // console.log('p ' + p_t);
    activeState.addNodes(p_t);
    getDataPersonConnections(p_t).forEach(c =>
    {
      // console.log('c ' + c.r);
      if (compareTs(c.p1, p_t) && getConnectionRelationSettings(c.r).level === 'v') {
        activeState.addEdges(c.t);
        recurseDown(c.p2);
      }
      // else {
      //   console.log('-');
      // }
    });
  };
  deselectAll();
  recurseUp(e.data.node.id);
  // console.log('---');
  recurseDown(e.data.node.id);
  s.refresh();
}


// select connections
// ------------------------------------
function deselectConnections(e = null, refreshGraph = true, except = [])
{
  if (except.length) {
    activeState.dropEdges(
      activeState.edges()
        .filter(n => !except.includes(n.id))
        .map(n => n.id));
  }
  else {
    activeState.dropEdges();
  }
  if (refreshGraph) {
    s.refresh();
  }
}


// persons
// ------------------------------------
let personMenuForm = document.getElementById('person-form');
let personMenuPersonURL = document.getElementById('person-form-person-url');
let personMenuFirstName = document.getElementById('person-form-first-name');
let personMenuLastName = document.getElementById('person-form-last-name');
let personMenuBirthName = document.getElementById('person-form-birth-name');
let personMenuBirthDay = document.getElementById('person-form-birth-day');
let personMenuBirthMonth = document.getElementById('person-form-birth-month');
let personMenuBirthYear = document.getElementById('person-form-birth-year');
let personMenuDeathDay = document.getElementById('person-form-death-day');
let personMenuDeathMonth = document.getElementById('person-form-death-month');
let personMenuDeathYear = document.getElementById('person-form-death-year');
let personMenuNote = document.getElementById('person-form-note');
let personMenuAdd = document.getElementById('person-form-add');
let personMenuEdit = document.getElementById('person-form-edit');
let personMenuDelete = document.getElementById('person-form-delete');
let personMenuCancel = document.getElementById('person-form-cancel');

function startNewPerson(e)
{
  console.log('startNewPerson');
  let newPersonPosition = getGraphPositionFromEvent(e);
  alignToGrid(newPersonPosition);
  addPerson({
    t: PERSON_PREVIEW,
    x: newPersonPosition.x,
    y: newPersonPosition.y,
    f: '',
    l: '',
    m: '',
    o: ''},
    false, false, true, true);
  let fn = () =>
  {
    clearPersonMenu();
    updateDateValue(personMenuBirthDay, personMenuBirthMonth, personMenuBirthYear);
    updateDateValue(personMenuDeathDay, personMenuDeathMonth, personMenuDeathYear);
    showForm(personMenuForm, 'opt-new', true);
    if (activeState.nodes().length === 1 && activeState.edges().length === 0) {
      personMenuDoppelgangerPerson.innerHTML = activeState.nodes()[0].label;
      personMenuDoppelganger.classList.remove('hidden');
    }
    else {
      personMenuDoppelganger.classList.add('hidden');
    }
  };
  if (isMobile) {
    setTimeout(fn, settings.mobileGraphClickDelay);
  }
  else {
    fn();
  }
}

function clearPersonMenu()
{
  personMenuPersonURL.innerHTML = '';
  personMenuFirstName.value = '';
  personMenuLastName.value = '';
  personMenuBirthName.value = '';
  personMenuBirthDay.value = '';
  personMenuBirthMonth.value = '';
  personMenuBirthYear.value = '';
  personMenuDeathDay.value = '';
  personMenuDeathMonth.value = '';
  personMenuDeathYear.value = '';
  personMenuNote.value = '';
}

function showPersonInfo(t)
{
  let fn = () =>
  {
    console.log(['showPersonInfo', t]);
    let p = getDataPerson(t);
    let db = splitDate(p.b);
    let url = document.createElement('a');
    url.innerHTML = '&#x1F517;';
    url.href = serverURL + (serverURL.endsWith('/') ? '?' : '&') + 'show=' + p.t;
    personMenuPersonURL.innerHTML = '';
    personMenuPersonURL.appendChild(url);
    personMenuFirstName.value = p.f;
    personMenuLastName.value = p.l;
    personMenuBirthName.value = p.m;
    personMenuBirthDay.value = db[2];
    personMenuBirthMonth.value = db[1];
    personMenuBirthYear.value = db[0];
    updateDateValue(personMenuBirthDay, personMenuBirthMonth, personMenuBirthYear);
    let dd = splitDate(p.d);
    personMenuDeathDay.value = dd[2];
    personMenuDeathMonth.value = dd[1];
    personMenuDeathYear.value = dd[0];
    updateDateValue(personMenuDeathDay, personMenuDeathMonth, personMenuDeathYear);
    personMenuNote.value = p.o;
    if (currentUserCanEdit()) {
      personMenuDelete.classList.toggle('hidden', getDataPersonConnections(t).length > 0)
      personMenuEdit.classList.remove('hidden');
      personMenuFirstName.disabled = false;
      personMenuLastName.disabled = false;
      personMenuBirthName.disabled = false;
      personMenuBirthDay.disabled = false;
      personMenuBirthMonth.disabled = false;
      personMenuBirthYear.disabled = false;
      personMenuDeathDay.disabled = false;
      personMenuDeathMonth.disabled = false;
      personMenuDeathYear.disabled = false;
      personMenuNote.disabled = false;
    }
    else {
      personMenuDelete.classList.add('hidden');
      personMenuEdit.classList.add('hidden');
      personMenuFirstName.disabled = true;
      personMenuLastName.disabled = true;
      personMenuBirthName.disabled = true;
      personMenuBirthDay.disabled = true;
      personMenuBirthMonth.disabled = true;
      personMenuBirthYear.disabled = true;
      personMenuDeathDay.disabled = true;
      personMenuDeathMonth.disabled = true;
      personMenuDeathYear.disabled = true;
      personMenuNote.disabled = true;
    }
    personMenuDoppelganger.classList.add('hidden');
    showForm(personMenuForm, 'opt-edit', currentUserCanEdit());
  };
  if (isMobile) {
    setTimeout(fn, settings.mobileGraphClickDelay);
  }
  else {
    fn();
  }
}

personMenuAdd.addEventListener('click', e =>
{
  if (currentUserCanEdit()) {
    console.log('click person-form-add');
    hideForm(personMenuForm);
    let personPreview = s.graph.nodes(PERSON_PREVIEW);
    let x = personPreview.x;
    let y = personPreview.y;
    deletePerson(PERSON_PREVIEW, false, false, true, false);
    addPerson({
        x: x,
        y: y,
        f: personMenuFirstName.value.trim(),
        l: personMenuLastName.value.trim(),
        m: personMenuBirthName.value.trim(),
        b: personMenuBirthDay.getAttribute('data-value'),
        d: personMenuDeathDay.getAttribute('data-value'),
        o: personMenuNote.value.trim()
      },
      true, true, true, true,
      (p) =>
      {
        deselectAll(e, false);
        activeState.addNodes(p.t);
        s.refresh();
      });
  }
});

personMenuEdit.addEventListener('click', e =>
{
  if (currentUserCanEdit()) {
    console.log('click person-form-edit');
    hideForm(personMenuForm);
    editPerson({
        t: activeState.nodes()[0].id,
        f: personMenuFirstName.value.trim(),
        l: personMenuLastName.value.trim(),
        m: personMenuBirthName.value.trim(),
        b: personMenuBirthDay.getAttribute('data-value'),
        d: personMenuDeathDay.getAttribute('data-value'),
        o: personMenuNote.value.trim()
      });
  }
});

personMenuDelete.addEventListener('click', e =>
{
  if (currentUserCanEdit()) {
    console.log('click person-form-delete');
    let t = activeState.nodes()[0].id;
    let connections = getDataPersonConnections(t);
    if (connections.length) {
      console.log(['cancelled - person to delete must not have connections', connections]);
      return;
    }
    hideForm(personMenuForm);
    activeState.dropNodes();
    deletePerson(t);
  }
});

personMenuCancel.addEventListener('click', e =>
{
  console.log('click person-form-cancel');
  if (s.graph.nodes(PERSON_PREVIEW)) {
    deletePerson(PERSON_PREVIEW, false, false, true, true);
  }
  hideForm(personMenuForm);
});

approveDeleteOrCancelKeys(
  [ personMenuFirstName, personMenuLastName, personMenuBirthName, personMenuBirthDay, personMenuBirthMonth, personMenuBirthYear, personMenuDeathDay, personMenuDeathMonth, personMenuDeathYear, personMenuNote, personMenuCancel ],
  [ personMenuAdd, personMenuEdit ],
  personMenuDelete,
  personMenuCancel);

let logAddPerson = true;
function addPerson(p, toData, toServer, toGraph, refreshGraph, doneCallback = null)
{
  if ('n' in p) {// backward compatibility for old log items with only one name attribute
    // console.log('convert ' + p.n);
    p.f = '';
    p.l = '';
    p.m = '';
    if (p.n.includes(',')) {
      let i = p.n.indexOf(',');
      p.f = p.n.substr(0, i).trim();
      p.l = p.n.substr(i + 1).trim();
    }
    else {
      p.f = p.n;
    }
    delete p.n;
  }
  toServerDataGraph('addPerson', p, {
      toServer: !toServer ? null : response =>
      {
        response = addLogItemFromServerResponse(response);
        p.t = response[0].substr(2);
      },
      toData: !toData ? null : p => data.graph.persons.push(p),
      toGraph: !toGraph ? null : () =>
      {
        s.graph.addNode({
            _my: {
              isPerson: true,
              p: p
            },
            id: p.t,
            x: p.x,
            y: p.y,
            label: getPersonRufname(p),
            size: settings.nodeSize,
            color: getNodeColorFromPerson(p),
            labelAlignment: (p.y < nodeCenterY) ? 'top' : 'bottom' });
        },
      refreshGraph: refreshGraph,
      doneCallback: p =>
      {
        if (toGraph) {
          p._graphNode = s.graph.nodes(p.t);
        }
        if (doneCallback) {
          doneCallback(p);
        }
      }
    }, logAddPerson);
  if (toServer) {
    restartEditingStopTimer();
  }
}

function editPerson(p, toData = true, toServer = true, toGraph = true, refreshGraph = true)
{
  toServerDataGraph('editPerson', p, {
      toServer: !toServer ? null : addLogItemFromServerResponse,
      toData: !toData ? null : () =>
      {
        let i = getDataPersonIndex(p.t);
        let old = data.graph.persons[i];
        p.x = old.x;
        p.y = old.y;
        data.graph.persons[i] = p;
      },
      toGraph: !toGraph ? null : () =>
      {
        let n = s.graph.nodes(p.t);
        n.label = getPersonRufname(p);
        n.color = getNodeColorFromPerson(p);
      },
      refreshGraph: refreshGraph
    });
  if (toServer) {
    restartEditingStopTimer();
  }
}

function deletePerson(p_t, toData = true, toServer = true, toGraph = true, refreshGraph = true)
{
  toServerDataGraph('deletePerson', p_t, {
      toServer: !toServer ? null : addLogItemFromServerResponse,
      toData: !toData ? null : () => deleteDataPerson(p_t),
      toGraph: !toGraph ? null : () => s.graph.dropNode(p_t),
      refreshGraph: refreshGraph
    });
  if (toServer) {
    restartEditingStopTimer();
  }
}

function movePersons(n_id, toData, toServer, toGraph, refreshGraph, alignNodesToGrid, log)
{
  let nodes = activeState.nodes();
  if (!nodes.some(n => n.id === n_id)) {
    nodes = [s.graph.nodes(n_id)];
  }
  if (alignNodesToGrid) {
    nodes.forEach(alignToGrid);
  }
  moveChildConnectionNodes(nodes);
  // if (refreshGraph) {
    // s.refresh();
  // }
  let ds = [];
  if (toServer) {
    nodes.forEach(n => { ds.push({ t: n.id, x: n.x, y: n.y }); });
  }
  toServerDataGraph('movePersons', ds, {
      toServer: !toServer ? null : addLogItemFromServerResponse,
      toData: !toData ? null : () =>
      {
        nodes.forEach(n => {
          let p = getDataPerson(n.id);
          p.x = n.x;
          p.y = n.y; });
      },
      toGraph: null,
      refreshGraph: refreshGraph
    }, log);
  if (toServer) {
    restartEditingStopTimer();
  }
}


// doppelgangers
// ------------------------------------
let personMenuDoppelganger = document.getElementById('person-form-doppelganger');
let personMenuDoppelgangerAdd = document.getElementById('person-form-doppelganger-add');
let personMenuDoppelgangerPerson = personMenuDoppelgangerAdd.querySelector('span');

personMenuDoppelgangerAdd.addEventListener('click', e =>
{
  if (currentUserCanEdit()) {
    console.log('click person-form-doppelganger-add');
    hideForm(personMenuForm);
    let personPreview = s.graph.nodes(PERSON_PREVIEW);
    let x = personPreview.x;
    let y = personPreview.y;
    deletePerson(PERSON_PREVIEW, false, false, true, false);
    addDoppelganger({
        x: x,
        y: y,
        p: activeState.nodes()[0].id
      },
      true, true, true, true,
      (p) =>
      {
        deselectAll(e, false);
        activeState.addNodes(p.t);
        s.refresh();
      });
  }
});

let logAddDoppelganger = true;
function addDoppelganger(d, toData, toServer, toGraph, refreshGraph, doneCallback = null)
{
  toServerDataGraph('addDoppelganger', d, {
    toServer: !toServer ? null : response =>
    {
      response = addLogItemFromServerResponse(response);
      d.t = response[0].substr(2);
    },
    toData: !toData ? null : d => data.graph.doppelgangers.push(d),
    toGraph: !toGraph ? null : () =>
    {
      let p = getDataPerson(d.p);
      s.graph.addNode({
          _my: {
            isDoppelganger: true,
            d: d
          },
          id: d.t,
          x: d.x,
          y: d.y,
          label: getPersonRufname(p),
          size: settings.nodeSize * .7,
          color: getNodeColorFromPerson(p),
          labelAlignment: (d.y < nodeCenterY) ? 'top' : 'bottom' });
    },
    refreshGraph: refreshGraph,
    doneCallback: d =>
    {
      if (toGraph) {
        d._graphNode = s.graph.nodes(d.t);
      }
      if (doneCallback) {
        doneCallback(d);
      }
    }
  }, logAddDoppelganger);
  if (toServer) {
    restartEditingStopTimer();
  }
}


// connections
// ------------------------------------
let connectionMenuForm = document.getElementById('connection-form');
let connectionMenuPersons = document.getElementById('connection-form-persons');
let connectionMenuRelation = document.getElementById('connection-form-relation');
let connectionMenuDesc = document.getElementById('connection-form-desc');
let connectionMenuAdd = document.getElementById('connection-form-add');
let connectionMenuAddChild = document.getElementById('connection-form-add-child');
let connectionMenuEdit = document.getElementById('connection-form-edit');
let connectionMenuDelete = document.getElementById('connection-form-delete');
let connectionMenuCancel = document.getElementById('connection-form-cancel');

function startNewConnection()
{
  let p1 = activeState.nodes()[0];
  let p2 = activeState.nodes()[1];
  if (checkPersonsConnected(p1.id, p2.id)) {
    console.log('no connection possible - persons already connected');
    return;
  }
  addConnection({
      t: CONNECTION_PREVIEW,
      p1: p1.id,
      p2: p2.id,
      r: '',
      d: ''},
    false, false, true, true);
  let fn = () =>
  {
    clearConnectionMenu('verheiratet');
    [...connectionMenuRelation.children].forEach(option =>
    {
      option.disabled = !option.value;
    });
    showForm(connectionMenuForm, 'opt-new', true);
  };
  if (isMobile) {
    setTimeout(fn, settings.mobileGraphClickDelay);
  }
  else {
    fn();
  }
}

function startNewChildConnection()
{
  let c = activeState.edges()[0];
  if (isChildConnectionNode(c.source)) {
    console.log('no child connection possible - selected connection is already a child connection');
    return;
  }
  let p1_id = createChildConnectionNodeId(c.source, c.target);
  let p2 = activeState.nodes()[0];
  if (checkPersonsConnected(c.source, p2.id) || checkPersonsConnected(c.target, p2.id)) {
    console.log('no child connection possible - persons already connected');
    return;
  }
  addConnection({
      t: CONNECTION_PREVIEW,
      p1: p1_id,
      p2: activeState.nodes()[0].id,
      r: '',
      d: ''},
    false, false, true, true);
  let fn = () =>
  {
    clearConnectionMenu('Kind');
    [...connectionMenuRelation.children].forEach(option =>
    {
      option.disabled = !option.value || (getConnectionRelationSettings(option.value).level === 'h');
    });
    showForm(connectionMenuForm, 'opt-new-child', true);
  };
  if (isMobile) {
    setTimeout(fn, settings.mobileGraphClickDelay);
  }
  else {
    fn();
  }
}

function clearConnectionMenu(relationValue = '???')
{
  connectionMenuPersons.innerHTML = '';
  connectionMenuRelation.value = relationValue;
  connectionMenuDesc.value = '';
}

function showConnectionInfo(t)
{
  let fn = () =>
  {
    console.log(['showConnectionInfo', t]);
    let c = getDataConnection(t);
    let p1_n = '';
    let isChildConnection = isChildConnectionNode(c.p1);
    if (isChildConnection) {
      let p1 = getParentTsFromChildConnectionNode(c.p1);
      let p1_1 = getDataPerson(p1[0]);
      let p1_2 = getDataPerson(p1[1]);
      p1_n = getPersonRufname(p1_1) + ' & ' + getPersonRufname(p1_2);
    }
    else {
      p1_n = getPersonRufname(getDataPerson(c.p1));
    }
    let p2 = getDataPerson(c.p2);
    connectionMenuPersons.innerHTML = escapeHtml(p1_n) + ' &mdash; ' + escapeHtml(getPersonRufname(p2));
    connectionMenuRelation.value = c.r;
    connectionMenuDesc.value = c.d;
    if (currentUserCanEdit()) {
      connectionMenuDelete.classList.toggle('hidden', getDataChildConnections(c).length > 0);
      connectionMenuEdit.classList.remove('hidden');
      connectionMenuRelation.disabled = false;
      connectionMenuDesc.disabled = false;
    }
    else {
      connectionMenuDelete.classList.add('hidden');
      connectionMenuEdit.classList.add('hidden');
      connectionMenuRelation.disabled = true;
      connectionMenuDesc.disabled = true;
    }
    [...connectionMenuRelation.children].forEach(option =>
    {
      option.disabled = !option.value || (isChildConnection && getConnectionRelationSettings(option.value).level === 'h');
    });
    showForm(connectionMenuForm, 'opt-edit', currentUserCanEdit());
  };
  if (isMobile) {
    setTimeout(fn, settings.mobileGraphClickDelay);
  }
  else {
    fn();
  }
}

connectionMenuAdd.addEventListener('click', e =>
{
  if (currentUserCanEdit()) {
    console.log('click connection-form-add');
    hideForm(connectionMenuForm);
    deleteConnection(CONNECTION_PREVIEW, false, false, true, false);
    let n = activeState.nodes();
    addConnection({
        p1: n[0].id,
        p2: n[1].id,
        r: connectionMenuRelation.value.trim(),
        d: connectionMenuDesc.value.trim()
      }, true, true, true, true,
      (c) =>
      {
        deselectAll(e, false);
        activeState.addEdges(c.t);
        s.refresh();
      });
  }
});

connectionMenuAddChild.addEventListener('click', e =>
{
  if (currentUserCanEdit()) {
    console.log('click connection-form-add-child');
    hideForm(connectionMenuForm);
    deleteConnection(CONNECTION_PREVIEW, false, false, true, false);
    let c = activeState.edges()[0];
    let p = activeState.nodes()[0];
    let p1 = s.graph.nodes(c.source);
    let p2 = s.graph.nodes(c.target);
    addConnection({
        p1: createChildConnectionNodeId(p1.id, p2.id),
        p2: p.id,
        r: connectionMenuRelation.value.trim(),
        d: connectionMenuDesc.value.trim()
      }, true, true, true, true,
      (c) =>
      {
        deselectAll(null, false);
        activeState.addEdges(c.t);
        s.refresh();
      });
  }
});

connectionMenuEdit.addEventListener('click', e =>
{
  if (currentUserCanEdit()) {
    console.log('click connection-form-edit');
    hideForm(connectionMenuForm);
    editConnection({
        t: activeState.edges()[0].id,
        r: connectionMenuRelation.value.trim(),
        d: connectionMenuDesc.value.trim()
      });
  }
});

connectionMenuDelete.addEventListener('click', e =>
{
  if (currentUserCanEdit()) {
    console.log('click connection-form-delete');
    let t = activeState.edges()[0].id;
    let childConnections = getDataChildConnections(getDataConnection(t));
    if (childConnections.length) {
      console.log(['cancelled - connection to delete must not have child connections', childConnections]);
      return;
    }
    hideForm(connectionMenuForm);
    activeState.dropEdges();
    deleteConnection(t);
  }
});

connectionMenuCancel.addEventListener('click', e =>
{
  console.log('click connection-form-cancel');
  if (s.graph.edges(CONNECTION_PREVIEW)) {
    deleteConnection(CONNECTION_PREVIEW, false, false, true, true);
  }
  hideForm(connectionMenuForm);
});

approveDeleteOrCancelKeys(
  [ connectionMenuRelation, connectionMenuDesc, connectionMenuCancel ],
  [ connectionMenuAdd, connectionMenuAddChild, connectionMenuEdit ],
  connectionMenuDelete,
  connectionMenuCancel);

let logAddConnection = true;
function addConnection(c, toData, toServer, toGraph, refreshGraph, doneCallback = null)
{
  let isChildConnection = isChildConnectionNode(c.p1);
  if (toGraph && isChildConnection) {
    if (!s.graph.nodes(c.p1)) {
      let p1 = getParentTsFromChildConnectionNode(c.p1);
      let p1_1 = getDataPerson(p1[0]);
      let p1_2 = getDataPerson(p1[1]);
      let p12 = getChildConnectionNodePosition(p1_1, p1_2);
      s.graph.addNode({
          _my: {
            isChildConnectionNode: true,
            c: c
          },
          id: c.p1,
          x: p12.x,
          y: p12.y,
          size: .1,
          color: settings.edgeColor
      });
    }
  }
  toServerDataGraph('addConnection', c, {
      toServer: !toServer ? null : response =>
      {
        response = addLogItemFromServerResponse(response);
        c.t = response[0].substr(2);
      },
      toData: !toData ? null : () => data.graph.connections.push(c),
      toGraph: !toGraph ? null : () =>
      {
        let _my = { c: c };
        if (isChildConnection) {
          _my.isChildConnection = true;
        }
        else {
          _my.isPersonConnection = true;
        }
        s.graph.addEdge({
            _my: _my,
            id: c.t,
            source: c.p1,
            target: c.p2,
            label: c.r,
            size: settings.edgeSize,
            type: getConnectionRelationSettings(c.r).lineType,
            color: getEdgeColorFromConnection(c)});
      },
      refreshGraph: refreshGraph,
      doneCallback: c =>
      {
        if (toGraph) {
          c._graphEdge = s.graph.edges(c.t);
          if (isChildConnectionNode(c.p1)) {
            c._graphCCNode = s.graph.nodes(c.p1);
          }
        }
        if (doneCallback) {
          doneCallback(c);
        }
      }
    }, logAddConnection);
  if (toServer) {
    restartEditingStopTimer();
  }
}

function editConnection(c, toData = true, toServer = true, toGraph = true, refreshGraph = true)
{
  toServerDataGraph('editConnection', c, {
      toServer: !toServer ? null : addLogItemFromServerResponse,
      toData: !toData ? null : () =>
      {
        let i = getDataConnectionIndex(c.t);
        let old = data.graph.connections[i];
        c.p1 = old.p1;
        c.p2 = old.p2;
        data.graph.connections[i] = c;
      },
      toGraph: !toGraph ? null : () =>
      {
        let e = s.graph.edges(c.t);
        e.label = c.r;
        e.type = getConnectionRelationSettings(c.r).lineType;
        e.color = getEdgeColorFromConnection(c);
      },
      refreshGraph: refreshGraph
    });
  if (toServer) {
    restartEditingStopTimer();
  }
}

function deleteConnection(c_t, toData = true, toServer = true, toGraph = true, refreshGraph = true)
{
  toServerDataGraph('deleteConnection', c_t, {
      toServer: !toServer ? null : addLogItemFromServerResponse,
      toData: !toData ? null : () => deleteDataConnection(c_t),
      toGraph: !toGraph ? null : () => s.graph.dropEdge(c_t),
      refreshGraph: refreshGraph
    });
  if (toServer) {
    restartEditingStopTimer();
  }
}

let extensionNodes = [];
let extensionEdges = [];

function addExtension(p, id, offset_xy, label)
{
  let t_p = '*' + p.t + '-' + id + '-p';
  let t_c = '*' + p.t + '-' + id + '-c';
  extensionNodes.push(t_p);
  extensionEdges.push(t_c);
  s.graph.addNode({
      _my: {
        isExtension: true,
        p: p
      },
      id: t_p,
      x: p._graphNode.x + offset_xy.x,
      y: p._graphNode.y + offset_xy.y,
      size: .01 * settings.nodeSize,
      color: '#ddd'
  });
  s.graph.addEdge({
      _my: {
        isExtension: true,
        p: p
      },
      id: t_c,
      source: p.t,
      target: t_p,
      label: label,
      size: settings.edgeSize,
      type: 'extension',
      color: '#ddd'
  });
}


// events
// ------------------------------------

if (!currentUserCanEdit()) {
  dragListener.disable();
}

function bindDefaultViewerEvents()
{
  let cdcNode = clickDoubleClick(
  e =>
  {
    let n_id = e.data.node.id;
    deselectAll(null, false, [n_id]);
    if (!isPerson(e.data.node)) {
      return;
    }
    activeState.addNodes(n_id);
    s.refresh();
    showPersonInfo(n_id);
  },
  e =>
  {
    if (!isPerson(e.data.node)) {
      return;
    }
    if (!currentLayoutId) {
      selectDirectRelatives(e);
    }
    else {
      deselectAll();
      layouts[currentLayoutId].apply(e.data.node.id);
    }
  });
  s.bind('clickNode', cdcNode.click.bind(cdcNode));
  s.bind('doubleClickNode', cdcNode.doubleClick.bind(cdcNode));

  s.bind('clickEdge', e =>
  {
    let e_id = e.data.edge.id;
    deselectAll(null, false, [e_id]);
    if (isExtension(e.data.edge)) {
      // activeState.addNodes(e.data.edge.source);
      // s.refresh();
      layouts[currentLayoutId].apply(e.data.edge.source);
      return;
    }
    activeState.addEdges(e_id);
    s.refresh();
    showConnectionInfo(e_id);
  });

  s.bind('clickStage', deselectAll);

  s.bind('coordinatesUpdated', () => { s.camera.angle = 0; });
}

document.querySelectorAll('#layouts > button').forEach(btn =>
{
  btn.addEventListener('click', e =>
  {
    let url = btn.getAttribute('data-url');
    let nodes = activeState.nodes();
    if (nodes.length) {
      url += (url.endsWith('/') ? '?' : '&') + 'sel=' + nodes[0].id;
    }
    window.location.href = url;
  });
});

window.addEventListener('resize', (e) =>
{
  if (window.innerHeight !== windowSize.height && window.innerWidth !== windowSize.width) {
    window.location.reload();
  }
});

let selectionFromURL = urlParams.get('sel');
let showFromURL = urlParams.get('show');
if (currentLayoutId) {
  callbacks.graphLoaded.add(() => layouts[currentLayoutId].apply(selectionFromURL));
}
let fromURL = showFromURL || selectionFromURL;
if (fromURL) {
  callbacks.graphLoaded.addOnce(() =>
  {
    let p = getDataPerson(fromURL);
    if (p) {
      activeState.addNodes(fromURL);
      if (currentLayoutId) {
        s.camera.goTo({
            x: p._graphNode.x,
            y: p._graphNode.y });
      }
      s.refresh();
      if (showFromURL === fromURL) {
        showPersonInfo(showFromURL);
      }
    }
    else if (getDataConnection(fromURL)) {
      activeState.addEdges(fromURL);
      s.refresh();
      if (showFromURL === fromURL) {
        showConnectionInfo(showFromURL);
      }
    }
  });
}

setTimeout(s.refresh.bind(s), 1000);
