;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.canvas.hovers');

  /**
   * This hover renderer will basically display the label with a background.
   *
   * @param  {object}                   node     The node object.
   * @param  {CanvasRenderingContext2D} context  The canvas context.
   * @param  {configurable}             settings The settings function.
   */
  sigma.canvas.hovers.def = function(node, context, settings) {
    if (node.hidden) return;
    var x,
        y,
        w,
        h,
        e,
        fontStyle = settings('hoverFontStyle') || settings('fontStyle'),
        prefix = settings('prefix') || '',


        size = node[prefix + 'size'] || 1,
        borderSize = node.hover_border_size || settings('nodeHoverBorderSize') || 0,
        activeBorderSize = node.active_hover_border_size || settings('nodeActiveHoverBorderSize') || borderSize,
        outerBorderSize = node.hover_outer_border_size || settings('nodeHoverOuterBorderSize') || 0,
        activeOuterBorderSize = node.active_hover_outer_border_size || settings('nodeActiveHoverOuterBorderSize') || outerBorderSize,
        color = settings('nodeHoverColor') === 'default'
          ? settings('defaultNodeHoverColor')
          : (node.hover_color || settings('defaultNodeHoverColor')),
        activeColor = settings('nodeActiveHoverColor') === 'default'
          ? settings('defaultNodeActiveHoverColor')
          : (node.active_hover_color || settings('defaultNodeActiveHoverColor') || color),
	      borderColor = settings('nodeHoverBorderColor') === 'default'
          ? settings('defaultNodeHoverBorderColor')
          : (node.hover_border_color || settings('defaultNodeHoverBorderColor') || color),
	      outerBorderColor = settings('nodeHoverOuterBorderColor') === 'default'
          ? settings('defaultNodeHoverOuterBorderColor')
          : (node.hover_outer_border_color || settings('defaultNodeHoverOuterBorderColor') || borderColor),
	      activeBorderColor = settings('nodeActiveHoverBorderColor') === 'default'
          ? settings('defaultNodeActiveHoverBorderColor')
          : (node.active_hover_border_color || settings('defaultNodeActiveHoverBorderColor') || borderColor),
	      activeOuterBorderColor = settings('nodeActiveHoverOuterBorderColor') === 'default'
          ? settings('defaultNodeActiveHoverOuterBorderColor')
          : (node.active_hover_outer_border_color || settings('defaultNodeActiveHoverOuterBorderColor') || activeBorderColor || outerBorderColor),


        alignment = node.labelAlignment || settings('labelAlignment'),
        fontSize = (settings('labelSize') === 'fixed') ?
          settings('defaultLabelSize') :
          settings('labelSizeRatio') * size,
        maxLineLength = settings('maxNodeLabelLineLength') || 0,
        level = settings('nodeHoverLevel'),
        lines = getLines(node.label, maxLineLength);

    if (alignment !== 'center') {
      prepareLabelBackground(context);
      drawLabelBackground(alignment, context, fontSize, node, lines, maxLineLength);
    }

    // Shadow:
    if (level) {
      sigma.utils.canvas.setLevel(level, context);
    }

    // Node:
    var nodeRenderer = sigma.canvas.nodes[node.type] || sigma.canvas.nodes.def;
    nodeRenderer(node, context, settings,
      {
        borderSize: borderSize,
        activeBorderSize: activeBorderSize,
        outerBorderSize: outerBorderSize,
        activeOuterBorderSize: activeOuterBorderSize,
        color: color,
        activeColor: activeColor,
        borderColor: borderColor,
        outerBorderColor: outerBorderColor,
        activeBorderColor: activeBorderColor,
        activeOuterBorderColor: activeOuterBorderColor,
      });

    // reset shadow
    if (level) {
      sigma.utils.canvas.resetLevel(context);
    }

    if (alignment === 'center') {
      prepareLabelBackground(context);
      drawLabelBackground(alignment, context, fontSize, node, lines, maxLineLength);
    }

    // Display the label:
    if (typeof node.label === 'string') {
      context.fillStyle = (settings('labelHoverColor') === 'node') ?
        (node.color || defaultNodeColor) :
        settings('defaultLabelHoverColor');

      var labelOffsetX = 0,
          labelOffsetY = fontSize / 3,
          shouldRender = true,
          labelWidth;
      context.textAlign = "center";

      switch (alignment) {
        case 'bottom':
          labelOffsetY = + size + 4 * fontSize / 3;
          break;
        case 'center':
          break;
        case 'left':
          context.textAlign = "right";
          labelOffsetX = - size - borderSize - outerBorderSize - 3;
          break;
        case 'top':
          labelOffsetY = - size / 2 - (lines.length * 3) * fontSize / 3;
          break;
        case 'constrained':
          labelWidth = sigma.utils.canvas.getTextWidth(node.label);
          if (labelWidth > (size + fontSize / 3) * 2) {
            shouldRender = false;
          }
          break;
        case 'inside':
          labelWidth = sigma.utils.canvas.getTextWidth(node.label);
          if (labelWidth <= (size + fontSize / 3) * 2) {
            break;
          }
        /* falls through*/
        case 'right':
        /* falls through*/
        default:
          labelOffsetX = size + borderSize + outerBorderSize + 3;
          context.textAlign = "left";
          break;
      }

      if (shouldRender) {
        var baseX = node[prefix + 'x'] + labelOffsetX,
            baseY = Math.round(node[prefix + 'y'] + labelOffsetY);

        for (var i = 0; i < lines.length; ++i) {
          context.fillText(lines[i], baseX, baseY + i * (fontSize + 1));
        }
      }
    }

    function prepareLabelBackground(context) {
      context.font = (fontStyle ? fontStyle + ' ' : '') +
        fontSize + 'px ' + (settings('hoverFont') || settings('font'));

      context.beginPath();
      context.fillStyle = settings('labelHoverBGColor') === 'node' ?
        (node.color || defaultNodeColor) :
        settings('defaultHoverLabelBGColor');

      if (node.label && settings('labelHoverShadow')) {
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 8;
        context.shadowColor = settings('labelHoverShadowColor');
      }
    }

    function drawLabelBackground(alignment, context, fontSize, node, lines, maxLineLength) {
      var labelWidth =
        (maxLineLength > 1 && lines.length > 1) ?
        0.6 * maxLineLength * fontSize :
        sigma.utils.canvas.getTextWidth(
          context,
          settings('approximateLabelWidth'),
          fontSize,
          lines.reduce((maxLine, line) => (maxLine.length > line.length) ? maxLine : line)
        );

      var x = Math.round(node[prefix + 'x']),
          y = Math.round(node[prefix + 'y']),
          w = Math.round(labelWidth + 4),
          h = h = ((fontSize + 1) * lines.length) + 4,
          e = Math.round(size + fontSize * 0.25);

      if (node.label && typeof node.label === 'string') {
        // draw a rectangle for the label
        switch (alignment) {
          case 'constrained':
          /* falls through*/
          case 'center':
            y = Math.round(node[prefix + 'y'] - fontSize * 0.5 - 2);
            context.rect(x - w * 0.5, y, w, h);
            break;
          case 'left':
            x = Math.round(node[prefix + 'x'] + fontSize * 0.5 + 2);
            y = Math.round(node[prefix + 'y'] - fontSize * 0.5 - 2);
            w += size * 0.5 + fontSize * 0.5;

            context.moveTo(x, y + e);
            context.arcTo(x, y, x - e, y, e);
            context.lineTo(x - w - borderSize - outerBorderSize - e, y);
            context.lineTo(x - w - borderSize - outerBorderSize - e, y + h);
            context.lineTo(x - e, y + h);
            context.arcTo(x, y + h, x, y + h - e, e);
            context.lineTo(x, y + e);
            break;
          case 'top':
            context.rect(x - w * 0.5, y - e - h, w, h);
            break;
          case 'bottom':
            context.rect(x - w * 0.5, y + e, w, h);
            break;
          case 'inside':
            if (labelWidth <= e * 2) {
              // don't draw anything
              break;
            }
            // use default setting, falling through
          /* falls through*/
          case 'right':
          /* falls through*/
          default:
            x = Math.round(node[prefix + 'x'] - fontSize * 0.5 - 2);
            y = Math.round(node[prefix + 'y'] - fontSize * 0.5 - 2);
            w += size * 0.5 + fontSize * 0.5;

            context.moveTo(x, y + e);
            context.arcTo(x, y, x + e, y, e);
            context.lineTo(x + w + borderSize + outerBorderSize + e, y);
            context.lineTo(x + w + borderSize + outerBorderSize + e, y + h);
            context.lineTo(x + e, y + h);
            context.arcTo(x, y + h, x, y + h - e, e);
            context.lineTo(x, y + e);
            break;
        }
      }

      context.closePath();
      context.fill();

      sigma.utils.canvas.resetLevel(context);
    }

    /**
     * Split a text into several lines. Each line won't be longer than the specified maximum length.
     * @param {string}  text            Text to split
     * @param {number}  maxLineLength   Maximum length of a line. A value <= 1 will be treated as "infinity".
     * @returns {Array<string>}         List of lines
     */
    function getLines(text, maxLineLength) {
      if (text == null) {
        return [];
      }

      if (maxLineLength <= 1) {
        return text.split('\n');
      }

      var words = text.split(' '),
        lines = [],
        lineLength = 0,
        lineIndex = -1,
        lineList = [],
        lineFull = true;

      for (var i = 0; i < words.length; ++i) {
        if (lineFull) {
          if (words[i].length > maxLineLength) {
            var parts = splitWord(words[i], maxLineLength);
            for (var j = 0; j < parts.length; ++j) {
              lines.push([parts[j]]);
              ++lineIndex;
            }
            lineLength = parts[parts.length - 1].length;
          } else {
            lines.push([words[i]
            ]);
            ++lineIndex;
            lineLength = words[i].length + 1;
          }
          lineFull = false;
        } else if (lineLength + words[i].length <= maxLineLength) {
          lines[lineIndex].push(words[i]);
          lineLength += words[i].length + 1;
        } else {
          lineFull = true;
          --i;
        }
      }

      for (i = 0; i < lines.length; ++i) {
        lineList.push(lines[i].join(' '))
      }

      return lineList;
    }

    /**
     * Split a word into several lines (with a '-' at the end of each line but the last).
     * @param {string} word       Word to split
     * @param {number} maxLength  Maximum length of a line
     * @returns {Array<string>}   List of lines
     */
    function splitWord(word, maxLength) {
      var parts = [];

      for (var i = 0; i < word.length; i += maxLength - 1) {
        parts.push(word.substr(i, maxLength - 1) + '-');
      }

      var lastPartLen = parts[parts.length - 1].length;
      parts[parts.length - 1] = parts[parts.length - 1].substr(0, lastPartLen - 1) + ' ';

      return parts;
    }
  };
}).call(this);
