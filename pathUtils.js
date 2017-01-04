
function getPanelInfo(jsonObj, fontsize, unitheight, wpadding, hpadding) {
	var caseName = jsonObj.caseName;
	var jsonFactor = eval(jsonObj.caseFactor);
	jsonObj.w = caseName.length * fontsize;
	jsonObj.h = unitheight;
	jsonObj.t = jsonObj.w;
	for (var i = 0; i < jsonFactor.length; i++) {
		var className = jsonFactor[i].name;
		var realFactor = eval(jsonFactor[i].value);
		jsonFactor[i].w = className.length * fontsize;
		jsonFactor[i].h = unitheight;
		jsonFactor[i].t = jsonFactor[i].w;
		var line_total = 0;
		for (var j = 0; j < realFactor.length; j++) {
			var factorName = realFactor[j].name;
			realFactor[j].w = factorName.length * fontsize;
			realFactor[j].h = unitheight;
			line_total = line_total + realFactor[j].w;
		}
		line_total = line_total + (realFactor.length - 1) * wpadding;
		for (var j = 0; j < realFactor.length; j++) {
			realFactor[j].t = line_total;
		}
		if (jsonObj.width === undefined) {
			jsonObj.width = 0;
		}
		jsonObj.width = line_total > jsonObj.width ? line_total : jsonObj.width;
	}
	jsonObj.height = jsonFactor.length * 2 * (unitheight + hpadding) + unitheight;
	jsonObj.cx = jsonObj.width / 2;
	jsonObj.cy = jsonObj.height / 2;
	return jsonObj;
}

function getUnitInfo(jsonObj, index, panelW, fontsize, unitheight, wpadding, hpadding) {
	var x = (panelW - jsonObj[0].t) / 2
	var y = (index + 1) * 2 * (unitheight + hpadding);
	for (var i = 0; i < jsonObj.length; i++) {
		jsonObj[i].x = x;
		jsonObj[i].y = y;
		x = x + jsonObj[i].name.length * fontsize + wpadding;
	}
}

function makePanel(jsonObj, fontsize, unitheight, wpadding, hpadding) {
	getPanelInfo(jsonObj, fontsize, unitheight, wpadding, hpadding);
	jsonObj.x = (jsonObj.width - jsonObj.t) / 2;
	jsonObj.y = 0;
	var jsonFactor = eval(jsonObj.caseFactor);
	for (var i = 0; i < jsonFactor.length; i++) {
		jsonFactor[i].x = (jsonObj.width - jsonFactor[i].t) / 2;
		jsonFactor[i].y = (i * 2 + 1) * (unitheight + hpadding);
		var realFactor = eval(jsonFactor[i].value);
		getUnitInfo(realFactor, i, jsonObj.width, fontsize, unitheight, wpadding, hpadding);
	}
	console.log(jsonObj);
}

function renderPanel(jsonObj, unitheight, arc) {
	var elem = document.getElementById('path');
	elem.setAttribute('width', jsonObj.width);
	elem.setAttribute('height', jsonObj.height);
	var textx = 2;
	var texty = unitheight / 2 + 3;
	var svg = Snap("#path");
	var caserec = svg.paper.rect(jsonObj.x, jsonObj.y, jsonObj.w, unitheight, arc).attr({
		fill: '#ccd7ff',
		stroke: '#4a6dfb',
		strokeWidth: 2
	});
	svg.paper.text(jsonObj.x + textx, jsonObj.y + texty, jsonObj.caseName).attr({
		"font-size": "13px",
		fill: "#4a6dfb",
	});
	var jsonFactor = eval(jsonObj.caseFactor);
	for(var i = 0; i < jsonFactor.length; i++) {
		var className = jsonFactor[i].name;
		var realFactor = eval(jsonFactor[i].value);
		var classrec = svg.rect(jsonFactor[i].x, jsonFactor[i].y, jsonFactor[i].w, unitheight, arc).attr({
			fill: '#ccd7ff',
			stroke: '#4a6dfb',
			strokeWidth: 2
		});
		svg.paper.text(jsonFactor[i].x + textx, jsonFactor[i].y + texty, className).attr({
			"font-size": "13px",
			fill: "#4a6dfb",
		});
		if (i + 1 < jsonFactor.length) {
			var classrec2 = svg.rect(jsonFactor[i+1].x, jsonFactor[i+1].y, jsonFactor[i+1].w, unitheight, arc);
		}
		if (i === 0) {
			renderPath(svg.paper, caserec, classrec);
		}
		for (var j = 0; j < realFactor.length; j++) {
			var factorName = realFactor[j].name;
			var factorValue = realFactor[j].value;
			if(factorValue===1) {
				var factorrec = svg.rect(realFactor[j].x, realFactor[j].y, realFactor[j].w, unitheight, arc).attr({
					fill: '#4a70f7',
					stroke: '#4a70f7',
					strokeWidth: 2
				});
				svg.paper.text(realFactor[j].x + textx, realFactor[j].y + texty, factorName).attr({
					"font-size": "13px",
					fill: "white",
				});
				renderPath(svg.paper, classrec, factorrec);
				if (i + 1 < jsonFactor.length) {
					renderPath(svg.paper, factorrec, classrec2);
				}
			}
			else {
				svg.rect(realFactor[j].x, realFactor[j].y, realFactor[j].w, unitheight, arc).attr({fill: 'white'});
				svg.paper.text(realFactor[j].x + textx, realFactor[j].y + texty, factorName).attr({
					"font-size": "13px",
					fill: "#4a6dfb",
				});
			}
		}
	}
}

function renderPath(paper, rect1, rect2) {
	var bb1 = rect1.getBBox();
	var bb2 = rect2.getBBox();
	var p1 = paper.path("M0,0 L0,6 L3,3 z").attr({"fill":"#4a70f7"});
	var arrow = p1.marker(0, 0, 10, 10, 0, 3);
	var markerHeight = 6;
	var arcLength = 10;
	if (Math.abs(bb1.cx - bb2.cx) < arcLength) {
		arcLength = Math.abs(bb1.cx - bb2.cx) / 2;
	}
	if (Math.abs(bb2.y - bb1.y2) < arcLength) {
		arcLength = Math.abs(bb1.cx - bb2.cx) / 2;
	}
	var n;
	var n1 = "M" + bb1.cx + "," + bb1.y2 + " ";
	if (bb1.cx === bb2.cx) {
		var n2 = "L" + bb2.cx + "," + (bb2.y - markerHeight);
		n = n1 + n2;
	}
	else if (bb1.cx < bb2.cx) {
		var arc = bb1.y2 + (bb2.y - bb1.y2) / 2;
		var n2 = "V" + (arc - arcLength) + " ";
		var a1 = "Q" + bb1.cx + " " + arc + " " + (bb1.cx + arcLength) + " " + arc;
		var n3 = "H" + (bb2.cx - arcLength) + " ";
		var a2 = "Q" + bb2.cx + " " + arc + " " + bb2.cx + " " + (arc + arcLength);
		var n4 = "L" + bb2.cx + "," + (bb2.y - markerHeight);
		n = n1 + n2 + a1 + n3 + a2 + n4;
	}
	else {
		var arc = bb1.y2 + (bb2.y - bb1.y2) / 2;
		var n2 = "V" + (arc - arcLength) + " ";
		var a1 = "Q" + bb1.cx + " " + arc + " " + (bb1.cx - arcLength) + " " + arc;
		var n3 = "H" + (bb2.cx + arcLength) + " ";
		var a2 = "Q" + bb2.cx + " " + arc + " " + bb2.cx + " " + (arc + arcLength);
		var n4 = "L" + bb2.cx + "," + (bb2.y - markerHeight);
		n = n1 + n2 + a1 + n3 + a2 + n4;
	}
	var path = paper.path(n).attr({
		stroke: "#4a70f7",
		strokeWidth: 2,
		fill: "none",
		class: "path",
		"marker-end": arrow
	});
}
