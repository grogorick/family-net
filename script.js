let s = new sigma('graph');
let eventData = null;
let response = null;

function addNode(d)
{
  s.graph.addNode({
    // Main attributes:
    id: 'n_' + d.t,
    label: d.n,
    // Display attributes:
    x: d.x,
    y: d.y,
    size: 1,
    color: '#f00'
  });
}

function load()
{
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      response = JSON.parse(this.responseText);
      console.log(response);
      response.persons.forEach(addNode);
    }
  };
  xhttp.open('GET', 'storage.yml', true);
  xhttp.send();
}
load();


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

s.bind('doubleClickStage', e => {
  eventData = e.data;
  showNewNodeForm();
});

document.getElementById('new-node-cancel').addEventListener('click', e =>
{
  clearAndHideNewNodeForm();
});
document.getElementById('new-node-add').addEventListener('click', e =>
{
  hideNewNodeForm();

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      console.log(this.responseText);
    }
  };
  xhttp.open('GET', '?action=add'
    + '&x=' + eventData.captor.clientX
    + '&y=' + eventData.captor.clientY
    + '&n=' + encodeURIComponent(newNodeName.value.trim())
    + '&b=' + encodeURIComponent(newNodeBirthday.value.trim())
    , true);
  xhttp.send();

  addNode({
    t: new Date().getTime(),
    n: newNodeName.value.trim(),
    x: eventData.captor.clientX,
    y: eventData.captor.clientY
  })
  // s.graph.addNode({
  //   // Main attributes:
  //   id: 'n1',
  //   label: 'World !',
  //   // Display attributes:
  //   x: 1,
  //   y: 1,
  //   size: 1,
  //   color: '#00f'
  // }).addEdge({
  //   id: 'e0',
  //   // Reference extremities:
  //   source: 'n0',
  //   target: 'n1'
  // });

  // Finally, let's ask our sigma instance to refresh:
  s.refresh();
  clearAndHideNewNodeForm();
});
