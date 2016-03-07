var t = 0;

var xUnit = window.innerWidth / 100;
var yUnit = window.innerHeight * .7 / 100;

function Point(x, y) {
		this.x = x;
		this.y = y;
		this.add = function(x, y) {
			this.x = this.x + x;
			this.y = this.y + y;
		};
		this.copy = function() {
			return new Point(this.x, this.y);
		}
		this.dist = function(p2) {
			return Math.sqrt((this.x - p2.x) * (this.x - p2.x) + (this.y - p2.y) * (this.y - p2.y));
		}
}

function Line(p1, p2) {

		this.p1 = p1;
		this.p2 = p2;
		this.add = function(x, y) {
			this.p2.add(x, y);
		};	
}

function LineAnim(line, time) {
		
		this.animTime = time;
		this.line = line;
		this.curLine = new Line(line.p1.copy(), line.p1.copy());
		this.curTime = 0;
		this.inc = new Point((line.p2.x - line.p1.x)/ time, (line.p2.y - line.p1.y) / time);
		
		this.update = function() {
			this.curTime = this.curTime + 1;
			if(this.curTime <= this.animTime)
				this.curLine.add(this.inc.x, this.inc.y);
		};
			
}

function LineSeries(p1) {
	this.p = new Array();
	this.p[0] = p1;
	this.length = 1;
	this.euclidean = 0;
	this.append = function(p) {
		this.length += 1;
		this.p[this.length - 1] = p;
		this.euclidean += p.dist(this.p[this.length - 2]);
	}
	this.set = function(i, p) {
		this.p[i] = p;
	}
	
}

function AnimLineSeries(ls, time) {
	this.ls = ls;
	this.animTime = time;
	
	
	this.reset = function() {
		this.p = new Array();
		this.p[0] = ls.p[0].copy();
		this.p[1] = ls.p[0].copy();
		this.curPoint = 1;
		this.segTime = (ls.p[1].dist(this.p[0]) / ls.euclidean * time);
		this.inc = new Point((ls.p[1].x - this.p[0].x) / this.segTime, (ls.p[1].y - this.p[0].y) / this.segTime);
		this.curTime = 0;
		this.tTime = 0;
		this.curLineSeries = new LineSeries(this.p[0]);
		this.curLineSeries.append(this.p[1]);
	};
	
	this.update = function() {
		if(this.tTime < this.animTime)
		{
			this.p[this.curPoint].add(this.inc.x, this.inc.y);
			this.curTime += 1;
			this.tTime += 1;
			
			
			if(this.segTime - this.curTime < 1)
			{
				this.p[this.curPoint] = this.ls.p[this.curPoint].copy();
				this.curLineSeries.set(this.curPoint, this.p[this.curPoint]);

				if(this.curPoint < this.ls.length - 1)
				{
					this.curPoint += 1;
					this.curTime = 0;
					this.p[this.curPoint] = this.ls.p[this.curPoint - 1].copy();
					this.segTime = (this.ls.p[this.curPoint].dist(this.p[this.curPoint - 1]) / this.ls.euclidean * time);
					this.inc = new Point((this.ls.p[this.curPoint].x - this.p[this.curPoint - 1].x) / this.segTime, (this.ls.p[this.curPoint].y - this.p[this.curPoint - 1].y) / this.segTime);
					this.curLineSeries.append(this.p[this.curPoint]);
				}
				else {
					this.tTime = this.animTime;
				}
			}
		}
		else {
			this.curLineSeries = this.ls;
		}
	}
	
	this.reset();
}

function reset() {
	for(var i = 0; i < animLink.length; i++)
	{
		animLink[i].reset();
	}	
}

function init_canvas(){
	var canvas = document.getElementById("main_canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight * .7;
	document.getElementById("home").addEventListener("click", function() {animSelect = 1; reset();});
	document.getElementById("about").addEventListener("click", function() {animSelect = 2; reset();});
	document.getElementById("projects").addEventListener("click", function() {animSelect = 3; reset();});
	document.getElementById("contact").addEventListener("click", function() {animSelect = 4; reset();});
	init();
	update();
}

function update() {
	var canvas = document.getElementById('main_canvas');
	var context = canvas.getContext('2d');
	context.fillStyle = "black";
	context.fillRect(-100000,-100000,200000,200000);
	var time = (new Date()).getTime();

	//aSeries.update();
	//drawLineSeries(context, lSeries, "white");
	//drawLineSeries(context, aSeries.curLineSeries, "cyan");
	
	drawLineSeries(context, homeSeries, "white");
	drawLineSeries(context, aboutSeries, "white");
	drawLineSeries(context, projectSeries, "white");
	drawLineSeries(context, contactSeries, "white");
	
	if(animSelect != 0)
	{
		animLink[animSelect - 1].update();
		drawLineSeries(context, animLink[animSelect - 1].curLineSeries, "cyan");
	}

	t = t + 1;
	if(t % 5 == 0)
	{
		if(shadowVal < 1000 && shadowDir == 0)
		{
			shadowVal += 2;
			if(shadowVal == 50)
				shadowDir = 1;
		}
		else {
			shadowVal -= 2;
			if(shadowVal == 10)
				shadowDir = 0;
		}
	}
	window.requestAnimationFrame(update);
}

function drawLine(context, line) {
	context.beginPath();
	context.moveTo(line.p1.x, line.p1.y);
    context.lineTo(line.p2.x, line.p2.y);
	context.strokeStyle = "white";
	context.lineWidth = 5;
    context.stroke();
}

function drawLineSeries(context, series, color) {

	context.beginPath();
	context.moveTo(series.p[0].x, series.p[0].y);
	for(i = 1; i < series.length; i++)
	{
		context.lineTo(series.p[i].x, series.p[i].y);
	}
	context.strokeStyle = color;
	if(color == "cyan")
	{
		
		context.shadowBlur = shadowVal;
		context.shadowColor = color;
	}
	else {
		context.globalAlpha = .4;
		context.shadowBlur = 0;
	}
	context.lineWidth = 5;
	context.stroke();
	context.globalAlpha = 1;

}
var shadowVal, shadowDir, homeSeries, aboutSeries, projectSeries,contactSeries, animLink, animSelect, xUnit, yUnit, t;

function init() {
	
	t = 0;

	xUnit = window.innerWidth / 100;
	yUnit = window.innerHeight * .7 / 100;
	shadowVal = 20;
	shadowDir = 0;
	var homeRect = document.getElementById("home").getBoundingClientRect();
	var homeX = (homeRect.left + homeRect.width / 2)/ xUnit;
	//alert(homeX);
	homeSeries = new LineSeries(new Point(homeX * xUnit, 2.6 * yUnit));
	homeSeries.append(new Point(homeX * xUnit, 70 * yUnit));
	homeSeries.append(new Point(1.465 * homeX * xUnit, 70 * yUnit + .465 * homeX * xUnit));
	homeSeries.append(new Point(2.2955 * homeX * xUnit, 70 * yUnit + .465 * homeX * xUnit));

	aboutSeries = new LineSeries(new Point(20 * xUnit, 2.6 * yUnit));
	aboutSeries.append(new Point(20 * xUnit, 10 * yUnit));
	aboutSeries.append(new Point(18 * xUnit, 10 * yUnit + 2 * xUnit));
	aboutSeries.append(new Point(13 * xUnit, 10 * yUnit + 2 * xUnit));
	aboutSeries.append(new Point(11 * xUnit, 10 * yUnit + 4 * xUnit));
	aboutSeries.append(new Point(11 * xUnit, 38 * yUnit + 8 * xUnit));
	aboutSeries.append(new Point(15 * xUnit, 38 * yUnit + 12 * xUnit));
	aboutSeries.append(new Point(2.2955 * homeX * xUnit, 38 * yUnit + 12 * xUnit));

	projectSeries = new LineSeries(new Point(32.5 * xUnit, 2.6 * yUnit));
	projectSeries.append(new Point(32.5 * xUnit, 14 * yUnit));
	projectSeries.append(new Point(30.5 * xUnit, 14 * yUnit + 2 * xUnit));
	projectSeries.append(new Point(15 * xUnit, 14 * yUnit + 2 * xUnit));
	projectSeries.append(new Point(13 * xUnit, 14 * yUnit + 4 * xUnit));
	projectSeries.append(new Point(13 * xUnit, 40 * yUnit + 4 * xUnit));
	projectSeries.append(new Point(17 * xUnit, 40 * yUnit + 8 * xUnit));
	projectSeries.append(new Point(2.2955 * homeX * xUnit, 40 * yUnit + 8 * xUnit));

	contactSeries = new LineSeries(new Point(45 * xUnit, 2.6 * yUnit));
	contactSeries.append(new Point(45 * xUnit, 18 * yUnit));
	contactSeries.append(new Point(43 * xUnit, 18 * yUnit + 2 * xUnit));
	contactSeries.append(new Point(17 * xUnit, 18 * yUnit + 2 * xUnit));
	contactSeries.append(new Point(15 * xUnit, 18 * yUnit + 4 * xUnit));
	contactSeries.append(new Point(15 * xUnit, 34 * yUnit + 4 * xUnit));
	contactSeries.append(new Point(18 * xUnit, 34 * yUnit + 7 * xUnit));
	contactSeries.append(new Point(2.2955 * homeX * xUnit, 34 * yUnit + 7 * xUnit));

	animLink = [
		new AnimLineSeries(homeSeries, 100),
		new AnimLineSeries(aboutSeries, 100),
		new AnimLineSeries(projectSeries, 100),
		new AnimLineSeries(contactSeries, 100)
	];

	animSelect = 0;
}

/**
var throt;
window.addEventListener("resize", function() {
	if(!throt) {
		init_canvas();
		throt = true;
		setTimeout(function() {throt = false;}, 300);
}});**/

