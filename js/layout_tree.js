function TreeLayout()
{
  this.settings = {
    nodeSpacingX: 100,
    nodeSpacingY: 100
  };

  this.prepared = false;

  this.apply = (p0_t = null) =>
  {
    if (data.graph.persons.length) {
      console.log('autolayout 1 start');
      this.hideAll();

      console.log('prepare');
      if (!this.prepared) {
        this.prepare();
      }

      let p0 = null;
      if (p0_t) {
        p0 = getDataPerson(p0_t);
      }
      else {
        p0 = data.graph.persons[0];
        p0._graphNode.x = 0;
        p0._graphNode.y = 0;
      }
      console.log('layout for "' + p0.n + '"');
      p0._graphNode.hidden = false;
      this.layout(p0);

      // let left = p0._graphNode.x - p0.layout_tree.up.left;
      // let right = p0._graphNode.x + p0.layout_tree.up.right;
      // for (let x = left; x <= right; x += this.settings.nodeSpacingX) {
      //   [-1000, 500].forEach((y, j) =>
      //   {
      //     s.graph.addNode({
      //       id: 'grid ' + x + ' ' + j,
      //       x: x,
      //       y: y,
      //       size: .1,
      //       color: settings.edgeColor }); });
      //   s.graph.addEdge({
      //     id: 'grid ' + x,
      //     source: 'grid ' + x + ' 0',
      //     target: 'grid ' + x + ' 1',
      //     size: settings.edgeSize,
      //     type: 'line',
      //     color: '#eee' });
      // }

      setTimeout(() => activeState.addNodes(p0.t), 500);
      
      s.refresh();
      console.log('autolayout 1 done');
    }
  };

  this.hideAll = () =>
  {
    data.graph.persons.forEach(p => p._graphNode.hidden = true);
    data.graph.connections.forEach(c => c._graphEdge.hidden = true);
    s.refresh();
  };

  this.prepare = () =>
  {
    data.graph.persons.forEach(p => { p.layout_tree = {
      up: { left: 0, right: 0 },
      down: { left: 0, right: 0, childrenLeft: 0, childrenRight: 0, partners: 0, children: 0, width: 0 }};
    });
    data.graph.persons.forEach(p =>
    {
      this.prepareUp(p);
    });
    data.graph.persons.forEach(p =>
    {
      this.prepareDown(p);
    });
    this.prepared = true;
  };

  this.layout = p =>
  {
    this.layoutUp(p);
    this.layoutDown(p);
  };

  this.prepareUp = p =>
  {
    if ('done' in p.layout_tree.up) {
      return;
    }
    p.layout_tree.up.done = true;
    switch (p._parents.length) {
    case 0: break;
    case 1:
      let pp = p._parents[0].p;
      this.prepareUp(pp);
      p.layout_tree.up.left = pp.layout_tree.up.left;
      p.layout_tree.up.right = pp.layout_tree.up.right;
      break;
    case 2:
      p._parents.forEach(pp => this.prepareUp(pp.p));
      let pp1 = p._parents[0].p;
      let pp2 = p._parents[1].p;
      p.layout_tree.up.left = pp1.layout_tree.up.left + pp1.layout_tree.up.right + 1;
      p.layout_tree.up.right = pp2.layout_tree.up.left + pp2.layout_tree.up.right + 1;
      break;
    }
  };

  this.layoutUp = p =>
  {
    let x = p._graphNode.x,
        y = p._graphNode.y - this.settings.nodeSpacingY;
    switch (p._parents.length) {
    case 0: break;
    case 1:
      let pp = p._parents[0];
      pp.p._graphNode.x = x;
      pp.p._graphNode.y = y;
      break;
    case 2:
      let pp1 = p._parents[0];
      let pp2 = p._parents[1];
      // pp1.pc._graphEdge.label = '' + (pp1.p.layout_tree.up.right + pp2.p.layout_tree.up.left + 2);
      pp1.p._graphNode.x = x - (pp1.p.layout_tree.up.right + 1) * this.settings.nodeSpacingX;
      pp1.p._graphNode.y = y;

      pp2.p._graphNode.x = x + (pp2.p.layout_tree.up.left + 1) * this.settings.nodeSpacingX;
      pp2.p._graphNode.y = y;

      pp1.pc._graphEdge.hidden = false;
      break;
    }
    let bothParents = p._parents.length === 2;
    if (bothParents) {
      p._parents[0].pc._graphEdge.hidden = false;
    }
    p._parents.forEach(pp =>
    {
      pp.p._graphNode.hidden = false;
      pp.c._graphEdge.hidden = false;
      this.layoutUp(pp.p);
      // pp.p._graphNode.label += '\n' + pp.p.layout_tree.up.left + '/' + pp.p.layout_tree.up.right + '\n' + pp.p._graphNode.x;
    });
    if (bothParents) {
      moveChildConnectionNodes([p._parents[0].p._graphNode]);
      // p._graphNode.x = p._parents[0].c._graphCCNode.x;
      p._parents[0].c._graphCCNode.x = p._graphNode.x;
    }
  };

  this.prepareDown = (p, invertPartners = true) =>
  {
    let down = p.layout_tree.down;
    if ('done' in down) {
      return;
    }
    down.done = true;
    down.invertPartners = invertPartners;
    down.children = minus1(p._children.length);
    let childIdx = 0,
        firstLeft = null,
        lastRight = 0;
    p._partners.forEach(pp =>
    {
      pp.c._children.forEach(cp =>
      {
        this.prepareDown(cp.p, (childIdx += 2) <= p._children.length);
        down.children += cp.p.layout_tree.down.width;
        if (firstLeft === null) {
          firstLeft = cp.p.layout_tree.down.left;
        }
        lastRight = cp.p.layout_tree.down.right;
      });
    });
    if (firstLeft === null) {
      firstLeft = 0;
    }
    let childrenHalf = (down.children - firstLeft - lastRight) / 2;
    let partnerOffset = p._partners.length / 2;
    down.childrenLeft = childrenHalf + firstLeft;
    down.childrenRight = childrenHalf + lastRight;
    if (down.invertPartners) {
      down.childrenLeft += partnerOffset;
      down.childrenRight -= partnerOffset;
      down.left = Math.max(down.childrenLeft, p._partners.length);
      down.right = Math.max(0, down.childrenRight);
    }
    else {
      down.childrenLeft -= partnerOffset;
      down.childrenRight += partnerOffset;
      down.left = Math.max(0, down.childrenLeft);
      down.right = Math.max(down.childrenRight, p._partners.length);
    }
    down.width = down.left + down.right;
  }

  this.layoutDown = (p, test = '') =>
  {
    // p._graphNode.label += '\n' + p.layout_tree.down.left + ' + ' + p.layout_tree.down.right + '\n' + p.layout_tree.down.childrenLeft + ' + ' + p.layout_tree.down.childrenRight + '\n' + p.layout_tree.down.width + ' / ' + p.layout_tree.down.children;
    p._partners.forEach((pp, i) =>
    {
      pp.p._graphNode.x = p._graphNode.x + (p.layout_tree.down.invertPartners ? -1 : 1) * (i + 1) * 2 * this.settings.nodeSpacingX;
      pp.p._graphNode.y = p._graphNode.y;
      pp.p._graphNode.hidden = false;
      pp.c._graphEdge.hidden = false;
    });
    moveChildConnectionNodes([p._graphNode]);
    let x = p._graphNode.x - p.layout_tree.down.childrenLeft * 2 * this.settings.nodeSpacingX;
    let y = p._graphNode.y + this.settings.nodeSpacingY;
    let tmpPartners = p.layout_tree.down.invertPartners ? p._partners.reverse() : p._partners;
    tmpPartners.forEach(pp =>
    {
      pp.c._children.forEach(cp =>
      {
        cp.p._graphNode.x = x + cp.p.layout_tree.down.left * 2 * this.settings.nodeSpacingX;
        x += (cp.p.layout_tree.down.width + 1) * 2 * this.settings.nodeSpacingX;
        cp.p._graphNode.y = y;
        cp.p._graphNode.hidden = false;
        cp.c._graphEdge.hidden = false;
        this.layoutDown(cp.p, test + ' ');
      });
    });
  };
}

function minus1(x)
{
  return x ? x - 1 : 0;
}

layouts['tree'] = new TreeLayout();

