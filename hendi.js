
var canvas;
var gl;
var program;

var movement = false;
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zDist = -25.0;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var vertices = [

  vec4(-0.5, -0.5, 0.5, 1.0),
  vec4(-0.5, 0.5, 0.5, 1.0),
  vec4(0.5, 0.5, 0.5, 1.0),
  vec4(0.5, -0.5, 0.5, 1.0),
  vec4(-0.5, -0.5, -0.5, 1.0),
  vec4(-0.5, 0.5, -0.5, 1.0),
  vec4(0.5, 0.5, -0.5, 1.0),
  vec4(0.5, -0.5, -0.5, 1.0)
];

// RGBA colors
var vertexColors = [
  vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
  vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
  vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
  vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
  vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
  vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
  vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
  vec4( 1.0, 1.0, 1.0, 1.0 )   // white
];


var torsoId = 0;
var headId = 1;
var head1Id = 1;
var head2Id = 10;
var visifingurNId = 2;
var visifingurMId = 3;
var littliMId = 4;
var littliNId = 5;
var baugHId = 6;
var langaMId = 7;
var langaNId = 8;
var baugfingurMId = 9;

var currBodyPart = 0;

var torsoHeight = 5.0;
var torsoWidth = 5.0;
var upperArmHeight = 3.0;
var lowerArmHeight = 2.0;
var upperArmWidth = 1;
var lowerArmWidth = 1;
var upperLegWidth = 1;
var lowerLegWidth = 1;
var pinkyBase = 0.30;
var pinkyMid = 0.25;
var pinkyTop = 0.25;
var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;
var headHeight = 3;
var headWidth = 1.4;

var numNodes = 10;
var numAngles = 11;
var angle = 0;

//var theta = [0, 0, 0, 0, 0, 0, 180, 0, 180, 0, 0];
var theta = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var numVertices = 24;

var stack = [];

var figure = [];

for (var i = 0; i < numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var cBuffer;
var modelViewLoc;

var pointsArray = [];
var coloresArray = [];

//-------------------------------------------

function scale4(a, b, c) {
  var result = mat4();
  result[0][0] = a;
  result[1][1] = b;
  result[2][2] = c;
  return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child) {
  var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
  }
  return node;
}


function initNodes(Id) {

  var m = mat4();

  switch (Id) {

    case torsoId:

      m = rotate(theta[torsoId], 0, 1, 0);
      figure[torsoId] = createNode(m, torso, null, headId);
      break;

    case headId:
    case head1Id:
    case head2Id:


      m = translate(-1.7, -1.5 , 0.0);
      m = mult(m, rotateX(theta[head1Id]))
      m = mult(m, rotateZ(theta[head2Id]));
      m = mult(m, translate(5.0, 0.5 * headHeight, 0.0));
      figure[headId] = createNode(m, head, visifingurNId, null);
      break;


    case visifingurNId:

      m = translate(-(torsoWidth + upperArmWidth-1), torsoHeight, 0.0);
      m = mult(m, rotate(theta[visifingurNId], 1, 0, 0));
      figure[visifingurNId] = createNode(m, leftUpperArm, littliMId, visifingurMId);
      break;

    case littliMId:

      m = translate(torsoWidth + upperArmWidth-1, pinkyMid, 0.0);
      m = mult(m, rotate(theta[littliMId], 1, 0, 0));
      figure[littliMId] = createNode(m, rightUpperArm, baugHId, littliNId);
      break;

    case baugHId:

      m = translate(-(torsoWidth + upperLegWidth)/2+2.3, torsoHeight, 0.0);
      m = mult(m, rotate(theta[baugHId], 1, 0, 0));
      figure[baugHId] = createNode(m, leftUpperLeg, langaNId, langaMId);
      break;

    case langaNId:

      m = translate((torsoWidth + upperLegWidth)/2-2.3, torsoHeight, 0.0);
      m = mult(m, rotate(theta[langaNId], 1, 0, 0));
      figure[langaNId] = createNode(m, rightUpperLeg, null, baugfingurMId);
      break;

    case visifingurMId:

      m = translate(0.0, upperArmHeight, 0.0);
      m = mult(m, rotate(theta[visifingurMId], 1, 0, 0));
      figure[visifingurMId] = createNode(m, leftLowerArm, null, null);
      break;

    case littliNId:

      m = translate(0.0, pinkyBase, 0.0);
      m = mult(m, rotate(theta[littliNId], 1, 0, 0));
      figure[littliNId] = createNode(m, rightLowerArm, null, null);
      break;

    case langaMId:

      m = translate(0.0, upperLegHeight, 0.0);
      m = mult(m, rotate(theta[langaMId], 1, 0, 0));
      figure[langaMId] = createNode(m, leftLowerLeg, null, null);
      break;

    case baugfingurMId:

      m = translate(0.0, upperLegHeight, 0.0);
      m = mult(m, rotate(theta[baugfingurMId], 1, 0, 0));
      figure[baugfingurMId] = createNode(m, rightLowerLeg, null, null);
      break;

  }

}

function traverse(Id) {

  if (Id == null) return;
  stack.push(modelViewMatrix);
  modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
  figure[Id].render();
  if (figure[Id].child != null) traverse(figure[Id].child);
  modelViewMatrix = stack.pop();
  if (figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function torso() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * torsoHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(torsoWidth, torsoHeight, 1));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 12; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function head() {

  instanceMatrix = mult(modelViewMatrix, translate(.0, 0.5 * headHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperArm() {

  instanceMatrix = mult(modelViewMatrix, translate(3.0, 0.5 * upperArmHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerArm() {

  instanceMatrix = mult(modelViewMatrix, translate(3.0, 0.5 * lowerArmHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperArm() {

  instanceMatrix = mult(modelViewMatrix, translate(-3.0, 0.5 * upperArmHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerArm() {

  instanceMatrix = mult(modelViewMatrix, translate(-3.0, 0.5 * lowerArmHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperLeg() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerLeg() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperLeg() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerLeg() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth))
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function quad(a, b, c, d) {
  coloresArray.push(vertexColors[a]);
  pointsArray.push(vertices[a]);
  coloresArray.push(vertexColors[a]);
  pointsArray.push(vertices[b]);
  coloresArray.push(vertexColors[a]);
  pointsArray.push(vertices[c]);
  coloresArray.push(vertexColors[a]);
  pointsArray.push(vertices[d]);
  
}


function cube() {
 quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() {

  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  //
  //  Load shaders and initialize attribute buffers
  //
  program = initShaders(gl, "vertex-shader", "fragment-shader");

  gl.useProgram(program);
  instanceMatrix = mat4();

  cube();

  // Create and initialize  buffer objects
  projectionMatrix = perspective(50.0, 1.0, 0.01, 100.0);
  modelViewMatrix = mat4();


  gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  cBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(coloresArray), gl.STATIC_DRAW );

  var vColor = gl.getAttribLocation( program, "vColor" );
  gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vColor );

  // Event listener for keyboard
  window.addEventListener("keydown", function(e) {
    switch (e.keyCode) {
      case 38: // upp ör
        theta[currBodyPart] = (theta[currBodyPart] < 180.0) ? theta[currBodyPart] + 5 : 180.0;
        document.getElementById("currAngle").innerHTML = theta[currBodyPart];
        initNodes(currBodyPart);
        break;
      case 40: // niður ör
        theta[currBodyPart] = (theta[currBodyPart] > -180.0) ? theta[currBodyPart] - 5 : -180.0;
        document.getElementById("currAngle").innerHTML = theta[currBodyPart];
        initNodes(currBodyPart);
        break;
    }
  });

  document.getElementById("btnTorso").onclick = function() {
    currBodyPart = torsoId;
    document.getElementById("currAngle").innerHTML = theta[currBodyPart];
  };

  document.getElementById("btnHead2").onclick = function() {
    currBodyPart = head2Id;
    document.getElementById("currAngle").innerHTML = theta[currBodyPart];
  };

  document.getElementById("btnHead1").onclick = function() {
    currBodyPart = head1Id;
    document.getElementById("currAngle").innerHTML = theta[currBodyPart];
  };

  document.getElementById("btnLeftUpperArm").onclick = function() {
    currBodyPart = visifingurNId;
    document.getElementById("currAngle").innerHTML = theta[currBodyPart];
  };

  document.getElementById("btnLeftLowerArm").onclick = function() {
    currBodyPart = visifingurMId;
    document.getElementById("currAngle").innerHTML = theta[currBodyPart];
  };

  document.getElementById("btnRightUpperArm").onclick = function() {
    currBodyPart = littliMId;
    document.getElementById("currAngle").innerHTML = theta[currBodyPart];
  };

  document.getElementById("btnRightLowerArm").onclick = function() {
    currBodyPart = littliNId;
    document.getElementById("currAngle").innerHTML = theta[currBodyPart];
  };

  document.getElementById("btnLeftUpperLeg").onclick = function() {
    currBodyPart = baugHId;
    document.getElementById("currAngle").innerHTML = theta[currBodyPart];
  };

  document.getElementById("btnLeftLowerLeg").onclick = function() {
    currBodyPart = langaMId;
    document.getElementById("currAngle").innerHTML = theta[currBodyPart];
  };

  document.getElementById("btnRightUpperLeg").onclick = function() {
    currBodyPart = langaNId;
    document.getElementById("currAngle").innerHTML = theta[currBodyPart];
  };

  document.getElementById("btnRightLowerLeg").onclick = function() {
    currBodyPart = baugfingurMId;
    document.getElementById("currAngle").innerHTML = theta[currBodyPart];
  };


  for (i = 0; i < numNodes; i++) initNodes(i);

  //event listeners for mouse
  canvas.addEventListener("mousedown", function(e) {
    movement = true;
    origX = e.clientX;
    origY = e.clientY;
    e.preventDefault(); // Disable drag and drop
  });

  canvas.addEventListener("mouseup", function(e) {
    movement = false;
  });

  canvas.addEventListener("mousemove", function(e) {
    if (movement) {
      spinY = (spinY + (e.clientX - origX)) % 360;
      spinX = (spinX + (origY - e.clientY)) % 360;
      origX = e.clientX;
      origY = e.clientY;
    }
  });

  // Event listener for mousewheel
  window.addEventListener("mousewheel", function(e) {
    if (e.wheelDelta > 0.0) {
      zDist += 0.5;
    } else {
      zDist -= 0.5;
    }
  });

  render();
}


var render = function() {

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.cullFace(gl.FRONT_AND_BACK);
  gl.frontFace(gl.CCW);
  // staðsetja áhorfanda og meðhöndla músarhreyfingu
  var mv = lookAt(vec3(0.0, 0.0, zDist), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
  mv = mult(mv, rotate(spinX, [1, 0, 0]));
  mv = mult(mv, rotate(spinY, [0, 1, 0]));

  modelViewMatrix = mv;
  traverse(torsoId);
  requestAnimFrame(render);
}
