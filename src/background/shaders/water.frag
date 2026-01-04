uniform float time;
uniform vec2 size;
uniform vec2 direction;
uniform float speed;
uniform float density;
uniform vec3 tint;

#include util/hash.frag;

float rainRipple(vec2 p, vec2 center, float startTime, float maxRadius) {
  float dist = length(p - center);
  float rippleTime = time - startTime;
  
  if(rippleTime < 0.0 || rippleTime > 3.0) return 0.0;
  
  float radius = rippleTime * maxRadius * 0.4;
  float ringWidth = 0.08 * maxRadius;
  
  float ringDist = abs(dist - radius);
  float intensity = 1.0 - smoothstep(0.0, ringWidth, ringDist);
  
  float fade = 1.0 - (rippleTime / 3.0);
  fade = fade * fade;
  
  return intensity * fade;
}

float surfaceDistortion(vec2 p, float speed) {
  vec2 distortP = p + time * speed * 0.05;
  
  float n1 = sin(distortP.x * 8.0 + time * speed * 1.5) * 0.02;
  float n2 = sin(distortP.y * 6.0 + time * speed * 1.2) * 0.015;
  float n3 = sin((distortP.x + distortP.y) * 4.0 + time * speed * 2.0) * 0.01;
  
  return (n1 + n2 + n3) * 0.5 + 0.5;
}

half4 main(float2 coord) {
  vec2 p = coord / size;
  p.x *= size.x / size.y;
  
  float baseSpeed = pow(speed - 0.5, 1.0) + 0.5;
  float tiling = max(size.x, size.y) / 150.0 / 12.0;
  
  vec2 scaledP = p * tiling;
  float rippleStrength = 0.0;
  
  float gridSize = 2.0 + density * 1.5;
  vec2 gridP = scaledP * gridSize;
  vec2 gridInt = floor(gridP);
  vec2 gridFrac = fract(gridP);
  
  for(int j = -2; j <= 2; j++) {
    for(int i = -2; i <= 2; i++) {
      vec2 cellOffset = vec2(float(i), float(j));
      vec2 cellId = gridInt + cellOffset;
      vec2 cellHash = hash(cellId);
      
      float dropTime = time * baseSpeed * (0.3 + cellHash.x * 1.2) + cellHash.y * 10.0;
      float dropPhase = fract(dropTime * 0.15);
      
      if(dropPhase < 0.7) {
        vec2 dropPos = cellOffset + 0.2 + 0.6 * hash(cellId + vec2(1.0, 2.0));
        float startTime = floor(dropTime * 0.15) / (baseSpeed * (0.3 + cellHash.x * 1.2)) + cellHash.y * 10.0 / (baseSpeed * (0.3 + cellHash.x * 1.2));
        float maxRadius = 0.3 + cellHash.x * 0.4;
        
        float ripple = rainRipple(gridFrac, dropPos, startTime, maxRadius);
        rippleStrength += ripple;
      }
    }
  }
  
  if(density > 2) {
    float gridSize2 = gridSize * 1.8;
    vec2 gridP2 = scaledP * gridSize2 + vec2(0.5, 0.3);
    vec2 gridInt2 = floor(gridP2);
    vec2 gridFrac2 = fract(gridP2);
    
    for(int j = -1; j <= 1; j++) {
      for(int i = -1; i <= 1; i++) {
        vec2 cellOffset = vec2(float(i), float(j));
        vec2 cellId = gridInt2 + cellOffset;
        vec2 cellHash = hash(cellId + vec2(10.0, 20.0));
        
        float dropTime = time * baseSpeed * (0.5 + cellHash.x * 1.0) + cellHash.y * 15.0;
        float dropPhase = fract(dropTime * 0.2);
        
        if(dropPhase < 0.6) {
          vec2 dropPos = cellOffset + 0.2 + 0.6 * hash(cellId + vec2(3.0, 4.0));
          float startTime = floor(dropTime * 0.2) / (baseSpeed * (0.5 + cellHash.x * 1.0)) + cellHash.y * 15.0 / (baseSpeed * (0.5 + cellHash.x * 1.0));
          float maxRadius = 0.2 + cellHash.x * 0.3;
          
          float ripple = rainRipple(gridFrac2, dropPos, startTime, maxRadius);
          rippleStrength += ripple * 0.6;
        }
      }
    }
  }
  
  float distortion = surfaceDistortion(scaledP, baseSpeed);
  float combinedEffect = rippleStrength * 0.8 + distortion * 0.2;
  
  vec3 waterTint = vec3(0.9, 0.95, 1.0);
  vec3 finalColor = waterTint * tint * combinedEffect;
  
  float alpha = clamp(combinedEffect * 0.4, 0.0, 0.8);
  
  return vec4(finalColor, alpha);
}