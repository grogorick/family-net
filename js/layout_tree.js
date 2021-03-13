function TreeLayout()
{
  this.settings = {
    nodeSpacingX: 100,
    nodeSpacingY: 100,
    nodeSpacingYPerYear: 100 / 20,
    yearsPerGridLine: 100
  };

  this.useYearBasedY = urlParams.has('yearBased');

  this.apply = (p0_t = null) =>
  {
    if (data.graph.persons.length) {
      console.log('autolayout 1 start');
      this.hideAll();

      this.p0 = null;
      if (p0_t) {
        this.p0 = getDataPerson(p0_t);
      }
      if (this.p0 === null) {
        this.p0 = data.graph.persons[0];
        this.p0._graphNode.x = 0;
        this.p0._graphNode.y = 0;
      }

      console.log('prepare');
      this.prepare();

      console.log('layout for "' + getPersonFullName(this.p0) + '"');
      console.log(this.p0);
      this.p0._graphNode.hidden = false;
      this.layout(this.p0);

      if (this.useYearBasedY) {
        console.log('year grid');
        this.grid.resize();
        this.grid.render();
      }

      console.log('autolayout 1 done');
      activeState.addNodes(this.p0.t);
      s.refresh();
    }
  };

  if (this.useYearBasedY) {
    this.grid = {};

    this.grid.canvas = document.createElement('canvas');
    this.grid.canvas.id = 'layout-tree';
    graphElement.appendChild(this.grid.canvas);

    this.grid.resize = () =>
    {
      this.grid.canvas.width = window.innerWidth;
      this.grid.canvas.height = window.innerHeight;
    };
    s.bind('resize', this.grid.resize);

    this.grid.ctx = this.grid.canvas.getContext("2d");
    this.grid.render = () =>
    {
      let p0_year = splitDate(this.p0.b)[0];
      if (!p0_year) {
        return;
      }
      this.grid.ctx.clearRect(0, 0, this.grid.canvas.width, this.grid.canvas.height);
      let p0 = getScreenPositionFromGraphPosition(this.p0._graphNode.x, this.p0._graphNode.y);
      let p1 = getScreenPositionFromGraphPosition(this.p0._graphNode.x, this.p0._graphNode.y + this.settings.nodeSpacingYPerYear * this.settings.yearsPerGridLine);
      let stepY = p1.y - p0.y;

      let baseYear = Math.floor(p0_year / this.settings.yearsPerGridLine) * this.settings.yearsPerGridLine;
      let baseY = p0.y - stepY * (p0_year - baseYear) / this.settings.yearsPerGridLine;

      let ypgl = this.settings.yearsPerGridLine;
      [ { initY: baseY,         incY: y => y - stepY, initYear: baseYear,        incYear: -ypgl, check: y => 0 < y },
        { initY: baseY + stepY, incY: y => y + stepY, initYear: baseYear + ypgl, incYear:  ypgl, check: y => y < this.grid.canvas.height }
      ].forEach(dir =>
      {
        let year = dir.initYear;
        let y = dir.initY;
        for (; dir.check(y); y = dir.incY(y)) {
          this.grid.drawLine(year, y);
          year += dir.incYear;
        }
      });
    };

    this.grid.drawLine = (year, y) =>
    {
      let yearStr = year.toString();
      let fontSize = 12;
      this.grid.ctx.font = fontSize + 'pt Arial';
      this.grid.ctx.fillStyle = '#aaa';
      let textWidth = this.grid.ctx.measureText(yearStr).width;
      this.grid.ctx.fillText(yearStr, 10, y + fontSize / 2);

      let textOffset = 10 + textWidth * 1.5;
      let width = this.grid.canvas.width - textOffset;
      let x1 = textOffset;
      let x2 = this.grid.canvas.width;
      let gradient = this.grid.ctx.createLinearGradient(x1, 0, x2, 0);
      gradient.addColorStop(0, '#ddd');
      gradient.addColorStop(.1, '#f5f5f5');
      gradient.addColorStop(.9, '#f5f5f5');
      gradient.addColorStop(1, '#ddd');
      this.grid.ctx.beginPath();
      this.grid.ctx.moveTo(x1, y);
      this.grid.ctx.lineTo(x2, y);
      this.grid.ctx.strokeStyle = gradient;
      this.grid.ctx.lineWidth = 1;
      this.grid.ctx.stroke();
    }

    s.bind('coordinatesUpdated', this.grid.render);
  }

  this.hideAll = () =>
  {
    data.graph.persons.forEach(p => p._graphNode.hidden = true);
    data.graph.connections.forEach(c => c._graphEdge.hidden = true);
    s.refresh();
  };

  this.prepare = () =>
  {
    data.graph.persons.forEach(p => p.layout_tree = {});
    this.prepareUp(this.p0);
    this.prepareDown(this.p0);
  };

  this.layout = p =>
  {
    tmpEdges.forEach(e => s.graph.dropEdge(e));
    tmpNodes.forEach(n => s.graph.dropNode(n));
    tmpEdges = [];
    tmpNodes = [];
    this.layoutUp(p);
    this.layoutDown(p);
  };

  this.prepareUp = p =>
  {
    if ('up' in p.layout_tree) {
      return;
    }
    p.layout_tree.up = {
      left: 0,
      right: 0
    };

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
    let x = p._graphNode.x;
    switch (p._parents.length) {
    case 0: break;
    case 1:
      let pp = p._parents[0];
      pp.p._graphNode.x = x;
      pp.p._graphNode.y = p._graphNode.y + (this.yearBasedOffsetY(p.b, pp.p.b) || -this.settings.nodeSpacingY);
      break;
    case 2:
      let pp1 = p._parents[0];
      let pp2 = p._parents[1];
      // pp1.pc._graphEdge.label = '' + (pp1.p.layout_tree.up.right + pp2.p.layout_tree.up.left + 2);
      let p1_y = this.yearBasedOffsetY(p.b, pp1.p.b);
      let p2_y = this.yearBasedOffsetY(p.b, pp2.p.b);
      if (p1_y === null || p2_y === null) {
        if (p1_y === null && p2_y === null) {
          p1_y = p2_y = -this.settings.nodeSpacingY;
        }
        else if (p1_y === null) {
          p1_y = p2_y;
        }
        else if (p2_y === null) {
          p2_y = p1_y;
        }
      }
      pp1.p._graphNode.x = x - (pp1.p.layout_tree.up.right + 1) * this.settings.nodeSpacingX;
      pp1.p._graphNode.y = p._graphNode.y + p1_y;

      pp2.p._graphNode.x = x + (pp2.p.layout_tree.up.left + 1) * this.settings.nodeSpacingX;
      pp2.p._graphNode.y = p._graphNode.y + p2_y;

      pp1.pc._graphEdge.hidden = false;
      break;
    }
    let bothParents = p._parents.length === 2;
    if (bothParents) {
      p._parents[0].pc._graphEdge.hidden = false;
    }
    p._parents.forEach((pp, i) =>
    {
      pp.p._graphNode.hidden = false;
      pp.c._graphEdge.hidden = false;
      this.layoutUp(pp.p);
      // pp.p._graphNode.label += '\n' + pp.p.layout_tree.up.left + '/' + pp.p.layout_tree.up.right + '\n' + pp.p._graphNode.x;

      if (pp.p._partners.length > 1) {
        addTmpLine(pp.p, 'partners', { x: (i * 2 - 1) * this.settings.nodeSpacingY / 2, y: 0 }, 'Weitere Partner von ' + getPersonRufname(pp.p));
      }
      if (pp.p._children.length > 1) {
        addTmpLine(pp.p, 'children', { x: 0, y: this.settings.nodeSpacingY / 2 }, 'Weitere Kinder von ' + getPersonRufname(pp.p));
      }
    });
    if (bothParents) {
      moveChildConnectionNodes([p._parents[0].p._graphNode]);
      p._graphNode.x = p._parents[0].c._graphCCNode.x;
      // p._parents[0].c._graphCCNode.x = p._graphNode.x;
    }
  };

  this.prepareDown = (p, reversePartnersAndChildren = true) =>
  {
    if ('down' in p.layout_tree) {
      return;
    }
    let down = p.layout_tree.down = {
      left: 0,
      right: 0,
      childrenLeft: 0,
      childrenRight: 0,
      partnersLeft: 0,
      partnersRight: 0,
      children: minus1(p._children.length),
      width: 0,
      reversePartnersAndChildren: reversePartnersAndChildren
    };

    let childIdx = 0,
        firstLeft = null,
        lastRight = 0;
    let tmpChildren = p._children.slice(0);
    let prepareChild = cp =>
    {
      tmpChildren.splice(tmpChildren.findIndex(tmpCp => tmpCp.p.t === cp.p.t), 1);
      this.prepareDown(cp.p, childIdx < p._children.length / 2);
      cp.p.layout_tree.down.childIdx = childIdx;
      down.children += cp.p.layout_tree.down.width;
      if (firstLeft === null) {
        firstLeft = cp.p.layout_tree.down.left;
      }
      lastRight = cp.p.layout_tree.down.right;
      ++childIdx;
    };
    let tmpPartners = p.layout_tree.down.reversePartnersAndChildren ? p._partners.slice(0).reverse() : p._partners;
    tmpPartners.forEach(pp => p.layout_tree.down.reversePartnersAndChildren
      ? pp.c._children.slice(0).reverse().forEach(prepareChild)
      : pp.c._children.forEach(prepareChild));
    tmpChildren.forEach(prepareChild);
    if (firstLeft === null) {
      firstLeft = 0;
    }
    let childrenHalf = (down.children - firstLeft - lastRight) / 2;
    let partnerOffset = p._partners.length / 2;
    down.childrenLeft = childrenHalf + firstLeft;
    down.childrenRight = childrenHalf + lastRight;
    if (down.reversePartnersAndChildren) {
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

  this.layoutDown = p =>
  {
    // p._graphNode.label += '\n' + p.layout_tree.down.left + ' + ' + p.layout_tree.down.right + '\n' + p.layout_tree.down.childrenLeft + ' + ' + p.layout_tree.down.childrenRight + '\n' + p.layout_tree.down.width + ' / ' + p.layout_tree.down.children;
    // p._graphNode.label = getPersonRufname(p) + '\n' + p.layout_tree.down.childIdx + ' ' + p.layout_tree.down.reversePartnersAndChildren;
    p._partners.forEach((pp, i) =>
    {
      pp.p._graphNode.x = p._graphNode.x + (p.layout_tree.down.reversePartnersAndChildren ? -1 : 1) * (i + 1) * 2 * this.settings.nodeSpacingX;
      pp.p._graphNode.y = p._graphNode.y + (this.yearBasedOffsetY(p.b, pp.p.b) || 0);
      pp.p._graphNode.hidden = false;
      pp.c._graphEdge.hidden = false;
      // pp.p._graphNode.label = getPersonRufname(pp.p) + '\n' + i;

      if (pp.p._parents.length) {
        addTmpLine(pp.p, 'parents', { x: 0, y: -this.settings.nodeSpacingY / 2 }, 'Eltern von ' + getPersonRufname(pp.p));
      }
      if (pp.p._partners.length > 1) {
        addTmpLine(pp.p, 'partners', { x: (p.layout_tree.down.reversePartnersAndChildren ? -1 : 1) * this.settings.nodeSpacingY / 2, y: 0 }, 'Weitere Partner von ' + getPersonRufname(pp.p));
      }
      if (pp.p._children.length > pp.c._children.length) {
        addTmpLine(pp.p, 'children', { x: 0, y: this.settings.nodeSpacingY / 2 }, 'Weitere Kinder von ' + getPersonRufname(pp.p));
      }
    });
    let x = p._graphNode.x - p.layout_tree.down.childrenLeft * 2 * this.settings.nodeSpacingX;
    let tmpChildren = p._children.slice(0);
    let layoutChild = cp =>
    {
      tmpChildren.splice(tmpChildren.findIndex(tmpCp => tmpCp.p.t === cp.p.t), 1);
      cp.p._graphNode.x = x + cp.p.layout_tree.down.left * 2 * this.settings.nodeSpacingX;
      x += (cp.p.layout_tree.down.width + 1) * 2 * this.settings.nodeSpacingX;
      cp.p._graphNode.y = p._graphNode.y + (this.yearBasedOffsetY(p.b, cp.p.b) || this.settings.nodeSpacingY);
      cp.p._graphNode.hidden = false;
      cp.c._graphEdge.hidden = false;
      this.layoutDown(cp.p);
    };
    let tmpPartners = p.layout_tree.down.reversePartnersAndChildren ? p._partners.slice(0).reverse() : p._partners;
    tmpPartners.forEach(pp => p.layout_tree.down.reversePartnersAndChildren
      ? pp.c._children.slice(0).reverse().forEach(layoutChild)
      : pp.c._children.forEach(layoutChild));
    tmpChildren.forEach(layoutChild);
    moveChildConnectionNodes([p._graphNode]);
  };

  this.yearBasedOffsetY = (p1_date, p2_date) =>
  {
    if (!this.useYearBasedY) {
      return null;
    }
    let p1_year = splitDate(p1_date)[0];
    let p2_year = splitDate(p2_date)[0];
    if (!!p1_year && !!p2_year) {
      return (p2_year - p1_year) * this.settings.nodeSpacingYPerYear;
    }
    return null;
  };
}

function minus1(x)
{
  return x ? x - 1 : 0;
}

layouts['tree'] = new TreeLayout();

