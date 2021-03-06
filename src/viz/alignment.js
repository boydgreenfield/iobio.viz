var alignment = function() {
	// Import base chart
	var base = require('./base.js')(),
		utils = require('../utils.js'),
		extend = require('extend');

	// Value transformers
	var directionValue = null;

	// Defaults
	var elemHeight = 4,
		orientation = 'down',
		events = [],
		tooltip;

	// Default Options
	var defaults = { };

	function chart(selection, opts) {
		// Merge defaults and options
		var options = {};
		extend(options, defaults, opts);

		// Call base chart
		base.call(this, selection, options);

		// Grab base functions for easy access
		var x = base.x(),
			y = base.y(),
			id = base.id();
			xValue = base.xValue(),
			yValue = base.yValue(),
			wValue = base.wValue(),
			yAxis = base.yAxis(),
			color = base.color(),
			transitionDuration = base.transitionDuration();

		// Change orientation of pileup
		if (orientation == 'down') {
			// swap y scale min and max
			y.range([y.range()[1],y.range()[0]]);
			// update y axis
			if(yAxis)
				selection.select(".iobio-y.iobio-axis").transition()
					.duration(0)
					.call(yAxis);
		}

		// Draw


		var g = selection.select('g.iobio-container').classed('iobio-alignment', true); // grab container to draw into (created by base chart)
		var aln = g.selectAll('.alignment')
				.data(selection.datum());

		// Enter
		aln.enter().append('g')
			.attr('id', function(d) { return id(d)})
			.attr('class', 'alignment')
			.attr('transform', function(d,i) {
				var translate = 'translate('+parseInt(x(xValue(d,i) + wValue(d,i)/2))+','+ parseInt(y(yValue(d,i))-elemHeight/2) + ')'
				if (directionValue && directionValue(d,i) == 'reverse')
					return translate + ' rotate(180)';
				else
					return translate;
			})
			.style('fill', color)
			.append('polygon')
				.attr('points', function(d) {

					// var rW = x(xValue(d)+wValue(d)) - x(xValue(d));
					var rH = elemHeight;
					// var arrW = Math.min(5, rW);

					if (directionValue) // draw arrow
						return ('-0.1,' + (-rH/2) +
								' 0,' + (-rH/2) +
								' 0.1,0' +
								' 0,' + (rH/2) +
								' -0.1,' + (rH/2));
					else // draw rectangle
						return ('-0.1,' + (-rH/2) +
								' 0,' + (-rH/2) +
								' 0,' + (rH/2) +
								' -0.1,' + (rH/2));
				})

		aln.exit()

		aln.transition()
			.duration(transitionDuration)
			.attr('transform', function(d,i) {
				var translate = 'translate('+parseInt(x(xValue(d,i) + wValue(d,i)/2))+','+ parseInt(y(yValue(d,i))-elemHeight/2) + ')'
				if (directionValue && directionValue(d,i) == 'reverse')
					return translate + ' rotate(180)';
				else
					return translate;
			})
			.style('fill', color);

		aln.select('polygon').transition()
			.duration(transitionDuration)
			.attr('points', function(d,i) {
				var rW = x(xValue(d,i)+wValue(d,i)) - x(xValue(d,i));
				var rH = elemHeight;
				var arrW = Math.min(5, rW);

				if (directionValue)
					return ((-rW/2) + ',' + (-rH/2) + ' '
						  + (rW/2-arrW) + ',' + (-rH/2) + ' '
						  + (rW/2) + ',0 '
						  + (rW/2-arrW) + ',' + (rH/2) + ' '
						  + (-rW/2) + ',' + (rH/2));
				else
					return ((-rW/2) + ',' + (-rH/2) + ' '
						  + (rW/2) + ',' + (-rH/2) + ' '
						  + (rW/2) + ',' + (rH/2) + ' '
						  + (-rW/2) + ',' + (rH/2));
			})

		// Add title on hover
	    if (tooltip) {
	    	var tt = d3.select('.iobio-tooltip')
	    	utils.tooltipHelper(g.selectAll('.alignment'), tt, tooltip);
	    }

	    // Attach events
		events.forEach(function(ev) {
			g.selectAll('.alignment').on(ev.event, ev.listener);
		})

	}
	// Rebind methods in 2d.js to this chart
	base.rebind(chart);

	/*
	 * Value accessor for getting the direction of the alignment
	 */
	chart.directionValue = function(_) {
		if (!arguments.length) return directionValue;
		directionValue = _;
		return chart;
	};

	/*
   	 * Specifies the orientation of the alignment. Can be 'up' or 'down'
   	 */
  	chart.orientation = function(_) {
    	if (!arguments.length) return orientation;
    	orientation = _;
    	return chart;
  	};

	/*
   	 * Set events on rects
   	 */
	chart.on = function(event, listener) {
		if (!arguments.length) return events;
		events.push( {'event':event, 'listener':listener})
		return chart;
	}

	/*
   	 * Set tooltip that appears when mouseover rects
   	 */
	chart.tooltip = function(_) {
		if (!arguments.length) return tooltip;
			tooltip = _;
			return chart;
	}

	return chart;
}

// Export alignment
module.exports = alignment;