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
		if (vertexPosition[3 * i + 2] >= pwgl.TranslateZ - 0.75
				|| (vertexPosition[3 * i] - pwgl.TranslateX)
						* (vertexPosition[3 * i] - pwgl.TranslateX)
						+ (vertexPosition[3 * i + 1] - pwgl.TranslateY)
						* (vertexPosition[3 * i + 1] - pwgl.TranslateY) > 1) {
			colors[4 * i] = 0.27;
			colors[4 * i + 1] = 0.543;
			colors[4 * i + 2] = 0.0;
			colors[4 * i + 3] = 1.0;
		} else {
			colors[4 * i] = 0.543;
			colors[4 * i + 1] = 0.35;
			colors[4 * i + 2] = 0.0;
			colors[4 * i + 3] = 1.0;
		}

	}
	;
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	triangleVertexColorBuffer.itemSize = 4;
	triangleVertexColorBuffer.numItems = vertexCnt;
}

var rTri = 0;
var rSquare = 0;
var z = 0;

function drawScene() {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	pMatrix = okMat4Proj(50, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
	mvMatrix = new okMat4();

	mvPushMatrix();
	mvMatrix.translate(OAK.SPACE_WORLD, -pwgl.TranslateX, -pwgl.TranslateY,
			-(pwgl.TranslateZ), true);
	mvMatrix.rotX(OAK.SPACE_WORLD, -90, true);
	mvMatrix.rotY(OAK.SPACE_WORLD, rTri, true);
	mvMatrix.translate(OAK.SPACE_WORLD, 0.0, 0.0, z - 10.0, true);

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

var lastTime = 0;
var currentlyPressedKeys = {};

function animate() {
	var timeNow = new Date().getTime();
	if (lastTime != 0) {
		var elapsed = timeNow - lastTime;

		rTri += (90 * elapsed) / 1000.0;
		rSquare += (75 * elapsed) / 1000.0;
	}
	lastTime = timeNow;
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
}

function tick() {
	okRequestAnimationFrame(tick);
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
	// gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;

	tick();
}
