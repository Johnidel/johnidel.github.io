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

function ModuleRect(rect, text, size, width, bC, lines) {
	this.rect = rect;
	this.text = text;
	this.blur = false;
	this.type = "m";
	this.size = size;
	this.width = width;
	this.done = false;
	this.blurColor = bC;
	this.aLines = new Array();
	this.lines = lines;
	
	var segs = 10;
	var segX = (this.rect.width - (this.width)) / segs;
	for(var i = 0; i < this.lines - 1; i++)
	{
		
		var startX = this.rect.p.x + this.width / 2;
		var startY = this.rect.p.y + this.width / 2 + ((this.rect.height - this.width) / this.lines) * (i + 1);
		var curY = startY;
		var ls = new LineSeries(new Point(startX, startY));
		ls.append(new Point(startX + (segX * segs), startY));
		
		//Not included, this code generate random lines across the module
		//However it is hazardous to perfromance and looks quite bad, improvements arent worth the effort
		//I also like the simplicity of the lines across, it is easier on the eyes
		/**
		for(var curX = startX + segX; curX < this.rect.p.x + this.rect.width + 1; curX += segX)
		{
			var points = new Array();
			points[0] = new Point(curX, curY);
			if(curY - segX > this.rect.p.y)
			{
				points[points.length] = new Point(curX, curY - segX);
			}
			if(curY + segX < this.rect.p.y + this.rect.height)
			{
				points[points.length] = new Point(curX, curY + segX);
			}
			
			var r2 = Math.round((Math.random() * points.length)) + 1;
			alert(r2);
			if(r2 < points.length)
			{
				ls.append(points[r2]);
				curY = points[r2].y;
			}
			else
			{
				ls.append(points[0]);
				curY = points[0].y;
			}
		}*/
		
		this.aLines[i] = new AnimLineSeries(ls, 5, W_COLOR, "cyan", 1, false);
	}
	
	this.draw = function(context) {
		
		var rec = this.rect;
		
		if(this.aLines.length < 100)
		{
			for(var i = 0; i < this.aLines.length; i++)
			{
				this.aLines[i].draw(context);
			}
		}
		else {
			context.fillStyle = "cyan";
			context.shadowBlur = 0;
			context.globalAlpha = .4;
			context.fillRect(rec.p.x, rec.p.y, this.aLines[0].curLineSeries.last.x - rec.p.x, rec.height);
		}
			
		if(this.blur)
		{
			context.shadowBlur = shadowVal;
			context.shadowColor = this.blurColor;
		}
		else {
			context.globalAlpha = .4;
			context.shadowBlur = 0;
		}
		
		context.strokeStyle = this.rect.color;
		context.lineWidth = this.width;
		
		context.strokeRect(Math.round(rec.p.x), Math.round(rec.p.y), Math.round(rec.width), Math.round(rec.height));
		context.font = this.size + "px Lucida Console";
		
		drawText(context, this.text, rec.p.x + (rec.width / 2) - (context.measureText(this.text).width / 2), rec.p.y + this.size + 10, this.size, W_COLOR);
	}
	
	this.update = function () {
		this.blur = true;
		
		for(var i = 0; i < this.aLines.length; i++)
		{
			this.aLines[i].update();
		}
		if(this.aLines[0].done)
			this.done = true;
	}
	
	this.reset = function() {
		this.done = false;
		this.blur = false;
		for(var i = 0; i < this.aLines.length; i++)
		{
			this.aLines[i].reset();
		}
	}
	
	this.copy = function() {
		return new ModuleRect(this.rect, this.text, this.size, this.width, this.blurColor, this.lines);
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
	this.last = p1;
	
	this.append = function(p) {
		this.length += 1;
		this.p[this.length - 1] = p;
		this.euclidean += p.dist(this.p[this.length - 2]);
		this.last = p;
	}
	this.next = function(x, y) {
		this.p[this.length] = new Point(this.p[this.length - 1].x + x, this.p[this.length - 1].y + y);
		this.last = this.p[this.length];
		this.euclidean += this.p[this.length].dist(this.p[this.length - 1]);
		this.length += 1;
		
	}
	this.set = function(i, p) {
		this.p[i] = p;
		this.update();
	}
	this.update = function () {
		this.last = this.p[this.p.length - 1];
	}
	
}

function AnimLineSeries(ls, time, color1, color2, width, blur) {
	this.ls = ls;
	this.animTime = time;
	this.done = false;
	this.type = "a";
	this.color1 = color1;
	this.color2 = color2;
	this.width = width;
	this.blur = blur;
	
	this.copy = function() {
		return new AnimLineSeries(this.ls, this.animTime, this.color1, this.color2, this.width, this.blur);
	}
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
		this.curLineSeries.update();
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
		drawLineSeries(context, this.ls, this.color1, this.width, false);
		drawLineSeries(context, this.curLineSeries, this.color2, this.width, this.blur);
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


		if(this.rects[0].height < this.height)
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
	/**
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
	}**/
	
	this.reset = function() {
		this.rects = new Array();
		for(var i = 0; i < this.segments; i++)
		{
			this.rects[i + 1] = new Rect(new Point(this.p.x, this.p.y + i * this.height * 2), this.width, this.height, this.color);
		}
		this.rects[0] = new Rect(new Point(this.p.x, this.p.y + (this.segments - 1) * this.height * 2 + this.height), this.width, 0, "cyan");
		this.incy = this.height / this.segTime; 
		this.done = false;	
		this.curSeg = this.segments;
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
			context.fillRect(Math.round(rec.p.x), Math.round(rec.p.y), Math.round(rec.width), Math.round(rec.height));
		}
		context.globalAlpha = 1;
		context.shadowBlur = shadowVal;
		context.shadowColor = "cyan";
		var rec = this.rects[0];
		context.fillStyle = rec.color;
		context.fillRect(Math.round(rec.p.x), Math.round(rec.p.y), Math.round(rec.width), Math.round(rec.height));
	}
	
}

function AnimText(text, slow, x, y, color1, color2, size, width) {
	this.text = text;
	this.slow = slow;
	this.x = x;
	this.y = y;
	this.color1 = color1;
	this.color2 = color2;
	this.size = size;
	this.done = false;
	this.width = width;
	
	
	this.draw = function(context) {
		
		var xMin = -(translationS.x) - curTrans.x;
		var xMax = (translationS.x) + window.innerWidth - curTrans.x;
		var yMin = -(translationS.y) - curTrans.y;
		var yMax = (translationS.y) + window.innerHeight - curTrans.y;
		
		if(((this.x > xMin && this.x < xMax) || (this.x + this.width > xMin && this.x + this.width < xMax)) && ((this.y > yMin && this.y < yMax) || (this.y + this.size > yMin && this.y + this.size < yMax)))
		{
			//drawText(context, this.sText, this.x, this.y, this.size, this.color1, false);
			drawText(context, this.aText, this.x, this.y, this.size, this.color2, true);
		}
		else{
			
		}
	}
	
	this.update = function() {
		this.count += 1;
		
		if(this.aText.length < this.text.length)
		{
			this.aText += this.sText[this.aText.length];
			this.sText[this.aText.length - 1] = " ";
		}
		if(this.aText.length < this.text.length)
		{
			this.aText += this.sText[this.aText.length];
			this.sText[this.aText.length - 1] = " ";
		}
		if(this.aText.length < this.text.length)
		{
			this.aText += this.sText[this.aText.length];
			this.sText[this.aText.length - 1] = " ";
		}
		if(this.aText.length < this.text.length)
		{
			this.aText += this.sText[this.aText.length];
			this.sText[this.aText.length - 1] = " ";
		}
		if(this.aText.length == this.sText.length)
			this.done = true;
	}
	
	this.reset = function() {
		this.count = 0;
		this.aText = "";
		this.sText = this.text;
		this.done = false;
	}
	
	this.reset();
	
}

var test;
var tra = new Point(0,0);
function AnimString() {
	this.anims = new Array();
	this.following = new Array();
	this.targeting = new Array();
	this.targets = new Array();
	this.curAnim = 0;
	
	this.push = function(arg) {
		this.anims[this.anims.length] = arg;
	}
	
	this.pushText = function(textArr) {
		
		for(var i = 0; i < textArr.length; i++)
		{
			this.anims[this.anims.length] = textArr[i];
		}
	}
	
	this.update = function() {
		
		if(this.following.indexOf(this.curAnim) >= 0 && this.anims[this.curAnim].done == false)
		{
			var lines = this.anims[this.curAnim].curLineSeries;
			curTrans.x = -(lines.last.x - window.innerWidth  / 2);
			curTrans.y = -(lines.last.y - window.innerHeight / 2);
			translation = curTrans.copy();
			follow = true;
			followDone = false;
		}
		else if(this.targeting.indexOf(this.curAnim) >= 0 && this.anims[this.curAnim].done == false)
		{
			var ind = this.targeting.indexOf(this.curAnim);
			curTrans.x = -(this.targets[ind].x - window.innerWidth  / 2);
			curTrans.y = -(this.targets[ind].y - window.innerHeight / 2);
			translation = curTrans.copy();
			follow = true;
			followDone = false;
		}
		else {
			followDone = true;
		}
		
		this.anims[this.curAnim].update();
		for(var i = this.curAnim + 1; i < this.anims.length; i++)
			this.anims[i].reset();
		
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
	
	this.follow = function() {
		this.following[this.following.length] = this.anims.length - 1;
	}
	
	this.target = function(x, y) {
		this.targeting[this.targeting.length] = this.anims.length - 1;
		this.targets[this.targets.length] = new Point(x, y);
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
	for(var i = 0; i < aStrings.length; i++)
	{
		aStrings[i].reset();
	}	
}

var scale = 1;

function init_canvas(){
	var canvas = document.getElementById("main_canvas");
	canvas.width = window.innerWidth * 1;
	canvas.height = window.innerHeight * 1;
	document.getElementById("home").addEventListener("click", function() {animSelect = 1; reset();});
	document.getElementById("about").addEventListener("click", function() {animSelect = 2; reset();});
	document.getElementById("projects").addEventListener("click", function() {animSelect = 3; reset();});
	document.getElementById("contact").addEventListener("click", function() {animSelect = 4; reset();});
	var context = canvas.getContext('2d');
	
	canvas.onmousedown = handleMouseDown;
	canvas.onmousemove = handleMouseMove;
	canvas.onmouseup = handleMouseUp;
	canvas.onmouseout = handleMouseOut;
	canvas.onwheel = function(e) {
		var scaleI = scale;
		if(e.wheelDelta > 0)
		{
			scale += .05;
		}
		else {
			scale -= .05;
		}
		if(scale < .05)
			scale = .05;
		if(scale > 3)
			scale = 3;
		
		var delta = (scale - 1) / scale;
		
		translationS.x = -(window.innerWidth) * (delta) / 2;
		translationS.y = -(window.innerHeight) * (delta) / 2;
		
		handleMouseMove(e);
	}
	
	canvas.addEventListener("touchstart", touchStart, false);
	canvas.addEventListener("touchmove", touchMove, false);
	canvas.addEventListener("touchend", touchEnd, false);
	canvas.addEventListener("touchcancel", touchEnd, false);

	
	init(context);
	update();
}

var textIter;

var translation = new Point(0,0);
var translationS = new Point(0,0);

var prevTrans = new Point(0,0);

var maxTransO = Math.sqrt(1000);
var follow = false;
var followDone = true;

function update() {
	

	if(scale > 1)
		shadowVal = shadowC / scale;
	else {
		shadowVal = shadowC * scale;
	}
	//Override shadows(laggy)
	shadowVal = 0;
	var canvas = document.getElementById('main_canvas');
	var context = canvas.getContext('2d');
	context.globalAlpha = 1;
	context.fillStyle = "#0E0F0F";
	context.fillRect(-100000,-100000,200000,200000);
	
	context.save();
	var maxTrans = maxTransO / (scale);
	var followC = follow;

	var traStart = new Point(curTrans.x, curTrans.y);

	
	if((traStart.x - prevTrans.x) * (traStart.x - prevTrans.x) + (traStart.y - prevTrans.y) * (traStart.y - prevTrans.y) > maxTrans * maxTrans && follow)
	{
		var mag = Math.sqrt((traStart.x - prevTrans.x) * (traStart.x - prevTrans.x) + (traStart.y - prevTrans.y) * (traStart.y - prevTrans.y));
		traStart = new Point((traStart.x - prevTrans.x) / mag * maxTrans + prevTrans.x, (traStart.y - prevTrans.y) / mag * maxTrans + prevTrans.y);
		
		
	}
	
	if(follow && followDone && traStart.x == curTrans.x && traStart.y == curTrans.y)
	{
		follow = false;
	}
	

	prevTrans = new Point(traStart.x, traStart.y);

	context.scale(scale, scale);
	

	context.translate(traStart.x, traStart.y);
	context.translate(translationS.x, translationS.y);

	context.shadowBlur = shadowVal;
	
	if(window.innerWidth > 700)
		drawGrid(context, 7);
	
	for(var i = 0; i < aStrings.length; i++)
	{	
		if(animSelect == i + 1)
		{
			//916
			aStrings[i].update();
		}
	}

	for(var i = 0; i < aStrings.length; i++)
	{
		aStrings[i].draw(context);
	}	

	
	context.restore();
	
	t = t + 1;
	if(t % 5 == 0)
	{
		if(shadowC < 50 && shadowDir == 0)
		{
			shadowC += 2;
			if(shadowC == 50)
				shadowDir = 1;
		}
		else {
			shadowC -= 2;
			if(shadowC == 10)
				shadowDir = 0;
		}
	}
	
	if(window.innerHeight > window.innerWidth)
	{
		shadowC = 0;
	}
	
	window.requestAnimationFrame(update);
}

function drawGrid(context, color) {

	context.strokeStyle = "#634444";
	context.lineWidth = 1;
	context.shadowColor = "cyan";
	context.globalAlpha = .4;
	context.shadowBlur = shadowVal;
	
	context.beginPath();
	for(var i = -10000; i < 10000; i+= 50 / Math.sqrt(scale))
	{
			context.moveTo(Math.round(i), -10000);
			context.lineTo(Math.round(i), 10000);
			context.moveTo(-10000, Math.round(i));
			context.lineTo(10000, Math.round(i));
	}
	
	context.stroke();
	
}

function drawText(context, text, x, y, size, color, high)
{
	if(!high)
	{
		context.globalAlpha = .4;
		context.shadowBlur = 0;
	}	
	else {
		context.globalAlpha = 1;
		context.shadowBlur = shadowVal;
	}
	context.font = "Bolder " + size + "px Lucida Console";
	context.fillStyle = color;
	context.fillText(text, Math.round(x), Math.round(y));
	/**
	context.globalAlpha = .1;
	context.strokeStyle = "cyan";
	context.lineWidth = 2;
	context.strokeText(text, Math.round(x), Math.round(y));**/
}

function drawLine(context, line) {
	context.beginPath();
	context.moveTo(line.p1.x, line.p1.y);
	 context.lineTo(line.p2.x, line.p2.y);
	context.strokeStyle = "white";
	context.lineWidth = 5;
	 context.stroke();
}

function drawLineSeries(context, series, color, width, blur) {

	context.beginPath();
	context.moveTo(Math.round(series.p[0].x), Math.round(series.p[0].y));
	for(i = 1; i < series.length; i++)
	{
		context.lineTo(Math.round(series.p[i].x), Math.round(series.p[i].y));
	}
	context.strokeStyle = color;
	if(blur)
	{
		
		context.shadowBlur = shadowVal;
		context.shadowColor = color;
		context.globalAlpha = 1;
	}
	else {
		context.globalAlpha = .3;
		context.shadowBlur = 0;
	}
	context.lineWidth = width;
	context.stroke();

}

function readText(str) {
	var arr = str.split("$");
	arr.splice(0,1);
	return arr;
}

function setupText(text, rect, color1, color2, size, context)
{
	animArray = new Array();
	var maxH = rect.height;
	var maxW = rect.width * 14/16;
	var lines = 0; 
	var curWidth = 0;
	var curH = 0;
	var startI = 0;
	var fits = true;
	var center = false;
	
	
	var s = size;
	for(var i = 0; i < text.length; i++)
	{
		curWidth = 0;
		var firstChar = text[i].substring(0, text[i].indexOf("_"));
		var rest = text[i].substring(text[i].indexOf("_") + 1, text[i].length);
		var words = rest.split(" ");
		
		
		if(firstChar.indexOf("#") >= 0)
		{
			s = size * 2.5;
		}
		if(firstChar.indexOf("!") >= 0)
		{
			words.splice(0,0,"     ");
			s = size;
		}
		if(firstChar.indexOf("C") >= 0)
		{
			center = true;
		}
		context.font = "Bolder " + s + "px Lucida Console";
		var spaceW = context.measureText(" ").width;
		for(var i2 = 0; i2 < words.length; i2++)
		{
			
			var wW = context.measureText(words[i2]).width;
			if(wW > maxW)
			{
				fits = false;
				break;
				
			}
			
			if(wW + curWidth > maxW)
			{
				lines++;
				curH += s;
				var tWords = words.slice();
				
				var line = tWords.splice(startI, i2 - startI);
				
				var lineT = "";
				
				for(var inc = 0; inc < line.length; inc++)
				{
					lineT += line[inc] + " ";
				}
				
				curWidth -= spaceW;
				var xLoc;

				if(!center)
					xLoc = rect.p.x + rect.width / 16;
				else 
					xLoc = rect.p.x + (rect.width / 2) - (curWidth / 2);
				
				animArray[animArray.length] = new AnimText(lineT, 2, xLoc, curH + rect.p.y, color1, color2, s,  context.measureText(lineT).width);
				
				startI = i2;
				curWidth = wW + spaceW;
			}
			else {
				curWidth += wW + spaceW;
			}
		}
		var tWords = words.slice();
		var last = tWords.splice(startI, words.length - startI);
		if(last.length != 0)
		{
			var lineT = "";
			for(var inc = 0; inc < last.length; inc++)
			{
				lineT += last[inc] + " ";
			}
				
			lines++;
			curH += s;
			curWidth -= spaceW;
			var xLoc;
			if(!center)
					xLoc = rect.p.x + rect.width / 16;
				else 
					xLoc = rect.p.x + (rect.width / 2) - (curWidth / 2);
				
			animArray[animArray.length] = new AnimText(lineT, 1, xLoc, curH + rect.p.y, color1, color2, s, context.measureText(lineT).width);
			startI = 0;
			
		}	
		
	}
	
	if(curH > maxH || !fits)
		animArray = setupText(text, rect, color1, color2, size - .5, context);
	return animArray;
}

var shadowVal, shadowDir, shadowC, animSelect;
var inAnim;

var mouseDown;

var aStrings;

function init(context) {
	
	t = 0;
	
	
	xUnit = window.innerWidth / 100;
	yUnit = window.innerHeight / 100;
	
	//Needed to not break when height gets very small, hard to 45 angles at this points
	//Lesser of the 2 evils is to overflow off screen and let user pan
	//Ata certain point you can't be sympatetic for people operating at these resolutions
	if(window.innerHeight < 610)
	{
		xUnit = window.innerWidth / 100;
		yUnit = window.innerHeight / 100 ;
	}
	
	shadowC = 20;
	shadowDir = 0;
	var homeRect = document.getElementById("home").getBoundingClientRect();
	var homeX = (homeRect.left + homeRect.width / 2);
	var homeY = document.getElementById("top").getBoundingClientRect().bottom + 1;
	
	var LINE_WIDTH = 8;
	
	if(window.innerWidth < 700)
	{
		LINE_WIDTH = 3;
	}

	
	var homeSeries = new LineSeries(new Point(homeX, homeY));
	homeSeries.append(new Point(homeX, homeY + 3 * homeX));

	
	var aboutRect = document.getElementById("about").getBoundingClientRect();
	var aboutX = (aboutRect.left + aboutRect.width / 2);
	
	var aboutSeries = new LineSeries(new Point(aboutX, homeY));
	aboutSeries.append(new Point(aboutX, homeY + .4 * homeX));
	aboutSeries.append(new Point(aboutX - .2 * homeX, homeY + .6 * homeX));
	aboutSeries.append(new Point(homeX + .5 * homeX, homeY + .6 * homeX));
	aboutSeries.append(new Point(homeX + .2 * homeX, homeY + .9 * homeX));
	aboutSeries.append(new Point(homeX + .2 * homeX, homeY + 3 * homeX));

	
	var projectRect = document.getElementById("projects").getBoundingClientRect();
	var projectX = (projectRect.left + projectRect.width / 2);

	var projectSeries = new LineSeries(new Point(projectX, homeY));
	projectSeries.append(new Point(projectX, homeY + .8 * homeX));
	projectSeries.append(new Point(projectX - .2 * homeX, homeY + 1.0 * homeX));
	projectSeries.append(new Point(homeX + .8 * homeX, homeY + 1.0 * homeX));
	projectSeries.append(new Point(homeX + .5 * homeX, homeY + 1.3 * homeX));
	projectSeries.append(new Point(homeX + .5 * homeX, homeY + 3 * homeX));


	var contactRect = document.getElementById("contact").getBoundingClientRect();
	var contactX = (contactRect.left + contactRect.width / 2);
	
	var contactSeries = new LineSeries(new Point(contactX, homeY));
	contactSeries.append(new Point(contactX, homeY + .4 * homeX));
	contactSeries.append(new Point(contactX - .2 * homeX, homeY + .6 * homeX));
	contactSeries.append(new Point(projectX + (-projectX + contactX) * .25, homeY + .6 * homeX));
	contactSeries.append(new Point(projectX + (-projectX + contactX) * .25 - .2 * homeX, homeY + .8 * homeX));
	contactSeries.append(new Point(projectX + (-projectX + contactX) * .25 - .2 * homeX, homeY + 1 * homeX));
	contactSeries.append(new Point(projectX + (-projectX + contactX) * .25 - .4 * homeX, homeY + 1.2 * homeX));
	contactSeries.append(new Point(homeX + 1.1 * homeX, homeY + 1.2 * homeX));
	contactSeries.append(new Point(homeX + .8 * homeX, homeY + 1.5 * homeX));
	contactSeries.append(new Point(homeX + .8 * homeX, homeY + 3 * homeX));


	var animLink = [
		new AnimLineSeries(homeSeries, 20, W_COLOR, "cyan", LINE_WIDTH, true),
		new AnimLineSeries(aboutSeries, 20, W_COLOR, "cyan", LINE_WIDTH, true),
		new AnimLineSeries(projectSeries, 20, W_COLOR, "cyan", LINE_WIDTH, true),
		new AnimLineSeries(contactSeries, 20, W_COLOR, "cyan", LINE_WIDTH, true)
	];

	//BEGIN HOME
	
	animSelect = 0;
	
	/**
	var s = 2.2955 * homeX;
	var enc = new ModuleRect(new Rect(new Point(2.2955 * homeX, 40 * yUnit), 10 * xUnit, 40 * yUnit, "cyan"), "", 15, 3, "cyan", 30);
	var dec = new ModuleRect(new Rect(new Point(2.2955 * homeX + 25 * xUnit, 40 * yUnit), 10 * xUnit, 40 * yUnit, "cyan"), "", 15, 3, "cyan", 30);
	
	var e2d1_ = new LineSeries(new Point(s + 10 * xUnit, 50 * yUnit));
	e2d1_.append(new Point(s + 25 * xUnit, 50 * yUnit));
	var e2d2_ = new LineSeries(new Point(s + 10 * xUnit,70 * yUnit));
	e2d2_.append(new Point(s + 25 * xUnit, 70 * yUnit));
	
	var e2d1 = new AnimLineSeries(e2d1_, 20, W_COLOR, "cyan", 8, true);
	var e2d2 = new AnimLineSeries(e2d2_, 20, W_COLOR, "cyan", 8, true);**/
	
	var declines = 25;
	
	var OX = homeX;
	var s = 0;
	var OY = homeY + 3 * homeX;
	
	var u = homeX / 10;
	
	var homeSelectRect = new ModuleRect(new Rect(new Point(6 * u, homeY - 5 * u), 8 * u, 5 * u, "cyan"), "", 15, 3, "cyan", 1500);
	
	var homeSelectText = setupText(readText("$#C_Home"), homeSelectRect.rect, W_COLOR, "black", 20, context)
	
	var enc = new ModuleRect(new Rect(new Point(OX - .3 * homeX, OY), 1.4 * homeX, 2 * homeX, "cyan"), "", 15, 3, "cyan", declines);
	var dec = new ModuleRect(new Rect(new Point(OX + 2.6 * homeX, OY - 1 * homeX), 1.4 * homeX, 4 * homeX, "cyan"), "", 15, 3, "cyan", declines);
	
	var e2d1_ = new LineSeries(new Point(OX + 1.1 * homeX, OY + .5 * homeX));
	e2d1_.append(new Point(OX + 2.6 * homeX, OY + .5 * homeX));
	var e2d2_ = new LineSeries(new Point(OX + 1.1 * homeX, OY + 1.5 * homeX));
	e2d2_.append(new Point(OX + 2.6 * homeX, OY + 1.5 * homeX));
	
	var e2d1 = new AnimLineSeries(e2d1_, 20, W_COLOR, "cyan", LINE_WIDTH, true);
	var e2d2 = new AnimLineSeries(e2d2_, 20, W_COLOR, "cyan", LINE_WIDTH, true);
	
	var l1_ = new LineSeries(new Point(OX + 4 * homeX, OY - .25 * homeX));
	l1_.append(new Point(contactX + 1 * homeX, OY - .25 * homeX));
	l1_.next(2 * u, -2 * u);
	l1_.next(0, -1 * u);
	
	var l1 =  new AnimLineSeries(l1_, 10, W_COLOR, "cyan", LINE_WIDTH, true);
	
	var power = new AnimPowerBar(new Point(l1_.last.x - 5 * u, l1_.last.y - 19 * u), 10 * u, 1 * u, 20, 10, W_COLOR);
	
	var l2_ = new LineSeries(new Point(l1_.last.x, l1_.last.y - 19 * u));
	l2_.next(0, -1 * u);
	l2_.next(2 * u, -2 * u);
	l2_.next(7 * u, 0);
	l2_.next(2 * u, 2 * u);
	l2_.next(0, 21 * u);
	l2_.next(2*u, 2*u);
	l2_.next(5*u, 0);
	l2_.next(2*u, -2*u);
	l2_.next(0, -u);
	
	var l2 =  new AnimLineSeries(l2_, 10, W_COLOR, "cyan", LINE_WIDTH, true);
	
	var power2 = new AnimPowerBar(new Point(l2_.last.x - 5 * u, l2_.last.y - 19 * u), 10 * u, 1 * u, 20, 10, W_COLOR);
	
	var l3_ = new LineSeries(new Point(l2_.last.x, l2_.last.y - 19 * u));
	l3_.next(0, -1 * u);
	l3_.next(2 * u, -2 * u);
	l3_.next(30 * u, 0);
	l3_.next(2 * u, 2 * u);
	l3_.next(0, 1 * u);
	
	
	var l3 =  new AnimLineSeries(l3_, 10, W_COLOR, "cyan", LINE_WIDTH, true);
	
	var homeRect = new ModuleRect(new Rect(new Point(l3_.last.x - 20 * u, l3_.last.y), 40 * u, 40 * u, "cyan"), "", 15, 3, "cyan", 300);
	
	var contents = "$#_Home$_ $!_Welcome, feel free to pan the camera around and explore!$_Make use of zoom if something isnt on the screen.$_ $_Click the buttons and the \"circuit\" will take you there.";

	contents = readText(contents);
	homeText = setupText(contents, homeRect.rect, W_COLOR, "black", 20, context);

	var aS1 = new AnimString();
	aS1.push(homeSelectRect);
	aS1.pushText(homeSelectText);
	aS1.push(animLink[0]);
	aS1.push(enc);
	aS1.push(e2d1);
	aS1.push(e2d2);
	aS1.push(dec);
	aS1.push(l1);
	aS1.push(power);
	aS1.push(l2);
	aS1.push(power2);
	aS1.push(l3);
	aS1.push(homeRect);
	
	for(var i = 0; i < homeText.length; i++)
	{
		aS1.push(homeText[i]);
	}
	
	//About Me
	
	var aboutSelectRect = new ModuleRect(new Rect(new Point(aboutX - 4 * u, homeY - 5 * u), 8 * u, 5 * u, "cyan"), "", 15, 3, "cyan",  150);
	
	var aboutSelectText = setupText(readText("$#C_About Me"), aboutSelectRect.rect, W_COLOR, "black", 20, context);
	
	var l4_ = new LineSeries(new Point(OX + 4 * homeX, OY + 5 * u));
	l4_.next(40 * u, 0);
	l4_.next(15 * u, 15 * u);
	l4_.next(70 * u, 0);
	l4_.next(150 * u, -150 * u);
	l4_.next(0, -100 * u);
	
	var l4 =  new AnimLineSeries(l4_, 120, W_COLOR, "cyan", LINE_WIDTH, true);
	
	var power3 = new AnimPowerBar(new Point(l4_.last.x - 10 * u, l4_.last.y - 78 * u), 20 * u, 2 * u, 60, 20, W_COLOR);
	
	var l5_ = new LineSeries(new Point(l4_.last.x, power3.p.y));
	l5_.next(0, -2 * u);
	l5_.next(4 * u, -4 * u);
	l5_.next(20 * u, 0);
	
	var l5 =  new AnimLineSeries(l5_, 10, W_COLOR, "cyan", LINE_WIDTH, true);
	
	var aboutDec = new ModuleRect(new Rect(new Point(l5_.last.x, l5_.last.y - 7.5 * u), 15 * u, 15 * u, "cyan"), "", 15, 3, "cyan",  declines);
	
	var l6_ = new LineSeries(new Point(aboutDec.rect.p.x + aboutDec.rect.width, l5_.last.y));
	l6_.next(20 * u, 0);
	
	var l6 =  new AnimLineSeries(l6_, 10, W_COLOR, "cyan", LINE_WIDTH, true);
	
	var aboutT = new ModuleRect(new Rect(new Point(l6_.last.x, l6_.last.y - 7.5 * u), 40 * u, 15 * u, "cyan"), "", 15, 3, "cyan",  150);	
	
	var aboutTText = setupText(readText("$#C_About Me"), aboutT.rect, W_COLOR, "black", 30, context);
	
	var l7_ = new LineSeries(new Point(aboutDec.rect.p.x + aboutDec.rect.width / 2, aboutDec.rect.p.y + aboutDec.rect.height));
	l7_.next(0, 5 * u);
	l7_.next(2 * u, 2 * u);
	l7_.next(10 * u, 0);
	
	var l7 =  new AnimLineSeries(l7_, 10, W_COLOR, "cyan", LINE_WIDTH, true);
	
	var aboutC = new ModuleRect(new Rect(new Point(l7_.last.x, l7_.last.y - 5* u), 56 * u, 60 * u, "cyan"), "", 15, 3, "cyan",  150);	
	
	var aboutCText = setupText(readText("$!_I am a second year computer engineering student at Boston University.$_My primary interests are in software development. I have worked on a wide range of projects ranging from mobile games to desktop client-server software. I am interested in creating software that makes everyday life a little bit easier.$_I code in a wide variety of languages including:$!_*Java, Java EE$!_*C, C++$!_*Javascript, HTML$!_*Python, MySQL"), aboutC.rect, W_COLOR, "black", 30, context);
	
	var aS2 = new AnimString();
	aS2.push(aboutSelectRect);
	aS2.target(aboutSelectRect.rect.p.x, aboutSelectRect.rect.p.y);
	aS2.pushText(aboutSelectText);
	aS2.push(animLink[1]);
	aS2.push(enc.copy());
	aS2.target(enc.rect.p.x + enc.rect.width / 2, enc.rect.p.y + enc.rect.height / 2);
	aS2.push(e2d1.copy());
	aS2.push(e2d2.copy());
	aS2.push(dec.copy());
	aS2.push(l4);
	aS2.follow();
	
	aS2.push(power3);
	aS2.target(power3.p.x + window.innerWidth / 2 - 2 * u, power3.p.y + window.innerHeight / 2 - homeY - 15 * u);
	aS2.push(l5);
	aS2.push(aboutDec);
	aS2.push(l6);
	aS2.push(aboutT);
	aS2.pushText(aboutTText);
	aS2.push(l7);
	aS2.push(aboutC);
	aS2.pushText(aboutCText);
	
	//PROJECTS
	
	var projectSelectRect = new ModuleRect(new Rect(new Point(projectX - 4 * u, homeY - 5 * u), 8 * u, 5 * u, "cyan"), "", 15, 3, "cyan",  150);
	
	var projectSelectText = setupText(readText("$#C_Projects"), projectSelectRect.rect, W_COLOR, "black", 20, context);
	
	var l10_ = new LineSeries(new Point(OX + 4 * homeX, OY + 14 * u));
	l10_.next(20 * u, 0);
	l10_.next(100 * u, 100 * u);
	l10_.next(0, 80 * u);
	l10_.next(4 * u, 4 * u);
	l10_.next(4 * u, 0);
	l10_.next(4 * u, -4 * u);
	l10_.next(0, -2 * u);
	
	var l10 =  new AnimLineSeries(l10_, 80, W_COLOR, "cyan", LINE_WIDTH, true);
	
	var power5 = new AnimPowerBar(new Point(l10_.last.x - 6 * u, l10_.last.y - 49 * u), 12 * u, 1 * u, 60, 25, W_COLOR);
	
	var aS3 = new AnimString();
	aS3.push(projectSelectRect);
	aS3.target(projectSelectRect.rect.p.x + projectSelectRect.rect.width / 2, projectSelectRect.rect.p.y + projectSelectRect.rect.height / 2);
	aS3.pushText(projectSelectText);
	aS3.push(animLink[2]);
	aS3.push(enc.copy());
	aS3.target(enc.rect.p.x + enc.rect.width / 2, enc.rect.p.y + enc.rect.height / 2);
	aS3.push(e2d1.copy());
	aS3.push(e2d2.copy());
	aS3.push(dec.copy());
	aS3.push(l10);
	aS3.follow();
	aS3.push(power5);
	aS3.target(power5.p.x + window.innerWidth / 2 - 4 * u, power5.p.y + window.innerHeight / 2 - homeY - 15 * u);
	

	
	
	
	
	
	
	//CONTACT
	
	var contactSelectRect = new ModuleRect(new Rect(new Point(contactX - 4 * u, homeY - 5 * u), 8 * u, 5 * u, "cyan"), "", 15, 3, "cyan",  150);
	
	var contactSelectText = setupText(readText("$#C_Contact"), contactSelectRect.rect, W_COLOR, "black", 20, context);
	
	
	var l8_ = new LineSeries(new Point(OX + 4 * homeX, OY + 23 * u));
	l8_.next(10 * u, 0);
	l8_.next(2 * u, 2 * u);
	l8_.next(0, 40 * u);
	l8_.next(-4 * u, 4 * u);
	l8_.next(-40 * u, 40 * u);
	l8_.next(-40 * u, 0);
	l8_.next(-2 * u, 2 * u);
	l8_.next(0, 25 * u);
	l8_.next(2 * u, 2 * u);
	l8_.next(10 * u, 0);
	l8_.next(2 * u, -2 * u);
	l8_.next(0, -2 * u);
	
	
	
	var l9_ = new LineSeries(new Point(l8_.last.x, l8_.last.y - 9 * u));
	l9_.next(0, -2 * u);
	l9_.next(2* u, -2 * u);
	l9_.next(5* u, 0);
	
	var l8 =  new AnimLineSeries(l8_, 80, W_COLOR, "cyan", LINE_WIDTH, true);
	var l9 =  new AnimLineSeries(l9_, 10, W_COLOR, "cyan", LINE_WIDTH, true);
	
	var power4 = new AnimPowerBar(new Point(l8_.last.x - 5 * u, l8_.last.y - 9 * u), 10 * u, 1 * u, 60, 5, W_COLOR);
	
	var contactT = new ModuleRect(new Rect(new Point(l9_.last.x, l9_.last.y - 7.5 * u), 40 * u, 15 * u, "cyan"), "", 15, 3, "cyan",  150);	
	
	var contactText = setupText(readText("$#C_-------$#C_Coming Soon$#C_-------"), contactT.rect, W_COLOR, "black", 30, context);
	
	var aS4 = new AnimString();
	aS4.push(contactSelectRect);
	aS4.target(contactSelectRect.rect.p.x + contactSelectRect.rect.width / 2, contactSelectRect.rect.p.y + contactSelectRect.rect.height / 2);
	aS4.pushText(contactSelectText);
	aS4.push(animLink[3]);
	aS4.push(enc.copy());
	aS4.target(enc.rect.p.x + enc.rect.width / 2, enc.rect.p.y + enc.rect.height / 2);
	aS4.push(e2d1.copy());
	aS4.push(e2d2.copy());
	aS4.push(dec.copy());
	aS4.push(l8);
	aS4.follow();
	aS4.push(power4);
	aS4.push(l9);
	aS4.target(contactT.rect.p.x + contactT.rect.width / 2, contactT.rect.p.y + contactT.rect.height / 2);
	aS4.push(contactT);
	aS4.pushText(contactText);
	
	aStrings = [aS1, aS2, aS3, aS4];
}

var anc = new Point(0,0);
var curTrans = new Point(0,0);

function handleMouseDown(e) {
	mouseDown = true;
	anc = new Point(e.clientX, e.clientY);
	
}

function handleMouseMove(e) {
	if(mouseDown && !follow)
	{
		curTrans = new Point(translation.x + 1 / scale * (e.clientX - anc.x), translation.y + 1 / scale * (e.clientY - anc.y));
	}
	
}

function handleMouseUp(e) {
	mouseDown = false;
	translation = curTrans.copy();

}

function handleMouseOut(e) {
	handleMouseUp(e);
}

function touchStart(e) {
	touch1 = e.changedTouches[0];
	if(!mouseDown)
		anc = new Point(touch1.clientX, touch1.clientY);
	mouseDown = true;
}
var touchScroll = false;
var touchDist = 0;

function touchMove(e) {
	e1 = e.changedTouches[0];
	if(mouseDown && e.changedTouches.length == 1)
	{	
		curTrans = new Point(translation.x + 1 / scale * (e1.clientX - anc.x), translation.y + 1 / scale * (e1.clientY - anc.y));
	}
	else if(e.changedTouches.length == 2 && !touchScroll)
	{
		touchScroll = true;
		e2 = e.changedTouches[1];
		var d = (e1.clientX - e2.clientX) * (e1.clientX - e2.clientX) + (e1.clientY - e2.clientY) + (e1.clientY - e2.clientY);
		touchDist = d;
	}
	else if(e.changedTouches.length == 2)
	{
		e2 = e.changedTouches[1];
		var d = (e1.clientX - e2.clientX) * (e1.clientX - e2.clientX) + (e1.clientY - e2.clientY) + (e1.clientY - e2.clientY);
		
		if(d - touchDist > 10)
		{
			scale += .05;
			touchDist = d;
		}
		else if(d - touchDist < -10){
			scale -= .05;
			touchDist = d;
		}
		
		if(scale < .05)
			scale = .05;
		if(scale > 3)
			scale = 3;
		
		var delta = (scale - 1) / scale;
		
		translationS.x = -(window.innerWidth) * (delta) / 2;
		translationS.y = -(window.innerHeight) * (delta) / 2;
	}
}

function touchEnd(e) {
	mouseDown = false;
	translation = curTrans.copy();
}

/**
var throt;
window.addEventListener("resize", function() {
	if(!throt) {
		init_canvas();
		throt = true;
		setTimeout(function() {throt = false;}, 300);
}});**/

