
let mainMenu = document.getElementById('account');

document.getElementById('mobile-help').addEventListener('click', () =>
{
  console.log('mobile-help');
  mainMenu.classList.toggle('hidden');
  document.querySelector('#help .box-restore').click();
});

document.getElementById('mobile-log').addEventListener('click', () =>
{
  mainMenu.classList.toggle('hidden');
  document.querySelector('#log .box-restore').click();
});

document.getElementById('mobile-admin').addEventListener('click', () =>
{
  mainMenu.classList.toggle('hidden');
  document.querySelector('#admin .box-restore').click();
});

if (currentUserCanEdit()) {

let mobileActionMode = null;
let MOBILE_ACTION_NEW_PERSON = 'new-person';
let MOBILE_ACTION_NEW_CONNECTION = 'new-connection';
let MOBILE_ACTION_MOVE_PERSON = 'move-person';

let mobileActionNewPerson = document.getElementById('mobile-action-new-person');
let mobileActionNewConnection = document.getElementById('mobile-action-new-connection');
let mobileActionMovePerson = document.getElementById('mobile-action-move-person');

if (currentUserIsEditing) {
  mobileActionNewPerson.addEventListener('click', () =>
  {
    mobileActionMode = mobileActionNewPerson.classList.toggle('selected') ? MOBILE_ACTION_NEW_PERSON : null;
    mobileActionNewConnection.classList.remove('selected');
    mobileActionMovePerson.classList.remove('selected');
    if (mobileActionMode) {
      deselectAll();
    }
  });
  mobileActionNewConnection.addEventListener('click', () =>
  {
    mobileActionNewPerson.classList.remove('selected');
    mobileActionMode = mobileActionNewConnection.classList.toggle('selected') ? MOBILE_ACTION_NEW_CONNECTION : null;
    mobileActionMovePerson.classList.remove('selected');
    if (mobileActionMode) {
      deselectAll();
    }
  });
  mobileActionMovePerson.addEventListener('click', () =>
  {
    mobileActionNewPerson.classList.remove('selected');
    mobileActionNewConnection.classList.remove('selected');
    mobileActionMode = mobileActionMovePerson.classList.toggle('selected') ? MOBILE_ACTION_MOVE_PERSON : null;
    if (mobileActionMode) {
      deselectAll();
    }
  });
}
function clearMobileActionMode()
{
  mobileActionMode = null;
  mobileActionNewPerson.classList.remove('selected');
  mobileActionNewConnection.classList.remove('selected');
  mobileActionMovePerson.classList.remove('selected');
}

s.bind('clickNode', e =>
{
  let n_id = e.data.node.id;
  if (isChildConnectionNode(n_id)) {
    return;
  }
  if (mobileActionMode) {
    switch (mobileActionMode) {
      case MOBILE_ACTION_NEW_CONNECTION:
      {
        activeState.addNodes(n_id);
        s.refresh();
        let numNodes = activeState.nodes().length;
        let numEdges = activeState.edges().length;
        if (numNodes === 2 && numEdges === 0) {
          clearMobileActionMode();
          startNewConnection();
        }
        else if (numNodes === 1 && numEdges === 1) {
          clearMobileActionMode();
          startNewChildConnection();
        }
        break;
      }
      case MOBILE_ACTION_MOVE_PERSON:
      {
        deselectPersons(null, false, [n_id]);
        activeState.addNodes(n_id);
        s.refresh();
        break;
      }
      default: break;
    }
  }
  else {
    deselectAll(null, false, [n_id]);
    activeState.addNodes(n_id);
    s.refresh();
    showPersonInfo(n_id);
  }
});

s.bind('clickEdge', e =>
{
  let e_id = e.data.edge.id;
  if (mobileActionMode) {
    switch (mobileActionMode) {
      case MOBILE_ACTION_NEW_CONNECTION:
      {
        deselectConnections(null, false, [e_id]);
        activeState.addEdges(e_id);
        s.refresh();
        let numNodes = activeState.nodes().length;
        let numEdges = activeState.edges().length;
        if (numNodes === 1 && numEdges === 1) {
          clearMobileActionMode();
          startNewChildConnection();
        }
        break;
      }
      default: break;
    }
  }
  else {
    deselectAll(null, false, [e_id]);
    activeState.addEdges(e_id);
    s.refresh();
    showConnectionInfo(e_id);
  }
});

s.bind('clickStage', e =>
{
  if (mobileActionMode) {
    switch (mobileActionMode) {
      case MOBILE_ACTION_NEW_PERSON:
      {
        clearMobileActionMode();
        startNewPerson(e);
        return;
      }
      case MOBILE_ACTION_MOVE_PERSON:
      {
        let nodes = activeState.nodes();
        if (nodes.length === 1) {
          let n = nodes[0];
          let newPosition = getGraphPositionFromEvent(e);
          n.x = newPosition.x;
          n.y = newPosition.y;
          movePersons(n.id, true, true, false, true, true, true);
        }
        return;
      }
      default: break;
    }
  }
  deselectAll();
});

s.bind('coordinatesUpdated', e =>
{
  // console.log(['coordinatesUpdated', e]);
  s.camera.angle = 0;
  if (logItemSelectedPreview === logItemSelectedMaster) {
    cameraMoved(e);
  }
});

}
else { // only viewing when an auto layout is used

  bindDefaultViewerEvents();
}
