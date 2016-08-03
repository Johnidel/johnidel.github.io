
var indexPercentages = {
	
	1928: 34.06, 1949: 17.44, 1970: -3.15, 1991: 31.23,

	1929: -20.78, 1950: 41.82, 1971: 26.09, 1992: 10.35,

	1930: -37.57, 1951: 13.72, 1972: 20.77, 1993: 28.82,

	1931: -51.99, 1952: 10.60, 1973: -22.27, 1994: 0.70,

	1932: -11.55, 1953: -5.83, 1974: -24.99, 1995: 21.22,

	1933: 103.52, 1954: 58.35, 1975: 48.96, 1996: 16.27,

	1934: 3.43, 1955: 20.47, 1976: 32.39, 1997: 16.63,

	1935: 48.85, 1956: 6.13, 1977: 23.46, 1998: 2.29,

	1936: 49.42, 1957: -16.76, 1978: 25.43, 1999: 22.79,

	1937: -44.54, 1958: 55.98, 1979: 21.97, 2000: 0.58,

	1938: 30.40, 1959: 14.38, 1980: 28.04, 2001: 2.60,

	1939: -4.31, 1960: -5.66, 1981: 5.06, 2002: -11.32,

	1940: -6.21, 1961: 27.18, 1982: 16.80, 2003: 48.70,

	1941: -7.91, 1962: -11.74, 1983: 32.34, 2004: 22.38,

	1942: 23.75, 1963: 20.56, 1984: 4.15, 2005: 11.86,

	1943: 45.85, 1964: 18.06, 1985: 39.35, 2006: 22.02,

	1944: 35.34, 1965: 28.86, 1986: 26.88, 2007: 2.51,

	1945: 54.89, 1966:-8.89, 1987: 9.23, 2008: -40.55,

	1946: -10.25, 1967: 55.09, 1988: 26.90, 2009: 39.63,

	1947: 1.52, 1968: 32.63, 1989: 25.98, 2010: 22.66,

	1948: -3.51, 1969: -23.42, 1990: -16.49, 2011: -8.58,

	2012: 18.38, 2013: 29.31, 2014: 3.32};
	
var margin = {top: 10, right: 30, bottom: 30, left: 30},
		width = 960 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;
		
function jet(num, min, max)
{
	/**
	var colorScale = d3.scaleLinear()
			    .domain([max,
			             (max-min)*4/5,
			             (max-min)*3/5,
			             (max-min)*2/5,
			             (max-min)*1/5,
			             min])
			    .range(["#800000",
			            "#FF0000",
			            "#FFFF00",
			            "#00FFFF",
			            "#0000FF",
			            "#00008F"]);
	console.log(num)
	return colorScale(num);**/
	var hue = -num / max * 250 + 250;
	var lite = (-.3 * (hue - 140) / 140 * (hue - 140) / 140) + .7;
	if(hue < 30)
		return d3.hsl(hue, 1,lite).toString()
	else
		return d3.hsl(hue, 1,lite).toString()
}

var tipT = d3_rs_tip.body()
		.attr('class', 'd3-tip darkTip')
		.offset([-10, 0])
		.html(function(d) {
			return "<div style='text-align: center;' ><strong>Year:</strong> <span style='font-weight: 800; color:red'>" + d.x + "</span></div><br/><div><strong>Investment Value:</strong> $<span style='font-weight: 800; color:red'>" + Math.floor(d.y * 100) / 100 + "</span></div><br/><div style='text-align: center; font-weight: 800;'><strong>Gain:</strong> <span style='color:red'>" + d.gp + "%</span></div>";
		})
	
function barGraph(dat) {
	
	var min = Math.min.apply(Math, dat.map(function(v) {
				return v.y;
			}));
	var max = Math.max.apply(Math, dat.map(function(v) {
				return v.y;
			}));
			
	console.log(dat[0].x);
	console.log(dat[dat.length - 1].x);
	
	var x = d3.scaleLinear()
		.domain([1928, dat[dat.length - 1].x + 1])
		.range([0, width - 130]);

	var y = d3.scaleLinear()
		.domain([0, max * 1.3])
		.range([0, height - 30]);
		
	var yVals = d3.scaleLinear()
		.domain([0, Math.max.apply(Math, dat.map(function(v) {
				return v.y;
			}))
			])
		.range([height, 0]);
		
	var svg = d3.select(".graphic");
	
	var barWidth =(width - 130)/ (dat.length);
	
	//svg.selectAll(".axis").remove()
	
	var bars = svg.selectAll(".bar").data(dat, function(d){return d.x;});
	svg.call(tipT);
	bars.enter().append("rect")
		.on("mouseover", tipT.show)
		.on("mouseout", tipT.hide)
		.attr("class", "bar")
		.attr("x", function(d) {return (d.x - dat[0].x) * barWidth + 130 + 1})
		.attr("width", barWidth)
		.attr("y",function(d) {return height + 10;})
		.transition().duration(750)
		.attr("y",function(d) {return height - y(d.y);})
		.attr("height",function(d) {return y(d.y) + 10;})
		.style("fill", function(d) { return jet(d.y, min, max)})
		.style("opacity", ".84")


	bars.exit().remove();
	
	bars
		.transition().duration(1200)
		.attr("x", function(d) {return (d.x - dat[0].x) * barWidth + 130 + 1})
		.attr("y",function(d) {return height - y(d.y);})
		.attr("width", barWidth)
		.attr("height",function(d) {return y(d.y) + 10;})
		.style("fill", function(d) { return jet(d.y, min, max)})
		.style("opacity", ".84")
		
	var xaxis = svg.select(".axis--x")
		.transition().duration(1000)
		.call(d3.axisBottom(x).tickFormat(d3.format("d")));
		
	var yaxis = svg.select(".axis--y")
		.transition().duration(1000)
		.call(d3.axisLeft(yVals).tickFormat(d3.format("d")));
		
	xaxis.selectAll("text").attr("transform", "translate(-5, 10) rotate(-45)")

		
}

angular.module('myApp', ['ngAnimate'])
.controller('totalCtrl', ['$scope', '$sce', function($scope, $sce) {
	
  $scope.data = {};
  
	var dat = [];
	var formatCount = d3.format(",.0f");

	var x = d3.scaleLinear()
		.domain([0,30])
		.rangeRound([0, width - 130]);

	var y = d3.scaleLinear()
		.domain([0,30])
		.range([0, height]);
		
	var yVals = d3.scaleLinear()
		.domain([0,30])
		.range([height, 0]);

	var svg = d3.select("#graph").append("svg")
		.attr("class", "graphic")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
	svg.call(tipT);

	var bar = svg.selectAll(".bar")
		.data(dat)
	  .enter().append("rect")
		.attr("class", "bar")
		.attr("x", function(d) {return x(d.x);})
		.attr("y",function(d) {return height - y(d.y);})
		.attr("width",function(d) {return width / dat.length;})
		.attr("height",function(d) {console.log(d.y);return y(d.y);})
		
	/**
	bar.append("rect")
		.attr("x", 1)
		.attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
		.attr("height", function(d) { return height - y(d.length); });**/
	/**
	bar.append("text")
		.attr("dy", ".75em")
		.attr("y", 6)
		.attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
		.attr("text-anchor", "middle")
		.text(function(d) { return formatCount(d.length); });**/

	svg.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(100," + height + ")")
		.attr("width", 100)
		.call(d3.axisBottom(x));
		
	svg.append("g")
		.attr("class", "axis axis--y")
		.attr("transform", "translate(100,0)")
		.call(d3.axisLeft(yVals));
  
	
}])

.controller('formCtrl', ['$scope', '$sce', function($scope, $sce) {
	
    $scope.data.years = Object.keys(indexPercentages);
	$scope.data.principal = 1000;
	$scope.data.increment = 0; 
	$scope.data.yearRange = 20;
	$scope.data.dropCount = 0;
	$scope.data.graphs = 0;
	
	$scope.countDrop = function(max, inc) {
		$scope.data.dropCount += inc;
		
		if(($scope.data.dropCount < max && inc > 0) || ($scope.data.dropCount > max && inc < 0))
			setTimeout(function() {console.log("coutin"); $scope.countDrop(max, inc); $scope.$apply();}, 20);
		
	}
	
	$scope.trustYear = function() {
		$scope.data.tYear = $sce.trustAsHtml($scope.data.year.toString());
		$scope.countDrop(0, -1);
	}
	
	$scope.dropClicked = function() {
		$scope.data.dropEnabled = !$scope.data.dropEnabled;
		if($scope.data.dropEnabled)
			$scope.countDrop(20, 1);
		else 
			$scope.countDrop(0, -1);
	}
	
	console.log("init")
    $scope.clicked = function() {
		
		var dat = [];
		var princip = $scope.data.principal;
		var inc = $scope.data.increment;
		var year = parseInt($scope.data.year);
		var yearRange = parseInt($scope.data.yearRange);
		

		if($scope.data.year == null)
			return;
		if(year + yearRange > 2014)
			return;
		if(princip < 0)
			return;

		
		$scope.data.trustedHtml = $sce.trustAsHtml($scope.data.increment.toString());
		
		dat.push({x: year, y: princip, 'gp': indexPercentages[year.toString()]});
		for(var i = year + 1; i < year + yearRange; i++)
		{
			dat.push({'x': i, 'y': dat[dat.length - 1].y + inc + (dat[dat.length - 1].y + inc) * indexPercentages[i.toString()] / 100, 'gp': indexPercentages[i.toString()]})
		}
	
		barGraph(dat);
		console.log(dat)
		
		$scope.data.gain = $sce.trustAsHtml((dat[dat.length - 1].y).toString());
		$scope.data.rot = $sce.trustAsHtml(((dat[dat.length - 1].y - princip) / princip * 100).toString() + '%');

    };
}]);



