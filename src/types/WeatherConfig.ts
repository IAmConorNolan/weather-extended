import { Vector2 } from "@owlbear-rodeo/sdk";

export interface WeatherConfig {
  type: "SNOW" | "RAIN" | "SAND" | "FIRE" | "CLOUD" | "BLOOM" | "ENERGYSTORM" | "WATER" | "CURRENT";
  speed?: number;
  direction?: Vector2;
  density?: number;
  tint?: string;
}
