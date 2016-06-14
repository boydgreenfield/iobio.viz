/*

Usage:

 	var m = [15, 35, 25, 15],
        w = 230,
        h = 230,
        r = Math.min(w, h) / 2;

    var color = d3.scale.category20b();

    var pie = d3.layout.pie()
                       .sort(null)
                       .value(function(d,i) {return d.value});
    var references = [
      {name: 'chr1', value: +20},
      {name: 'chr2', value: +14},
      {name: 'chr3', value: +15},
      {name: 'chr4', value: +17},
      {name: 'chr5', value: +23},
      {name: 'chr6', value: +24},
      {name: 'chr7', value: +30}
    ];

    var selection = d3.select("#pie-viz").datum( pie(references) );
    var chart = iobio.viz.pieChooser()
        .radius(r)
        .innerRadius(r*.5)
        .padding(30)        
        .color( function(d,i) { 
          return color(i); 
        })
        .on("click", function(d,i) {
          console.log("chr clicked " + d );
        })
        .on("clickall", function(d,i) {
          console.log("click all " + d);
        })
    chart( selection );
*/
var pieChooser = function() {
	// Import base chart
	var base = require("./base.js")(),
		pie = require('./pie.js')(),
		utils = require('../utils.js'),
		extend = require('extend');

	// Defaults
	var events = [],
		eventMap = {},
		tooltip;

	// Default Options
	var defaults = {};

	var name = function(d) { return  d.data.name};

	var clickedSlice = null;
	var clickedSlices = [];

	var sliceApiSelected = null;
  	var arcs = null;
 	var radiusOffset;
  	var arc;	
  	var options;
  	var labels;
  	var text;

	function chart(selection, opts) {
		// Merge defaults and options
		options = {};
		extend(options, defaults, opts);

		arc = d3.svg.arc()
				    .innerRadius(chart.innerRadius())
				    .outerRadius(chart.radius());

		pie.radius(chart.radius())
	       .innerRadius(chart.innerRadius())
	       .padding(chart.padding())
	       .transitionDuration(chart.transitionDuration())
	       .color(chart.color())
	       .text( function(d,i) {return ""});

		pie(selection, options);


		arcs = selection.selectAll('.arc');

		arcs.append("text")
	        .attr("class", "chartlabel")
	        .attr("dy", ".35em")
	        .attr("transform", function(d) {
	          return "translate(" + chart._arcLabelPosition(d, .55) + ")";
	        })
	        .attr("text-anchor", "middle")
	        .style("pointer-events", "none")
	        .text(function(d,i) {
	          return name(d);
	        });

		// Attach events
		events.forEach(function(ev) {
			eventMap[ev.event] = ev.listener;
		})


 		arcs.on("mouseover", function(d, i) {
              d3.select(this).attr("cursor", "pointer");
              chart._selectSlice.call(this, d, i, null, true);

              d3.select(this).select("path")
                .style("stroke", "darkturquoise")
                .style("stroke-width", "2")
                .style("opacity", 1);

              var listener = eventMap["mouseover"];
              if (listener) {
              	listener.call(chart, d, i);
              }
              
            }) 
           .on("mouseout", function(d) {
				d3.select(this).attr("cursor", "default");
				if (clickedSlices.length == 0 && this != clickedSlice) {
				d3.select(this)
				  .select("path")
				  .transition()
				  .duration(150).attr("transform", "translate(0,0)"); 
				}
                  
              	d3.select(this).select("path")
                               .style("stroke-width", "0");

                var listener = eventMap["mouseout"];
              	if (listener) {
              		listener.call(chart, d, i);
              	}             

            })
           .on("click", function(d, i) {
              	chart._clickSlice(this, d, i, true);

              	var listener = eventMap["click"];
              	if (listener) {
              		listener.call(chart, d, i);
              	}   
            });


	    // ALL link inside of donut chart for selecting all pieces
	    var g = selection.select('.iobio-pie');
	    g.append("circle")
	      .attr("id", "all-circle")
	      .attr("cx", 0)
	      .attr("cy", 0)
	      .attr("r", 25)
	      .attr("stroke", 'lightgrey')
	      .attr("fill", 'transparent')
	      .on("mouseover", function(d) {
	        if (clickedSlices.length == 0) {
	          chart._selectAllCircle(true);               
	        }
	        d3.select(this).attr("cursor", "pointer");
	      })
	      .on("mouseout", function(d) {
	        if (clickedSlices.length == 0) {
	          chart._selectAllCircle(false);
	        }
	        d3.select(this).attr("cursor", "default");
	      })
		  .on("click", function(d) { 
		  		selection.select("circle#all-circle.selected").classed("selected", false);
		  		d3.select(this).classed("selected", true);
	          	chart._clickAllSlices(d);
	          	var listener = eventMap["clickall"];
	          	if (listener) {
	          		listener.call(chart, d);
	          	}   
	       })	     
	     g.append("text")
	        .attr("id", "all-text")
	        .attr("dy", ".35em")
	        .style("text-anchor", "middle")
	        .style("pointer-events", "none")
	        .attr("class", "inside")
	        .text(function(d) { return 'All'; });
	        
	        


	}
	// Rebind methods in pie.js to this chart
	base.rebind(chart);

	/*
   	 * Set events on arcs
   	 */
	chart.on = function(event, listener) {
		if (!arguments.length) {
			return events;
		} 
		events.push( {'event':event, 'listener':listener})
		return chart;
	}

	/*
   	 * Set tooltip that appears when mouseover arcs
   	 */
	chart.tooltip = function(_) {
		if (!arguments.length) return tooltip;
			tooltip = _;
			return chart;
	}

	chart.name = function(_) {
		if (!arguments.length) return name;
		name = _;
		return name;
	}

	chart.text = function(_) {
		if (!arguments.length) return text;
		text = _;
		return text;
	}

	chart.padding = function(_) {
		if (!arguments.length) return padding;
		padding = _;
		return chart;
	}

   	chart.radius = function(_) {
		if (!arguments.length) return radius;
		radius = _;
		return chart;
	};

	chart.innerRadius = function(_) {
		if (!arguments.length) return innerRadius;
		innerRadius = _;
		return chart;
	};

  	chart._clickSlice = function(theSlice, d, i, singleSelection) {
	    if (singleSelection) {
	      chart._selectAllCircle(false);
	    }


	    if (singleSelection) {
	      if (clickedSlices.length > 0) {
	        for (var i = 0; i < clickedSlices.length; i++) {
	          chart._unclickSlice(clickedSlices[i]);
	        }
	        clickedSlices.length = 0;

	      } else if (clickedSlice) {
	        chart._unclickSlice(clickedSlice);
	      }

	    } 

	    // Bold the label of the clicked slice
	    d3.select(theSlice).selectAll("text").attr("class", "chartlabelSelected");

	    // Offset the arc even more than mouseover offset
	    // Calculate angle bisector
	    var ang = d.startAngle + (d.endAngle - d.startAngle)/2; 
	    // Transformate to SVG space
	    ang = (ang - (Math.PI / 2) ) * -1;

	    // Calculate a 10% radius displacement
	    var x = Math.cos(ang) * radius * 0.1;
	    var y = Math.sin(ang) * radius * -0.1;

	    d3.select(theSlice)
	      .select("path")
	      .attr("transform", "rotate(0)")
	      .transition()
	      .duration(200)
	      .attr("transform", "translate("+x+","+y+")"); 

	    if (singleSelection) {
	      clickedSlice = theSlice;
	      //dispatch.clickslice(d.data, i);    
	    }
	    else {
	      clickedSlices.push(theSlice);
	    }

	}	

    chart._unclickSlice = function(clickedSlice) {
	    // change the previous clicked slice back to no offset
	    d3.select(clickedSlice)
	      .select("path")
	      .transition()
	      .duration(150).attr("transform", "translate(0,0)"); 

	    // change the previous clicked slice label back to normal font
	    d3.select(clickedSlice).selectAll("text").attr("class", "chartlabel");
	    var labelPos = chart._arcLabelPosition(clickedSlice.__data__, .55);

    	return chart;

  	}

  	chart._selectSlice = function(d, i, gNode, deselectPrevSlice) {
		var theSlice = this; 

		// We have a gNode when this function is
		// invoked during initialization to selected
		// the first slice.
		if (gNode) {
		  theSlice = gNode;
		  sliceApiSelected = gNode;
		  
		} else {
		  // We have to get rid of previous selection
		  // when we mouseenter after first chromsome
		  // was auto selected because mouseout
		  // event not triggered when leaving first
		  // selected slice.
		  if (deselectPrevSlice) {
		    if (sliceApiSelected) {
		      d3.select(sliceApiSelected).select("path")
		          .transition()
		          .duration(150)
		          .attr("transform", "translate(0,0)"); 
		        sliceApiSelected = null;
		    }
		  }
		}

		// show tooltip
		if (options.showTooltip) {
		  _tooltip().transition()
		    .duration(200)
		    .style("opacity", .9);

		  var centroid = arc.centroid(d);

		  var matrix = theSlice.getScreenCTM()
		                       .translate(+theSlice.getAttribute("cx"),
		                                  +theSlice.getAttribute("cy"));
		  // position tooltip
		  _tooltip().html(name(d.data))
		    .style("visibility", "visible")
		    .style("left", (matrix.e + centroid[0]) + "px")
		    .style("top", (matrix.f + centroid[1]- 18) + "px");

		}


		if (theSlice != clickedSlice) {
		  // Calculate angle bisector
		  var ang = d.startAngle + (d.endAngle - d.startAngle)/2; 
		  // Transformate to SVG space
		  ang = (ang - (Math.PI / 2) ) * -1;

		  // Calculate a .5% radius displacement (inverse to make slice to inward)
		  var x = Math.cos(ang) * radius * 0.1;
		  var y = Math.sin(ang) * radius * -0.1;
		  d3.select(theSlice)
		    .select("path")
		    .attr("transform", "rotate(0)")
		    .transition()
		    .duration(200)
		    .attr("transform", "translate("+x+","+y+")"); 

		}
    	return chart;
  	}


	chart._arcLabelPosition = function(d, ratio) {
		var r = ( chart.innerRadius() + chart.radius() ) * ratio;
		var oa = arc.startAngle.call(d);
		var ia = arc.endAngle.call(d);
		a = ( oa(d) + ia(d) ) / 2 - (Math.PI/ 2);      
		return [ Math.cos(a) * r, Math.sin(a) * r ];    
	};

	chart._clickAllSlices = function(data)  {
		chart._selectAllCircle(true);
		chart._clickAllCircle();
		clickedSlices.length = 0;
		for (var i = 0; i < data.length; i++) {
		    var theSlice = arcs.selectAll("d.arc")[i].parentNode;
		    chart._clickSlice(theSlice, theSlice.__data__,  i, false);
		} 
		return chart;   
	}



	chart.clickSlice = function(i) {   
		var theSlice = arcs.selectAll("d.arc")[i].parentNode;
		chart._clickSlice(theSlice, theSlice.__data__, i, true);
		chart._selectSlice(theSlice.__data__,  i, theSlice);
		clickedSlice = theSlice;
		return chart;
	}

	chart.clickAllSlices = function(data) {
		chart._clickAllSlices(data);
		//dispatch.clickall();    
		return chart;
	}

	chart._selectAllCircle = function(select) {

/*
	    if (select) {
	      d3.select("circle#all-circle").attr("fill", "#F7F3BA");
	      d3.select("circle#all-circle").style("stroke", "lightgrey");
	      d3.select("text#all-text").style("font-weight", "normal");
	      d3.select("text#all-text").style("fill", "black");
	      d3.select("text#all-text").style("opacity", ".5");
	    } else {
	       d3.select("circle#all-circle").attr("fill", "none");
	       d3.select("circle#all-circle").style("stroke", "lightgrey");
	       d3.select("text#all-text").style("fill", "grey");
	       d3.select("text#all-text").style("font-weight", "normal");
	       d3.select("text#all-text").style("opacity", "1");
	    }
*/
	    return chart;
  	}

  	chart._clickAllCircle = function() {
 /*
      d3.select("circle#all-circle").attr("fill", "#F7F3BA");
      d3.select("circle#all-circle").style("stroke", "grey");
      d3.select("text#all-text").style("font-weight", "bold");
      d3.select("text#all-text").style("fill", "grey");
      d3.select("text#all-text").style("opacity", "1");    
 */
      return chart;
    }  



	return chart;
}

// Export alignment
module.exports = pieChooser;