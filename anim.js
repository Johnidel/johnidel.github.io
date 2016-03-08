var t = 0;

var xUnit = window.innerWidth / 100;
var yUnit = window.innerHeight * .7 / 100;

const W_COLOR = "#7A5C5C";

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

function Rect(p, width, height, color) {
	this.p = p;
	this.width = width;
	this.height = height;
	this.color = color;
}

function ModuleRect(rect, text, size, width, bC) {
	this.rect = rect;
	this.text = text;
	this.blur = false;
	this.type = "m";
	this.size = size;
	this.width = width;
	this.done = false;
	this.blurColor = bC;
	
	this.draw = function(context) {
		if(this.blur)
		{
			//context.globalAlpha = 1;
			context.shadowBlur = shadowVal;
			context.shadowColor = this.blurColor;
		}
		else {
			context.globalAlpha = .4;
			context.shadowBlur = 0;
		}
		context.strokeStyle = this.rect.color;
		context.lineWidth = this.width;
		var rec = this.rect;
		context.strokeRect(rec.p.x, rec.p.y, rec.width, rec.height);
		context.font = this.size + "px Lucida Console";
		
		drawText(context, this.text, rec.p.x + (rec.width / 2) - (context.measureText(this.text).width / 2), rec.p.y + this.size + 10, this.size, W_COLOR);
	}
	
	this.update = function () {
		this.blur = true;
		this.done = true;
	}
	
	this.reset = function() {
		this.done = false;
		this.blur = false;
	}
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

function AnimLineSeries(ls, time, color1, color2) {
	this.ls = ls;
	this.animTime = time;
	this.done = false;
	this.type = "a";
	this.color1 = color1;
	this.color2 = color2;
	
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
		
		this.done = false;
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
			this.done = true;
		}
	}
	
	this.draw = function(context) {
		drawLineSeries(context, this.ls, this.color1);
		drawLineSeries(context, this.curLineSeries, this.color2);
	}
	
	this.reset();
}


function AnimPowerBar(p, width, height, time, segments, color) {
	this.p = p;
	this.width = width;
	this.height = height;
	this.animTime = time;
	this.segments = segments;
	this.segTime = time/segments;
	this.color = color;
	this.type = "p";
	this.done = false;


	this.rects = new Array();
	for(var i = 0; i < this.segments; i++)
	{
		this.rects[i + 1] = new Rect(new Point(this.p.x, this.p.y + i * this.height * 2), this.width, this.height, this.color);
	}
	this.rects[0] = new Rect(new Point(this.p.x, this.p.y + (this.segments - 1) * this.height * 2 + this.height), this.width, 0, "cyan");
	this.incy = this.height / this.segTime; 
	this.done = false;	
	this.curSeg = this.segments;
	
	
	this.update = function() {


		if(this.rects[0].height <= this.height)
		{
			this.rects[0].p.y -= this.incy;
			this.rects[0].height += this.incy;
		}
		else {
			if(this.curSeg > 1)
			{
				this.rects[this.curSeg].color = "cyan";
				this.curSeg -= 1;
				this.rects[0].p.y = this.rects[this.curSeg].p.y + this.height;
				this.rects[0].height = 0;
			}
			else {
				this.done = true;
			}
		}
		
		
	}
	
	this.reset = function() {
		this.done = false;

		if(this.rects[0].height > 0)
		{
			this.rects[0].p.y += this.incy * 3;
			this.rects[0].height -= this.incy * 3;
		}
		else {
			if(this.curSeg < this.segments)
			{
				this.rects[this.curSeg + 1].color = W_COLOR;
				this.curSeg += 1;
				this.rects[0].p.y = this.rects[this.curSeg].p.y;
				this.rects[0].height = this.height;
			}
			else {
				this.rects[0].height = 0;
			}
		}
		
		
	}
	
	this.draw = function(context) {
		for(var i = 1; i < this.rects.length; i++)
		{
			var rec = this.rects[i];
			context.fillStyle = rec.color;
			if(rec.color == "cyan")
			{
				context.globalAlpha = 1;
				context.shadowBlur = shadowVal;
				context.shadowColor = "cyan";
			}
			else {
				context.globalAlpha = .4;
				context.shadowBlur = 0;
			}
			context.fillRect(rec.p.x, rec.p.y, rec.width, rec.height);
		}
		context.globalAlpha = 1;
		context.shadowBlur = shadowVal;
		context.shadowColor = "cyan";
		var rec = this.rects[0];
		context.fillStyle = rec.color;
		context.fillRect(rec.p.x, rec.p.y, rec.width, rec.height);
	}
	
}

function AnimText(text, slow, x, y, color, size) {
	this.text = text;
	this.slow = slow;
	this.x = x;
	this.y = y;
	this.color = color;
	this.size = size;
	
	
	this.draw = function(context) {
		drawText(context, this.sText, this.x, this.y, this.size, this.color);
		drawText(context, this.aText, this.x, this.y, this.size, "cyan");
	}
	
	this.update = function() {
		this.count += 1;
		if(this.count % this.slow == 0 && this.aText.length < this.text.length)
		{
			this.aText += this.sText[this.aText.length];
			this.sText[animText.length - 1] = " ";
		}
	}
	
	this.reset = function() {
		this.count = 0;
		this.aText = "";
		this.sText = this.text;
	}
	
	this.reset();
	
}

function AnimString() {
	this.anims = new Array();
	this.curAnim = 0;
	
	this.push = function(arg) {
		this.anims[this.anims.length] = arg;
	}
	
	this.update = function() {
		this.anims[this.curAnim].update();
		if(this.anims[this.curAnim].done && this.curAnim < this.anims.length - 1)
		{
			this.curAnim += 1;
		}
	}
	
	this.draw = function(context) {
		for(var i = 0; i < this.anims.length; i++)
		{
			this.anims[i].draw(context);
		}
	}
	
	this.reset = function() {
		this.curAnim = 0;
		for(var i = 0; i < this.anims.length; i++)
		{
			this.anims[i].reset();
		}
	}
}

function reset() {
	for(var i = 0; i < animLink.length; i++)
	{
		animLink[i].reset();
	}	
}

function init_canvas(){
	var canvas = document.getElementById("main_canvas");
	canvas.width = window.innerWidth * 1;
	canvas.height = window.innerHeight * 1;
	document.getElementById("home").addEventListener("click", function() {animSelect = 1; reset();});
	document.getElementById("about").addEventListener("click", function() {animSelect = 2; reset();});
	document.getElementById("projects").addEventListener("click", function() {animSelect = 3; reset();});
	document.getElementById("contact").addEventListener("click", function() {animSelect = 4; reset();});
	var context = canvas.getContext('2d');
	init(context);
	update();
}
var animTextO = "<SYSTEM> HOME";
var animText = "";
var textIter;

function update() {
	var canvas = document.getElementById('main_canvas');
	var context = canvas.getContext('2d');
	context.globalAlpha = 1;
	context.fillStyle = "#0E0F0F";
	context.fillRect(-100000,-100000,200000,200000);
	
	context.shadowBlur = shadowVal;
	drawGrid(context, 7);
	
	for(var i = 0; i < aStrings.length; i++)
	{	
		if(animSelect == i + 1)
		{
			aStrings[i].update();
		}
		else {
			aStrings[i].reset();
		}
	}
	
	for(var i = 0; i <aStrings.length; i++)
	{
		aStrings[i].draw(context);
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

function drawGrid(context, color) {

	context.strokeStyle = "#634444";
	context.lineWidth = .2;
	
	for(var i = -5000; i < 5000; i+=50)
	{
			context.beginPath();
			context.moveTo(i, -10000);
			context.lineTo(i, 10000);
			context.stroke();
			
			context.beginPath();
			context.moveTo(-10000, i);
			context.lineTo(10000, i);
			context.stroke();
	}
	
}

function drawText(context, text, x, y, size, color)
{
	if(color != "cyan")
	{
		context.globalAlpha = .4;
		context.shadowBlur = 0;
	}	
	else {
		context.globalAlpha = 1;
		context.shadowBlur = shadowVal;
	}
	context.font = size + "px Lucida Console";
	context.fillStyle = color;
	context.fillText(text, x, y);
	context.globalAlpha = .1;
	context.strokeStyle = "cyan";
	context.lineWidth = 2;
	context.strokeText(text, x, y);
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
		context.globalAlpha = 1;
	}
	else {
		context.globalAlpha = .3;
		context.shadowBlur = 0;
	}
	context.lineWidth = 8;
	context.stroke();

}


var shadowVal, shadowDir, animSelectt;


var aStrings;

function init(context) {
	
	t = 0;

	xUnit = window.innerWidth / 100;
	yUnit = window.innerHeight / 100;
	shadowVal = 20;
	shadowDir = 0;
	var homeRect = document.getElementById("home").getBoundingClientRect();
	var homeX = (homeRect.left + homeRect.width / 2);
	var homeY = document.getElementById("top").getBoundingClientRect().bottom + 1;

	
	var homeSeries = new LineSeries(new Point(homeX, homeY));
	homeSeries.append(new Point(homeX, 75 * yUnit - (.465 * homeX)));
	homeSeries.append(new Point(1.465 * homeX, 75 * yUnit));
	homeSeries.append(new Point(2.2955 * homeX, 75 * yUnit));
	
	var aboutRect = document.getElementById("about").getBoundingClientRect();
	var aboutX = (aboutRect.left + aboutRect.width / 2);
	
	var aboutSeries = new LineSeries(new Point(aboutX, homeY));
	aboutSeries.append(new Point(aboutX, homeY + 5 * yUnit));
	aboutSeries.append(new Point(aboutX - .2 * homeX, homeY + 5 * yUnit + .2 * homeX));
	aboutSeries.append(new Point(homeX + .5 * homeX, homeY + 5 * yUnit + .2 * homeX));
	aboutSeries.append(new Point(homeX + .2 * homeX, homeY + 5 * yUnit + .5 * homeX));
	aboutSeries.append(new Point(homeX + .2 * homeX, 65 * yUnit - .4 * homeX));
	aboutSeries.append(new Point(homeX + .6 * homeX, 65 * yUnit));
	aboutSeries.append(new Point(2.2955 * homeX, 65 * yUnit));
	
	var projectRect = document.getElementById("projects").getBoundingClientRect();
	var projectX = (projectRect.left + projectRect.width / 2);

	var projectSeries = new LineSeries(new Point(projectX, homeY));
	projectSeries.append(new Point(projectX, homeY + 10 * yUnit));
	projectSeries.append(new Point(projectX - .2 * homeX, homeY + 10 * yUnit + .2 * homeX));
	projectSeries.append(new Point(homeX + .8 * homeX, homeY + 10 * yUnit + .2 * homeX));
	projectSeries.append(new Point(homeX + .5 * homeX, homeY + 10 * yUnit + .5 * homeX));
	projectSeries.append(new Point(homeX + .5 * homeX, 55 * yUnit - .3 * homeX));
	projectSeries.append(new Point(homeX + .8 * homeX, 55 * yUnit));
	projectSeries.append(new Point(2.2955 * homeX, 55 * yUnit));

	var contactRect = document.getElementById("contact").getBoundingClientRect();
	var contactX = (contactRect.left + contactRect.width / 2);
	
	var contactSeries = new LineSeries(new Point(contactX, homeY));
	contactSeries.append(new Point(contactX, homeY + 4 * yUnit));
	contactSeries.append(new Point(contactX - .2 * homeX, homeY + 4 * yUnit + .2 * homeX));
	contactSeries.append(new Point((projectX + contactX) / 2, homeY + 4 * yUnit + .2 * homeX));
	contactSeries.append(new Point((projectX + contactX) / 2 - .2 * homeX, homeY + 4 * yUnit + .4 * homeX));
	contactSeries.append(new Point((projectX + contactX) / 2 - .2 * homeX, homeY + 15 * yUnit));
	contactSeries.append(new Point((projectX + contactX) / 2 - .4 * homeX, homeY + 15 * yUnit + .2 * homeX));
	contactSeries.append(new Point(homeX + 1.1 * homeX, homeY + 15 * yUnit + .2 * homeX));
	contactSeries.append(new Point(homeX + .8 * homeX, homeY + 15 * yUnit + .5 * homeX));
	contactSeries.append(new Point(homeX + .8 * homeX, 45 * yUnit - .2 * homeX));
	contactSeries.append(new Point(homeX + homeX, 45 * yUnit));
	contactSeries.append(new Point(2.2955 * homeX, 45 * yUnit));

	var animLink = [
		new AnimLineSeries(homeSeries, 60, W_COLOR, "cyan"),
		new AnimLineSeries(aboutSeries, 60, W_COLOR, "cyan"),
		new AnimLineSeries(projectSeries, 60, W_COLOR, "cyan"),
		new AnimLineSeries(contactSeries, 60, W_COLOR, "cyan")
	];

	animSelect = 0;
	var s = 2.2955 * homeX;
	var enc = new ModuleRect(new Rect(new Point(2.2955 * homeX, 40 * yUnit), 10 * xUnit, 40 * yUnit, "cyan"), "", 15, 3, "cyan");
	var dec = new ModuleRect(new Rect(new Point(2.2955 * homeX + 20 * xUnit, 40 * yUnit), 10 * xUnit, 40 * yUnit, "cyan"), "", 15, 3, "cyan");
	
	var e2d1_ = new LineSeries(new Point(s + 10 * xUnit, 50 * yUnit));
	e2d1_.append(new Point(s + 20 * xUnit, 50 * yUnit));
	var e2d2_ = new LineSeries(new Point(s + 10 * xUnit,70 * yUnit));
	e2d2_.append(new Point(s + 20 * xUnit, 70 * yUnit));
	
	var e2d1 = new AnimLineSeries(e2d1_, 60, W_COLOR, "cyan");
	var e2d2 = new AnimLineSeries(e2d2_, 60, W_COLOR, "cyan");
	
	
	// HOME
	
	var l1_ = new LineSeries(new Point(s + 30 * xUnit, 45 * yUnit));
	l1_.append(new Point(s + 32 * xUnit, 45 * yUnit));
	l1_.append(new Point(s + 34 * xUnit, 45 * yUnit - 2 * xUnit));
	l1_.append(new Point(s + 34 * xUnit, 43 * yUnit - 2 * xUnit));
	
	
	
	var l1 =  new AnimLineSeries(l1_, 20, W_COLOR, "cyan");
	
	var power = new AnimPowerBar(new Point(s + 32.5 * xUnit, 28 * yUnit - 2 * xUnit), 3 * xUnit, 1 * yUnit, 50, 8, W_COLOR);
	
	
	var l2_ = new LineSeries(new Point(s + 34 * xUnit, 28 * yUnit - 2 * xUnit));
	l2_.append(new Point(s + 34 * xUnit, 26 * yUnit - 2 * xUnit));
	l2_.append(new Point(s + 35 * xUnit, 26 * yUnit - 3 * xUnit));
	l2_.append(new Point(s + 36 * xUnit, 26 * yUnit - 3 * xUnit));
	l2_.append(new Point(s + 37 * xUnit, 26 * yUnit - 2 * xUnit));
	l2_.append(new Point(s + 37 * xUnit, 44 * yUnit - 2 * xUnit));
	l2_.append(new Point(s + 38 * xUnit, 44 * yUnit - 1 * xUnit));
	l2_.append(new Point(s + 39 * xUnit, 44 * yUnit - 1 * xUnit));
	l2_.append(new Point(s + 40 * xUnit, 44 * yUnit - 2 * xUnit));
	l2_.append(new Point(s + 40 * xUnit, 43 * yUnit - 2 * xUnit));
	
	var l2 =  new AnimLineSeries(l2_, 30, W_COLOR, "cyan");
	
	var power2 = new AnimPowerBar(new Point(s + 38.5 * xUnit, 28 * yUnit - 2 * xUnit), 3 * xUnit, 1 * yUnit, 50, 8, W_COLOR);
	
	var l3_ = new LineSeries(new Point(s + 40 * xUnit, 28 * yUnit - 2 * xUnit));
	l3_.append(new Point(s + 40 * xUnit, 26 * yUnit - 2 * xUnit));
	l3_.append(new Point(s + 41 * xUnit, 26 * yUnit - 3 * xUnit));
	l3_.append(new Point(s + 55 * xUnit, 26 * yUnit - 3 * xUnit));
	l3_.append(new Point(s + 56 * xUnit, 26 * yUnit - 2 * xUnit));
	l3_.append(new Point(s + 56 * xUnit, 28 * yUnit - 2 * xUnit));

	var l3 =  new AnimLineSeries(l3_, 20, W_COLOR, "cyan");
	
	var portrait = false;
	var size = 80;
	context.font = size + "px Lucida Console";
	
	while(context.measureText("HOME").width > (20 * xUnit))
	{
		size -= 2;
		context.font = size + "px Lucida Console";
	}
	
	var homeTextRect = new ModuleRect(new Rect(new Point(s + 46 * xUnit, 28 * yUnit - 2 * xUnit), 20 * xUnit, 15 * yUnit, W_COLOR), "", 15, 8, "cyan");
	var xLoc = (s + 56 * xUnit) - context.measureText("HOME").width / 2;
	var homeText = new AnimText("HOME", 4, xLoc, 30 * yUnit - 2 * xUnit + size, W_COLOR, size);
	
	
	
	
	var aS1 = new AnimString();
	aS1.push(animLink[0]);
	aS1.push(enc);
	aS1.push(e2d1);
	aS1.push(dec);
	aS1.push(l1);
	aS1.push(power);
	aS1.push(l2);
	aS1.push(power2);
	aS1.push(l3);
	aS1.push(homeTextRect);
	aS1.push(homeText);
	//if
	
	var aS2 = new AnimString();
	aS2.push(animLink[1]);
	
	var aS3 = new AnimString();
	aS3.push(animLink[2]);
	
	var aS4 = new AnimString();
	aS4.push(animLink[3]);
	
	aStrings = [aS1, aS2, aS3, aS4];
}

/**
var throt;
window.addEventListener("resize", function() {
	if(!throt) {
		init_canvas();
		throt = true;
		setTimeout(function() {throt = false;}, 300);
}});**/
