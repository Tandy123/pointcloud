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

var xRot = 0;
var xMov = 0;

var yRot = 0;
var yMov = 0;

var z = 0.0;

var currentlyPressedKeys = {};
var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

function handleMouseDown(event) {
	mouseDown = true;
	if (event.button == 1) {
		alert("左键");
	}
	lastMouseX = event.clientX;
	lastMouseY = event.clientY;
}

function handleMouseUp(event) {
	mouseDown = false;
}

function handleMouseMove(event) {
	if (!mouseDown) {
		return;
	}
	var newX = event.clientX;
	var newY = event.clientY;

	var deltaX = newX - lastMouseX
	yRot += 5 * (deltaX / 30);

	var deltaY = newY - lastMouseY;
	xRot += 5 * (deltaY / 30);

	lastMouseX = newX
	lastMouseY = newY;
}

function handleKeyDown(event) {
	currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
	currentlyPressedKeys[event.keyCode] = false;
}

function handleKeys() {
	if (currentlyPressedKeys[109]) {
		// Page Up
		z -= 0.5;
	}
	if (currentlyPressedKeys[107]) {
		// Page Down
		z += 0.5;
	}
	if (currentlyPressedKeys[37]) {
		// Left cursor key
		yRot -= 5;
	}
	if (currentlyPressedKeys[39]) {
		// Right cursor key
		yRot += 5;
	}
	if (currentlyPressedKeys[38]) {
		// Up cursor key
		xRot -= 5;
	}
	if (currentlyPressedKeys[40]) {
		// Down cursor key
		xRot += 5;
	}
	if (currentlyPressedKeys[65]) {

		xMov -= 10;
	}
	if (currentlyPressedKeys[68]) {

		xMov += 10;
	}
	if (currentlyPressedKeys[87]) {

		yMov += 10;
	}
	if (currentlyPressedKeys[83]) {

		yMov -= 10;
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
	for ( var i = 0; i < vertexCnt1; i++) {
		colors[4 * i] = vertexPosition1[3 * i] / 256;
		colors[4 * i + 1] = vertexPosition1[3 * i + 1] / 256;
		colors[4 * i + 2] = vertexPosition1[3 * i + 2] / 256;
		colors[4 * i + 3] = 1.0;
	}
	;
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	triangleVertexColorBuffer.itemSize = 4;
	triangleVertexColorBuffer.numItems = vertexCnt1;
}

function drawScene() {
	gl.viewport(xMov, yMov, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	pMatrix = okMat4Proj(90, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
	mvMatrix = new okMat4();

	mvPushMatrix();
	mvMatrix.translate(OAK.SPACE_WORLD, -pwgl.TranslateX, -pwgl.TranslateY,
			-pwgl.TranslateZ, true);
	mvMatrix.rotX(OAK.SPACE_WORLD, -90, true);

	mvMatrix.rotX(OAK.SPACE_WORLD, xRot, true);
	mvMatrix.rotY(OAK.SPACE_WORLD, yRot, true);
	mvMatrix.translate(OAK.SPACE_WORLD, 0, 0, z - 10, true);

	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
			triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	setMatrixUniforms();

	/* var mvMatrix2 = new okMat4();
	 
	 mvMatrix=mvMatrix2;
	 
	 gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	 gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	 gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
	 gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	 setMatrixUniforms();*/
	gl.drawArrays(gl.Point, 0, triangleVertexPositionBuffer.numItems);
	mvPopMatrix();
}

var lastTime = 0;

function animate() {
	var timeNow = new Date().getTime();
	if (lastTime != 0) {
		var elapsed = timeNow - lastTime;

	}
	lastTime = timeNow;
}

function tick() {
	okRequestAnimationFrame(tick);
	handleKeys();
	drawScene();
	animate();
}

function webGLStart() {
	calcPointTran();
	var canvas = document.getElementById("canvas");
	initGL(canvas);
	initShaders();
	calcPointTran();
	initBuffers();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	canvas.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;

	tick();
}
