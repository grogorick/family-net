;(function() {
  'use strict';

  sigma.utils.pkg('sigma.canvas.nodes');

  /**
   * The default node renderer. It renders the node as a simple disc.
   *
   * @param  {object}                   node     The node object.
   * @param  {CanvasRenderingContext2D} context  The canvas context.
   * @param  {configurable}             settings The settings function.
   * @param  {?object}                  options  Force optional parameters (e.g. color).
   */
  sigma.canvas.nodes.def = function(node, context, settings, options) {
    if (node.hidden) return;
    var o = options || {},
        prefix = settings('prefix') || '',
        x = node[prefix + 'x'],
        y = node[prefix + 'y'],
        imgCrossOrigin = settings('imgCrossOrigin') || 'anonymous',
        size = o.size || node[prefix + 'size'] || 1,
        borderSize = o.borderSize || node.border_size || settings('nodeBorderSize') || 0,
        activeBorderSize = o.activeBorderSize || node.active_border_size || settings('nodeActiveBorderSize') || borderSize,
        outerBorderSize = o.outerBorderSize || node.outer_border_size || settings('nodeOuterBorderSize') || 0,
        activeOuterBorderSize = o.activeOuterBorderSize || node.active_outer_border_size || settings('nodeActiveOuterBorderSize') || outerBorderSize,
        color = settings('nodeColor') === 'default'
          ? settings('defaultNodeColor')
          : (o.color || node.color || settings('defaultNodeColor')),
        activeColor = settings('nodeActiveColor') === 'default'
          ? settings('defaultNodeActiveColor')
          : (o.activeColor || node.active_color || settings('defaultNodeActiveColor') || color),
	      borderColor = settings('nodeBorderColor') === 'default'
          ? settings('defaultNodeBorderColor')
          : (o.borderColor || node.border_color || settings('defaultNodeBorderColor') || color),
	      activeBorderColor = settings('nodeActiveBorderColor') === 'default'
          ? settings('defaultNodeActiveBorderColor')
          : (o.activeBorderColor || node.active_border_color || settings('defaultNodeActiveBorderColor') || borderColor),
	      outerBorderColor = settings('nodeOuterBorderColor') === 'default'
          ? settings('defaultNodeOuterBorderColor')
          : (o.outerBorderColor || node.outer_border_color || settings('defaultNodeOuterBorderColor') || borderColor),
	      activeOuterBorderColor = settings('nodeActiveOuterBorderColor') === 'default'
          ? settings('defaultNodeActiveOuterBorderColor')
          : (o.activeOuterBorderColor || node.active_outer_border_color || settings('defaultNodeActiveOuterBorderColor') || activeBorderColor || outerBorderColor),
        level = node.active ? settings('nodeActiveLevel') : node.level;

    // Level:
    sigma.utils.canvas.setLevel(level, context);

    if (node.active) {
      color = activeColor;
      outerBorderSize = activeOuterBorderSize;
      outerBorderColor = activeOuterBorderColor;
      borderSize = activeBorderSize;
      borderColor = activeBorderColor;
    }

    // Outer Border:
    if (outerBorderSize > 0) {
      context.beginPath();
      context.fillStyle = outerBorderColor;
      context.arc(x, y, size + borderSize + outerBorderSize, 0, Math.PI * 2, true);
      context.closePath();
      context.fill();
    }

    // Border:
    if (borderSize > 0) {
      context.beginPath();
      context.fillStyle = borderColor;
      context.arc(x, y, size + borderSize, 0, Math.PI * 2, true);
      context.closePath();
      context.fill();
    }

    // Node Fill:
    if ((!node.active ||
      (node.active && settings('nodeActiveColor') === 'node')) &&
      node.colors &&
      node.colors.length) {

      // see http://jsfiddle.net/hvYkM/1/
      var i,
          l = node.colors.length,
          j = 1 / l,
          lastend = 0;

      for (i = 0; i < l; i++) {
        context.fillStyle = node.colors[i];
        context.beginPath();
        context.moveTo(x, y);
        context.arc(x, y, size, lastend, lastend + (Math.PI * 2 * j), false);
        context.lineTo(x, y);
        context.closePath();
        context.fill();
        lastend += Math.PI * 2 * j;
      }
      sigma.utils.canvas.resetLevel(context);
    }
    else {
      context.fillStyle = color;
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2, true);
      context.closePath();
      context.fill();

      sigma.utils.canvas.resetLevel(context);
    }

    // Image:
    if (node.image) {
      sigma.utils.canvas.drawImage(
        node, x, y, size, context, imgCrossOrigin, settings('imageThreshold')
      );
    }

    // Icon:
    if (node.icon) {
      sigma.utils.canvas.drawIcon(node, x, y, size, context, settings('iconThreshold'));
    }

  };
})();
