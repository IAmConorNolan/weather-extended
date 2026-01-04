uniform float time;
uniform vec2 size;
uniform vec2 direction;
uniform float speed;
uniform float density;
uniform vec3 tint;

#include util/hash.frag
#include util/circle.frag
#include util/fbm.frag

float particle(vec2 p, float jitter, vec2 direction, float speed, float size) {
  p += time * direction * speed * vec2(-1, 1) * 0.3;

  float minDist = 10.;
  vec2 minPoint;
  animatedCircle(p, jitter, speed * 0.5, minDist, minPoint);

  float scale = dot(minPoint, vec2(0.3, 0.3)) + 0.7;
  float blur = size * 0.8;
  float circle = smoothstep(size * scale - blur, size * scale + blur, minDist);

  return 1.0 - circle;
}

float caustics(vec2 p, float speed) {
  vec2 anim = p + time * speed * 0.15;

  float n1 = sin(anim.x * 3.0 + time * speed * 0.8) * cos(anim.y * 3.0 + time * speed * 0.6);
  float n2 = sin((anim.x + anim.y) * 4.0 + time * speed * 1.2);

  float caustic = (n1 + n2) * 0.5 + 0.5;
  caustic = pow(caustic, 3.0);

  return caustic * 0.3;
}

float underwaterFog(vec2 p, float speed) {
  vec2 anim = direction * time * speed * vec2(-1, 1) * 0.08;

  vec2 innerP = p + anim * 0.3;
  vec2 q = vec2(fbm4(innerP), fbm4(innerP + vec2(3.234)));

  return fbm6(p + anim + q * 0.8) * 0.4;
}

half4 main(float2 coord) {
  vec2 p = coord / size;
  p.x *= size.x / size.y;

  float baseSpeed = pow(speed - 0.5, 1.2) + 0.3;
  float tiling = max(size.x, size.y) / 150.0 / 18.0;

  vec2 scaledP = p * tiling;
  float alpha = 0.0;
  vec3 color = vec3(0.0);

  // Suspended particles (plankton, sediment)
  float particles = 0.0;
  particles += particle(scaledP * 6.0, 4.5, direction, baseSpeed * 0.8, 0.06);

  if(density > 1) {
    particles += particle(scaledP * 12.0, 6.2, direction, baseSpeed * 1.2, 0.04);
  }
  if(density > 2) {
    particles += particle(scaledP * 20.0, 8.1, direction, baseSpeed * 1.5, 0.03);
  }
  if(density > 3) {
    particles += particle(scaledP * 35.0, 10.3, direction, baseSpeed * 2.0, 0.02);
  }

  // Light particles
  vec3 particleColor = vec3(0.8, 0.9, 1.0);
  color += particleColor * particles;
  alpha += particles * 0.5;

  // Underwater fog/murkiness
  if(density > 1) {
    float fog = underwaterFog(scaledP * 3.0, baseSpeed * 0.5);
    vec3 fogColor = vec3(0.6, 0.75, 0.85);
    color += fogColor * fog;
    alpha += fog * 0.3;
  }

  // Light caustics from water surface
  float causticsEffect = caustics(scaledP * 8.0, baseSpeed);
  vec3 causticsColor = vec3(1.0, 1.0, 0.95);
  color += causticsColor * causticsEffect;
  alpha += causticsEffect * 0.2;

  // Apply underwater blue-green tint
  vec3 underwaterBase = vec3(0.4, 0.7, 0.9);
  color = mix(color, color * underwaterBase, 0.3);

  return vec4(color * tint, 1.0) * clamp(alpha, 0.0, 1.0) * 0.7;
}
