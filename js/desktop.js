
let hoverTimeouts = {};
s.bind('hovers', e =>
{
  // console.log(e);
  let showHideDoppelgangerEdges = (n, hidden) =>
  {
    if (isDoppelgangerNode(n) && !isNodeSelected(n.id)) {
      // n._my.p._graphEdge.hidden = hidden;
      n._my.p._graphEdge.color = hidden ? settings.edgeColorDoppelganger : settings.edgeColorDoppelgangerHover;
    }
    else if (isPersonNode(n) && !isNodeSelected(n.id)) {
      n._my.p._doppelgangers.forEach(d =>
      {
        // d._graphEdge.hidden = hidden;
        d._graphEdge.color = hidden ? settings.edgeColorDoppelganger : settings.edgeColorDoppelgangerHover;
      });
    }
  }
  e.data.enter.nodes.forEach(n =>
  {
    if (isPersonNode(n) || isDoppelgangerNode(n))  {
      showHideDoppelgangerEdges(n, false);
      n.label = n._my.p.get_longDisplayString();
      hoverTimeouts[n._my.p.t] = setTimeout(() => {
        console.log('long hovered to show details');
        delete hoverTimeouts[n._my.p.t];
        n.label = n._my.p.get_longDetailedDisplayString();
        s.refresh();
      }, settings.extendedLabelHoverDelay);
    }
  });
  e.data.leave.nodes.forEach(n =>
  {
    if (isPersonNode(n) || isDoppelgangerNode(n))  {
      showHideDoppelgangerEdges(n, true);
      if (n._my.p.t in hoverTimeouts) {
        clearTimeout(hoverTimeouts[n._my.p.t]);
        delete hoverTimeouts[n._my.p.t];
      }
      n.label = getPersonPreviewDisplayString(n._my.p);
    }
  });

  if (e.data.current.nodes.length) {
    s.settings('enableEdgeHovering', false);
  }
  else {
    s.settings('enableEdgeHovering', true);
  }
  s.refresh();
});

if (currentUserCanEdit()) {

let cdcNode = clickDoubleClick(
  e =>
  {
    if (startedWith_coordinatesUpdated) {
      console.log('skip clickNode during coordinatesUpdated');
      return;
    }
    if (startedWith_drag) {
      console.log('skip clickNode during drag');
      return;
    }

    console.log(['clickNode', e]);
    let n = e.data.node;
    if (!isPersonNode(n) && !isDoppelgangerNode(n)) {
      return;
    }

    let n_id = n.id;
    if (!multipleKeyPressed(e)) {
      deselectAll(null, false, [n_id]);
      activeState.addNodes(n_id);
      s.refresh();
      showPersonInfo(n);
    }
    else {
      activeState.addNodes(n_id);
      s.refresh();
      let numNodes = activeState.nodes().length;
      let numEdges = activeState.edges().length;
      if (numNodes === 2 && numEdges === 0) {
        if (permissions.CREATE_CONNECTIONS) {
          startNewConnection();
        }
      }
      else if (numNodes === 1 && numEdges === 1) {
        if (permissions.CREATE_CONNECTIONS) {
          startNewChildConnection();
        }
      }
      else if (numEdges > 0 && numNodes > 1) {
        deselectConnections();
      }
    }
  },
  e => {
    if (multipleKeyPressed(e))
      event_findRelationship(e);
    else
      event_selectPersonAndDirectRelatives(e);
  });

s.bind('clickNode', cdcNode.click.bind(cdcNode));
s.bind('doubleClickNode', cdcNode.doubleClick.bind(cdcNode));

s.bind('clickEdge', e =>
{
  let ed = e.data.edge;
  if (isDoppelgangerConnectionEdge(ed)) {
    return;
  }
  let e_id = ed.id;
  if (!multipleKeyPressed(e)) {
    deselectAll(null, false, [e_id]);
    activeState.addEdges(e_id);
    s.refresh();
    showConnectionInfo(ed);
  }
  else {
    deselectConnections(null, false, [e_id]);
    activeState.addEdges(e_id);
    s.refresh();
    let numNodes = activeState.nodes().length;
    let numEdges = activeState.edges().length;
    if (numNodes === 1) {
      if (permissions.CREATE_CONNECTIONS) {
        startNewChildConnection();
      }
    }
    else if (numNodes > 1) {
      deselectPersons();
    }
  }
});

let cdcStage = clickDoubleClick(
  e =>
  {
    if (startedWith_coordinatesUpdated) {
      console.log('skip clickStage during coordinatesUpdated');
      startedWith_coordinatesUpdated = false;
      return;
    }
    if (startedWith_drag || e.data.captor.isDragging) {
      console.log('skip clickStage during drag');
      return;
    }

    console.log(['clickStage', e]);
    if (!multipleKeyPressed(e)) {
      console.log('deselect all');
      deselectAll();
    }
  },
  e =>
  {
    console.log(['doubleClick', e]);
    if (permissions.CREATE_PERSONS) {
      startNewPerson(e);
    }
  });

s.bind('clickStage', cdcStage.click.bind(cdcStage));
s.bind('doubleClickStage', cdcStage.doubleClick.bind(cdcStage));

let startedWith_coordinatesUpdated = false;
let startedWith_drag = false;
s.bind('coordinatesUpdated', e =>
{
  if (startedWith_drag) {
    console.log('skip coordinatesUpdated during drag');
    return;
  }
  // console.log(['coordinatesUpdated', e]);
  clearTimeout(startedWith_coordinatesUpdated);
  startedWith_coordinatesUpdated = setTimeout(() => { startedWith_coordinatesUpdated = false; }, 1000);

  cameraMoved(e);
});

let dragActiveNodes = [];
let dragActiveNodeIds = [];
function prepareMoveNodes(refNode)
{
  let nodes = activeState.nodes();
  if (nodes.length > 1 && nodes.some(n => n.id === refNode.id)) {
    nodes.forEach(n => {
      n._my.tmp_x = n.x;
      n._my.tmp_y = n.y;
      dragActiveNodes.push(n);
      dragActiveNodeIds.push(n.id);
    });
    activeState.dropNodes(dragActiveNodeIds);
    activeState.addNodes(refNode.id);
  }
}
function restoreRelativeMoveNodePositions(finish)
{
  if (dragActiveNodes.length) {
    let refNode = activeState.nodes()[0];
    if (finish)
      alignToGrid(refNode);
    let dx = refNode.x - refNode._my.tmp_x,
        dy = refNode.y - refNode._my.tmp_y;
    dragActiveNodes.forEach(n => {
      if (n.id !== refNode.id) {
        n.x = n._my.tmp_x + dx;
        n.y = n._my.tmp_y + dy;
      }
      if (finish) {
        delete n._my.tmp_x;
        delete n._my.tmp_y;
      }
    });
    if (finish) {
      activeState.addNodes(dragActiveNodeIds);
      dragActiveNodes = [];
      dragActiveNodeIds = [];
    }
    else {
      moveChildConnectionNodes(dragActiveNodes);
      s.refresh();
    }
  }
}

dragListener.bind('startdrag', e =>
{
  if (multipleKeyPressed(e) && permissions.EDIT_PERSONS) {
    console.log(['startdrag', e]);
    prepareMoveNodes(e.data.node);
  }
  else {
    console.log('deactivate dragging');
    dragListener.bind('dragend', () => {
      console.log('reactivate dragging');
      dragListener.enable();
    });
    dragListener.disable();
  }
});
dragListener.bind('drag', e =>
{
  // console.log(['drag', e]);
  clearTimeout(startedWith_drag);
  startedWith_drag = setTimeout(() => { startedWith_drag = false; }, 1000);
  restoreRelativeMoveNodePositions(false);
});
dragListener.bind('drop', e =>
{
  console.log(['drop', e]);
  restoreRelativeMoveNodePositions(true);
  movePersons(e.data.node.id, true, true, false, true, false, true);
});

let lasso = new sigma.plugins.lasso(s, s.renderers[0], {
  strokeStyle: 'black',
  lineWidth: 0,
  fillWhileDrawing: true,
  fillStyle: 'rgba(0, 0, 0, 0.03)',
  cursor: 'crosshair'
});
window.addEventListener('keydown', e =>
{
  // console.log(e);
  if (e.ctrlKey && e.shiftKey) {
    lasso.activate();
  }
});
window.addEventListener('keyup', e =>
{
  // console.log(e);
  if (!e.ctrlKey || !e.shiftKey) {
    lasso.deactivate();
  }
});
lasso.bind('selectedNodes', e =>
{
  let nodes = e.data;
  activeState.dropEdges();
  activeState.addNodes(nodes.map(n => n.id).filter(n_id => !isChildConnectionNodeId(n_id)));
  s.refresh();
});

}
else { // only viewing when an auto layout is used

  let cdcNode = clickDoubleClick(
    event_selectPersonAndShowInfo,
    e => {
      if (multipleKeyPressed(e))
        event_findRelationship(e);
      else
        event_selectPersonAndDirectRelatives(e);
    }
  );
  s.bind('clickNode', cdcNode.click.bind(cdcNode));
  s.bind('doubleClickNode', cdcNode.doubleClick.bind(cdcNode));

  bindCommonViewerEvents();

}
