let startedWith_coordinatesUpdated = 0;
let startedWith_drag = 0;
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
    let n_id = e.data.node.id;
    if (isChildConnectionNode(n_id)) {
      return;
    }

    if (!multipleKeyPressed(e)) {
      deselectAll(null, false, [n_id]);
      activeState.addNodes(n_id);
      s.refresh();
      showPersonInfo(n_id);
    }
    else if (currentUserCanEdit()) {
      activeState.addNodes(n_id);
      s.refresh();
      let numNodes = activeState.nodes().length;
      let numEdges = activeState.edges().length;
      if (numNodes === 2 && numEdges === 0) {
        startNewConnection();
      }
      else if (numNodes === 1 && numEdges === 1) {
        startNewChildConnection();
      }
      else if (numEdges > 0 && numNodes > 1) {
        deselectConnections();
      }
    }
  },
  e =>
  {
    if (!currentLayoutId) {
      selectDirectRelatives(e);
    }
    else {
      deselectAll();
      layouts[currentLayoutId].apply(e.data.node.id);
    }
  });

s.bind('clickNode', cdcNode.click.bind(cdcNode));
s.bind('doubleClickNode', cdcNode.doubleClick.bind(cdcNode));

s.bind('hovers', hoverPersons);

s.bind('clickEdge', e =>
{
  let e_id = e.data.edge.id;
  if (!multipleKeyPressed(e)) {
    deselectAll(null, false, [e_id]);
    activeState.addEdges(e_id);
    s.refresh();
    showConnectionInfo(e_id);
  }
  else if (currentUserCanEdit()) {
    deselectConnections(null, false, [e_id]);
    activeState.addEdges(e_id);
    s.refresh();
    let numNodes = activeState.nodes().length;
    let numEdges = activeState.edges().length;
    if (numNodes === 1 && numEdges === 1) {
      startNewChildConnection();
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
    deselectAll();
    if (currentUserCanEdit()) {
      startNewPerson(e);
    }
  });

s.bind('clickStage', cdcStage.click.bind(cdcStage));
s.bind('doubleClickStage', cdcStage.doubleClick.bind(cdcStage));

s.bind('coordinatesUpdated', e =>
{
  if (startedWith_drag) {
    console.log('skip coordinatesUpdated during drag');
    return;
  }
  // console.log(['coordinatesUpdated', e]);
  clearTimeout(startedWith_coordinatesUpdated);
  startedWith_coordinatesUpdated = setTimeout(() => { startedWith_coordinatesUpdated = false; }, 1000);

  if (currentUserCanEdit() && (logItemSelectedPreview === logItemSelectedMaster)) {
    cameraMoved(e);
  }
});

dragListener.bind('startdrag', e =>
{
  if (multipleKeyPressed(e)) {
    console.log(['startdrag', e]);
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
  movePersons(e.data.node.id, false, false, false, false, false, false); // move child nodes
});
dragListener.bind('drop', e =>
{
  console.log(['drop', e]);
  movePersons(e.data.node.id, true, true, false, true, true, true);
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
lasso.bind('selectedNodes', (e) =>
{
  let nodes = e.data;
  activeState.dropEdges();
  activeState.addNodes(nodes.map(n => n.id).filter(n_id => !isChildConnectionNode(n_id)));
  s.refresh();
});
