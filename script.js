let s = new sigma('graph');

s.settings('doubleClickEnabled', false);
s.settings('rescaleIgnoreSize', true);
let bounds = {
  minX: -500,
  minY: -500,
  maxX: 500,
  maxY: 500,
  sizeMax: 5,
  weightMax: 1};
s.settings('bounds', bounds);

let data = { persons: [], connections: []};

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
        size: 5,
        color: '#f00'
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
        target: d.p2
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

// load from file
// ------------------------------------
console.log('load from file')
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


// new node
// ------------------------------------
let newNodeForm = document.getElementById('new-node-form');
let newNodeName = document.getElementById('new-node-name');
let newNodeBirthday = document.getElementById('new-node-birthday');

function showNewNodeForm()
{
  newNodeForm.style.display = 'inline-block';
}
function hideNewNodeForm()
{
  newNodeForm.style.display = 'none';
}
function clearAndHideNewNodeForm()
{
  newNodeForm.style.display = 'none';
  newNodeName.value = '';
  newNodeBirthday.value = '';
}


let e_doubleClickStage = null;

function startNewPerson(e)
{
  console.log('startNewPerson');
  e_doubleClickStage = e;
  showNewNodeForm();
}

document.getElementById('new-node-add').addEventListener('click', e =>
{
  console.log('click new-node-add');
  hideNewNodeForm();

  let pos = getGraphPositionFromEvent(e_doubleClickStage);
  addPerson({
      x: pos.x,
      y: pos.y,
      n: newNodeName.value.trim(),
      b: newNodeBirthday.value.trim()
    },
    true, true, true, true);
  clearAndHideNewNodeForm();
});

document.getElementById('new-node-cancel').addEventListener('click', e =>
{
  console.log('click new-node-cancel');
  clearAndHideNewNodeForm();
});


// new connection
// ------------------------------------
let newConnectionForm = document.getElementById('new-connection-form');
let newConnectionDesc = document.getElementById('new-connection-desc');

function showNewConnectionForm()
{
  newConnectionForm.style.display = 'inline-block';
}
function hideNewConnectionForm()
{
  newConnectionForm.style.display = 'none';
}
function clearAndHideNewConnectionForm()
{
  newConnectionForm.style.display = 'none';
  newConnectionDesc.value = '';
}

let node1 = null;
let node2 = null;

function deselectPerson(e)
{
  console.log('deselectPerson');
  node1 = null;
}

function selectFirstPerson(e)
{
  console.log(['selectFirstPerson', e]);
  node1 = e.data.node;
}

function selectSecondPerson(e)
{
  console.log(['selectSecondPerson', e, node1, node2]);
  if (node1 !== null && node1.id !== e.data.node.id) {
    node2 = e.data.node;
    showNewConnectionForm();
  }
}

let dcnCheck = 0;
function clickNode(e)
{
  if (!dcnCheck)
    setTimeout(() => {
      if (!dcnCheck)
        selectFirstPerson(e);
      else
        dcnCheck--; }, s.settings.doubleClickTimeout + 100);
  else
    dcnCheck--;
}
function doubleClickNode(e)
{
  dcnCheck = 2;
  selectSecondPerson(e);
}

document.getElementById('new-connection-add').addEventListener('click', e =>
{
  console.log('click new-connection-add');
  hideNewConnectionForm();

  addConnection({
    t: new Date().getTime(),
    p1: node1.id,
    p2: node2.id,
    d: newConnectionDesc.value.trim()
  }, true, true, true, true);
  clearAndHideNewConnectionForm();
});

document.getElementById('new-connection-cancel').addEventListener('click', e =>
{
  console.log('click new-connection-cancel');
  clearAndHideNewConnectionForm();
});

s.bind('clickStage', deselectPerson);
s.bind('doubleClickStage', startNewPerson);
s.bind('clickNode', clickNode);
s.bind('doubleClickNode', doubleClickNode);
