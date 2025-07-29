import OBR, { Item, Vector2 } from "@owlbear-rodeo/sdk";
import { forwardRef, useEffect, useMemo, useState } from "react";
import { getMetadata } from "../util/getMetadata";
import { WeatherConfig } from "../types/WeatherConfig";
import { getPluginId } from "../util/getPluginId";
import { isPlainObject } from "./util/isPlainObject";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import { styled } from "@mui/material/styles";
import FormLabel from "@mui/material/FormLabel";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ToggleButton from "@mui/material/ToggleButton";
import { WindLow } from "./icons/WindLow";
import { WindMedium } from "./icons/WindMedium";
import { WindHigh } from "./icons/WindHigh";
import { WindMax } from "./icons/WindMax";
import { DensityLow } from "./icons/DensityLow";
import { DensityMedium } from "./icons/DensityMedium";
import { DensityHigh } from "./icons/DensityHigh";
import { DensityMax } from "./icons/DensityMax";
import Skeleton from "@mui/material/Skeleton";
import North from "@mui/icons-material/NorthRounded";
import East from "@mui/icons-material/EastRounded";
import South from "@mui/icons-material/SouthRounded";
import West from "@mui/icons-material/WestRounded";
import NorthEast from "@mui/icons-material/NorthEastRounded";
import SouthEast from "@mui/icons-material/SouthEastRounded";
import SouthWest from "@mui/icons-material/SouthWestRounded";
import NorthWest from "@mui/icons-material/NorthWestRounded";
import Button from "@mui/material/Button";
import Paper, { PaperProps } from "@mui/material/Paper";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import { useRef } from "react";

const SmallLabel = styled(FormLabel)({
  fontSize: "0.75rem",
  marginBottom: 4,
});

const ScrollInsetPaper = forwardRef<HTMLDivElement, PaperProps>(
  ({ children, ...rest }, ref) => {
    return (
      <Paper
        sx={{
          borderRadius: 1,
          overflow: "hidden",
          maxWidth: "calc(100% - 32px)",
          maxHeight: "calc(100% - 96px)",
          boxShadow: "var(--Paper-shadow)",
          backgroundImage: "var(--Paper-overlay)",
          position: "absolute",
          display: "flex",
          py: 1,
        }}
        {...rest}
        ref={ref}
      >
        <Box
          sx={{
            overflowY: "auto",
            overflowX: "hidden",
            outline: 0,
            WebkitOverflowScrolling: "touch",
            width: "100%",
          }}
        >
          {children}
        </Box>
      </Paper>
    );
  }
);

export function Menu() {
  const [selection, setSelection] = useState<string[] | null>(null);
  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      const selection = await OBR.player.getSelection();
      if (mounted) {
        setSelection(selection ?? null);
      }
    };
    initialize();
    return () => {
      mounted = false;
    };
  }, []);

  const [items, setItems] = useState<Item[] | null>(null);
  useEffect(() => {
    if (!selection) {
      return;
    }

    let mounted = true;
    const getItems = async () => {
      const items = await OBR.scene.items.getItems(selection);
      if (mounted) {
        setItems(items);
      }
    };
    getItems();

    const unsubscribe = OBR.scene.items.onChange((items) => {
      if (mounted) {
        setItems(items.filter((item) => selection.includes(item.id)));
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [selection]);

  if (items) {
    return <MenuControls items={items} />;
  } else {
    return <MenuSkeleton />;
  }
}

type Direction =
  | "EAST"
  | "SOUTH"
  | "WEST"
  | "NORTH"
  | "NORTH_EAST"
  | "SOUTH_EAST"
  | "SOUTH_WEST"
  | "NORTH_WEST";

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function toDegrees(angle: number): number {
  return angle * (180 / Math.PI);
}

function roundTo(x: number, to: number): number {
  return Math.round(x / to) * to;
}

function vectorToDirection(vec: Vector2): Direction {
  const angle = Math.atan2(vec.y, vec.x);
  const degrees = mod(toDegrees(angle), 360);
  const rounded = roundTo(degrees, 45);
  if (rounded === 0) {
    return "EAST";
  } else if (rounded === 90) {
    return "NORTH";
  } else if (rounded === 180) {
    return "WEST";
  } else if (rounded === 270) {
    return "SOUTH";
  } else if (rounded === 45) {
    return "NORTH_EAST";
  } else if (rounded === 135) {
    return "NORTH_WEST";
  } else if (rounded === 225) {
    return "SOUTH_WEST";
  } else {
    return "SOUTH_EAST";
  }
}

function directionToVector(dir: Direction): Vector2 {
  switch (dir) {
    case "EAST":
      return { x: 1, y: 0 };
    case "NORTH":
      return { x: 0, y: 1 };
    case "SOUTH":
      return { x: 0, y: -1 };
    case "WEST":
      return { x: -1, y: 0 };
    case "NORTH_EAST":
      return { x: 1, y: 1 };
    case "NORTH_WEST":
      return { x: -1, y: 1 };
    case "SOUTH_EAST":
      return { x: 1, y: -1 };
    case "SOUTH_WEST":
      return { x: -1, y: -1 };
  }
}

function directionToLabel(dir: Direction): React.ReactNode {
  switch (dir) {
    case "EAST":
      return (
        <>
          E <East fontSize="small" />
        </>
      );
    case "NORTH":
      return (
        <>
          N <North fontSize="small" />
        </>
      );
    case "SOUTH":
      return (
        <>
          S <South fontSize="small" />
        </>
      );
    case "WEST":
      return (
        <>
          W <West fontSize="small" />
        </>
      );
    case "NORTH_EAST":
      return (
        <>
          NE <NorthEast fontSize="small" />
        </>
      );
    case "NORTH_WEST":
      return (
        <>
          NW <NorthWest fontSize="small" />
        </>
      );
    case "SOUTH_EAST":
      return (
        <>
          SE <SouthEast fontSize="small" />
        </>
      );
    case "SOUTH_WEST":
      return (
        <>
          SW <SouthWest fontSize="small" />
        </>
      );
  }
}

function MenuControls({ items }: { items: Item[] }) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const colorCanvasRef = useRef<HTMLCanvasElement>(null);
  const hueCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const config = useMemo<WeatherConfig>(() => {
    for (const item of items) {
      const config = getMetadata<WeatherConfig>(
        item.metadata,
        getPluginId("weather"),
        { type: "SNOW" }
      );
      return config;
    }
    return { type: "SNOW" };
  }, [items]);


  // Utility functions for color conversion
  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const hexToHsl = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };


  const values = {
    density: config.density ?? 3,
    direction: config.direction ?? { x: -1, y: -1 },
    speed: config.speed ?? 1,
    type: config.type,
    tint: config.tint ?? "#ffffff",
  };

  async function handleConditionChange(value: WeatherConfig["type"]) {
    await OBR.scene.items.updateItems(items, (items) => {
      for (const item of items) {
        const config = item.metadata[getPluginId("weather")];
        if (isPlainObject(config)) {
          config.type = value;
        }
      }
    });
  }

  const directionValue = vectorToDirection(values.direction);
  async function handleDirectionChange(value: Direction) {
    await OBR.scene.items.updateItems(items, (items) => {
      for (const item of items) {
        const config = item.metadata[getPluginId("weather")];
        if (isPlainObject(config)) {
          config.direction = directionToVector(value);
        }
      }
    });
  }

  async function handleCoverChange(value: number) {
    await OBR.scene.items.updateItems(items, (items) => {
      for (const item of items) {
        const config = item.metadata[getPluginId("weather")];
        if (isPlainObject(config)) {
          config.density = value;
        }
      }
    });
  }

  async function handleWindChange(value: number) {
    await OBR.scene.items.updateItems(items, (items) => {
      for (const item of items) {
        const config = item.metadata[getPluginId("weather")];
        if (isPlainObject(config)) {
          config.speed = value;
        }
      }
    });
  }

  async function handleTintChange(value: string) {
    await OBR.scene.items.updateItems(items, (items) => {
      for (const item of items) {
        const config = item.metadata[getPluginId("weather")];
        if (isPlainObject(config)) {
          config.tint = value === "#ffffff" ? undefined : value;
        }
      }
    });
  }

  // Canvas drawing functions for color picker
  useEffect(() => {
    if (colorPickerOpen && colorCanvasRef.current && hueCanvasRef.current) {
      drawColorCanvas();
      drawHueCanvas();
    }
  }, [colorPickerOpen, hue]);

  const drawColorCanvas = () => {
    const canvas = colorCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Create saturation/lightness gradient
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const s = (x / width) * 100;
        const l = 100 - (y / height) * 100;
        const color = hslToHex(hue, s, l);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  };

  const drawHueCanvas = () => {
    const canvas = hueCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Create hue gradient
    for (let y = 0; y < height; y++) {
      const h = (y / height) * 360;
      const color = hslToHex(h, 100, 50);
      ctx.fillStyle = color;
      ctx.fillRect(0, y, width, 1);
    }
  };

  const handleColorCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = colorCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const s = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const l = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
    
    setSaturation(s);
    setLightness(l);
    const newColor = hslToHex(hue, s, l);
    handleTintChange(newColor);
  };

  const handleHueCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = hueCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const h = Math.max(0, Math.min(360, (y / 100) * 360));
    
    setHue(h);
    const newColor = hslToHex(h, saturation, lightness);
    handleTintChange(newColor);
  };

  // Initialize color picker state when opening
  useEffect(() => {
    if (colorPickerOpen) {
      const [h, s, l] = hexToHsl(values.tint);
      setHue(h);
      setSaturation(s);
      setLightness(l);
    }
  }, [colorPickerOpen, values.tint]);



  return (
    <Stack px={2} py={1}>
      <Stack gap={1} direction="row" sx={{ mb: 1 }} alignItems="center">
        <FormControl fullWidth>
          <SmallLabel id="condition-label">Condition</SmallLabel>
          <Select
            labelId="condition-label"
            value={values.type}
            size="small"
            onChange={(e) =>
              handleConditionChange(e.target.value as WeatherConfig["type"])
            }
            MenuProps={{
              slots: {
                paper: ScrollInsetPaper,
              },
            }}
          >
            <MenuItem value="SNOW">Snow</MenuItem>
            <MenuItem value="RAIN">Rain</MenuItem>
            <MenuItem value="SAND">Sand</MenuItem>
            <MenuItem value="FIRE">Fire</MenuItem>
            <MenuItem value="CLOUD">Cloud</MenuItem>
            <MenuItem value="BLOOM">Bloom</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <SmallLabel id="direction-label">Direction</SmallLabel>
          <Select
            labelId="direction-label"
            value={directionValue}
            size="small"
            onChange={(e) => handleDirectionChange(e.target.value as Direction)}
            renderValue={directionToLabel}
            sx={{
              ".MuiSelect-select": {
                display: "flex",
                alignItems: "center",
              },
              ".MuiSvgIcon-root": {
                ml: 0.5,
              },
            }}
            MenuProps={{
              slots: {
                paper: ScrollInsetPaper,
              },
            }}
          >
            <MenuItem value="NORTH">
              North <North sx={{ ml: 0.5 }} fontSize="small" />
            </MenuItem>
            <MenuItem value="NORTH_EAST">
              North East <NorthEast sx={{ ml: 0.5 }} fontSize="small" />
            </MenuItem>
            <MenuItem value="EAST">
              East <East sx={{ ml: 0.5 }} fontSize="small" />
            </MenuItem>
            <MenuItem value="SOUTH_EAST">
              South East <SouthEast sx={{ ml: 0.5 }} fontSize="small" />
            </MenuItem>
            <MenuItem value="SOUTH">
              South <South sx={{ ml: 0.5 }} fontSize="small" />
            </MenuItem>
            <MenuItem value="SOUTH_WEST">
              South West
              <SouthWest sx={{ ml: 0.5 }} fontSize="small" />
            </MenuItem>
            <MenuItem value="WEST">
              West <West sx={{ ml: 0.5 }} fontSize="small" />
            </MenuItem>
            <MenuItem value="NORTH_WEST">
              North West <NorthWest sx={{ ml: 0.5 }} fontSize="small" />
            </MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Stack gap={1} direction="row" sx={{ mb: 1 }} alignItems="center">
        <FormControl fullWidth>
          <SmallLabel>Wind</SmallLabel>
          <ToggleButtonGroup
            exclusive
            aria-label="edge"
            size="small"
            value={values.speed}
            onChange={(_, v) => v && handleWindChange(v)}
            fullWidth
          >
            <ToggleButton value={1} aria-label="low">
              <WindLow />
            </ToggleButton>
            <ToggleButton value={2} aria-label="medium">
              <WindMedium />
            </ToggleButton>
            <ToggleButton value={3} aria-label="high">
              <WindHigh />
            </ToggleButton>
            <ToggleButton value={4} aria-label="max">
              <WindMax />
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
      </Stack>
      <Stack gap={1} direction="row" sx={{ mb: 1 }} alignItems="center">
        <FormControl fullWidth>
          <SmallLabel>Cover</SmallLabel>
          <ToggleButtonGroup
            exclusive
            aria-label="type"
            size="small"
            value={values.density}
            onChange={(_, v) => v && handleCoverChange(v)}
            fullWidth
          >
            <ToggleButton value={1} aria-label="low">
              <DensityLow />
            </ToggleButton>
            <ToggleButton value={2} aria-label="medium">
              <DensityMedium />
            </ToggleButton>
            <ToggleButton value={3} aria-label="high">
              <DensityHigh />
            </ToggleButton>
            <ToggleButton value={4} aria-label="max">
              <DensityMax />
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
      </Stack>
      <Stack sx={{ mb: 2 }}>
        <SmallLabel>Tint</SmallLabel>
        <IconButton
          onClick={() => setColorPickerOpen(!colorPickerOpen)}
          sx={{
            width: "100%",
            height: 32,
            backgroundColor: values.tint === "#ffffff" ? "rgba(255,255,255,0.05)" : values.tint,
            border: "2px solid",
            borderColor: values.tint === "#ffffff" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
            borderRadius: 1,
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "&:hover": {
              backgroundColor: values.tint === "#ffffff" ? "rgba(255,255,255,0.1)" : values.tint,
              borderColor: "rgba(255,255,255,0.4)",
              transform: "scale(1.02)",
            },
          }}
        >
          {values.tint === "#ffffff" && (
            <Box sx={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.6)",
              fontWeight: "bold"
            }}>
              ×
            </Box>
          )}
        </IconButton>
        <Collapse in={colorPickerOpen}>
          <Box sx={{ 
            mt: 1, 
            p: 1.5, 
            border: "1px solid", 
            borderColor: "rgba(255,255,255,0.15)", 
            borderRadius: 1,
            backgroundColor: "rgba(26, 32, 46, 0.95)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            width: "100%"
          }}>
            {/* Color Picker Area */}
            <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
              {/* Saturation/Lightness Canvas */}
              <Box sx={{ position: "relative", flex: 1 }}>
                <canvas
                  ref={colorCanvasRef}
                  width={150}
                  height={100}
                  onClick={handleColorCanvasClick}
                  style={{
                    cursor: "crosshair",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "4px",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)",
                    width: "100%",
                    height: "100px"
                  }}
                />
                {/* Crosshair indicator */}
                <Box sx={{
                  position: "absolute",
                  left: `calc(${saturation}% - 3px)`,
                  top: `calc(${100 - lightness}% - 3px)`,
                  width: 6,
                  height: 6,
                  border: "1px solid #ffffff",
                  borderRadius: "50%",
                  pointerEvents: "none",
                  boxShadow: "0 0 2px rgba(0,0,0,0.6)"
                }} />
              </Box>

              {/* Hue Slider Canvas */}
              <Box sx={{ position: "relative" }}>
                <canvas
                  ref={hueCanvasRef}
                  width={16}
                  height={100}
                  onClick={handleHueCanvasClick}
                  style={{
                    cursor: "crosshair",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "4px",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)"
                  }}
                />
                {/* Hue indicator */}
                <Box sx={{
                  position: "absolute",
                  left: -1,
                  top: `${(hue / 360) * 100 - 1}px`,
                  width: 18,
                  height: 2,
                  border: "1px solid #ffffff",
                  borderRadius: "1px",
                  pointerEvents: "none",
                  boxShadow: "0 0 2px rgba(0,0,0,0.6)"
                }} />
              </Box>

              {/* Color Preview */}
              <Box sx={{
                width: 28,
                height: 100,
                backgroundColor: values.tint === "#ffffff" ? "rgba(255,255,255,0.05)" : values.tint,
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "4px",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {values.tint === "#ffffff" && (
                  <Box sx={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.6)",
                    fontWeight: "bold"
                  }}>
                    ×
                  </Box>
                )}
              </Box>
            </Box>

            {/* Hex Input and Clear Button */}
            <Stack direction="row" spacing={0.5} alignItems="flex-end">
              <TextField
                size="small"
                label="Hex"
                value={values.tint === "#ffffff" ? "" : values.tint}
                placeholder="No tint"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  if (/^#[0-9A-F]{0,6}$/i.test(value)) {
                    if (value.length === 7) {
                      const [h, s, l] = hexToHsl(value);
                      setHue(h);
                      setSaturation(s);
                      setLightness(l);
                      handleTintChange(value);
                    }
                  }
                }}
                sx={{
                  flex: 1,
                  "& .MuiInputBase-input": {
                    fontSize: "0.7rem",
                    padding: "4px 8px",
                    textAlign: "center"
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "0.65rem",
                    color: "rgba(255,255,255,0.7)",
                  },
                }}
              />
              <Button
                size="small"
                variant="outlined"
                onClick={async () => {
                  await OBR.scene.items.updateItems(items, (items) => {
                    for (const item of items) {
                      const config = item.metadata[getPluginId("weather")];
                      if (isPlainObject(config)) {
                        delete config.tint;
                      }
                    }
                  });
                  setHue(0);
                  setSaturation(0);
                  setLightness(100);
                  setColorPickerOpen(false);
                }}
                sx={{
                  minWidth: "auto",
                  px: 1,
                  fontSize: "0.65rem",
                  color: "rgba(255,255,255,0.7)",
                  borderColor: "rgba(255,255,255,0.3)",
                  "&:hover": {
                    borderColor: "rgba(255,255,255,0.5)",
                    backgroundColor: "rgba(255,255,255,0.05)"
                  }
                }}
              >
                Clear
              </Button>
            </Stack>
          </Box>
        </Collapse>
      </Stack>
      <Button
        size="small"
        fullWidth
        onClick={async () => {
          const selection = await OBR.player.getSelection();
          if (!selection || selection.length === 0) {
            return;
          }
          await OBR.scene.items.updateItems(selection, (items) => {
            for (const item of items) {
              delete item.metadata[getPluginId("weather")];
            }
          });
        }}
        color="error"
      >
        Remove Weather
      </Button>
    </Stack>
  );
}

function FormControlSkeleton() {
  return (
    <Stack width="100%" gap={0.5}>
      <Skeleton height={17.25} width={40} />
      <Skeleton
        variant="rectangular"
        height={40}
        width="100%"
        sx={{ borderRadius: 0.5 }}
      />
    </Stack>
  );
}

function MenuSkeleton() {
  return (
    <Stack px={2} py={1}>
      <Stack gap={1} direction="row" sx={{ mb: 1 }} alignItems="center">
        <FormControlSkeleton />
        <FormControlSkeleton />
      </Stack>
      <Stack gap={1} direction="row" sx={{ mb: 1 }} alignItems="center">
        <FormControlSkeleton />
      </Stack>
      <Stack gap={1} direction="row" sx={{ mb: 2 }} alignItems="center">
        <FormControlSkeleton />
      </Stack>
      <Skeleton
        variant="rectangular"
        height={30.75}
        width="100%"
        sx={{ borderRadius: "20px" }}
      />
    </Stack>
  );
}
