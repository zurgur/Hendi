/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Sýnir notkun stigveldislíkana.  Forritið robotArm er
//     úr kennslubókinni en nú er hægt að snúa líkaninu með mús.
//
//    Hjálmtýr Hafsteinsson, febrúar 2018
/////////////////////////////////////////////////////////////////
var NumVertices = 36; //(6 faces)(2 triangles/face)(4 vertices/triangle)

var movement = false;
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zDist = -25.0;

var points = [];
var colors = [];
var currentBtn = "middle";

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
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


// Parameters controlling the size of the midle finger

var BASE_HEIGHT      = 5.0;
var BASE_WIDTH       = 4.0;
var LOWER_MIDDLE_HEIGHT = 2.0;
var LOWER_MIDDLE_WIDTH  = 0.8;
var MIDDLE_MIDDLE_HEIGHT = 2.0;
var UPPER_MIDDLE_WIDTH  = 0.8;
var UPPER_MIDDLE_HEIGHT = 1.5;

// Paramiterst for controling the size of the index finger

var LOWER_INDEX_HEIGHT = 1.6;
var MIDDLE_INDEX_HEIGHT = 1.55;
var UPPER_INDEX_HEIGHT = 1.2;
var INDEX_WIDTH = 0.78;

// Paramiters for ring finger size

var RING_WIDTH = 0.78;
var LOWER_RING_HEIGHT = 1.6;
var MIDDLE_RING_HEIGHT = 1.55;
var UPPER_RING_HEIGHT = 1.2;

//paramiters for the size of little finger

var LITTL_WIDTH = 0.65;
var LOWER_LITTL_HEIGHT = 1.1;
var MIDDLE_LITTL_HEIGHT = 1.08;
var UPPER_LITTL_HEIGHT = 1;



// Shader transformation matrices

var modelViewMatrix, projectionMatrix;

// Array of rotation angles (in degrees) for each rotation axis

var Base = 0;
var MiddleMiddle = 1;
var LowerMiddle = 2;


var thetaFuck = [ 0, 0, 0];
var thetaIndex = [ 0, 0, 0];
var thetaRing = [0, 0, 0];
var thetaLittle = [0, 0, 0];
var thetapinky = [0, 0, 0];

var angle = 0;

var modelViewMatrixLoc;

var vBuffer, cBuffer;

//----------------------------------------------------------------------------

function quad(  a,  b,  c,  d ) {
    colors.push(vertexColors[a]); 
    points.push(vertices[a]); 
    colors.push(vertexColors[a]); 
    points.push(vertices[b]); 
    colors.push(vertexColors[a]); 
    points.push(vertices[c]);
    colors.push(vertexColors[a]); 
    points.push(vertices[a]); 
    colors.push(vertexColors[a]); 
    points.push(vertices[c]); 
    colors.push(vertexColors[a]); 
    points.push(vertices[d]); 
}


function colorCube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

//____________________________________________

// Remmove when scale in MV.js supports scale matrices

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}


//--------------------------------------------------


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );
    gl.enable( gl.DEPTH_TEST ); 
    
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    
    gl.useProgram( program );

    colorCube();
    
    // Load shaders and use the resulting shader program
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );    
    gl.useProgram( program );

    // Create and initialize  buffer objects
    
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    projectionMatrix = perspective( 60.0, 1.0, 0.1, 100.0 );
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.clientX;
        origY = e.clientY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (e.clientX - origX) ) % 360;
            spinX = ( spinX + (origY - e.clientY) ) % 360;
            origX = e.clientX;
            origY = e.clientY;
        }
    } );

    // btn listeners
    document.getElementById("btnMiddle").onclick = function(){
        currentBtn = "middle";
    }
    document.getElementById("btnRing").onclick = function(){
        currentBtn = "ring";
    }
    document.getElementById("btnIndex").onclick = function(){
        currentBtn = "index";
    }
    document.getElementById("btnLittle").onclick = function(){
        currentBtn = "little";
    }
    document.getElementById("btnThum1").onclick = function(){
        currentBtn = "thum1";
    }
    document.getElementById("btnThum").onclick = function(){
        currentBtn = "Thum";
    }
    
    // Event listener for keyboard
     window.addEventListener("keydown", function(e){
         switch( e.keyCode ) {
            case 38:	// upp ör
                zDist += 1.0;
                break;
            case 40:	// niður ör
                zDist -= 1.0;
                break;
            case 90:	// z - snýr stöpli áfram
                thetaFuck[0] = Math.min(180, thetaFuck[0]+5);
                break;
            case 88:	// x - snýr stöpli afturábak
			    thetaFuck[0] = Math.max(-180, thetaFuck[0]-5);
                break;
            case 65:	// a - snýr neðri armi
                if(currentBtn === "middle"){
                    thetaFuck[1] = Math.min(90, thetaFuck[1] + 5);
                }else if(currentBtn === "ring"){
                    thetaRing[1] = Math.min(90, thetaRing[1] + 5);
                }else if(currentBtn === "index"){
                    thetaIndex[1] = Math.min(90, thetaIndex[1] + 5);
                }else if(currentBtn === "little"){
                    thetaLittle[1] = Math.min(90, thetaLittle[1] + 5);
                }
                break;
            case 83:	// s - snýr neðri armi
                if(currentBtn === "middle"){
                    thetaFuck[1] = Math.max(0, thetaFuck[1] - 5);
                }else if(currentBtn === "ring"){
                    thetaRing[1] = Math.max(0, thetaRing[1] - 5);
                }else if(currentBtn === "index"){
                    thetaIndex[1] = Math.max(0, thetaIndex[1] - 5);
                }else if(currentBtn === "little"){
                    thetaLittle[1] = Math.max(0, thetaLittle[1] - 5);
                }
                break;
            case 81:	// q - snýr efri og mið putta
                if(currentBtn === "middle"){
                    thetaFuck[2] = Math.min(90, thetaFuck[2] + 5);
                }else if(currentBtn === "ring"){
                    thetaRing[2] = Math.min(90, thetaRing[2] + 5);
                }else if(currentBtn === "index"){
                    thetaIndex[2] = Math.min(90, thetaIndex[2] + 5);
                }else if(currentBtn === "little"){
                    thetaLittle[2] = Math.min(90, thetaLittle[2] + 5);
                }
                break;
            case 87:	// w - snýr neðri putta
                if(currentBtn === "middle"){
                    thetaFuck[2] = Math.max(0, thetaFuck[2] - 5);
                }else if(currentBtn === "ring"){
                    thetaRing[2] = Math.max(0, thetaRing[2] - 5);
                }else if(currentBtn === "index"){
                    thetaIndex[2] = Math.max(0, thetaIndex[2] - 5);
                }else if(currentBtn === "little"){
                    thetaLittle[2] = Math.max(0, thetaLittle[2] - 5);
                }
                break;
         }
     }  );  

    // Event listener for mousewheel
     window.addEventListener("mousewheel", function(e){
         if( e.wheelDelta > 0.0 ) {
             zDist += 1.0;
         } else {
             zDist -= 1.0;
         }
     }  );  
       
  
    render();
}

//----------------------------------------------------------------------------


function base() {
    var s = scalem(1, BASE_HEIGHT, BASE_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * BASE_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------


function middleMiddle() {
    var s = scalem(UPPER_MIDDLE_WIDTH, MIDDLE_MIDDLE_HEIGHT, UPPER_MIDDLE_WIDTH);
    var instanceMatrix = mult(translate( 0.0, 0.5 * MIDDLE_MIDDLE_HEIGHT, 0.0 ),s);    
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------


function lowerMiddle()
{
    var s = scalem(LOWER_MIDDLE_WIDTH, LOWER_MIDDLE_HEIGHT, LOWER_MIDDLE_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * LOWER_MIDDLE_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------

function upperMiddle(){
    var s = scalem(UPPER_MIDDLE_WIDTH, UPPER_MIDDLE_HEIGHT,UPPER_MIDDLE_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * UPPER_MIDDLE_HEIGHT, 0.0 ), s);
    var t = mult( modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices);
}

//----------------------------------------------------------------------------
//----------------------------------------------------------------------------


function middleIndex() {
    var s = scalem(INDEX_WIDTH, MIDDLE_INDEX_HEIGHT, INDEX_WIDTH);
    var instanceMatrix = mult(translate( 0.0, 0.5 * MIDDLE_INDEX_HEIGHT, 0.0 ),s);    
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------


function lowerIndex()
{
    var s = scalem(INDEX_WIDTH, LOWER_INDEX_HEIGHT, INDEX_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * LOWER_INDEX_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------

function upperIndex(){
    var s = scalem(INDEX_WIDTH, UPPER_INDEX_HEIGHT, INDEX_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * UPPER_INDEX_HEIGHT, 0.0 ), s);
    var t = mult( modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices);
}

//----------------------------------------------------------------------------
//----------------------------------------------------------------------------


function middleRing() {
    var s = scalem(RING_WIDTH, MIDDLE_RING_HEIGHT, RING_WIDTH);
    var instanceMatrix = mult(translate( 0.0, 0.5 * MIDDLE_RING_HEIGHT, 0.0 ),s);    
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------


function lowerRing()
{
    var s = scalem(RING_WIDTH, LOWER_RING_HEIGHT, RING_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * LOWER_RING_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------

function upperRing(){
    var s = scalem(RING_WIDTH, UPPER_RING_HEIGHT, RING_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * UPPER_RING_HEIGHT, 0.0 ), s);
    var t = mult( modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices);
}

//----------------------------------------------------------------------------
//----------------------------------------------------------------------------


function middleLitte() {
    var s = scalem(LITTL_WIDTH, MIDDLE_LITTL_HEIGHT, LITTL_WIDTH);
    var instanceMatrix = mult(translate( 0.0, 0.5 * MIDDLE_LITTL_HEIGHT, 0.0 ),s);    
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------


function lowerLittle()
{
    var s = scalem(LITTL_WIDTH, LOWER_LITTL_HEIGHT, LITTL_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * LOWER_LITTL_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------

function upperLitte(){
    var s = scalem(LITTL_WIDTH, UPPER_LITTL_HEIGHT, LITTL_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * UPPER_LITTL_HEIGHT, 0.0 ), s);
    var t = mult( modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices);
}

//----------------------------------------------------------------------------




var render = function() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    
    // staðsetja áhorfanda og meðhöndla músarhreyfingu
    var mv = lookAt( vec3(0.0, 2.0, zDist), vec3(0.0, 2.0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, rotate( spinX, [1, 0, 0] ) );
    mv = mult( mv, rotate( spinY, [0, 1, 0] ) );

    modelViewMatrix = mult(mv, rotate(thetaFuck[Base], 0, 1, 0 ));
    base();
 
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, BASE_HEIGHT, 0.5)); 
    modelViewMatrix = mult(modelViewMatrix, rotate(thetaFuck[MiddleMiddle], 0, 0, 1 ));
    lowerMiddle();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, LOWER_MIDDLE_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(thetaFuck[LowerMiddle], 0, 0, 1) );
    middleMiddle();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, MIDDLE_MIDDLE_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(thetaFuck[LowerMiddle], 0, 0, 1) );
    upperMiddle();

    //----------------------------------------------------------------------------
    //reset every thing
    modelViewMatrix = mult(mv, rotate(thetaFuck[Base], 0, 1, 0 ));

    modelViewMatrix = mult(modelViewMatrix, translate(0, BASE_HEIGHT, 1.5));

    modelViewMatrix = mult(modelViewMatrix, rotate(thetaIndex[MiddleMiddle], 0, 0, 1 ));
    lowerIndex();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, LOWER_INDEX_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(thetaIndex[LowerMiddle], 0, 0, 1) );
    middleIndex();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, MIDDLE_INDEX_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(thetaIndex[LowerMiddle], 0, 0, 1) );
    upperIndex();

    //----------------------------------------------------------------------------
    modelViewMatrix = mult(mv, rotate(thetaFuck[Base], 0, 1, 0 ));
    modelViewMatrix = mult(modelViewMatrix, translate(0, BASE_HEIGHT, -0.5));

    modelViewMatrix = mult(modelViewMatrix, rotate(thetaRing[MiddleMiddle], 0, 0, 1 ));
    lowerRing();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, LOWER_RING_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(thetaRing[LowerMiddle], 0, 0, 1) );
    middleRing();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, MIDDLE_RING_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(thetaRing[LowerMiddle], 0, 0, 1) );
    upperRing();

    //----------------------------------------------------------------------------
    modelViewMatrix = mult(mv, rotate(thetaFuck[Base], 0, 1, 0 ));
    modelViewMatrix = mult(modelViewMatrix, translate(0, BASE_HEIGHT, -1.5));

    modelViewMatrix = mult(modelViewMatrix, rotate(thetaLittle[MiddleMiddle], 0, 0, 1 ));
    lowerLittle();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, LOWER_LITTL_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(thetaLittle[LowerMiddle], 0, 0, 1) );
    middleLitte();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, MIDDLE_LITTL_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(thetaLittle[LowerMiddle], 0, 0, 1) );
    upperLitte();

    requestAnimFrame(render);
}
