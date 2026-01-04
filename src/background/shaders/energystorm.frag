uniform float time;
uniform vec2 size;
uniform vec2 direction;
uniform float speed;
uniform float density;
uniform vec3 tint;

#include util/fbm.frag;
#include util/hash.frag;

vec3 energyColor(float x, float intensity) {
  float y = clamp(x, 0.0, 1.0);
  vec3 electric = mix(vec3(0.4, 0.8, 1.0), vec3(1.0, 1.0, 0.8), y);
  vec3 arcane = mix(vec3(0.6, 0.2, 1.0), vec3(1.0, 0.6, 1.0), y);
  return mix(electric, arcane, sin(time * 2.0 + y * 6.28) * 0.5 + 0.5) * intensity;
}

float arcBolt(vec2 p, vec2 center1, vec2 center2, float thickness, float intensity) {
  vec2 mid = (center1 + center2) * 0.5;
  vec2 dir = center2 - center1;
  float len = length(dir);
  
  float arcHeight = len * 0.3 * intensity;
  vec2 perpDir = normalize(vec2(-dir.y, dir.x));
  vec2 arcCenter = mid + perpDir * arcHeight;
  
  float t = clamp(dot(p - center1, dir) / dot(dir, dir), 0.0, 1.0);
  vec2 closestPoint = mix(center1, center2, t);
  
  vec2 arcPoint = mix(center1, center2, t);
  arcPoint = mix(arcPoint, arcCenter, sin(t * 3.14159));
  
  float dist = length(p - arcPoint);
  
  float bolt = 1.0 - smoothstep(0.0, thickness, dist);
  float glow = (1.0 - smoothstep(thickness, thickness * 4.0, dist)) * 0.3;
  
  return (bolt + glow) * intensity;
}

float magneticField(vec2 p, float speed) {
  vec2 fieldP = p + time * speed * 0.1;
  
  vec2 q = vec2(fbm4(fieldP * 0.8), fbm4(fieldP * 0.8 + vec2(5.2, 1.3)));
  float field = fbm6(fieldP + q * 0.4);
  
  float distortion = sin(field * 6.28 + time * speed * 2.0) * 0.5 + 0.5;
  return field * distortion * 0.2;
}

float energyFlame(vec2 p, float speed) {
  vec2 anim = direction * time * speed * vec2(-1, 1) * 1.5;
  
  vec2 innerP = p + anim * 0.1;
  vec2 q = vec2(fbm4(innerP), fbm4(innerP + vec2(0.452)));
  
  float fbm = fbm6(p + anim + q * 4.8);
  float alpha = clamp(pow(fbm * 0.8, 1.6), 0.0, 1.0);
  
  return alpha;
}

half4 main(float2 coord) {
  vec2 p = coord / size;
  p.x *= size.x / size.y;
  
  float baseSpeed = pow(speed - 0.5, 1.5) + 0.5;
  float tiling = max(size.x, size.y) / 150.0 / 15.0;
  
  vec2 scaledP = p * tiling;
  vec3 color = vec3(0.0);
  float alpha = 0.0;
  
  float flame = energyFlame(scaledP * 1.2, baseSpeed * 0.4);
  vec3 flameColor = energyColor(flame, 1.2);
  color += flameColor;
  alpha += flame * 0.4;
  
  float field = magneticField(scaledP, baseSpeed);
  vec3 fieldColor = energyColor(field, 0.6);
  color += fieldColor;
  alpha += field * 0.2;
  
  vec2 gridP = scaledP * 2.0;
  vec2 gridInt = floor(gridP);
  vec2 gridFrac = fract(gridP);
  
  for(int j = -1; j <= 1; j++) {
    for(int i = -1; i <= 1; i++) {
      vec2 cellOffset = vec2(float(i), float(j));
      vec2 cellId = gridInt + cellOffset;
      vec2 cellHash = hash(cellId);
      
      float boltTime = time * baseSpeed * (0.5 + cellHash.x * 1.5) + cellHash.y * 10.0;
      float boltActive = step(0.85, sin(boltTime) * 0.5 + 0.5);
      
      if(boltActive > 0.0) {
        vec2 center1 = cellOffset + 0.2 + 0.6 * hash(cellId + vec2(0.0, 1.0));
        vec2 center2 = cellOffset + 0.2 + 0.6 * hash(cellId + vec2(1.0, 0.0));
        
        float arcIntensity = 0.5 + sin(boltTime * 3.0) * 0.3;
        float thickness = 0.008 * (1.0 + density * 0.5);
        
        float bolt = arcBolt(gridFrac, center1, center2, thickness, arcIntensity);
        
        if(bolt > 0.0) {
          vec3 boltColor = energyColor(bolt, 2.0);
          color += boltColor;
          alpha += bolt;
        }
      }
    }
  }
  
  if(density > 2) {
    vec2 gridP2 = scaledP * 1.5 + vec2(0.5, 0.3);
    vec2 gridInt2 = floor(gridP2);
    vec2 gridFrac2 = fract(gridP2);
    
    for(int j = -1; j <= 1; j++) {
      for(int i = -1; i <= 1; i++) {
        vec2 cellOffset = vec2(float(i), float(j));
        vec2 cellId = gridInt2 + cellOffset;
        vec2 cellHash = hash(cellId + vec2(10.0, 20.0));
        
        float boltTime = time * baseSpeed * (0.3 + cellHash.x * 2.0) + cellHash.y * 15.0;
        float boltActive = step(0.9, sin(boltTime) * 0.5 + 0.5);
        
        if(boltActive > 0.0) {
          vec2 center1 = cellOffset + 0.1 + 0.8 * hash(cellId + vec2(2.0, 3.0));
          vec2 center2 = cellOffset + 0.1 + 0.8 * hash(cellId + vec2(3.0, 2.0));
          
          float arcIntensity = 0.4 + sin(boltTime * 4.0) * 0.2;
          float thickness = 0.006;
          
          float bolt = arcBolt(gridFrac2, center1, center2, thickness, arcIntensity);
          
          if(bolt > 0.0) {
            vec3 boltColor = energyColor(bolt, 1.5);
            color += boltColor;
            alpha += bolt * 0.7;
          }
        }
      }
    }
  }
  
  return vec4(color * tint, 1.0) * clamp(alpha, 0.0, 2.0);
}