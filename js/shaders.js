function shaderify(canvas, srcInput, imgUrl) {
  var gl = canvas.getContext('webgl');
  var texture = gl.createTexture()
  var vertices = [
    1.0,  1.0,
   -1.0,  1.0,
    1.0, -1.0,
   -1.0, -1.0
  ];
  var vertexPosBuffer = gl.createBuffer();
  // Setup
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, canvas.width, canvas.height);
  // filling in the vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  vertexPosBuffer.itemSize = 2;
  vertexPosBuffer.numItems = 4;
  // compiling, attaching, linking the shaders
  function changeShaders() {
    console.log('recompiling...')
    gl.clear(gl.COLOR_BUFFER_BIT);
    var vertexShaderSrc = `attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

varying highp vec2 pos;

void main(void) {
  pos = aTextureCoord;
  gl_Position = vec4(aVertexPosition, 0.0, 1.0);
}`;
    var fragmentShaderSrc = `
precision highp float;
varying highp vec2 pos;

uniform sampler2D uSampler;

void main(void) {
  vec3 layer1 = texture2D(uSampler, pos).rgb;
  vec3 layer2 = vec3(1.0, 0.41, 0.71);
  ${srcInput.value}
  gl_FragColor = vec4(pixelColor, 1.0);
}`;
    console.log('shader:', fragmentShaderSrc);
    var shaderProgram = gl.createProgram();
    var vs = gl.createShader(gl.VERTEX_SHADER);
    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vs, vertexShaderSrc);
    gl.compileShader(vs);
    if(!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      alert('Vertex shader failed compilation:\n' + gl.getShaderInfoLog(vs))
      console.log(gl.getShaderInfoLog(shaderProgram))
    }
    gl.shaderSource(fs, fragmentShaderSrc);
    gl.compileShader(fs);
    if(!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      alert('Fragment shader failed compilation:\n' + gl.getShaderInfoLog(fs))
      console.log(gl.getShaderInfoLog(shaderProgram))
    }
    gl.attachShader(shaderProgram, vs);
    gl.attachShader(shaderProgram, fs);
    gl.linkProgram(shaderProgram);
    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
    }
    gl.useProgram(shaderProgram);
    // Texture coordinate attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);
    // Vertex position attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPosBuffer.numItems);
  }
  // Texture
/*
1.0,  1.0,
-1.0,  1.0,
1.0, -1.0,
-1.0, -1.0
*/
  var texCoordinates = [
    1.0, 0.0,
    0.0, 0.0,
    1.0, 1.0,
    0.0, 1.0
  ]

  var texCoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoordinates), gl.STATIC_DRAW);
  function loadTexture(imgName) {
    var img = new Image()
    img.onload = function() {
      console.log('init texture')
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.bindTexture(gl.TEXTURE_2D, null);
      changeShaders(); // to avoid unrenderable texture
    }
    img.src = imgName
  }
  loadTexture(imgUrl)
  srcInput.addEventListener('change', changeShaders)
}