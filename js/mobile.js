
let mainMenu = document.getElementById('account');

document.getElementById('mobile-switch-layout-net').addEventListener('click', () =>
{
  mainMenu.classList.toggle('hidden');
  document.querySelector('#switch-layout-net').click();
});

document.getElementById('mobile-switch-layout-tree').addEventListener('click', () =>
{
  mainMenu.classList.toggle('hidden');
  document.querySelector('#switch-layout-tree').click();
});

document.getElementById('mobile-switch-layout-treeYearBased').addEventListener('click', () =>
{
  mainMenu.classList.toggle('hidden');
  document.querySelector('#switch-layout-treeYearBased').click();
});

document.getElementById('mobile-help').addEventListener('click', () =>
{
  mainMenu.classList.toggle('hidden');
  document.querySelector('#help .box-restore').click();
});

document.getElementById('mobile-sources').addEventListener('click', () =>
{
  mainMenu.classList.toggle('hidden');
  document.querySelector('#sources .box-restore').click();
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

document.getElementById('mobile-settings').addEventListener('click', () =>
{
  mainMenu.classList.toggle('hidden');
  document.querySelector('#show-settings').click();
});

if (currentUserCanEdit()) {

let mobileActionMode = null;
let MOBILE_ACTION_NEW_PERSON = 'new-person';
let MOBILE_ACTION_NEW_CONNECTION = 'new-connection';
let MOBILE_ACTION_MOVE_PERSON = 'move-person';

let mobileActionNewPerson = document.getElementById('mobile-action-new-person');
let mobileActionNewConnection = document.getElementById('mobile-action-new-connection');
let mobileActionMovePerson = document.getElementById('mobile-action-move-person');

if (currentUserCanEdit()) {
  if (permissions.CREATE_PERSONS) {
    mobileActionNewPerson.addEventListener('click', () =>
    {
      mobileActionMode = mobileActionNewPerson.classList.toggle('selected') ? MOBILE_ACTION_NEW_PERSON : null;
      if (mobileActionNewConnection) {
        mobileActionNewConnection.classList.remove('selected');
      }
      if (mobileActionMovePerson) {
        mobileActionMovePerson.classList.remove('selected');
      }
      if (mobileActionMode) {
        deselectAll();
      }
    });
  }
  if (permissions.CREATE_CONNECTIONS) {
    mobileActionNewConnection.addEventListener('click', () =>
    {
      if (mobileActionNewPerson) {
        mobileActionNewPerson.classList.remove('selected');
      }
      mobileActionMode = mobileActionNewConnection.classList.toggle('selected') ? MOBILE_ACTION_NEW_CONNECTION : null;
      if (mobileActionMovePerson) {
        mobileActionMovePerson.classList.remove('selected');
      }
      if (mobileActionMode) {
        deselectAll();
      }
    });
  }
  if (permissions.EDIT_PERSONS) {
    mobileActionMovePerson.addEventListener('click', () =>
    {
      if (mobileActionNewPerson) {
        mobileActionNewPerson.classList.remove('selected');
      }
      if (mobileActionNewConnection) {
        mobileActionNewConnection.classList.remove('selected');
      }
      mobileActionMode = mobileActionMovePerson.classList.toggle('selected') ? MOBILE_ACTION_MOVE_PERSON : null;
      if (mobileActionMode) {
        deselectAll();
      }
    });
  }
}
function clearMobileActionMode()
{
  mobileActionMode = null;
  if (mobileActionNewPerson) {
    mobileActionNewPerson.classList.remove('selected');
  }
  if (mobileActionNewConnection) {
    mobileActionNewConnection.classList.remove('selected');
  }
  if (mobileActionMovePerson) {
    mobileActionMovePerson.classList.remove('selected');
  }
}

s.bind('clickNode', e =>
{
  let n_id = e.data.node.id;
  if (isChildConnectionNodeId(n_id)) {
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
    showPersonInfo(e.data.node);
  }
});

s.bind('clickEdge', e =>
{
  let ed = e.data.edge,
      e_id = ed.id;
  if (isDoppelgangerConnectionEdge(ed)) {
    deselectAll(null, false, [ed.source, ed.target]);
    activeState.addNodes([ed.source, ed.target]);
    s.refresh();
  }
  else if (mobileActionMode) {
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
    showConnectionInfo(ed);
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
  cameraMoved(e);
});

bindMobileLongPressEvents();

}
else { // only viewing when an auto layout is used

  s.bind('clickNode', event_selectPersonAndShowInfo);
  bindMobileLongPressEvents();
  bindCommonViewerEvents();

}

function bindMobileLongPressEvents()
{
  graphElement.addEventListener('contextmenu', e =>
  {
    e.preventDefault();
    let nodes = activeState.nodes();
    if (nodes.length > 2)
      return;
    let n = getNodeAtScreenPosition(e.clientX, e.clientY, 10);
    console.log(['longTap', n, e]);
    if (n !== null) {
      e.data = { node: n };
      event_selectPersonAndDirectRelatives(e);
      event_findRelationship(e);
    }
    return false;
  }, false);
}
