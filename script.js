const settings = {
  nodeSize: 5,
  nodeColor: '#78D384',
  nodeColorWarning: '#D0D480',
  nodeColorHighlight: '#3BAA49',

  edgeSize: .25,
  edgeColor: '#DDD',
  edgeColorWarning: '#E6AD92',
  edgeColorHighlight: '#000',

  gridStep: 20,
  saveCameraTimeout: 5000,
  checkOtherEditorInterval: 10000,

  relations: {
    _default: { lineType: 'line', level: null },
    Kind: { lineType: 'arrow', level: 'v' },
    adoptiert: { lineType: 'arrow', level: 'v' },
    verheiratet: { lineType: 'dashed', level: 'h' },
    geschieden: { lineType: 'dotted', level: 'h' },
    verwitwet: { lineType: 'dotted', level: 'h' } }
};

let s = new sigma({
  renderers: [{
    container: document.getElementById('graph'),
    type: 'canvas'
  }],
  settings: {
    doubleClickEnabled: false,
    rescaleIgnoreSize: true,

    font: '"Josefin Sans", "Trebuchet MS", sans-serif',
    fontStyle: '',
    activeFontStyle: 'bold',

    zoomingRatio: 1.2,
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
    labelSizeRatio: 1.5,
    labelThreshold: 5,

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
    edgeLabelHoverShadowColor: '#ddd'
  }
});

let activeState = sigma.plugins.activeState(s);
let dragListener = sigma.plugins.dragNodes(s, s.renderers[0], activeState);
if (currentUserIsViewer) {
  dragListener.disable();
}

const bounds = {
  minX: -500,
  minY: -500,
  maxX: 500,
  maxY: 500,
  sizeMax: 5,
  weightMax: 1};
s.settings('bounds', bounds);

let data = {
  settings: { camera: { x: 0, y: 0, z: 0 }},
  graph: { persons: [], connections: [] },
  log: [],
  currentHash: '' };

function currentUserCanEdit()
{
  return !currentUserIsViewer && !logPreviewActive;
}

let startEdit = document.getElementById('start-edit');
if (startEdit) {
  setInterval(() =>
  {
    console.log('check other editor');
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function()
    {
      if (this.readyState === 4 && this.status === 200) {
        if (this.responseText) {
          startEdit.classList.add('hidden');
          startEdit.nextElementSibling.innerHTML = '(' + this.responseText + ' bearbeitet gerade)';
          startEdit.nextElementSibling.classList.remove('hidden');
        }
        else {
          startEdit.nextElementSibling.classList.add('hidden');
          startEdit.classList.remove('hidden');
        }
      }
    };
    xhttp.open('GET', '?action=get-editor', true);
    xhttp.send();
  }, settings.checkOtherEditorInterval);
}

let stopEditTimer = document.getElementById('stop-edit-timer');
if (stopEditTimer && editingTimeout) {
  setInterval(() =>
  {
    if (!--editingTimeout) {
      window.location.reload();
    }
    stopEditTimer.innerHTML = ' (' + ((editingTimeout >= 60) ? Math.floor(editingTimeout / 60) + 'm' : ((editingTimeout % 60) + 's')) + ')';
  }, 1000);
}


function getDataPerson(t)
{
  let person = null;
  data.graph.persons.forEach(d => { if (d.t == t) person = d; });
  return person;
}
function getDataPersonIndex(t)
{
  return data.graph.persons.findIndex(d => d.t == t);
}
function getDataConnection(t)
{
  let connection = null;
  data.graph.connections.forEach(d => { if (d.t == t) connection = d; });
  return connection;
}
function getDataConnectionIndex(t)
{
  return data.graph.connections.findIndex(d => d.t == t);
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

function checkPersonsConnected(p1_t, p2_t)
{
  return data.graph.connections.some(c =>
    (compareTs(c.p1, p1_t) && compareTs(c.p2, p2_t)) ||
    (compareTs(c.p1, p2_t) && compareTs(c.p2, p1_t)));
}

function getGraphPositionFromEvent(e)
{
  let r = e.data.renderer;
  let c = s.camera;
  let factor = Math.max((bounds.maxX - bounds.minX) / r.width, (bounds.maxY - bounds.minY) / r.height);
  return {
    x: c.x * factor + e.data.captor.x * factor * c.ratio,
    y: c.y * factor + e.data.captor.y * factor * c.ratio
  };
}

function getPersonRufname(d_n)
{
  let n = d_n.match(/[*]\s*([^ ,?]+)(,|\s|$)/);
  if (!n) {
    n = d_n.match(/^([^ ,?]+)(,|\s|$)/);
  }
  return n ? n[1] : '';
}

function getPersonDisplayFullName(d_n)
{
  return d_n.replaceAll(/[,*?]/g, '').replaceAll(/  +/g, ' ');
}

function getNodeColorFromPerson(p)
{
  return [p.n, p.o].some(v => v.includes('???')) ? settings.nodeColorWarning : '';
}

function getEdgeColorFromConnection(c)
{
  return c.d.includes('???') ? settings.edgeColorWarning : '';
}

function getConnectionRelationSettings(r)
{
  if (r in settings.relations) {
    return settings.relations[r];
  }
  return settings.relations._default;
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
  return (typeof p_t == 'string') && p_t.includes('-');
}
function getDataChildConnections(c)
{
  return getDataPersonConnections(createChildConnectionNodeId(c.p1, c.p2));
}
function getParentsFromChildConnectionNode(t)
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
          let ps = getParentsFromChildConnectionNode(p_t);
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
function applyLoadedData(loadedData, addLogItems)
{
  data = loadedData;
  console.log(data);
  moveCamera({
      x: parseFloat(data.settings.camera.x),
      y: parseFloat(data.settings.camera.y),
      z: parseFloat(data.settings.camera.z)
    },
    false, false, true, false);
  logAddPerson = 3;
  data.graph.persons.forEach(p => { addPerson(p, false, false, true, false); if (logAddPerson) --logAddPerson; });
  logAddPerson = true;
  logAddConnection = 3;
  data.graph.connections.forEach(c => { addConnection(c, false, false, true, false); if (logAddConnection) --logAddConnection; });
  logAddConnection = true;
  s.refresh();

  if (addLogItems) {
    if (data.log.length > 0) {
      let logItemRestorable = !currentUserIsViewer && (data.log[0][2] === currentUser || currentUserIsAdmin);
      logAddLogItem = 3;
      let i = 0;
      let addLog = () => {
        let j = Math.min(i + 10, data.log.length);
        for (; i < j; ++i) {
          let l = data.log[i];
          let li = addLogItem(l, false, logItemRestorable);
          logItemRestorable = logItemRestorable && (!currentUserIsViewer && (l[2] === currentUser || currentUserIsAdmin));
          if (l[0] === data.currentHash) {
            li.classList.add('selected');
          }
          if (logAddLogItem) --logAddLogItem;
        }
        if (i < data.log.length - 1) {
          setTimeout(addLog, 1000);
        }
        else {
          logAddLogItem = true;
        }
      };
      addLog();
    }
  }
}
let dataCache = {};
function loadData(previewHash = null)
{
  activeState.dropNodes();
  activeState.dropEdges();
  s.graph.clear();

  if (previewHash in dataCache) {
    console.log('load cached data ' + previewHash);
    applyLoadedData(dataCache[previewHash], previewHash === null);
    return;
  }

  console.log('load data from server ' + previewHash);
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function()
  {
    if (this.readyState === 4 && this.status === 200) {
      let d = JSON.parse(this.responseText);
      applyLoadedData(d, previewHash === null);
      dataCache[previewHash ? previewHash : data.currentHash] = d;
    }
  };
  if (!previewHash) {
    xhttp.open('GET', '?action=init', true);
  }
  else {
    xhttp.open('GET', '?action=preview&hash=' + previewHash, true);
  }
  xhttp.send();
}
loadData();


// log history
// ------------------------------------
let logListUL = document.getElementById('log-list');
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

let logAddLogItem = true;
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
    logListUL.childNodes.forEach(li =>
    {
      li.classList.remove('selected');
    });
    li.classList.add('selected');
    logListUL.prepend(li);
  }
  else {
    logListUL.appendChild(li);
  }
  li.innerHTML = logAuthor + '<span>' + new Date(logDate).toLocaleString() + '</span>';
  li.title = logMsg;
  li.classList.add('button');
  let logPC = '';
  let logTs = [];
  if (logM.length === 2) {
    logPC = logM[1].substr(0, 2);
    if (['p ', 'c '].includes(logPC)) {
      logTs = logM[1].substr(2).split(', ');
    }
    else {
      logPC = '';
    }
  }
  li.setAttribute('data-log-pc', logPC);
  li.setAttribute('data-log-ts', logTs.join(','));
  li.addEventListener('mouseenter', e =>
  {
    console.log('enter li');
    if (li.classList.contains('selected')) {
      console.log('cancel peview - already selected');
      return;
    }
    let previewLogPC = logPC;
    let previewLogTs = logTs;
    let prevLi = li;
    while ((prevLi = prevLi.previousElementSibling) != null) {
      if (prevLi.classList.contains('selected')) {
        prevLi = li.previousElementSibling;
        previewLogPC = prevLi.getAttribute('data-log-pc');
        previewLogTs = prevLi.getAttribute('data-log-ts').split(',');
        break;
      }
    }
    console.log([previewLogPC, previewLogTs]);
    if (previewLogPC !== '') {
      if (previewLogPC === 'p ') {
        let existingNodeIDs = s.graph.nodes(previewLogTs).filter(n => n !== undefined).map(n => n.id);
        activeState.addNodes(existingNodeIDs);
      }
      else if (previewLogPC === 'c ') {
        let existingEdgeIDs = s.graph.edges(previewLogTs).filter(e => e !== undefined).map(e => e.id);
        activeState.addEdges(existingEdgeIDs);
      }
      s.refresh();
    }
  });
  li.addEventListener('mouseleave', e =>
  {
    console.log('leave li');
    activeState.dropNodes();
    activeState.dropEdges();
    s.refresh();
  });
  li.addEventListener('click', e =>
  {
    if (li.classList.contains('selected')) {
      return;
    }
    console.log('log click');
    logListUL.childNodes.forEach(li =>
    {
      li.classList.remove('selected');
    });
    li.classList.add('selected');
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

function addLogItemFromServerResponse(responseStr)
{
  response = responseStr.split(' ;; ');
  addLogItem(JSON.parse(response[1]), true, true);
  return response;
}


// move camera
// ------------------------------------
let saveCameraTimeout = null;
function cameraMoved(e)
{
  if (saveCameraTimeout) {
    clearTimeout(saveCameraTimeout);
  }
  saveCameraTimeout = setTimeout(() =>
  {
    saveCameraTimeout = null;
    moveCamera({
        x: s.renderers[0].camera.x,
        y: s.renderers[0].camera.y,
        z: s.renderers[0].camera.ratio
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
        s.renderers[0].camera.x = xyz.x;
        s.renderers[0].camera.y = xyz.y;
        s.renderers[0].camera.ratio = xyz.z; },
      refreshGraph: refreshGraph
    });
}


// select
// ------------------------------------
function deselectAll(e, refreshGraph = true, except = [])
{
  deselectPersons(e, false, except);
  deselectConnections(e, false, except);
  if (refreshGraph) {
    s.refresh();
  }
}


// select persons
// ------------------------------------
function selectPerson(e, refreshGraph = true)
{
  if (isChildConnectionNode(e.data.node.id)) {
    return;
  }

  let multipleKey = multipleKeyPressed(e);
  if (!multipleKey) {
    deselectAll(e, false);
    console.log(['selectPerson', e]);
  }
  else {
    if (activeState.nodes().length > 0 || activeState.edges().length > 1) {
      deselectConnections(null, false)
    }
    console.log(['selectPersonMultiple', e]);
  }
  let n = e.data.node;

  if (activeState.nodes().some(sn => sn.id === n.id)) {
    activeState.dropNodes(n.id);
  }
  else {
    activeState.addNodes(n.id);
  }
  if (refreshGraph) {
    s.refresh();
  }

  let nodes = activeState.nodes();
  if (nodes.length === 1) {
    if (!multipleKey) {
      showPersonInfo(nodes[0].id);
    }
    else if (currentUserCanEdit()) {
      let edges = activeState.edges();
      if (edges.length === 1) {
        let c = edges[0];
        let p = nodes[0];
        if (checkPersonsConnected(c.source, p.id) || checkPersonsConnected(c.target, p.id)) {
          console.log('already connected');
          return;
        }
        startNewChildConnection();
      }
    }
  }
  else if (nodes.length === 2 && currentUserCanEdit()) {
    if (!activeState.edges().length) {
      let p1 = nodes[0];
      let p2 = nodes[1];
      if (p1.id == p2.id) {
        console.log('no connection possible - 2 different persons must be selected');
        return;
      }
      if (checkPersonsConnected(p1.id, p2.id)) {
        console.log('no connection possible - persons already connected');
        return;
      }
      startNewConnection();
    }
  }
}

function deselectPersons(e, refreshGraph = true, except = [])
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

function selectOnePerson(e, refreshGraph = true)
{
  console.log(['selectOnePerson', e]);
  deselectAll(e, false);
  activeState.addNodes(e.data.node.id);
  if (refreshGraph) {
    s.refresh();
  }
}

function selectDirectRelatives(e)
{
  let recurseUp = p_t =>
  {
    console.log('p ' + p_t);
    activeState.addNodes(p_t);
    getDataPersonConnections(p_t).forEach(c =>
    {
      console.log('c ' + c.r);
      if (c.p2 == p_t && getConnectionRelationSettings(c.r).level === 'v') {
        activeState.addEdges(c.t);
        if (isChildConnectionNode(c.p1)) {
          getParentsFromChildConnectionNode(c.p1).forEach(recurseUp);
        }
        else {
          recurseUp(c.p1);
        }
      }
      else {
        console.log('-');
      }
    });
  };
  let recurseDown = p_t =>
  {
    console.log('p ' + p_t);
    activeState.addNodes(p_t);
    getDataPersonConnections(p_t).forEach(c =>
    {
      console.log('c ' + c.r);
      if (compareTs(c.p1, p_t) && getConnectionRelationSettings(c.r).level === 'v') {
        activeState.addEdges(c.t);
        recurseDown(c.p2);
      }
      else {
        console.log('-');
      }
    });
  };
  deselectAll();
  recurseUp(e.data.node.id);
  console.log('---');
  recurseDown(e.data.node.id);
  s.refresh();
}


// select connections
// ------------------------------------
function selectConnection(e, refreshGraph = true)
{
  deselectAll(e, false);
  console.log(['selectConnection', e]);
  let c = e.data.edge;
  activeState.addEdges(c.id);
  if (refreshGraph) {
    s.refresh();
  }

  if (!multipleKeyPressed(e)) {
    showConnectionInfo(c.id);
  }
}

function deselectConnections(e, refreshGraph = true, except = [])
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
let personMenuName = document.getElementById('person-form-name');
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

let newPersonPosition = null;
function startNewPerson(e)
{
  console.log('startNewPerson');
  newPersonPosition = getGraphPositionFromEvent(e);
  alignToGrid(newPersonPosition);
  personMenuName.value = '';
  personMenuBirthDay.value = '';
  personMenuBirthMonth.value = '';
  personMenuBirthYear.value = '';
  updateDateValue(personMenuBirthDay, personMenuBirthMonth, personMenuBirthYear);
  personMenuDeathDay.value = '';
  personMenuDeathMonth.value = '';
  personMenuDeathYear.value = '';
  updateDateValue(personMenuDeathDay, personMenuDeathMonth, personMenuDeathYear);
  personMenuNote.value = '';
  showForm(personMenuForm, 'opt-new');
}

function showPersonInfo(t)
{
  console.log(['showPersonInfo', t]);
  let p = getDataPerson(t);
  let db = p.b.split('-');
  personMenuName.value = p.n;
  personMenuBirthDay.value = db[2];
  personMenuBirthMonth.value = db[1];
  personMenuBirthYear.value = db[0];
  updateDateValue(personMenuBirthDay, personMenuBirthMonth, personMenuBirthYear);
  let dd = p.d.split('-');
  personMenuDeathDay.value = dd[2];
  personMenuDeathMonth.value = dd[1];
  personMenuDeathYear.value = dd[0];
  updateDateValue(personMenuDeathDay, personMenuDeathMonth, personMenuDeathYear);
  personMenuNote.value = p.o;
  if (currentUserCanEdit()) {
    personMenuDelete.classList.toggle('hidden', getDataPersonConnections(t).length > 0)
    personMenuEdit.classList.remove('hidden');
    personMenuName.disabled = false;
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
    personMenuName.disabled = true;
    personMenuBirthDay.disabled = true;
    personMenuBirthMonth.disabled = true;
    personMenuBirthYear.disabled = true;
    personMenuDeathDay.disabled = true;
    personMenuDeathMonth.disabled = true;
    personMenuDeathYear.disabled = true;
    personMenuNote.disabled = true;
  }
  showForm(personMenuForm, 'opt-edit');
}

personMenuAdd.addEventListener('click', e =>
{
  if (currentUserCanEdit()) {
    console.log('click person-form-add');
    hideForm(personMenuForm);
    addPerson({
        x: newPersonPosition.x,
        y: newPersonPosition.y,
        n: personMenuName.value.trim(),
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
        n: personMenuName.value.trim(),
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
  hideForm(personMenuForm);
});

approveDeleteOrCancelKeys(
  [ personMenuName, personMenuBirthDay, personMenuBirthMonth, personMenuBirthYear, personMenuDeathDay, personMenuDeathMonth, personMenuDeathYear, personMenuNote, personMenuCancel ],
  [ personMenuAdd, personMenuEdit ],
  personMenuDelete,
  personMenuCancel);

let logAddPerson = true;
function addPerson(p, toData, toServer, toGraph, refreshGraph, doneCallback = null)
{
  toServerDataGraph('addPerson', p, {
      toServer: !toServer ? null : response =>
      {
        response = addLogItemFromServerResponse(response);
        p.t = response[0].substr(2);
      },
      toData: !toData ? null : () => data.graph.persons.push(p),
      toGraph: !toGraph ? null : () =>
      {
        s.graph.addNode({
            id: p.t,
            x: p.x,
            y: p.y,
            label: getPersonRufname(p.n),
            size: settings.nodeSize,
            color: getNodeColorFromPerson(p) });
        },
      refreshGraph: refreshGraph,
      doneCallback: doneCallback
    }, logAddPerson);
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
        n.label = getPersonRufname(p.n);
        n.color = getNodeColorFromPerson(p);
      },
      refreshGraph: refreshGraph
    });
}

function deletePerson(p_t, toData = true, toServer = true, toGraph = true, refreshGraph = true)
{
  toServerDataGraph('deletePerson', p_t, {
      toServer: !toServer ? null : addLogItemFromServerResponse,
      toData: !toData ? null : () => deleteDataPerson(p_t),
      toGraph: !toGraph ? null : () => s.graph.dropNode(p_t),
      refreshGraph: refreshGraph
    });
}

function movePersons(e, toData, toServer, toGraph, refreshGraph, alignNodesToGrid, log)
{
  let nodes = activeState.nodes();
  if (!nodes.some(n => n.id === e.data.node.id)) {
    nodes = [e.data.node];
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
}

function hoverPersons(e)
{
  // console.log(e);
  e.data.enter.nodes.forEach(n => n.label = getPersonDisplayFullName(getDataPerson(n.id).n));
  e.data.leave.nodes.forEach(n => n.label = getPersonRufname(getDataPerson(n.id).n));
  s.refresh();
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
  connectionMenuPersons.innerHTML = '';
  connectionMenuRelation.value = '';
  connectionMenuDesc.value = '';
  showForm(connectionMenuForm, 'opt-new');
}

function startNewChildConnection()
{
  connectionMenuPersons.innerHTML = '';
  connectionMenuRelation.value = '';
  connectionMenuDesc.value = '';
  showForm(connectionMenuForm, 'opt-new-child');
}

function showConnectionInfo(t)
{
  console.log(['showConnectionInfo', t]);
  let c = getDataConnection(t);
  let p1_n = '';
  if (isChildConnectionNode(c.p1)) {
    let p1 = getParentsFromChildConnectionNode(c.p1);
    let p1_1 = getDataPerson(p1[0]);
    let p1_2 = getDataPerson(p1[1]);
    p1_n = getPersonRufname(p1_1.n) + ' & ' + getPersonRufname(p1_2.n);
  }
  else {
    p1_n = getPersonRufname(getDataPerson(c.p1).n);
  }
  let p2 = getDataPerson(c.p2);
  connectionMenuPersons.innerHTML = escapeHtml(p1_n) + ' &mdash; ' + escapeHtml(getPersonRufname(p2.n));
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
  showForm(connectionMenuForm, 'opt-edit');
}

connectionMenuAdd.addEventListener('click', e =>
{
  if (currentUserCanEdit()) {
    console.log('click connection-form-add');
    hideForm(connectionMenuForm);
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
  if (toGraph && isChildConnectionNode(c.p1)) {
    if (!s.graph.nodes(c.p1)) {
      let p1 = getParentsFromChildConnectionNode(c.p1);
      let p1_1 = getDataPerson(p1[0]);
      let p1_2 = getDataPerson(p1[1]);
      let p12 = getChildConnectionNodePosition(p1_1, p1_2);
      s.graph.addNode({
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
        s.graph.addEdge({
            id: c.t,
            source: c.p1,
            target: c.p2,
            label: c.r,
            size: settings.edgeSize,
            type: getConnectionRelationSettings(c.r).lineType,
            color: getEdgeColorFromConnection(c) });
      },
      refreshGraph: refreshGraph,
      doneCallback: doneCallback
    }, logAddConnection);
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
}

function deleteConnection(c_t, toData = true, toServer = true, toGraph = true, refreshGraph = true)
{
  toServerDataGraph('deleteConnection', c_t, {
      toServer: !toServer ? null : addLogItemFromServerResponse,
      toData: !toData ? null : () => deleteDataConnection(c_t),
      toGraph: !toGraph ? null : () => s.graph.dropEdge(c_t),
      refreshGraph: refreshGraph
    });
}


// events
// ------------------------------------
let skipClickNodeAfterDropOrCoordinatesUpdated = false;
let cdcNode = clickDoubleClick(
  e => { if (skipClickNodeAfterDropOrCoordinatesUpdated) { skipClickNodeAfterDropOrCoordinatesUpdated = false; return; } selectPerson(e); },
  selectDirectRelatives);

s.bind('clickNode', cdcNode.click.bind(cdcNode));
s.bind('doubleClickNode', cdcNode.doubleClick.bind(cdcNode));

s.bind('hovers', hoverPersons);

s.bind('clickEdge', selectConnection);

let cdcStage = clickDoubleClick(
  e => { if (!e.data.captor.isDragging && !multipleKeyPressed(e)) { deselectAll(e); } },
  e => { deselectAll(e); if (currentUserCanEdit()) { startNewPerson(e); } });

s.bind('clickStage', cdcStage.click.bind(cdcStage));
s.bind('doubleClickStage', cdcStage.doubleClick.bind(cdcStage));

let skipCoordinatesUpdatedAfterDrag = false
s.bind('coordinatesUpdated', e =>
{
  // console.log('coordinatesUpdated');
  if (skipCoordinatesUpdatedAfterDrag) {
    skipCoordinatesUpdatedAfterDrag = false;
    return;
  }
  skipClickNodeAfterDropOrCoordinatesUpdated = true;
  if (currentUserCanEdit()) {
    cameraMoved(e);
  }
});

dragListener.bind('drag', e =>
{
  // console.log('drag');
  if (currentUserCanEdit()) {
    movePersons(e, false, false, false, false, false, false);// move only child nodes
  }
  skipCoordinatesUpdatedAfterDrag = true;
});
dragListener.bind('drop', e =>
{
  console.log('drop');
  skipClickNodeAfterDropOrCoordinatesUpdated = true;
  if (currentUserCanEdit()) {
    movePersons(e, true, true, false, false, true, true);
  }
});


setTimeout(s.refresh.bind(s), 1000);
