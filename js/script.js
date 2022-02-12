const settings = {
  nodeSize: isMobile ? 3 : 5,
  nodeColor: '#78D384',
  nodeColorWarning: '#D0D480',
  nodeColorHighlight: '#3BAA49',
  nodeBorderColorDoppelganger: '#4499DD',
  nodeBorderSizeDoppelganger: 2,
  nodeColorPreview: '#ddd',

  edgeSize: .25,
  edgeColor: '#DDD',
  edgeColorWarning: '#E6AD92',
  edgeColorHighlight: '#000',
  edgeColorPreview: '#DDD',
  edgeColorDoppelganger: '#F7F7F7',
  edgeColorDoppelgangerHover: '#DDD',

  gridStep: 20,
  mobileGraphClickDelay: 500,
  saveCameraTimeout: 5000,
  checkOtherEditorInterval: 10000,
  stopEditWarningCountdown: 60,
  logPlaybackDelay: 200,
  selectDirectRelativesDelay: 200,
  extendedLabelHoverDelay: 3000,

  relations: {
    Kind: { lineType: 'arrow', level: 'v' },
    adoptiert: { lineType: 'dashedarrow', level: 'v' },
    verheiratet: { lineType: 'line', level: 'h' },
    geschieden: { lineType: 'dashed', level: 'h' },
    verwitwet: { lineType: 'dashed', level: 'h' },
    unverheiratet: { lineType: 'dashed', level: 'h' },
    Doppelganger: { lineType: 'curve', level: 'h' },
    unknown: { lineType: 'dotted', level: 'h' } },

  loadLogItemsPerSecond: 100,
  loadSourceItemsPerSecond: 10,

  debug: {
    addPerson: 1,
    addConnection: 1,
    addLogItem: 1,
    addSourceItem: 1 }
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
    nodeColor: 'node',
    defaultNodeColor: null,
    minNodeSize: .1,
    maxNodeSize: 10,
    // nodeBorderColor: 'default',
    defaultNodeBorderColor: null,
    nodeBorderSize: 0,
    nodeOuterBorderColor: 'default',
    defaultNodeOuterBorderColor: settings.nodeBorderColorDoppelganger,
    nodeOuterBorderSize: 0,

    // person hover
    nodeHoverColor: 'node',
    defaultNodeHoverColor: null,
    nodeHoverBorderColor: 'node',
    defaultNodeHoverBorderColor: null,
    nodeHoverBorderSize: 3,
    defaultNodeHoverOuterBorderColor: null,
    nodeHoverOuterBorderSize: 0,

    // person selected
    nodeActiveColor: 'default',
    defaultNodeActiveColor: settings.nodeColorHighlight,
    // nodeActiveBorderColor: 'default',
    // defaultNodeActiveBorderColor: 'transparent',
    // nodeActiveBorderSize: 0,

    // person selected hover
    nodeActiveHoverBorderColor: 'default',
    defaultNodeActiveHoverBorderColor: settings.nodeColorHighlight,
    nodeActiveHoverBorderSize: 3,

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
    enableEdgeHovering: true,
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
  settings: {
    camera: { x: 0, y: 0, z: 0 },
    personPreviewDisplayString: 'default' },
  graph: { persons: [], connections: [] },
  sources: {},
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
  if (permissions.EDIT) {
    let otherEditorDiv = document.getElementById('other-editor');
    let checkOtherEditor = () =>
    {
      xhRequest({ action: 'get-editor' }, responseText =>
      {
        console.log('check other editor: ' + responseText);
        let otherEditor = JSON.parse(responseText);
        if (otherEditor !== false) {
          if (permissions.EDIT) {
            startEdit.classList.add('hidden');
          }
          let otherEditorTimeout = otherEditor[0] + editingTimeoutDuration - Math.floor(new Date().getTime() / 1000);
          otherEditorDiv.innerHTML = otherEditor[1] + ' bearbeitet gerade (' + durationToString(otherEditorTimeout) + ')';
          otherEditorDiv.classList.remove('hidden');
        }
        else {
          otherEditorDiv.classList.add('hidden');
          if (permissions.EDIT) {
            startEdit.classList.remove('hidden');
          }
        }
      }, false);
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
            stopEditCountdownMessage.buttons['Weiter bearbeiten'].remove();
            xhRequest({ action: 'restart-edit-timer' }, responseText =>
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

function isDataPersonDoppelganger(p)
{
  return 'p' in p;
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
  let i = getDataPersonIndex(t);
  data.graph.persons[i].reset();
  return data.graph.persons.splice(i, 1);
}
function deleteDataConnection(t)
{
  let i = getDataConnectionIndex(t);
  data.graph.connections[i].reset();
  return data.graph.connections.splice(i, 1);
}

function compareTs(c_p_t, p_t)
{
  return isChildConnectionNodeId(c_p_t) ? c_p_t.includes(p_t) : (c_p_t == p_t);
}

function getPersonPreviewDisplayString(p)
{
  let s = data.settings.personPreviewDisplayString;
  if (s === 'default') {
    return p.get_shortDisplayString();
  }
  let ret = [];
  return ret.joinNotEmpty(' ');
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
      if (isChildConnectionNodeId(c.p1)) {
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
function isChildConnectionNodeId(p_t)
{
  return (typeof p_t === 'string') && p_t.includes('-');
}


function isPersonNode(n)
{
  return 'isPerson' in n._my;
}
function isDoppelgangerNode(n)
{
  return 'isDoppelganger' in n._my;
}
function isPersonConnectionEdge(e)
{
  return 'isPersonConnection' in e._my;
}
function isDoppelgangerConnectionEdge(e)
{
  return 'isDoppelgangerConnection' in e._my;
}
function isChildConnectionEdge(e)
{
  return 'isChildConnection' in e._my;
}
function isExtensionEdge(e)
{
  return 'isExtension' in e._my;
}

function isNodeSelected(n_id)
{
  return activeState.nodes(n_id).length > 0;
}
function isEdgeSelected(e_id)
{
  return activeState.edges(e_id).length > 0;
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
        if (isChildConnectionNodeId(p_t) && c.p2 != n1.id) {
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
    ? { action: 'get', q: 'preview', hash: previewHash }
    : { action: 'get', q: 'settings,graph,sources,log,currentHash' }, responseText =>
  {
    clearTimeout(delayedMsg);
    let d = JSON.parse(responseText);
    let hash = previewHash ? previewHash : d.currentHash;
    applyLoadedData(d, previewHash === null, previewHash === null);
    dataCache[hash] = d;

    if (!previewHash) {
      callbacks.initialLoadComplete.call();
    }

    if (msg !== null) {
      setTimeout(msg.dismiss, 1000);
    }
  }, false);
}
if (!firstLogin && !accountUpgraded) {
  loadData();
}

let nodeCenterY = 0;
function applyLoadedData(loadedData, addLogItems, adjustCamera)
{
  for (const [key, value] of Object.entries(loadedData)) {
    data[key] = value;
  }
  if (adjustCamera) {
    moveCamera({
        x: parseFloat(data.settings.camera.x),
        y: parseFloat(data.settings.camera.y),
        z: parseFloat(data.settings.camera.z)
      },
      false, false, true, false);
  }

  data.graph.persons.forEach(p => { nodeCenterY += p.y; });
  nodeCenterY /= data.graph.persons.length;

  logAddPerson = addLogItems ? settings.debug.addPerson : false;
  let persons = data.graph.persons;
  data.graph.persons = [];
  persons.forEach(p =>
  {
    addPerson(p, true, false, true, false);
    if (logAddPerson) {
      --logAddPerson;
      if (!logAddPerson) {
        console.log('...');
      }
    }
  });
  logAddPerson = true;

  logAddConnection = addLogItems ? settings.debug.addConnection : false;
  let connections = data.graph.connections;
  data.graph.connections = [];
  connections.forEach(c =>
  {
    addConnection(c, true, false, true, false);
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
      let logItemRestorable =
        currentUserIsEditing &&
        (permissions.LOG_RESET_ALL ||
        (permissions.LOG_RESET_OWN && data.log[0][2] === currentUser));
      logAddLogItem = settings.debug.addLogItem;
      let i = 0;
      let addLog = (continueAdding = true) => {
        let j = Math.min(i + settings.loadLogItemsPerSecond, data.log.length);
        for (; i < j; ++i) {
          let l = data.log[i];
          addLogItem(l, false, logItemRestorable);
          logItemRestorable = logItemRestorable &&
            (permissions.LOG_RESET_ALL ||
            (permissions.LOG_RESET_OWN && l[2] === currentUser));
          if (logAddLogItem) --logAddLogItem;
        }
        if (continueAdding && i < data.log.length) {
          setTimeout(addLog, 1000);
        }
        else {
          logAddLogItem = true;
        }
      };
      addLog(false);
      addOneTimeEventListener(document.querySelector('#log .box-restore'), 'click', addLog);
    }
  }
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

if (permissions.ADMIN) {
  document.getElementById('log-extended').addEventListener('change', () =>
  {
    xhRequest({ action: 'toggle-extended-log' }, () => window.location.reload());
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
    if (logPreviewActive || !currentUserCanEdit()) {
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

function splitServerResponse(responseStr)
{
  return responseStr.split(' ;;; ');
}

function addLogItemFromServerResponse(responseStr)
{
  let response = splitServerResponse(responseStr);
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
let doNotUpdateCamera = false;
function cameraMoved(e)
{
  if (doNotUpdateCamera) {
    return;
  }
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
  let recurseUp = p =>
  {
    // console.log('p ' + p.t);
    activeState.addNodes(p.t);
    activeState.addNodes(p._doppelgangers.map(pd => pd.t));
    p._parents.forEach(pp =>
    {
      activeState.addEdges(pp.c.t);
      if ('pc' in pp) {
        activeState.addEdges(pp.pc.t);
      }
      setTimeout(() => recurseUp(pp.p), settings.selectDirectRelativesDelay);
    });
  };
  let recurseDown = p =>
  {
    // console.log('p ' + p.t);
    activeState.addNodes(p.t);
    activeState.addNodes(p._doppelgangers.map(pd => pd.t));
    p._children.forEach(pc =>
    {
      activeState.addEdges(pc.c.t);
      if ('pc' in pc) {
        activeState.addEdges(pc.pc.t);
      }
      setTimeout(() => recurseDown(pc.p), settings.selectDirectRelativesDelay);
    });
  };
  deselectAll();
  recurseUp(e.data.node._my.p);
  // console.log('---');
  recurseDown(e.data.node._my.p);
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

function showPersonInfo(n)
{
  let fn = () =>
  {
    console.log(['showPersonInfo', n]);
    let n_p = null;
    let t = typeof n;
    switch (t) {
      case 'object':
        n_p = n._my.p;
        break;
      case 'string':
      case 'number':
        n_p = getDataPerson(n);
        break;
    }
    if (n_p === null) {
      console.error('person not found');
      return;
    }
    let p = n_p._;
    let url = document.createElement('a');
    url.innerHTML = '&#x1F517;';
    url.href = serverURL + (serverURL.endsWith('/') ? '?' : '&') + 'show=' + n_p.t;
    personMenuPersonURL.innerHTML = '';
    personMenuPersonURL.appendChild(url);
    if (navigator.canShare) {
      url.addEventListener('click', e => {
        e.preventDefault();
        let shareText = [p.get_rufName(), p.get_lastNames()].filter(Boolean).join(' ') + ' - ' + document.title;
        navigator.share({
          title: shareText,
          text: shareText,
          url: url.href
        });
      });
    }
    personMenuFirstName.value = p.f;
    personMenuLastName.value = p.l;
    personMenuBirthName.value = p.m;
    let pb = splitDate(p.b);
    personMenuBirthDay.value = pb[2];
    personMenuBirthMonth.value = pb[1];
    personMenuBirthYear.value = pb[0];
    updateDateValue(personMenuBirthDay, personMenuBirthMonth, personMenuBirthYear);
    let pd = splitDate(p.d);
    personMenuDeathDay.value = pd[2];
    personMenuDeathMonth.value = pd[1];
    personMenuDeathYear.value = pd[0];
    updateDateValue(personMenuDeathDay, personMenuDeathMonth, personMenuDeathYear);
    personMenuNote.value = p.o;
    personMenuDelete.classList.toggle('hidden', !currentUserCanEdit() || !permissions.DELETE_PERSONS || getDataPersonConnections(t).length > 0)
    if (currentUserCanEdit() && permissions.EDIT_PERSONS) {
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

    callbacks.showPersonInfo.call(p);

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
  if (currentUserCanEdit() && permissions.CREATE_PERSONS) {
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
  if (currentUserCanEdit() && permissions.EDIT_PERSONS) {
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
  if (currentUserCanEdit() && permissions.DELETE_PERSONS) {
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
function addPerson(p_raw, toData, toServer, toGraph, refreshGraph, doneCallback = null)
{
  let p = p_raw;
  if (!(p instanceof PersonFunctions)) {
    p = convertPerson(p);
  }

  toServerDataGraph('addPerson', p_raw, {
      toServer: !toServer ? null : response =>
      {
        response = addLogItemFromServerResponse(response);
        p.t = response[0].substr(2);
      },
      toData: !toData ? null : () =>
      {
        data.graph.persons.push(p);
        p.prepare();
      },
      toGraph: !toGraph ? null : () =>
      {
        let my = { p: p };
        if (isDataPersonDoppelganger(p)) {
          my.isDoppelganger = true;
        }
        else if (p.t !== PERSON_PREVIEW) {
          my.isPerson = true;
        }
        s.graph.addNode({
            _my: my,
            id: p.t,
            x: p.x,
            y: p.y,
            label: getPersonPreviewDisplayString(p),
            size: settings.nodeSize,
            color: p.get_nodeColor(),
            labelAlignment: (p.y < nodeCenterY) ? 'top' : 'bottom' });
        p._graphNode = s.graph.nodes(p.t);

        if (my.isDoppelganger) {
          let d_id = '*' + p.t + '-doppelganger-' + p._.t;
          s.graph.addEdge({
            _my: {
              isDoppelgangerConnection: true,
              p: p
            },
            id: d_id,
            source: p.t,
            target: p._.t,
            label: 'Doppelganger',
            size: settings.edgeSize,
            type: getConnectionRelationSettings('Doppelganger').lineType,
            color: settings.edgeColorDoppelganger });
          p._graphEdge = s.graph.edges(d_id);
        }
      },
      refreshGraph: refreshGraph,
      doneCallback: doneCallback
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
        let dataP = getDataPerson(p.t);
        for (let attr in p) {
          dataP[attr] = p[attr];
        }
        return dataP;
      },
      toGraph: !toGraph ? null : (p) =>
      {
        let n = s.graph.nodes(p.t);
        n.label = p.get_shortDisplayString();
        n.color = p.get_nodeColor();
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
  if (currentUserCanEdit() && permissions.EDIT_PERSONS) {
    console.log('click person-form-doppelganger-add');
    hideForm(personMenuForm);
    let personPreview = s.graph.nodes(PERSON_PREVIEW);
    let x = personPreview.x;
    let y = personPreview.y;
    deletePerson(PERSON_PREVIEW, false, false, true, false);
    addPerson({
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
  if (isChildConnectionNodeId(c.source)) {
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

function showConnectionInfo(e)
{
  let fn = () =>
  {
    console.log(['showConnectionInfo', e]);
    let c = null;
    let t = typeof e;
    switch (t) {
      case 'object':
        c = e._my.c;
        break;
      case 'string':
      case 'number':
        c = getDataConnection(e);
        break;
    }
    if (c === null) {
      console.error('connection not found');
      return;
    }
    if (c === undefined) {
      console.log('no info available for this connection');
      return;
    }
    let p1_n = '';
    let isChildConnection = isChildConnectionNodeId(c.p1);
    if (isChildConnection) {
      p1_n = c._persons[0].get_shortDisplayString() + ' & ' + c._persons[1].get_shortDisplayString();
    }
    else {
      p1_n = c._persons[0].get_shortDisplayString();
    }
    connectionMenuPersons.innerHTML = escapeHtml(p1_n) + ' &mdash; ' + escapeHtml(c._persons[c._persons.length - 1].get_shortDisplayString());
    connectionMenuRelation.value = c.r;
    connectionMenuDesc.value = c.d;
    connectionMenuDelete.classList.toggle('hidden', !currentUserCanEdit() || !permissions.DELETE_CONNECTIONS || c._children.length > 0);
    if (currentUserCanEdit() && permissions.EDIT_CONNECTIONS) {
      connectionMenuEdit.classList.remove('hidden');
      connectionMenuRelation.disabled = false;
      connectionMenuDesc.disabled = false;
    }
    else {
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
  if (currentUserCanEdit() && permissions.CREATE_CONNECTIONS) {
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
  if (currentUserCanEdit() && permissions.CREATE_CONNECTIONS) {
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
  if (currentUserCanEdit() && permissions.EDIT_CONNECTIONS) {
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
  if (currentUserCanEdit() && permissions.DELETE_CONNECTIONS) {
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
function addConnection(c_raw, toData, toServer, toGraph, refreshGraph, doneCallback = null)
{
  let c = c_raw;
  if (!(c instanceof Connection)) {
    c = convertConnection(c);
  }

  let isChildConnection = isChildConnectionNodeId(c.p1);
  if (toGraph && isChildConnection) {
    if (!s.graph.nodes(c.p1)) {
      let p1 = getParentTsFromChildConnectionNode(c.p1);
      let p1_1 = getDataPerson(p1[0]);
      let p1_2 = getDataPerson(p1[1]);
      let p12 = getChildConnectionNodePosition(p1_1, p1_2);
      s.graph.addNode({
          _my: {
            isChildConnectionNode: true,
            c: []
          },
          id: c.p1,
          x: p12.x,
          y: p12.y,
          size: .1,
          color: settings.edgeColor});
    }
  }

  toServerDataGraph('addConnection', c_raw, {
      toServer: !toServer ? null : response =>
      {
        response = addLogItemFromServerResponse(response);
        c.t = response[0].substr(2);
      },
      toData: !toData ? null : () =>
      {
        data.graph.connections.push(c);
        c.prepare();
      },
      toGraph: !toGraph ? null : () =>
      {
        let _my = { c: c };
        if (isChildConnection) {
          _my.isChildConnection = true;
          c._graphCCNode = s.graph.nodes(c.p1);
          c._graphCCNode._my.c.push(c);
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
            color: c.get_edgeColor()});
        c._graphEdge = s.graph.edges(c.t);
      },
      refreshGraph: refreshGraph,
      doneCallback: doneCallback
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
        if (old.r === c.r) {
          for (let attr in c) {
            old[attr] = c[attr];
          }
          return old;
        }
        else {
          old.reset();
          c = convertConnection(c);
          c.p1 = old.p1;
          c.p2 = old.p2;
          c.prepare();
          data.graph.connections[i] = c;
          return c;
        }
      },
      toGraph: !toGraph ? null : (c) =>
      {
        let e = s.graph.edges(c.t);
        e.label = c.r;
        e.type = getConnectionRelationSettings(c.r).lineType;
        e.color = c.get_edgeColor();
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


// extensions
// ------------------------------------
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


// sources
// ------------------------------------
let sourcesBox = document.getElementById('sources');
let sourcesList = sourcesBox.querySelector('#sources-list');
let sourceTemplateDiv = sourcesList.querySelector('#source-div-template');
let sourecsUploadingWaitDiv = sourcesBox.querySelector('#sources-uploading-wait');

callbacks.initialLoadComplete.add(() =>
{
  let tmpSources = data.sources;
  data.sources = {};
  for (const [id, source_raw] of Object.entries(tmpSources)) {
    let source = convertSource(source_raw);
    source.prepare(id);
    data.sources[id] = source;
  }

  logAddSourceItem = settings.debug.addSourceItem;
  let i = 0;
  let addSources = (continueAdding = true) => {
    let sources = Object.entries(data.sources);
    let j = Math.min(i + settings.loadSourceItemsPerSecond, sources.length);
    for (; i < j; ++i) {
      let [source_id, source] = sources[i];
      addSourceItem(source);
      if (logAddSourceItem) --logAddSourceItem;
    }
    if (continueAdding && i < sources.length) {
      setTimeout(addSources, 1000);
    }
  }

  addSources(false);
  addOneTimeEventListener(document.querySelector('#sources .box-restore'), 'click', addSources);
});

let logAddSourceItem = true;
function addSourceItem(source)
{
  console.log(logAddSourceItem ? ['addSourceItem', source] : '...');
  let btn = {};
  if (currentUserIsEditing) {
    btn['Löschen'] = {
      class: 'source-delete',
      click: e =>
      {
        if (confirm('Wirklich löschen?')) {
          toServerDataGraph('deleteSource', source._id, {
              toServer: true,
              toData: d =>
              {
                source.reset();
                delete data.sources[source._id];
                sourceDiv.remove();
              }
            });
        }
      }
    };
  }
  let sourceDiv = creatSourceDiv(source, e => showSourceDetails(source), btn);
  sourcesList.appendChild(sourceDiv);
}

function creatSourceDiv(source, img_click_callback = null, buttons = {})
{
  let sourceDiv = sourceTemplateDiv.cloneNode(true);
  sourceDiv.removeAttribute('id');
  sourceDiv.classList.remove('hidden');
  sourceDiv.classList.add('generated-source');
  sourceDiv.title = source._id;

  let img = sourceDiv.querySelector('.source-preview-img');
  img.src = sourcesPath + source._id + (('thumb' in source) ? '.thumb.jpg' : (source._ext));
  if (img_click_callback) {
    img.addEventListener('click', img_click_callback);
  }

  let description = sourceDiv.querySelector('.source-description');
  description.innerHTML = source._description;

  for (const [label, buttonData] of Object.entries(buttons)) {
    let btn = document.createElement('button');
    btn.type = 'button';
    btn.innerHTML = label;
    btn.classList.add('button-border');
    if ('class' in buttonData) {
      for (const c in buttonData.class) {
        btn.classList.add(c);
      }
    }
    if ('click' in buttonData) {
      btn.addEventListener('click', buttonData.click);
    }
    sourceDiv.appendChild(btn);
  }

  return sourceDiv;
}


// new sources
// ------------------------------------
if (currentUserIsEditing) {
  let newSourceForm = sourcesBox.querySelector('form');
  let newSourceFileInput = sourcesBox.querySelector('#upload-new-source');
  let newSourceFileInputLabel = sourcesBox.querySelector('label[for="upload-new-source"]');
  let newSourcePreviewTemplateDiv = sourcesBox.querySelector('#new-source-preview-div-template');
  let newSourceInvalidTemplateDiv = sourcesBox.querySelector('#new-source-invalid-div-template');
  let newSourcePreviewButtonsDiv = sourcesBox.querySelector('#new-source-buttons-div');
  let newSourceCancelButton = newSourcePreviewButtonsDiv.querySelector('button');
  let newSourceUploadResponse = sourcesBox.querySelector('#source-upload-response');

  newSourceFileInput.addEventListener('change', e =>
  {
    previewNewSourceFiles(newSourceFileInput.files);
  });
  sourcesBox.addEventListener('dragenter', e =>
  {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    sourcesBox.classList.add('drag-drop-area');
    newSourceFileInputLabel.classList.add('drag-drop-visual-area-active');
  });
  sourcesBox.addEventListener('dragover', e =>
  {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });
  sourcesBox.addEventListener('dragleave', e =>
  {
    e.stopPropagation();
    e.preventDefault();
    sourcesBox.classList.remove('drag-drop-area');
    newSourceFileInputLabel.classList.remove('drag-drop-visual-area-active');
  });
  sourcesBox.addEventListener('drop', e =>
  {
    e.stopPropagation();
    e.preventDefault();
    sourcesBox.classList.remove('drag-drop-area');
    newSourceFileInputLabel.classList.remove('drag-drop-visual-area-active');

    previewNewSourceFiles(e.dataTransfer.files);
  });

  let selectedFiles = [];
  let approvedFiles = [];
  function previewNewSourceFiles(files)
  {
    clearPreview(false);
    selectedFiles = files;

    for (let i = 0; i < files.length; ++i) {
      let file = files[i];
      let fileError = false;
      if (!file.type.match('image.*')) {
        fileError = file.name + ':<br />Dateityp (' + file.type + ') nicht erlaubt';
      }
      if (!file.size > maxSourceFileSize) {
        fileError = file.name + ':<br />Maximale Dateigröße (' + maxSourceFileSize + ') überschritten';
      }
      if (fileError) {
        let newSourceInvalidDiv = newSourceInvalidTemplateDiv.cloneNode(true);
        newSourceInvalidDiv.removeAttribute('id');
        newSourceInvalidDiv.classList.remove('hidden');
        newSourceInvalidDiv.classList.add('generated-preview');
        newSourceInvalidDiv.innerHTML = fileError;
        newSourceForm.insertBefore(newSourceInvalidDiv, newSourcePreviewTemplateDiv);
        continue;
      }
      console.log(file);
      approvedFiles.push(i);

      let newSourcePreviewDiv = newSourcePreviewTemplateDiv.cloneNode(true);
      newSourcePreviewDiv.removeAttribute('id');
      newSourcePreviewDiv.classList.remove('hidden');
      newSourcePreviewDiv.classList.add('generated-preview');
      newSourceForm.insertBefore(newSourcePreviewDiv, newSourcePreviewTemplateDiv);

      let newSourcePreviewImg = newSourcePreviewDiv.querySelector('.new-source-preview-img');
      newSourcePreviewImg.src = URL.createObjectURL(file);

      let newSourceDescription = newSourcePreviewDiv.querySelector('.new-source-description');
      newSourceDescription.value = file.name.substr(0, file.name.lastIndexOf('.'));

      let newSourceSize = newSourcePreviewDiv.querySelector('.new-source-size');
      newSourceSize.innerHTML = filesizeStr(file.size);
    }
    if (approvedFiles.length) {
      newSourcePreviewButtonsDiv.classList.remove('hidden');
    }
    else {
      alert('Nur Bilddateien können als Quellen hinzugefügt werden.');
    }
  }

  newSourceForm.addEventListener('submit', e =>
  {
    e.preventDefault();
    let descriptionInputs = newSourceForm.querySelectorAll('.new-source-description');
    let formData = new FormData();
    for (let i = 0; i < approvedFiles.length; ++i) {
      let fi = approvedFiles[i];
      formData.append('files[]', selectedFiles[fi]);
      formData.append('descriptions[]', descriptionInputs[i].value);
    }
    clearPreview(true);
    sourecsUploadingWaitDiv.classList.remove('hidden');
    xhRequestPost({ action: 'uploadSourceFiles' }, formData, responseText =>
    {
      sourecsUploadingWaitDiv.classList.add('hidden');
      if (responseText.length) {
        let response = splitServerResponse(responseText);
        response[1] = JSON.parse(response[1]);
        for (const [id, source_raw] of Object.entries(response[1].new_sources)) {
          let source = convertSource(source_raw);
          source.prepare(id);
          data.sources[id] = source;
          addSourceItem(source);
        }
        for (error of response[1].errors) {
          let li = document.createElement('li');
          li.innerHTML = error;
          newSourceUploadResponse.appendChild(li);
        }
      }
    }, true);
  });

  newSourceCancelButton.addEventListener('click', e =>
  {
    clearPreview(true);
  });

  function clearPreview(resetForm)
  {
    if (resetForm) {
      newSourceForm.reset();
    }
    selectedFiles = [];
    approvedFiles = [];
    newSourceForm.querySelectorAll('.generated-preview').forEach(gp => gp.remove());
    newSourcePreviewButtonsDiv.classList.add('hidden');

    while (newSourceUploadResponse.firstChild) {
      newSourceUploadResponse.removeChild(newSourceUploadResponse.lastChild);
    }
  }
}



// other
// ------------------------------------
function getPersonAndDoppelgangers(n)
{
  let ds = n._my.p._._doppelgangers.slice(0);
  ds.push(n._my.p._);
  return ds;
}


// events
// ------------------------------------

if (!currentUserCanEdit()) {
  dragListener.disable();
}

let tmpActiveNodes = [];
activeState.bind('activeNodes', e =>
{
  let activeNodes = activeState.nodes();
  let addedNodes = diff(activeNodes, tmpActiveNodes);
  let droppedNodes = diff(tmpActiveNodes, activeNodes);
  tmpActiveNodes = activeNodes;
  droppedNodes.forEach(n =>
  {
    getPersonAndDoppelgangers(n).forEach(d =>
    {
      delete d._graphNode.outer_border_size;
      if ('_graphEdge' in d) {
        d._graphEdge.color = settings.edgeColorDoppelganger;
      }
    });
  });
  addedNodes.forEach(n =>
  {
    getPersonAndDoppelgangers(n).forEach(d =>
    {
      d._graphNode.outer_border_size = settings.nodeBorderSizeDoppelganger;
      if ('_graphEdge' in d) {
        d._graphEdge.color = settings.edgeColorDoppelgangerHover;
      }
    });
  });
  s.refresh();
});

function bindDefaultViewerEvents()
{
  let cdcNode = clickDoubleClick(
  e =>
  {
    let n = e.data.node;
    deselectAll(null, false, [n.id]);
    if (isPersonNode(n) || isDoppelgangerNode(n)) {
      activeState.addNodes(n.id);
      s.refresh();
      showPersonInfo(n);
    }
  },
  e =>
  {
    let n = e.data.node;
    if (!isPersonNode(n) && !isDoppelgangerNode(n)) {
      return;
    }
    if (!currentLayoutId) {
      selectDirectRelatives(e);
    }
    else {
      deselectAll();
      layouts[currentLayoutId].apply(n.id);
    }
  });
  s.bind('clickNode', cdcNode.click.bind(cdcNode));
  s.bind('doubleClickNode', cdcNode.doubleClick.bind(cdcNode));

  s.bind('clickEdge', e =>
  {
    let ed = e.data.edge;
    if (isDoppelgangerConnectionEdge(ed)) {
      return;
    }
    deselectAll(null, false, [ed.id]);
    if (isExtensionEdge(e.data.edge)) {
      layouts[currentLayoutId].apply(ed.source);
      // s.refresh();
      return;
    }
    if (isPersonConnectionEdge(ed) || isChildConnectionEdge(ed)) {
      activeState.addEdges(ed.id);
      s.refresh();
      showConnectionInfo(ed);
    }
  });

  s.bind('clickStage', () =>
  {
    if (startedWith_coordinatesUpdated) {
      startedWith_coordinatesUpdated = false;
    }
    else {
      deselectAll(null);
    }
  });

  s.bind('coordinatesUpdated', e =>
  {
    clearTimeout(startedWith_coordinatesUpdated);
    startedWith_coordinatesUpdated = setTimeout(() => { startedWith_coordinatesUpdated = false; }, 1000);

    s.camera.angle = 0;
    cameraMoved(e);
  });

  let startedWith_coordinatesUpdated = false;
}


let searchInput = document.querySelector('#search-input');
searchInput.addEventListener('input', e =>
{
  let search = searchInput.value;
  activeState.dropNodes();
  activeState.dropEdges();
  if (search.trim().length > 0) {
    let s = search
      .replaceAll(/[.+?|()]/g, '\\$0')
      .replaceAll('*', '.+')
      .split(' ')
      .map(v => '(?=.*' + v + ')')
      .join('');
    let searchRE = new RegExp('^' + s + '.*$', 'i');
    activeState.addNodes(data.graph.persons.filter(p => p.get_allTextData().join('').match(searchRE)).map(p => p.t));
  }
});


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


let settings_changePassword = document.querySelector('#settings-change-password');
settings_changePassword.addEventListener('click', e =>
{
  let pw1 = document.querySelector('#settings-change-password1');
  let pw2 = document.querySelector('#settings-change-password2');
  let pwInfo = document.querySelector('#settings-change-password-info');
  if (pw1.value !== pw2.value) {
    pwInfo.innerHTML = 'Die Passwörter stimmen nicht überein.';
  }
  else {
    let fd = new FormData();
    fd.append('password', pw1.value);
    xhRequestPost({ action: 'change-password' }, fd, response =>
    {
      if (response === 'true') {
        pwInfo.innerHTML = 'Passwort gespeichert.';
      }
      else {
        pwInfo.innerHTML = 'Fehler: Passwort nicht gespeichert.';
      }
    });
  }
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
  callbacks.initialLoadComplete.add(() => layouts[currentLayoutId].apply(selectionFromURL));
}
let fromURL = showFromURL || selectionFromURL;
if (fromURL) {
  callbacks.initialLoadComplete.add(() =>
  {
    let p = getDataPerson(fromURL);
    if (p) {
      activeState.addNodes(fromURL);
      if (!currentUserCanEdit()) {
        s.camera.goTo({
            x: p._graphNode.x,
            y: p._graphNode.y });
      }
      s.refresh();
      if (showFromURL === fromURL) {
        showPersonInfo(p._graphNode);
      }
    }
    else {
      let c = getDataConnection(fromURL);
      if (c) {
        activeState.addEdges(fromURL);
        s.refresh();
        if (showFromURL === fromURL) {
          showConnectionInfo(c._graphEdge);
        }
      }
    }
  });
}

setTimeout(s.refresh.bind(s), 1000);
