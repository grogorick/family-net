const settings = {
  nodeSize: 5,
  nodeColor: '#78D384',
  nodeColorWarning: '#D0D480',
  nodeColorHighlight: '#3BAA49',

  edgeSize: .25,
  edgeColor: '#DDD',
  edgeColorWarning: '#E6BDB2',
  edgeColorHighlight: '#AAA',

  gridStep: 20,
  saveCameraTimeout: 5000,

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


    // connection
    edgeColor: 'default',
    defaultEdgeColor: settings.edgeColor,
    minEdgeSize: 0.1,
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

const bounds = {
  minX: -500,
  minY: -500,
  maxX: 500,
  maxY: 500,
  sizeMax: 5,
  weightMax: 1};
s.settings('bounds', bounds);

let data = { settings: { camera: { x: 0, y: 0, z: 0 }}, graph: { persons: [], connections: [] }};

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
        if (isChildConnectionNode(p_t)) {
          if (alreadyDone.includes(p_t)) {
            // console.log('child ' + childConnectionNodeId + ' already moved');
            return;
          }
          alreadyDone.push(p_t);
          let childConnectionNode = s.graph.nodes(p_t);
          let ps = getParentsFromChildConnectionNode(p_t);
          let n2 = getDataPerson((ps[0] == n1.id) ? ps[1] : ps[0]);
          let newPos = getChildConnectionNodePosition(n1, n2);
          childConnectionNode.x = newPos.x;
          childConnectionNode.y = newPos.y;
        }
      });
    });
  });
}

let modalBlocker = document.getElementById('modal-blocker');
function showForm(f, opt = null)
{
  modalBlocker.style.display = 'block';

  f.classList.remove('opt-new');
  f.classList.remove('opt-new-child');
  f.classList.remove('opt-edit');
  if (opt) {
    f.classList.add(opt);
  }

  f.classList.add('box-visible');
  let firstInput = f.querySelector('input, textarea');
  if (firstInput) {
    firstInput.focus();
  }
}
function hideForm(f)
{
  f.classList.remove('box-visible');
  modalBlocker.style.display = 'none';
}

modalBlocker.addEventListener('click', e =>
{
  document.querySelector('.box-visible button[id$="cancel"]').click();
});


// load from file
// ------------------------------------
console.log('load data');
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function()
{
  if (this.readyState === 4 && this.status === 200) {
    data = JSON.parse(this.responseText);
    console.log(data);
    moveCamera({
        x: parseFloat(data.settings.camera.x),
        y: parseFloat(data.settings.camera.y),
        z: parseFloat(data.settings.camera.z)
      },
      false, false, true, false);
    logAddPerson = 3;
    logAddConnection = 3;
    data.graph.persons.forEach(d => { addPerson(d, false, false, true, false); if (logAddPerson) --logAddPerson; });
    data.graph.connections.forEach(d => { addConnection(d, false, false, true, false); if (logAddConnection) --logAddConnection; });
    logAddPerson = true;
    logAddConnection = true;
    s.refresh();
  }
};
xhttp.open('GET', '?action=init', true);
xhttp.send();


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
    else {
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
  else if (nodes.length === 2) {
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
  personMenuDelete.style.display = getDataPersonConnections(t).length ? 'none' : '';
  showForm(personMenuForm, 'opt-edit');
}

personMenuAdd.addEventListener('click', e =>
{
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
    (d) =>
    {
      deselectAll(e, false);
      activeState.addNodes(d.t);
      s.refresh();
    });
});

personMenuEdit.addEventListener('click', e =>
{
  console.log('click person-form-edit');
  hideForm(personMenuForm);
  editPerson({
    t: activeState.nodes()[0].id,
    n: personMenuName.value.trim(),
    b: personMenuBirthDay.getAttribute('data-value'),
    d: personMenuDeathDay.getAttribute('data-value'),
    o: personMenuNote.value.trim()
  });
});

personMenuDelete.addEventListener('click', e =>
{
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
});

personMenuCancel.addEventListener('click', e =>
{
  console.log('click person-form-cancel');
  hideForm(personMenuForm);
});

approveDeleteOrCancelKeys(
  [ personMenuName, personMenuBirthDay, personMenuBirthMonth, personMenuBirthYear, personMenuDeathDay, personMenuDeathMonth, personMenuDeathYear, personMenuNote ],
  [ personMenuAdd, personMenuEdit ],
  personMenuDelete,
  personMenuCancel);

let logAddPerson = true;
function addPerson(d, toData, toServer, toGraph, refreshGraph, doneCallback = null)
{
  toServerDataGraph('addPerson', d, {
      toServer: !toServer ? null : (t) => { d.t = t; },
      toData: !toData ? null : () => { data.graph.persons.push(d); },
      toGraph: !toGraph ? null : () => {
        s.graph.addNode({
            id: d.t,
            x: d.x,
            y: d.y,
            label: getPersonRufname(d.n),
            size: settings.nodeSize,
            color: getNodeColorFromPerson(d) }); },
      refreshGraph: refreshGraph,
      doneCallback: doneCallback
    }, logAddPerson);
}

function editPerson(d, toData = true, toServer = true, toGraph = true, refreshGraph = true)
{
  toServerDataGraph('editPerson', d, {
      toServer: toServer,
      toData: !toData ? null : () => {
          let i = getDataPersonIndex(d.t);
          let old = data.graph.persons[i];
          d.x = old.x;
          d.y = old.y;
          data.graph.persons[i] = d; },
      toGraph: !toGraph ? null : () => {
        let n = s.graph.nodes(d.t);
        n.label = getPersonRufname(d.n);
        n.color = getNodeColorFromPerson(d); },
      refreshGraph: refreshGraph
    });
}

function deletePerson(t, toData = true, toServer = true, toGraph = true, refreshGraph = true)
{
  toServerDataGraph('deletePerson', t, {
      toServer: toServer,
      toData: !toData ? null : () => { deleteDataPerson(t); },
      toGraph: !toGraph ? null : () => { s.graph.dropNode(t); },
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
      toServer: toServer,
      toData: !toData ? null : () => {
        nodes.forEach(d => {
          let p = getDataPerson(d.id);
          p.x = d.x;
          p.y = d.y; }); },
      toGraph: !toGraph ? null : () => {
        nodes.forEach(d => {
          let n = s.graph.nodes(d.id);
          n.x = d.x;
          n.y = d.y; }); },
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
  connectionMenuPersons.innerHTML = p1_n + ' &mdash; ' + getPersonRufname(p2.n);
  connectionMenuRelation.value = c.r;
  connectionMenuDesc.value = c.d;
  connectionMenuDelete.style.display = getDataChildConnections(c).length ? 'none' : '';
  showForm(connectionMenuForm, 'opt-edit');
}

connectionMenuAdd.addEventListener('click', e =>
{
  console.log('click connection-form-add');
  hideForm(connectionMenuForm);
  let n = activeState.nodes();
  addConnection({
      p1: n[0].id,
      p2: n[1].id,
      r: connectionMenuRelation.value.trim(),
      d: connectionMenuDesc.value.trim()
    }, true, true, true, true,
    (d) =>
    {
      deselectAll(e, false);
      activeState.addEdges(d.t);
      s.refresh();
    });
});

connectionMenuAddChild.addEventListener('click', e =>
{
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
    (d) =>
    {
      deselectAll(null, false);
      activeState.addEdges(d.t);
      s.refresh();
    });
});

connectionMenuEdit.addEventListener('click', e =>
{
  console.log('click connection-form-edit');
  hideForm(connectionMenuForm);
  editConnection({
    t: activeState.edges()[0].id,
    r: connectionMenuRelation.value.trim(),
    d: connectionMenuDesc.value.trim()
  });
});

connectionMenuDelete.addEventListener('click', e =>
{
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
});

connectionMenuCancel.addEventListener('click', e =>
{
  console.log('click connection-form-cancel');
  hideForm(connectionMenuForm);
});

approveDeleteOrCancelKeys(
  [ connectionMenuRelation, connectionMenuDesc ],
  [ connectionMenuAdd, connectionMenuAddChild, connectionMenuEdit ],
  connectionMenuDelete,
  connectionMenuCancel);

let logAddConnection = true;
function addConnection(d, toData, toServer, toGraph, refreshGraph, doneCallback = null)
{
  if (toGraph && isChildConnectionNode(d.p1)) {
    if (!s.graph.nodes(d.p1)) {
      let p1 = getParentsFromChildConnectionNode(d.p1);
      let p1_1 = getDataPerson(p1[0]);
      let p1_2 = getDataPerson(p1[1]);
      let p12 = getChildConnectionNodePosition(p1_1, p1_2);
      s.graph.addNode({
        id: d.p1,
        x: p12.x,
        y: p12.y,
        size: .1,
        color: settings.edgeColor
      });
    }
  }
  toServerDataGraph('addConnection', d, {
      toServer: !toServer ? null : (t) => { d.t = t; },
      toData: !toData ? null : () => { data.graph.connections.push(d); },
      toGraph: !toGraph ? null : () => {
        s.graph.addEdge({
            id: d.t,
            source: d.p1,
            target: d.p2,
            label: d.r,
            size: settings.edgeSize,
            type: getConnectionRelationSettings(d.r).lineType,
            color: getEdgeColorFromConnection(d) }); },
      refreshGraph: refreshGraph,
      doneCallback: doneCallback
    }, logAddConnection);
}

function editConnection(d, toData = true, toServer = true, toGraph = true, refreshGraph = true)
{
  toServerDataGraph('editConnection', d, {
      toServer: toServer,
      toData: !toData ? null : () => {
        let i = getDataConnectionIndex(d.t);
        let old = data.graph.connections[i];
        d.p1 = old.p1;
        d.p2 = old.p2;
        data.graph.connections[i] = d; },
      toGraph: !toGraph ? null : () => {
        let c = s.graph.edges(d.t);
        c.label = d.r;
        c.type = getConnectionRelationSettings(d.r).lineType;
        c.color = getEdgeColorFromConnection(d); },
      refreshGraph: refreshGraph
    });
}

function deleteConnection(t, toData = true, toServer = true, toGraph = true, refreshGraph = true)
{
  toServerDataGraph('deleteConnection', t, {
      toServer: toServer,
      toData: !toData ? null : () => { deleteDataConnection(t); },
      toGraph: !toGraph ? null : () => { s.graph.dropEdge(t); },
      refreshGraph: refreshGraph
    });
}


// events
// ------------------------------------
let skipClickNodeAfterDrop = false;
let cdcNode = clickDoubleClick(

  e => { if (skipClickNodeAfterDrop) { skipClickNodeAfterDrop = false; return; } selectPerson(e); },

  selectDirectRelatives);

s.bind('clickNode', cdcNode.click.bind(cdcNode));
s.bind('doubleClickNode', cdcNode.doubleClick.bind(cdcNode));

s.bind('hovers', hoverPersons);


s.bind('clickEdge', selectConnection);


let cdcStage = clickDoubleClick(

  e => { if (!e.data.captor.isDragging && !multipleKeyPressed(e)) { deselectAll(e); } },

  e => { deselectAll(e); startNewPerson(e); });

s.bind('clickStage', cdcStage.click.bind(cdcStage));
s.bind('doubleClickStage', cdcStage.doubleClick.bind(cdcStage));


let skipCoordinatesUpdatedAfterDrag = false
s.bind('coordinatesUpdated', e => { if (skipCoordinatesUpdatedAfterDrag) { skipCoordinatesUpdatedAfterDrag = false; return; } cameraMoved(e); });


dragListener.bind('drag', e =>
{
  movePersons(e, false, false, false, false, false, false);
  skipCoordinatesUpdatedAfterDrag = true;
});


dragListener.bind('drop', e => { console.log('(drop)'); movePersons(e, true, true, false, false, true, true); skipClickNodeAfterDrop = true; });


setTimeout(s.refresh.bind(s), 1000);
