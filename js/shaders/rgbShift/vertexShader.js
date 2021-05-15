const rgbShiftVertexShader = `
uniform float scale;
uniform float shift;
varying vec2 vUv;
void main() {
  vec3 pos = position;
  pos.y = pos.y + ((sin(uv.x * 3.1415926535897932384626433832795) * shift * 5.0) * 0.085);
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.);
}
`