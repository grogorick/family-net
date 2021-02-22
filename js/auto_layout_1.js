settings_1 = {
  nodeSpacingX: 100,
  nodeSpacingY: 100
};

function AutoLayout1()
{
  this.apply = () =>
  {
    if (data.graph.persons.length) {
      console.log('autolayout 1 start');
      this.hideAll();

      let p0 = data.graph.persons[0];
      p0._graphNode.x = 0;
      p0._graphNode.y = 0;
      p0._graphNode.hidden = false;
      console.log('prepare');
      this.prepare(p0);
      console.log('layout');
      this.layout(p0);

      // let left = p0._graphNode.x - p0.al1.left;
      // let right = p0._graphNode.x + p0.al1.right;
      // for (let x = left; x <= right; x += settings_1.nodeSpacingX) {
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

  this.prepare = p =>
  {
    p.al1 = { left: 0, right: 0 };
    switch (p._parents.length) {
    case 0: break;
    case 1:
      let pp = p._parents[0].p;
      this.prepare(pp);
      p.al1.left = pp.al1.left;
      p.al1.right = pp.al1.right;
      break;
    case 2:
      p._parents.forEach(pp => this.prepare(pp.p));
      let pp1 = p._parents[0].p;
      let pp2 = p._parents[1].p;
      p.al1.left = pp1.al1.left + pp1.al1.right + settings_1.nodeSpacingX;
      p.al1.right = pp2.al1.left + pp2.al1.right + settings_1.nodeSpacingX;
      break;
    }
  };

  this.layout = p =>
  {
    let x = p._graphNode.x,
        y = p._graphNode.y - settings_1.nodeSpacingY;
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
      let distance = pp1.p.al1.right + pp2.p.al1.left + 2 * settings_1.nodeSpacingX;
      pp1.pc._graphEdge.label = distance.toString();
      pp1.p._graphNode.x = x - pp1.p.al1.right - settings_1.nodeSpacingX;
      pp1.p._graphNode.y = y;

      pp2.p._graphNode.x = x + pp2.p.al1.left + settings_1.nodeSpacingX;
      pp2.p._graphNode.y = y;

      pp1.pc._graphEdge.hidden = false;
      break;
    }
    if (p._parents.length === 2) {
      p._parents[0].pc._graphEdge.hidden = false;
    }
    p._parents.forEach(pp =>
    {
      pp.p._graphNode.hidden = false;
      pp.c._graphEdge.hidden = false;
      this.layout(pp.p);
      // pp.p._graphNode.label += '\n' + pp.p.al1.left + '/' + pp.p.al1.right + '\n' + pp.p._graphNode.x;
    });
    if (p._parents.length === 2) {
      moveChildConnectionNodes([p._parents[0].p._graphNode]);
      p._graphNode.x = p._parents[0].c._graphCCNode.x;
      //p._parents[0].c._graphCCNode.x = p._graphNode.x;
    }
  };
}

let autoLayout1 = new AutoLayout1();
callbacks.graphLoaded = autoLayout1.apply;

