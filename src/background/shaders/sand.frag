uniform float time;
uniform vec2 size;
uniform vec2 direction;
uniform float speed;
uniform float density;
uniform vec3 tint;

#include util/fbm.frag;

float sand(vec2 p, float speed, float animSpeed, float innerAnimSpeed, float detail) {
  // Animate the space in the given direction
  vec2 anim = direction * time * speed * vec2(-1, 1) * animSpeed;

  // Calculate the inner deformation with a slower animation
  vec2 innerP = p + anim * innerAnimSpeed;
  vec2 q = vec2(fbm4(innerP), fbm4(innerP + vec2(5.452)));

  // Feed the inner fBM into another fBM like https://iquilezles.org/articles/warp/
  return clamp(fbm6(p + anim + q * detail), 0.0, 1.0);
}

half4 main(float2 coord) {
  vec2 p = coord / size;
  // Remove aspect ratio
  p.x *= size.x / size.y;
  p = 0.5 + 0.5 * p;

  float alpha = 0.0;

  // Exponential speed from the input
  float baseSpeed = pow(speed - 0.5, 1.5);
  // Tile per 20 grid cells
  float tiling = max(size.x, size.y) / 150.0 / 20.0;

  alpha += sand(p * 3.0 * tiling, baseSpeed * 0.3 + 0.5, 0.5, 0.1, 0.5);
  if(density > 1) {
    alpha += sand(p * 5.0 * tiling, baseSpeed * 0.3 + 0.5, 0.8, 0.1, 0.8);
  }
  if(density > 2) {
    alpha += sand(p * 1.0 * tiling, baseSpeed * 0.3 + 0.5, 0.4, 0.1, 0.3);
  }
  if(density > 3) {
    alpha += sand(p * 0.5 * tiling, baseSpeed * 0.3 + 0.5, 0.2, 0.1, 0.2);
  }

  vec3 originalColor = vec3(0.76, 0.52, 0.34);
  return vec4(originalColor * tint, 1.0) * clamp(alpha, 0.0, 2.0);
}