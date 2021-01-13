const settings = {
  nodeColor: '#78D384',
  nodeColorHighlight1: '#3BAA49',
  nodeColorHighlight2: '#2F8339',
  edgeColor: '#DDD',
  edgeColorHighlight: '#AAA',
  nodeSize: 5,
  edgeSize: .25
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

let data = { persons: [], connections: []};

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
function showForm(f)
{
  modalBlocker.style.display = 'block';
  f.classList.add('input-box-visible');
  let firstInput = f.querySelector('input');
  if (firstInput) {
    firstInput.focus();
  }
}
function hideForm(f)
{
  f.classList.remove('input-box-visible');
  modalBlocker.style.display = 'none';
}

modalBlocker.addEventListener('click', e =>
{
  document.querySelector('.input-box-visible button[id$="cancel"]').click();
});


// load from file
// ------------------------------------
console.log('load data from file')
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function()
{
  if (this.readyState === 4 && this.status === 200) {
    data = JSON.parse(this.responseText);
    console.log(data);
    data.persons.forEach(d => addPerson(d));
    data.connections.forEach(d => addConnection(d));
    s.refresh();
  }
};
xhttp.open('GET', 'storage.yml', true);
xhttp.send();


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
  if (!e.data.captor.ctrlKey && !e.data.captor.shiftKey) {
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
  if (nodes.length === 2) {
    if (nodes[0].id == nodes[1].id) {
      console.log('no connection possible - 2 different persons must be selected');
      return;
    }
    if (checkPersonsConnected(nodes[0].id, nodes[1].id)) {
      console.log('no connection possible - persons already connected');
      return;
    }
    showForm(newConnectionForm);
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

function showPersonInfo(t)
{
  let d = getDataPerson(t);
  personActionTitle.innerHTML = d.n;
  personActionInfo.innerHTML = 'geboren: ' + d.b;
  showForm(personActionMenu);
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

  let d = getDataConnection(c.id);
  let p1 = getDataPerson(c.source);
  let p2 = getDataPerson(c.target);
  connectionActionTitle.innerHTML = p1.n + ' - ' + p2.n;
  connectionActionInfo.innerHTML = d.d;
  showForm(connectionActionMenu);
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


// new person
// ------------------------------------
function addPerson(d, toData = false, toServer = false, toGraph = true, refreshGraph = false)
{
  console.log(['addPerson', d, toData, toServer, toGraph, refreshGraph]);
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

let newPersonForm = document.getElementById('new-person-form');
let newPersonName = document.getElementById('new-person-name');
let newPersonBirthday = document.getElementById('new-person-birthday');
let newPersonAdd = document.getElementById('new-person-add');
let newPersonCancel = document.getElementById('new-person-cancel');

function clearNewPersonForm()
{
  newPersonName.value = '';
  newPersonBirthday.value = '';
}

let newPersonPosition = null;
function startNewPerson(e)
{
  console.log('startNewPerson');
  newPersonPosition = getGraphPositionFromEvent(e);
  showForm(newPersonForm);
}

newPersonAdd.addEventListener('click', e =>
{
  console.log('click new-person-add');
  hideForm(newPersonForm);

  addPerson({
      x: newPersonPosition.x,
      y: newPersonPosition.y,
      n: newPersonName.value.trim(),
      b: newPersonBirthday.getAttribute('data-value')
    },
    true, true, true, true);
  clearNewPersonForm();
});

newPersonCancel.addEventListener('click', e =>
{
  console.log('click new-person-cancel');
  hideForm(newPersonForm);
  clearNewPersonForm();
});

approveOrCancelKeys(newPersonName, newPersonAdd, newPersonCancel);
approveOrCancelKeys(newPersonBirthday, newPersonAdd, newPersonCancel);
approveOrCancelKeys(document.getElementById('new-person-birthday-month'), newPersonAdd, newPersonCancel);
approveOrCancelKeys(document.getElementById('new-person-birthday-year'), newPersonAdd, newPersonCancel);


// move person
// ------------------------------------
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


// delete person
// ------------------------------------
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


// new connection
// ------------------------------------
function addConnection(d, toData = false, toServer = false, toGraph = true, refreshGraph = false)
{
  console.log(['addConnection', d, toData, toServer, toGraph, refreshGraph]);
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

let newConnectionForm = document.getElementById('new-connection-form');
let newConnectionDesc = document.getElementById('new-connection-desc');
let newConnectionAdd = document.getElementById('new-connection-add');
let newConnectionCancel = document.getElementById('new-connection-cancel');

function clearNewConnectionForm()
{
  newConnectionDesc.value = '';
}

newConnectionAdd.addEventListener('click', e =>
{
  console.log('click new-connection-add');
  hideForm(newConnectionForm);
  let n = activeState.nodes();
  addConnection({
    t: new Date().getTime(),
    p1: n[0].id,
    p2: n[1].id,
    d: newConnectionDesc.value.trim()
  }, true, true, true, true);
  clearNewConnectionForm();
});

newConnectionCancel.addEventListener('click', e =>
{
  console.log('click new-connection-cancel');
  hideForm(newConnectionForm);
  clearNewConnectionForm();
});

approveOrCancelKeys(newConnectionDesc, newConnectionAdd, newConnectionCancel);


// delete connection
// ------------------------------------
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


// person action menu
// ------------------------------------
let personActionMenu = document.getElementById('person-action-menu');
let personActionTitle = personActionMenu.querySelector('h2');
let personActionInfo = personActionMenu.querySelector('.box-info');

document.getElementById('person-action-delete').addEventListener('click', e =>
{
  console.log('click person-action-delete');
  hideForm(personActionMenu);
  n = activeState.nodes()[0];
  activeState.dropNodes();
  deletePerson(n.id);
});

document.getElementById('person-action-cancel').addEventListener('click', e =>
{
  console.log('click person-action-cancel');
  personActionTitle.innerHTML = 'Person...';
  personActionInfo.innerHTML = '';
  hideForm(personActionMenu);
});


// connection action menu
// ------------------------------------
let connectionActionMenu = document.getElementById('connection-action-menu');
let connectionActionTitle = connectionActionMenu.querySelector('h2');
let connectionActionInfo = connectionActionMenu.querySelector('.box-info');

document.getElementById('connection-action-delete').addEventListener('click', e =>
{
  console.log('click connection-action-delete');
  hideForm(connectionActionMenu);
  c = activeState.edges()[0];
  activeState.dropEdges();
  deleteConnection(c.id);
});

document.getElementById('connection-action-cancel').addEventListener('click', e =>
{
  console.log('click connection-action-cancel');
  connectionActionTitle.innerHTML = 'Verbindung...';
  connectionActionInfo.innerHTML = '';
  hideForm(connectionActionMenu);
});


// events
// ------------------------------------
let skipClickAfterDrop = false;
let cdcNode = clickDoubleClick(
  e => { if (skipClickAfterDrop) { skipClickAfterDrop = false; return; } selectPerson(e); },
  e => { selectOnePerson(e); showPersonInfo(e.data.node.id); });
s.bind('clickNode', cdcNode.click.bind(cdcNode));
s.bind('doubleClickNode', cdcNode.doubleClick.bind(cdcNode));

s.bind('clickEdge', selectConnection);

let cdcStage = clickDoubleClick(
  e => { if (!e.data.captor.isDragging) { deselectAll(e); } else { console.log('dragged graph'); } },
  e => { deselectAll(e); startNewPerson(e); });
s.bind('clickStage', cdcStage.click.bind(cdcStage));
s.bind('doubleClickStage', cdcStage.doubleClick.bind(cdcStage));

dragListener.bind('drop', e => { console.log('drop'); movePersons(e); skipClickAfterDrop = true; });

// document.addEventListener('keydown', e => {});

setTimeout(s.refresh.bind(s), 1000);

