datafile = "md3_data.csv";

// css
var md3_style = document.createElement('style');
md3_style.innerHTML = ".bar:hover { cursor: pointer;}		\
		.axis { font: 11px sans-serif; }					\
		.axis path, .axis line { fill: none; stroke: #000;	\
		  shape-rendering: crispEdges;}						\
		.x.axis path { display: none;}						\
		#md3message {font: 14px sans-serif;}				\
		h1, h2 {font-family: sans-serif;}					\
		.brush .extent { stroke: #fff;						\
						fill-opacity: .125;					\
						shape-rendering: crispEdges;}		\
		#pca, #mds, #nmf, #ica, #fa, #tsne { cursor: crosshair; }													\
		";
document.head.appendChild(md3_style);

// Require.js
define(['jquery', 'd3.min'], function ( $, d3 ) {
	var w_w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	var w_h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	var margin = {top: 10, right: 6, bottom: 20, left: 60}
	//var width = w_w*.28 - 30 - margin.left - margin.right;
	var width = 400;
	var height = w_w*.3*.4 - margin.top - margin.bottom;

	//var x = d3.scale.ordinal()
	//	.rangeRoundBands([0, width], .1);

	//var y = d3.scale.linear()
	//	.range([height, 0]);

	var x = {};
	var y = {};
	
	//var xAxis = d3.svg.axis()
	//	.scale(d3.scale.ordinal().rangeRoundBands([0, width], 0))
	//	.outerTickSize(0)
	//	.orient("bottom");
			
	//var yAxis = d3.svg.axis()
	//	.scale(d3.scale.linear().range([height, 0]))
	//	.orient("left");
	
	var xAxis = {};
	var yAxis = {};
	
	var keys;
	var bar_svgs = {};
	var dot_svgs = {};
	var sortedBy = ["first", ""];
	var chosen = [];
	over_elm = false;
	var down_location;

	// ---------------------------- BARS ---------------------------------------
	// main function
	md3_bars = function(error, data)
	{
		
		if (error) throw error;
		keys = Object.keys(data[0]); // get attribute names
		id_keys = {};
		for (k in keys)
		{
			id_keys[keys[k]] = id_appropriate(keys[k]);
			x[id_keys[keys[k]]] = d3.scale.ordinal().rangeRoundBands([0, width], 0);
			y[id_keys[keys[k]]] = d3.scale.linear().range([height, 0]);
			
			xAxis[id_keys[keys[k]]] = d3.svg.axis()
				.scale(x[id_keys[keys[k]]])
				.outerTickSize(0)
				.orient("bottom");
				
			yAxis[id_keys[keys[k]]] =  d3.svg.axis()
				.scale(y[id_keys[keys[k]]])
				.orient("left");
		}
		
		// show histograms for each attribute
		for(var i = 2; i < keys.length; i++)
		{
			att = keys[i];
			makeDiv(att, 'md3Bars');
			bar_svgs[att] = makeSvg(att);
			
			d3.csv(datafile, function(data){return data}, show(att));
			
			if (i != keys.length-1)
			{
				makeDiv("lineUnder"+id_appropriate(att), 'md3Bars');
				d3.select("#lineUnder"+id_appropriate(att)).append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", 5)
				.append("line")
					.attr("x1", 10)
					.attr("y1", 0)
					.attr("x2", width+margin.left)
					.attr("y2", 0)
					.attr("stroke", "lightgray")
					.attr("stroke-width", 2);
			}
		}
				
		makeDiv("md3message", 'md3Bars');
		document.getElementById('md3message').innerHTML="<p>Not Sorted</p>";
	}

	// default sort
	mySort = function(array) {return array;}

	// change sort
	SwitchFunction = function(att)
	{	
		if (sortedBy[0] == att)
		{
			if(sortedBy[1] == "asc")
			{
				sortedBy[1] = "desc";
				document.getElementById('md3message').innerHTML="<p>Descending by "+att+"</p>";
				mySort = function (array)
				{
					return array.sort(function(d1, d2){return d2[att] - d1[att]});
				}
			}
			else if (sortedBy[1] == "desc")
			{
				sortedBy[1] = "none";
				document.getElementById('md3message').innerHTML="<p>Not Sorted</p>";
				mySort = function (array)
				{
					return array;
				}
			}
			else
			{
				sortedBy[1] = "asc";
				document.getElementById('md3message').innerHTML="<p>Ascending by "+att+"</p>";
				mySort = function (array)
				{		
					return array.sort(function(d1, d2){ return d1[att] - d2[att]});
				}
			}
		}
		else
		{
			sortedBy[0] = att;
			sortedBy[1] = "asc";
			document.getElementById('md3message').innerHTML="<p>Ascending by "+att+"</p>";
			mySort = function (array)
			{
				return array.sort(function(d1, d2){return d1[att] - d2[att]});
			}
		}
		
		// refresh bars
		for(s in bar_svgs)
		{
			bar_svgs[s].selectAll(".bar").remove();
			bar_svgs[s].selectAll("g").remove();
		}
		
		for(var m = 1; m < keys.length; m++)
		{	
			d3.csv(datafile, function(d){return d;}, show(keys[m]));
		}
	}

	function makeSvg(divId)
	{
		divId = id_appropriate(divId);
		return d3.select("#"+divId).append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
			.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	}

	// create bars	
	function show(att)
	{
		var f = function(error, data)
		{
			if(error) throw error;
			
			data = mySort(data);
			
			x_range = x[id_keys[att]];
			y_range = y[id_keys[att]];
			
			x_range.domain(data.map(function(d) { return d[keys[0]]; }));
			y_range.domain([0, d3.max(data, function(d) { return parseFloat(d[att]); })]);
					
			bar_svgs[att].append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0,"+height+")")
				.call(xAxis[id_keys[att]]);
			
			if (data.length > 30)
			{
				//bar_svgs[att].call(xAxis).outerTickSize = 0;
				bar_svgs[att].call(xAxis[id_keys[att]]).selectAll("text").remove();
			}
			
			bar_svgs[att].append("g")
				.attr("class", "y axis")
				.call(yAxis[id_keys[att]])
			.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", -48)
				.attr("dy", ".3em")
				.style("text-anchor", "end")
			.text(att)
				.attr("onclick", "SwitchFunction('"+att+"')")
				.style("cursor", "pointer")
				.attr("font-size", "16");
			
			bar_svgs[att].selectAll(".bar")
				.data(data)
				.enter().append("rect")
					.attr("class", "bar")
					.attr("x", function(d) { return x_range(d[keys[0]]); })
					.attr("width", x_range.rangeBand())
					
					.attr("y", function(d) { return y_range(d[att]);})
					
					.attr("fill", function(d){
						if(chosen.indexOf(d[keys[0]]) >= 0) { 
							return "darkred";
						}
						else {	
							return "steelblue";
						}
					})
					.attr("height", function(d) { return height - y_range(d[att]); })
					.on("mouseover", function()
					{
						d3.select(this)
							.attr("fill", "brown");
					})
					.on("mouseout", function(d)
					{
					  if(chosen.indexOf(d[keys[0]]) >= 0)
					  {
						  d3.select(this)
							.transition()
							.duration(50)
							.attr("fill", "darkred");
					  }
					  else
					  {
						  d3.select(this)
							.attr("fill", "steelblue");
					  }
					})
					.on("click", function(d)
					{
						temp_index = chosen.indexOf(d[keys[0]]);
						if (temp_index >= 0)
						{
							chosen.splice(temp_index, 1);
						}
						else
							chosen.push(d[keys[0]]);
						
						for(var j = 2; j < keys.length; j++)
						{
							bar_svgs[keys[j]].selectAll(".bar")
								.attr("fill", function(d)
								{
									if(chosen.indexOf(d[keys[0]]) >= 0)
									{ 
										return "darkred";
									}
									else
									{	
										return "steelblue";
									}
								});
						}
						var d_keys = Object.keys(dot_svgs);
						for(var d=0; d < d_keys.length; d++)
							dot_svgs[d_keys[d]].selectAll("circle")
								.attr("fill", function(d2)
								{
									if(chosen.indexOf(d2[0]) >= 0)
									{ 
										return "darkred";
									}
									else
									{	
										return "steelblue";
									}
								})
					});
				if(data.length > 40)
				{
					bar_svgs[att].selectAll(".bar").append("svg:title")
					.text(function(d) {return d[keys[1]] + ": " + d[att]; })
				}
			}
			return f;
	}



	// ------------------------------ SCATTER ---------------------------------------
	// Plot scatter graphs
	mdsDrawD3ScatterPlot = function(element, xPos, yPos, labels, pretty_labels, params) {
		params = params || {};
		var padding = params.padding || 32,
			w = params.w || Math.min(720, document.documentElement.clientWidth - padding),
			h = params.h || w,
			xDomain = [Math.min.apply(null, xPos),
					   Math.max.apply(null, xPos)],
			yDomain = [Math.max.apply(null, yPos),
					   Math.min.apply(null, yPos)],
			pointRadius = params.pointRadius || 3;

		if (params.reverseX) {
			xDomain.reverse();
		}
		if (params.reverseY) {
			yDomain.reverse();
		}
		// div specific mouse events
		document.getElementById(params.parent).addEventListener('mousedown', function(e) {
			function get_anc(el) {
				var x_off=0;
				var y_off=0;
				for (; el != null; el = el.offsetParent)
				{
					x_off += el.offsetLeft;
					y_off += el.offsetTop;
				}
				return [x_off, y_off]
			}
			var anc = get_anc(this);
			/*if (this.id == "mds")
				anc[1] += 25;
			else if (this.id == "pca")
				anc[1] += 25;*/
			anc[1] += 25;
			
			down_location = [e.pageX - anc[0], e.pageY - anc[1]];
			if (!over_elm)
			{
				chosen = [];
				
			}
		});
		document.getElementById(params.parent).addEventListener('mouseup', function(e) {
			function get_anc(el) {
				var x_off=0;
				var y_off=0;
				for (; el != null; el = el.offsetParent)
				{
					x_off += el.offsetLeft;
					y_off += el.offsetTop;
				}
				return [x_off, y_off]
			}
			var anc = get_anc(this);
			/*if (this.id == "mds")
				anc[1] += 25;
			else if (this.id == "pca")
				anc[1] += 25;*/
			anc[1] += 25;
			
			
			var up_location = [e.pageX - anc[0], e.pageY - anc[1]];
			console.log("up = " + up_location + " down = " + down_location);
			
			var d_keys = Object.keys(dot_svgs);
			for(var div_num=0; div_num < d_keys.length; div_num++)
			{
				dot_svgs[d_keys[div_num]].selectAll("circle").attr("fill", function(d)
					{
						var current = d3.select(this);
						temp_current = d3.select(this).parentNode;
						var pos = [current.attr("cx"), current.attr("cy")];
						var parent_id = e.target.parentNode.id;
						
						if (Math.min(down_location[0], up_location[0]) < pos[0] && pos[0] < Math.max(down_location[0], up_location[0]))
							if (Math.min(down_location[1], up_location[1]) < pos[1] && pos[1] < Math.max(down_location[1], up_location[1]))
							{
								// make sure you're in the right div
								if (parent_id == "mds" && div_num == 0 ||
									parent_id == "pca" && div_num == 1 ||
									parent_id == "nmf" && div_num == 2 ||
									parent_id == "ica" && div_num == 3 ||
									parent_id == "fa" && div_num == 4 ||
									parent_id == "tsne" && div_num == 5)
								{
									chosen.push(d[0]);
									return "darkred";
								}
							}
						
						return "steelblue";
					});
			}
			
			var d_keys = Object.keys(dot_svgs);
			for(var d=0; d < d_keys.length; d++)
				dot_svgs[d_keys[d]].selectAll("circle")
					.attr("fill", function(d2)
					{
						if( chosen.indexOf(d2[0]) >= 0)
						{ 
							return "darkred";
						}
						else
						{	
							return "steelblue";
						}
					});
					
			for(var j = 2; j < keys.length; j++)
			{
				bar_svgs[keys[j]].selectAll(".bar")
					.attr("fill", function(d)
					{
						if(chosen.indexOf(d[keys[0]]) >= 0)
						{ 
							return "darkred";
						}
						else
						{	
							return "steelblue";
						}
				});
			}
					
		});

		var xScale = d3.scale.linear().
				domain(xDomain)
				.range([padding, w - padding]);

		var yScale = d3.scale.linear().
			domain(yDomain)
			.range([padding, h-padding]),

		xAxis = d3.svg.axis()
			.scale(xScale)
			.orient("bottom")
			.ticks(params.xTicks || 7),

		yAxis = d3.svg.axis()
			.scale(yScale)
			.orient("left")
			.ticks(params.yTicks || 7);
		
		dot_svgs[params.parent] = element.append("svg")
				.attr("width", w)
				.attr("height", h);

		dot_svgs[params.parent].append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0," + (h - padding + 2*pointRadius) + ")")
			.call(xAxis);

		dot_svgs[params.parent].append("g")
			.attr("class", "axis")
			.attr("transform", "translate(" + (padding - 2*pointRadius) + ",0)")
			.call(yAxis);
		
		label_data = []
		for (var i = 0; i < labels.length; i++)
		{
			label_data.push([labels[i], pretty_labels[i]]);
		}
	    var nodes = dot_svgs[params.parent].selectAll("circle")
			   .data(label_data)
			   .enter()
			   .append("g");
		   
		nodes.append("circle")
		   .attr("r", pointRadius)
		   .attr("cx", function(d, i) { return xScale(xPos[i]); })
		   .attr("cy", function(d, i) { return yScale(yPos[i]); })
		   .attr("cursor", "pointer")
		   .attr("fill", function(d){
				if(chosen.indexOf(d[0]) >= 0) { 
					return "darkred";
				}
				else {	
					return "steelblue";
				}
			})
			.on("mouseover", function()
			{
				d3.select(this)
					.attr("fill", "brown");
				over_elm = true;
			})
			.on("mouseout", function(d)
			{
				if(chosen.indexOf(d[0]) >= 0)
				{
					  d3.select(this)
						.transition()
						.duration(50)
						.attr("fill", "darkred");
				}
				else
				{
					  d3.select(this)
						.attr("fill", "steelblue");
				}
				
				over_elm = false;
			})
			.on("click", function(d)
			{
				console.log("this is " + d3.select(this).attr("cx") + ", " + d3.select(this).attr("cy"));
				temp_index = chosen.indexOf(d[0]);
				if (temp_index >= 0)
				{
					chosen.splice(temp_index, 1);
				}
				else
					chosen.push(d[0]);
				
				var d_keys = Object.keys(dot_svgs);
				for(var d=0; d < d_keys.length; d++)
					dot_svgs[d_keys[d]].selectAll("circle")
						.attr("fill", function(d2)
						{
							if( chosen.indexOf(d2[0]) >= 0)
							{ 
								return "darkred";
							}
							else
							{	
								return "steelblue";
							}
						})
				for(var j = 2; j < keys.length; j++)
				{
					bar_svgs[keys[j]].selectAll(".bar")
						.attr("fill", function(d)
						{
							if(chosen.indexOf(d[keys[0]]) >= 0)
								{ 
									return "darkred";
								}
							else
							{	
									return "steelblue";
								}
							});
				}
			});

		if(labels.length > 40)
		{
			nodes.append("svg:title")
			.text(function(d) { return d[1]; })
		}
		else
		{
			nodes.append("text")
				.attr("text-anchor", "middle")
				.text(function(d) { return d[1]; })
				.attr("x", function(d, i) { return xScale(xPos[i]); })
				.attr("y", function(d, i) { return yScale(yPos[i]) - 2 *pointRadius; })
				.attr("style", "font: 10px sans-serif");
		}
	};

	//------------------------------------ Calling main functions -----------------------------

	var md3_display = makeDiv('md3_display');

	var display_table = document.createElement("TABLE");
	display_table.style.width = "100%";
	var disp_row = display_table.insertRow(0);
	var dot_cell = disp_row.insertCell(0);
	var bar_cell = disp_row.insertCell(1);
	dot_cell.style.verticalAlign = "top";
	bar_cell.style.verticalAlign = "top";

	md3_display.appendChild(display_table);

	var md3Bars = makeDiv('md3Bars');
	md3Bars.innerHTML = "<h2>Bar Graphs</h2>";
	md3Bars.style.height = w_h - 30 + "px";
	md3Bars.style.overflowY = "auto";
	bar_cell.appendChild(md3Bars);
	d3.csv(datafile, function(data){return data}, md3_bars);

	var dots = makeDiv("dots");
	dot_cell.appendChild(dots);
	dots.style.height = w_h - 30 + "px";
	dots.style.overflowY = "auto";
	
	var dots_table = "<table>\
		<tbody><tr>\
			<td id='mds_cell'></td>\
			<td id='pca_cell'></td>\
			<td id='nmf_cell'></td>\
		</tr>\
		<tr>\
			<td id='ica_cell'></td>\
			<td id='fa_cell'></td>\
			<td id='tsne_cell'></td>\
		</tr></tbody>\
	</table>"
	
	dots.innerHTML = dots_table;
	
	
	$.getJSON("main/data.json", function(py_data)
	{
		var py_charts = []
		for (var i = 0; i < py_data.length; i++)
		{
			py_charts.push(makeDiv(py_data[i].name, py_data[i].name+"_cell"));
			make_text(py_data[i].p_name, "h2", py_data[i].name).style.marginBottom = 0;;
			py_coords = {'labels':[], 'pretty_labels':[], 'x':[], 'y':[]};
			
			for (var j = 0; j < py_data[i].data.length; j++)
			{
				py_coords.labels.push(py_data[i].data[j].label);
				py_coords.pretty_labels.push(py_data[i].data[j].pretty_label);
				py_coords.x.push(py_data[i].data[j].x);
				py_coords.y.push(py_data[i].data[j].y);
			}
			
			var plot_w = w_w*.23 - 30
			var plot_h = plot_w
			
			mdsDrawD3ScatterPlot(d3.select("#"+py_data[i].name), py_coords.x, py_coords.y, py_coords.labels,
					py_coords.pretty_labels,
				{"w":plot_w, "h":plot_h, "padding":0, "pointRadius": 4, "parent":py_data[i].name})

		}
	});

	// create new div
	function makeDiv(newId, parent)
	{
		newId = id_appropriate(newId);
		
		
		var newDiv = document.createElement('div');
		newDiv.id = newId;
		if(!parent)
		{
			document.getElementsByTagName('body')[0].appendChild(newDiv);
		}
		else
		{
			document.getElementById(parent).appendChild(newDiv);
		}
		
		return newDiv;
	}
	
	function id_appropriate(in_str)
	{
		in_str = in_str.replace(/ /g, '_').replace(/\(/g, 'p').replace(/\)/g, 'q');
		if (in_str[0] in ['0','1','2','3','4','5','6','7','8','9'])
			in_str = "n".concat(in_str);
		
		return in_str;
	}
	
	function make_text(text, tag, parent) {
		if (parent)
		{
			parent = id_appropriate(parent);
		}
		
		var t = document.createTextNode(text);
		
		if (tag) {
			var p = document.createElement(tag);
			p.appendChild(t);
			t = p;
		}
		if (parent) {
			var pt = document.getElementById(parent);
			pt.appendChild(t);
		}
		else {
			document.getElementsByTagName('body')[0].appendChild(t);
		}
		
		return t;
	}

});

