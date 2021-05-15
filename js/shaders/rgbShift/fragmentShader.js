const rgbShiftFragmentShader = `
uniform sampler2D picture;
uniform float hasTexture;
uniform float shift;
uniform float scale;
uniform vec3 color;
uniform float opacity;
varying vec2 vUv;
void main() {
    float angle = 1.55;
    vec2 p = (vUv - vec2(0.5, 0.5)) * (1.0 - scale) + vec2(0.5, 0.5);
    vec2 offset = shift / 4.0 * vec2(cos(angle), sin(angle));
    vec4 cr = texture2D(picture, p + offset);
    vec4 cga = texture2D(picture, p);
    vec4 cb = texture2D(picture, p - offset);
    if (hasTexture == 1.0) gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);
    else gl_FragColor = vec4(color, opacity);
}
`
