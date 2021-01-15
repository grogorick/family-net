const settings = {
  nodeColor: '#78D384',
  nodeColorHighlight1: '#3BAA49',
  nodeColorHighlight2: '#2F8339',
  edgeColor: '#DDD',
  edgeColorHighlight: '#AAA',
  nodeSize: 5,
  edgeSize: .25,
  saveCameraTimeout: 5000
};
// #2F8339
// #3BAA49
// #53C561
// #78D384
// #9EE0A6

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
    labelAlignment: 'bottom',
    labelHoverShadow: true,
    labelHoverShadowColor: '#ddd',

    minNodeSize: 1,
    maxNodeSize: 10,
    nodeBorderColor: 'default',
    nodeOuterBorderColor: 'default',
    defaultNodeColor: settings.nodeColor,
    defaultNodeBorderColor: 'transparent',
    nodeBorderSize: 2,
    nodeOuterBorderSize: 0,

    nodeHoverBorderColor: 'default',
    defaultNodeHoverBorderColor: settings.nodeColor,
    nodeHoverBorderSize: 2,

    nodeActiveColor: 'default',
    nodeActiveBorderColor: 'default',
    defaultNodeActiveColor: settings.nodeColorHighlight1,
    defaultNodeActiveBorderColor: 'transparent',
    nodeActiveBorderSize: 2,

    edgeColor: 'default',
    defaultEdgeColor: settings.edgeColor,
    minEdgeSize: 0.1,
    maxEdgeSize: 5,
    minArrowSize: 5,

    enableEdgeHovering: true,
    edgeHoverPrecision: 5,
    // edgeHoverSizeRatio: 5
    // edgeHoverExtremities: true,
    edgeHoverColor: 'default',
    defaultEdgeHoverColor: settings.edgeColorHighlight,
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

let data = { camera: { x: 0, y: 0, z: 0 }, persons: [], connections: [] };

function getDataPerson(t)
{
  let person = null;
  data.persons.forEach(d => { if (d.t == t) person = d; });
  return person;
}
function getDataConnection(t)
{
  let connection = null;
  data.connections.forEach(d => { if (d.t == t) connection = d; });
  return connection;
}

function deleteDataPerson(t)
{
  return data.persons.splice(data.persons.findIndex(d => d.t == t), 1);
}
function deleteDataConnection(t)
{
  data.connections.splice(data.connections.findIndex(d => d.t == t), 1);
}

function getDataConnectionsToPerson(t)
{
  let connections = [];
  data.connections.forEach(d =>
  {
    if (d.p1 == t || d.p2 == t) {
      connections.push(d);
    }
  });
  return connections;
}

function checkPersonsConnected(t1, t2)
{
  let connected = false;
  data.connections.forEach(d =>
  {
    connected |= (
      (d.p1 == t1 && d.p2 == t2) ||
      (d.p1 == t2 && d.p2 == t1));
  });
  return connected;
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

let modalBlocker = document.getElementById('modal-blocker');
function showForm(f, opt = null)
{
  modalBlocker.style.display = 'block';

  f.classList.remove('opt-new');
  f.classList.remove('opt-edit');
  if (opt) {
    f.classList.add(opt);
  }

  f.classList.add('box-visible');
  let firstInput = f.querySelector('input');
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
console.log('load data from file');
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function()
{
  if (this.readyState === 4 && this.status === 200) {
    data = JSON.parse(this.responseText);
    console.log(data);
    moveCamera({
        x: parseFloat(data.camera.x),
        y: parseFloat(data.camera.y),
        z: parseFloat(data.camera.z)
      },
      false, false, true, false);
    logAddPerson = 10;
    logAddConnection = 10;
    data.persons.forEach(d => { addPerson(d, false, false, true, false); if (logAddPerson) --logAddPerson; });
    data.connections.forEach(d => { addConnection(d, false, false, true, false); if (logAddConnection) --logAddConnection; });
    logAddPerson = true;
    logAddConnection = true;
    s.refresh();
  }
};
xhttp.open('GET', 'storage.yml', true);
xhttp.send();


// move camera
// ------------------------------------
let saveCameraTimeout = null;
function cameraMoved()
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
  console.log(['moveCamera', xyz, toData, toServer, toGraph, refreshGraph]);
  let continueWhenServerIsDone = function()
  {
    if (toData) {
      data.camera = xyz;
    }
    if (toGraph) {
      s.renderers[0].camera.x = xyz.x;
      s.renderers[0].camera.y = xyz.y;
      s.renderers[0].camera.ratio = xyz.z;
      if (refreshGraph) {
        s.refresh();
      }
    }
  };
  if (toServer) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function()
    {
      if (this.readyState === 4 && this.status === 200) {
        console.log(this.responseText);
        continueWhenServerIsDone();
      }
    };
    xhttp.open('GET', '?action=moveCamera'
      + '&x=' + encodeURIComponent(xyz.x)
      + '&y=' + encodeURIComponent(xyz.y)
      + '&z=' + encodeURIComponent(xyz.z)
      , true);
    xhttp.send();
  }
  else {
    continueWhenServerIsDone();
  }
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
  let multipleKey = multipleKeyPressed(e);
  if (!multipleKey) {
    deselectAll(e, false);
    console.log(['selectPerson', e]);
  }
  else {
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
  }
  else if (nodes.length === 2) {
    if (nodes[0].id == nodes[1].id) {
      console.log('no connection possible - 2 different persons must be selected');
      return;
    }
    if (checkPersonsConnected(nodes[0].id, nodes[1].id)) {
      console.log('no connection possible - persons already connected');
      return;
    }
    startNewConnection();
  }
  checkCombinedSelection();
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
  checkCombinedSelection();
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

// select person and connection
function checkCombinedSelection()
{
  let es = activeState.edges();
  let ns = activeState.nodes();
  if (es.length === 1 && ns.length === 1) {
    console.log(['create child connection', es, ns]);
    let e = es[0];
    let n1 = s.graph.nodes(e.source);
    let n2 = s.graph.nodes(e.target);
    let n12 = {
      x: (n1.x + n2.x) / 2,
      y: (n1.y + n2.y) / 2
    };
    let n = ns[0];
    let t = new Date().getTime();
    s.graph.addNode({
      id: t + '-1',
      x: n12.x,
      y: n12.y,
      size: 0
    });
    s.graph.addNode({
      id: t + '-3',
      x: (n12.x + n.x) / 2,
      y: (n12.y + n.y) / 2,
      size: 0
    });
    s.graph.addEdge({
      id: t + '-2',
      source: t + '-1',
      target: t + '-3',
      label: 'Kind',
      size: settings.edgeSize,
      type: 'line'
    });
    s.graph.addEdge({
      id: t + '-4',
      source: t + '-3',
      target: n.id,
      size: settings.edgeSize,
      type: 'arrow'
    });
    s.refresh();
  }
}


// persons
// ------------------------------------
let personMenuForm = document.getElementById('person-form');
let personMenuName = document.getElementById('person-form-name');
let personMenuBirthday = document.getElementById('person-form-birthday');
let personMenuBirthdayMonth = document.getElementById('person-form-birthday-month');
let personMenuBirthdayYear = document.getElementById('person-form-birthday-year');
let personMenuAdd = document.getElementById('person-form-add');
let personMenuDelete = document.getElementById('person-form-delete');
let personMenuCancel = document.getElementById('person-form-cancel');

let newPersonPosition = null;
function startNewPerson(e)
{
  console.log('startNewPerson');
  newPersonPosition = getGraphPositionFromEvent(e);
  personMenuName.value = '';
  personMenuBirthday.value = '';
  personMenuBirthdayMonth.value = '';
  personMenuBirthdayYear.value = '';
  showForm(personMenuForm, 'opt-new');
}

function showPersonInfo(t)
{
  console.log(['showPersonInfo', t]);
  let d = getDataPerson(t);
  let db = d.b.split('-');
  personMenuName.value = d.n;
  personMenuBirthday.value = db[2];
  personMenuBirthdayMonth.value = db[1];
  personMenuBirthdayYear.value = db[0];
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
      b: personMenuBirthday.getAttribute('data-value')
    },
    true, true, true, true);
});

personMenuDelete.addEventListener('click', e =>
{
  console.log('click person-action-delete');
  hideForm(personMenuForm);
  n = activeState.nodes()[0];
  activeState.dropNodes();
  deletePerson(n.id);
});

personMenuCancel.addEventListener('click', e =>
{
  console.log('click person-form-cancel');
  hideForm(personMenuForm);
});

approveOrCancelKeys(personMenuName, personMenuAdd, personMenuCancel);
approveOrCancelKeys(personMenuBirthday, personMenuAdd, personMenuCancel);
approveOrCancelKeys(personMenuBirthdayMonth, personMenuAdd, personMenuCancel);
approveOrCancelKeys(personMenuBirthdayYear, personMenuAdd, personMenuCancel);

let logAddPerson = true;
function addPerson(d, toData, toServer, toGraph, refreshGraph)
{
  console.log(logAddPerson ? ['addPerson', d, toData, toServer, toGraph, refreshGraph] : '...');
  let continueWhenServerIsDone = function()
  {
    if (toData) {
      data.persons.push(d);
    }
    if (toGraph) {
      s.graph.addNode({
        id: d.t,
        x: d.x,
        y: d.y,
        label: d.n,
        size: settings.nodeSize
      });
      if (refreshGraph) {
        s.refresh();
      }
    }
  };
  if (toServer) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function()
    {
      if (this.readyState === 4 && this.status === 200) {
        console.log(this.responseText);
        d.t = this.responseText;
        continueWhenServerIsDone();
      }
    };
    xhttp.open('GET', '?action=addPerson'
      + '&x=' + encodeURIComponent(d.x)
      + '&y=' + encodeURIComponent(d.y)
      + '&n=' + encodeURIComponent(d.n)
      + '&b=' + encodeURIComponent(d.b)
      , true);
    xhttp.send();
  }
  else {
    continueWhenServerIsDone();
  }
}

function movePersons(e, toData = true, toServer = true, toGraph = false, refreshGraph = false)
{
  console.log(['movePersons', e, toData, toServer, toGraph, refreshGraph]);
  let nodes = activeState.nodes();
  if (!nodes.some(n => n.id === e.data.node.id)) {
    nodes = [e.data.node];
  }
  let continueWhenServerIsDone = function()
  {
    if (toData) {
      nodes.forEach(d =>
      {
        let p = getDataPerson(d.id);
        p.x = d.x;
        p.y = d.y;
      });
    }
    if (toGraph) {
      nodes.forEach(d =>
      {
        let n = s.graph.nodes(d.id);
        n.x = d.x;
        n.y = d.y;
      });
      if (refreshGraph) {
        s.refresh();
      }
    }
  };
  if (toServer) {
    let ts = [];
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function()
    {
      if (this.readyState === 4 && this.status === 200) {
        console.log([ts, this.responseText]);
        continueWhenServerIsDone();
      }
    };
    let ds = [];
    nodes.forEach(n => { ts.push(n.id); ds.push({ t: n.id, x: n.x, y: n.y }); });
    xhttp.open('GET', '?action=movePersons'
      + '&d=' + encodeURIComponent(JSON.stringify(ds))
      , true);
    xhttp.send();
  }
  else {
    continueWhenServerIsDone();
  }
}

function deletePerson(t, toData = true, toServer = true, toGraph = true, refreshGraph = true)
{
  console.log(['deletePerson', t, toData, toServer, toGraph, refreshGraph]);
  let connections = getDataConnectionsToPerson(t);
  if (connections.length) {
    console.log(['cancelled - person to delete must not be connected', connections]);
    return;
  }
  let continueWhenServerIsDone = function()
  {
    if (toData) {
      deleteDataPerson(t);
    }
    if (toGraph) {
      s.graph.dropNode(t);
      if (refreshGraph) {
        s.refresh();
      }
    }
  };
  if (toServer) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function()
    {
      if (this.readyState === 4 && this.status === 200) {
        console.log([t, this.responseText]);
        continueWhenServerIsDone();
      }
    };
    xhttp.open('GET', '?action=deletePerson'
      + '&t=' + encodeURIComponent(t)
      , true);
    xhttp.send();
  }
  else {
    continueWhenServerIsDone();
  }
}


// connections
// ------------------------------------
let connectionMenuForm = document.getElementById('connection-form');
let connectionMenuPersons = document.getElementById('connection-form-persons');
let connectionMenuDesc = document.getElementById('connection-form-desc');
let connectionMenuAdd = document.getElementById('connection-form-add');
let connectionMenuDelete = document.getElementById('connection-action-delete');
let connectionMenuCancel = document.getElementById('connection-form-cancel');

function startNewConnection()
{
  connectionMenuPersons.innerHTML = '';
  connectionMenuDesc.value = '';
  showForm(connectionMenuForm, 'opt-new');
}

function showConnectionInfo(t)
{
  console.log(['showConnectionInfo', t]);
  let d = getDataConnection(t);
  let p1 = getDataPerson(d.p1);
  let p2 = getDataPerson(d.p2);
  connectionMenuPersons.innerHTML = p1.n + ' &mdash; ' + p2.n;
  connectionMenuDesc.value = d.d;
  showForm(connectionMenuForm, 'opt-edit');
}

connectionMenuAdd.addEventListener('click', e =>
{
  console.log('click connection-form-add');
  hideForm(connectionMenuForm);
  let n = activeState.nodes();
  addConnection({
      t: new Date().getTime(),
      p1: n[0].id,
      p2: n[1].id,
      d: connectionMenuDesc.value.trim()
    }, true, true, true, true);
});

connectionMenuDelete.addEventListener('click', e =>
{
  console.log('click connection-action-delete');
  hideForm(connectionMenuForm);
  c = activeState.edges()[0];
  activeState.dropEdges();
  deleteConnection(c.id);
});

connectionMenuCancel.addEventListener('click', e =>
{
  console.log('click connection-form-cancel');
  hideForm(connectionMenuForm);
});

approveOrCancelKeys(connectionMenuDesc, connectionMenuAdd, connectionMenuCancel);

let logAddConnection = true;
function addConnection(d, toData, toServer, toGraph, refreshGraph)
{
  console.log(logAddConnection ? ['addConnection', d, toData, toServer, toGraph, refreshGraph] : '...');
  let continueWhenServerIsDone = function()
  {
    if (toData) {
      data.connections.push(d);
    }
    if (toGraph) {
      s.graph.addEdge({
        id: d.t,
        source: d.p1,
        target: d.p2,
        label: d.d,
        size: settings.edgeSize,
        type: (d.d.includes('geschieden') ? 'dotted' : (d.d.includes('verheiratet') ? 'dashed' : 'arrow'))
      });
      if (refreshGraph) {
        s.refresh();
      }
    }
  };
  if (toServer) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function()
    {
      if (this.readyState === 4 && this.status === 200) {
        console.log(this.responseText);
        d.t = this.responseText;
        continueWhenServerIsDone();
      }
    };
    xhttp.open('GET', '?action=addConnection'
      + '&p1=' + encodeURIComponent(d.p1)
      + '&p2=' + encodeURIComponent(d.p2)
      + '&d=' + encodeURIComponent(d.d)
      , true);
    xhttp.send();
  }
  else {
    continueWhenServerIsDone();
  }
}

function deleteConnection(t, toData = true, toServer = true, toGraph = true, refreshGraph = true)
{
  console.log(['deleteConnection', t, toData, toServer, toGraph, refreshGraph]);
  let continueWhenServerIsDone = function()
  {
    if (toData) {
      deleteDataConnection(t);
    }
    if (toGraph) {
      s.graph.dropEdge(t);
      if (refreshGraph) {
        s.refresh();
      }
    }
  };
  if (toServer) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function()
    {
      if (this.readyState === 4 && this.status === 200) {
        console.log([t, this.responseText]);
        continueWhenServerIsDone();
      }
    };
    xhttp.open('GET', '?action=deleteConnection'
      + '&t=' + encodeURIComponent(t)
      , true);
    xhttp.send();
  }
  else {
    continueWhenServerIsDone();
  }
}


// events
// ------------------------------------
let skipClickAfterDrop = false;
s.bind('clickNode', e => { if (skipClickAfterDrop) { skipClickAfterDrop = false; return; } selectPerson(e); });

s.bind('clickEdge', selectConnection);

let cdcStage = clickDoubleClick(
  e => { if (!e.data.captor.isDragging) { deselectAll(e); } else { cameraMoved(); } },
  e => { deselectAll(e); startNewPerson(e); });
s.bind('clickStage', cdcStage.click.bind(cdcStage));
s.bind('doubleClickStage', cdcStage.doubleClick.bind(cdcStage));

dragListener.bind('drop', e => { console.log('(drop)'); movePersons(e); skipClickAfterDrop = true; });

setTimeout(s.refresh.bind(s), 1000);
