import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "../util/getPluginId";

import weatherIcon from "../assets/weather.svg";

export function createWeatherMenu() {
  OBR.contextMenu.create({
    id: getPluginId("weather-menu/add"),
    icons: [
      {
        icon: weatherIcon,
        label: "Add Weather",
        filter: {
          every: [
            { key: "layer", value: "MAP", coordinator: "||" },
            { key: "layer", value: "FOG" },
            {
              key: ["metadata", getPluginId("weather")],
              value: undefined,
            },
          ],
          permissions: ["UPDATE"],
        },
      },
    ],
    async onClick(context) {
      await OBR.scene.items.updateItems(context.items, (items) => {
        for (const item of items) {
          item.metadata[getPluginId("weather")] = {
            type: "SNOW",
          };
        }
      });
    },
  });

  OBR.contextMenu.create({
    id: getPluginId("weather-menu/settings"),
    icons: [
      {
        icon: weatherIcon,
        label: "Weather Settings",
        filter: {
          every: [
            { key: "layer", value: "MAP", coordinator: "||" },
            { key: "layer", value: "FOG" },
            {
              key: ["metadata", getPluginId("weather")],
              value: undefined,
              operator: "!=",
            },
          ],
          permissions: ["UPDATE"],
        },
      },
    ],
    embed: {
      url: `${import.meta.env.BASE_URL}menu.html`,
      height: 263,
    },
  });
}
