uniform float time;
uniform vec2 size;
uniform vec2 direction;
uniform float speed;
uniform float density;
uniform vec3 tint;

#include util/fbm.frag;
#include util/line.frag;

// from https://www.shadertoy.com/view/ldBGW1
vec3 fireColor(float x, float k) {
  float y = clamp(1.0 - x, 0.0, 1.0);
  y *= k;
  return vec3(exp(-y * 0.1) + 0.2, exp(-y * 0.3), exp(-y * 0.7)) * (1.0 - exp(-x * k));
}

float ember(vec2 p, float jitter, vec2 direction, float speed, float size, float lineLength) {
  // Move the input space in the given direction
  p += time * direction * speed * vec2(-1, 1);
  // Animate the rise of the ember
  float minDist = 10.;
  vec2 minPoint;
  animatedLine(p, jitter, lineLength + (speed * 0.1), speed, direction * vec2(-1, 1), minDist, minPoint);
  float scale = dot(minPoint, vec2(0.8, 0.8));
  float blur = size * 1.5;
  float line = 1.0 - smoothstep(size * scale - blur, size * scale + blur, minDist);
  return line;
}

float flame(vec2 p, float speed) {
  // Animate the space in the given direction
  vec2 anim = direction * time * speed * vec2(-1, 1) * 2;

  // Calculate the inner deformation with a slower animation
  vec2 innerP = p + anim * 0.1;
  vec2 q = vec2(fbm4(innerP), fbm4(innerP + vec2(0.452)));

  // Feed the inner fBM into another fBM like https://iquilezles.org/articles/warp/
  float fbm = fbm6(p + anim + q * 6.3);
  float alpha = clamp(pow(fbm * 0.5, 2.05), 0.0, 1.0);

  return alpha;
}

half4 main(float2 coord) {
  vec2 p = coord / size;
  // Remove aspect ratio
  p.x *= size.x / size.y;

  // Exponential speed from the input
  float baseSpeed = pow(speed - 0.5, 2.0);
  // Tile per 20 grid cells
  float tiling = max(size.x, size.y) / 150.0 / 20.0;

  float alpha = 0.0;

  // Overlap embers based on density
  alpha += ember(p * 5.0 * tiling, 0.8, direction, baseSpeed * 0.2 + 0.2, 0.014, 0.25);
  if(density > 3) {
    alpha += ember(p * 40.0 * tiling, 0.8, direction, baseSpeed * 0.25 + 2.5, 0.05, 1.0);
  } else if(density > 2) {
    alpha += ember(p * 30.0 * tiling, 1.2, direction, baseSpeed * 0.25 + 1.5, 0.04, 0.75);
  } else if(density > 1) {
    alpha += ember(p * 20.0 * tiling, 1.2, direction, baseSpeed * 0.25 + 1.0, 0.03, 0.5);
  } else {
    alpha += ember(p * 10.0 * tiling, 1.2, direction, baseSpeed * 0.25 + 0.5, 0.01, 0.25);
  }

  if(density > 2) {
    float intensity = density > 3 ? 0.8 : 0.4;
    alpha += flame(p * 5.0 * tiling, baseSpeed * 0.1 + 0.5) * intensity;
  }

  vec3 originalColor = vec3(1.0, 0.4, 0.1); // Original fire orange
  return vec4(originalColor * tint, 1.0) * alpha;
}