var gl;

function initGL(canvas) {
	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry :-(");
	}
}

function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

var shaderProgram;

function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram,
			"aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram,
			"aVertexColor");
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram,
			"uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram,
			"uMVMatrix");
}

var mvMatrix;
var mvMatrixStack = [];
var pMatrix;

function mvPushMatrix() {
	var copy = new okMat4();
	mvMatrix.clone(copy);
	mvMatrixStack.push(copy);
}

function mvPopMatrix() {
	if (mvMatrixStack.length == 0) {
		throw "Invalid popMatrix!";
	}
	mvMatrix = mvMatrixStack.pop();
}

function setMatrixUniforms() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix.toArray());
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix
			.toArray());
}
var currentlyPressedKeys = {};

function handleKeyDown(event) {
	currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
	currentlyPressedKeys[event.keyCode] = false;
}
var pitch = 0;
var pitchRate = 0;
var yaw = 0;
var yawRate = 0;

var xPos = 0.0;
var yPos = 0.0;
var zPos = 0.0;
var deltaY = 0.0;
var distance = 150;
var speeddelta = 0.03;

var speed = 0;
function handleKeys() {
	if (currentlyPressedKeys[33]) {
		// Page Up
		pitchRate = 0.01;
	} else if (currentlyPressedKeys[34]) {
		// Page Down
		pitchRate = -0.01;
	} else {
		pitchRate = 0;
	}

	if (currentlyPressedKeys[37] || currentlyPressedKeys[65]) {
		// Left cursor key or A
		yawRate = 0.1;
	} else if (currentlyPressedKeys[39] || currentlyPressedKeys[68]) {
		// Right cursor key or D
		yawRate = -0.1;
	} else {
		yawRate = 0;
	}

	if (currentlyPressedKeys[38] || currentlyPressedKeys[87]) {
		// Up cursor key or W
		speed = speeddelta;
	} else if (currentlyPressedKeys[40] || currentlyPressedKeys[83]) {
		// Down cursor key
		speed = -speeddelta;
	} else {
		speed = 0;
	}

}

var triangleVertexPositionBuffer;
var triangleVertexColorBuffer;

function initBuffers() {
	triangleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPosition),
			gl.STATIC_DRAW);
	triangleVertexPositionBuffer.itemSize = 3;
	triangleVertexPositionBuffer.numItems = vertexCnt;

	triangleVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
	var colors = [];
	for ( var i = 0; i < vertexCnt; i++) {
		/* colors[4*i]=vertexPosition3[i]/65535;
		 colors[4*i+1]=vertexPosition3[i]/65535;
		 colors[4*i+2]=0.0;
		 colors[4*i+3]=1.0;*/
		colors[4 * i] = 1.0;
		colors[4 * i + 1] = 1.0;
		colors[4 * i + 2] = 0.0;
		colors[4 * i + 3] = 1.0;
	}
	;
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	triangleVertexColorBuffer.itemSize = 4;
	triangleVertexColorBuffer.numItems = vertexCnt;

	document.getElementById("loadingtext").textContent = "";
}

function drawScene() {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	if (triangleVertexPositionBuffer == null) {
		return;
	}

	pMatrix = okMat4Proj(75, gl.viewportWidth / gl.viewportHeight, 0.1,
			distance);
	mvMatrix = new okMat4();

	mvPushMatrix();
	mvMatrix.translate(OAK.SPACE_WORLD, -pwgl.TranslateX, -pwgl.TranslateY,
			-pwgl.TranslateZ, true);
	mvMatrix.rotX(OAK.SPACE_WORLD, -90, true);
	mvMatrix.translate(OAK.SPACE_WORLD, -xPos + 8, -yPos + deltaY, -zPos - 50,
			true);
	mvMatrix.rotY(OAK.SPACE_WORLD, -yaw, true);
	mvMatrix.rotX(OAK.SPACE_WORLD, -pitch, true);

	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
			triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	setMatrixUniforms();
	gl.drawArrays(gl.Point, 0, triangleVertexPositionBuffer.numItems);
	mvPopMatrix();
}

function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

var lastTime = 0;
var joggingAngle = 0;
function animate() {
	var timeNow = new Date().getTime();
	if (lastTime != 0) {
		var elapsed = timeNow - lastTime;
		if (speed != 0) {
			xPos -= Math.sin(degToRad(yaw)) * speed * elapsed;
			zPos -= Math.cos(degToRad(yaw)) * speed * elapsed;

			joggingAngle += elapsed * 0.6; // 0.6 "fiddle factor" - makes it feel more realistic :-)
			yPos = Math.sin(degToRad(joggingAngle)) / 20 + 0.4
		}
		yaw += yawRate * elapsed;
		pitch += pitchRate * elapsed;
	}
	lastTime = timeNow;
}

function tick() {
	okRequestAnimationFrame(tick);
	var obj = document.getElementById('viewpointselect');
	var index = obj.selectedIndex; //序号，取当前选中选项的序号
	if (index == 1) {
		deltaY = 5;
		speeddelta = 0.008;
		distance = 50;
	} else {
		deltaY = 0;
		speeddelta = 0.03;
		distance = 150;

	}
	handleKeys();
	drawScene();
	animate();
}

function webGLStart() {
	var canvas = document.getElementById("canvas");
	initGL(canvas);
	initShaders();
	calcPointTran();
	initBuffers();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;

	tick();
}