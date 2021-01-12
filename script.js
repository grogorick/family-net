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
    fontStyle: 'bold',
    // labelAlignment: 'constrained',
    labelHoverShadow: false,

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
    // edgeHoverExtremities: true,
    edgeHoverColor: 'default',
    defaultEdgeHoverColor: settings.edgeColorHighlight,
    edgeHoverSizeRatio: 5
  }
});

let activeState = sigma.plugins.activeState(s);
// var select = sigma.plugins.select(s, activeState, s.renderers[0]);
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
function deselectAll(e, refreshGraph = true)
{
  deselectPerson(e, false);
  deselectConnection(e, false);
  if (refreshGraph) {
    s.refresh();
  }
}


// select persons
// ------------------------------------
let person1 = null;
let person2 = null;

function selectPerson(e, refreshGraph = true)
{
  deselectAll(e, false);
  console.log(['selectPerson', e]);
  person1 = e.data.node;
  // activeState.addNodes(person1.id);
  person1.color = settings.nodeColorHighlight1;
  let d = getDataPerson(person1.id);
  person1.label = d.n + ' (' + d.b + ')';
  if (refreshGraph) {
    s.refresh();
  }
}
function selectSecondPerson(e, refreshGraph = true)
{
  deselectSecondPerson(e, false);
  console.log(['selectSecondPerson', e]);
  person2 = e.data.node;
  activeState
  person2.color = settings.nodeColorHighlight2;
  if (refreshGraph) {
    s.refresh();
  }
}

function deselectPerson(e, refreshGraph = true)
{
  if (person1 !== null) {
    console.log('deselectPerson');
    // activeState.dropNodes(person1.id);
    person1.color = null;
    let d = getDataPerson(person1.id);
    person1.label = d.n;
    person1 = null;
  }
  deselectSecondPerson(e, false);
  if (refreshGraph) {
    s.refresh();
  }
}
function deselectSecondPerson(e, refreshGraph = true)
{
  if (person2 !== null) {
    console.log('deselectSecondPerson');
    person2.color = null;
    person2 = null;
  }
  if (refreshGraph) {
    s.refresh();
  }
}


// select connections
// ------------------------------------
let connection1 = null;

function selectConnection(e, refreshGraph = true)
{
  deselectAll(e, false);
  console.log(['selectConnection', e]);
  connection1 = e.data.edge;
  connection1.color = settings.nodeColorHighlight1;
  if (refreshGraph) {
    s.refresh();
  }
}
function deselectConnection(e, refreshGraph = true)
{
  if (connection1 !== null) {
    console.log('deselectConnection');
    connection1.color = null;
    connection1 = null;
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
      + '&x=' + d.x
      + '&y=' + d.y
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

document.getElementById('new-person-add').addEventListener('click', e =>
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

document.getElementById('new-person-cancel').addEventListener('click', e =>
{
  console.log('click new-person-cancel');
  hideForm(newPersonForm);
  clearNewPersonForm();
});


// move person
// ------------------------------------
function movePerson(d, toData = true, toServer = true, toGraph = false, refreshGraph = false)
{
  console.log(['movePerson', d, toData, toServer, toGraph, refreshGraph]);
  let continueWhenServerIsDone = function()
  {
    if (toData) {
			let p = getDataPerson(d.t);
			p.x = d.x;
			p.y = d.y;
    }
    if (toGraph) {
			let n = s.graph.nodes(d.t);
			n.x = d.x;
			n.y = d.y;
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
        console.log([d.t, this.responseText]);
        continueWhenServerIsDone();
      }
    };
    xhttp.open('GET', '?action=movePerson'
      + '&t=' + d.t
      + '&x=' + d.x
      + '&y=' + d.y
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
      + '&t=' + t
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
      + '&p1=' + d.p1
      + '&p2=' + d.p2
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

function clearNewConnectionForm()
{
  newConnectionDesc.value = '';
}

document.getElementById('new-connection-add').addEventListener('click', e =>
{
  console.log('click new-connection-add');
  hideForm(newConnectionForm);

  addConnection({
    t: new Date().getTime(),
    p1: person1.id,
    p2: person2.id,
    d: newConnectionDesc.value.trim()
  }, true, true, true, true);
  clearNewConnectionForm();
});

document.getElementById('new-connection-cancel').addEventListener('click', e =>
{
  console.log('click new-connection-cancel');
  hideForm(newConnectionForm);
  clearNewConnectionForm();
});


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
      + '&t=' + t
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

document.getElementById('person-action-connect').addEventListener('click', e =>
{
  console.log('click person-action-connect');
  hideForm(personActionMenu);
  if (person1 == null || person2 == null || person1.id == person2.id) {
    console.log('cancelled - 2 persons must be selected');
    return;
  }
  if (checkPersonsConnected(person1.id, person2.id)) {
    console.log('cancelled - persons already connected');
    return;
  }
  showForm(newConnectionForm);
});

document.getElementById('person-action-delete').addEventListener('click', e =>
{
  console.log('click person-action-delete');
  hideForm(personActionMenu);
  deletePerson(person2.id);
  person2 = null;
});

document.getElementById('person-action-cancel').addEventListener('click', e =>
{
  console.log('click person-action-cancel');
  hideForm(personActionMenu);
});


// connection action menu
// ------------------------------------
let connectionActionMenu = document.getElementById('connection-action-menu');

document.getElementById('connection-action-delete').addEventListener('click', e =>
{
  console.log('click connection-action-delete');
  hideForm(connectionActionMenu);
  deleteConnection(connection1.id);
  connection1 = null;
});

document.getElementById('connection-action-cancel').addEventListener('click', e =>
{
  console.log('click connection-action-cancel');
  hideForm(connectionActionMenu);
});


// events
// ------------------------------------
let cdcNode = clickDoubleClick(selectPerson, e => { selectSecondPerson(e); showForm(personActionMenu); });
s.bind('clickNode', cdcNode.click.bind(cdcNode));
s.bind('doubleClickNode', cdcNode.doubleClick.bind(cdcNode));

s.bind('clickEdge', e => { selectConnection(e); showForm(connectionActionMenu); });

let cdcStage = clickDoubleClick(deselectAll, e => { deselectAll(e); startNewPerson(e); });
s.bind('clickStage', cdcStage.click.bind(cdcStage));
s.bind('doubleClickStage', cdcStage.doubleClick.bind(cdcStage));

dragListener.bind('drop', e => { console.log(['drop', e]); d=e.data.node; movePerson({ t: d.id, x: d.x, y: d.y }); });

// document.addEventListener('keydown', e => {});

setTimeout(s.refresh.bind(s), 1000);

