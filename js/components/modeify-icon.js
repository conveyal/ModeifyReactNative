import React from 'react'

/**
 * ModeifyIcon icon set component.
 * Usage: <ModeifyIcon name="icon-name" size={20} color="#4F8EF7" />
 */

import createIconSet from 'react-native-vector-icons/lib/create-icon-set';
const glyphMap: {[key: string]: number} = {
  "book": 58895,
  "money": 58896,
  "scale": 58897,
  "arrow": 58880,
  "cruiserbike": 58881,
  "end": 58882,
  "exit": 58883,
  "racerbike": 58884,
  "reverse": 58885,
  "search": 58886,
  "speedwalker": 58887,
  "start": 58888,
  "bike": 58889,
  "bus": 58890,
  "cabi": 58891,
  "car": 58892,
  "carshare": 58893,
  "train": 58894,
  "walk": 58898
}

const iconSet: React.Element = createIconSet(glyphMap, 'icomoon', 'ModeifyIcons.ttf');

export default iconSet;

export const Button: React.Element = iconSet.Button;
export const TabBarItem: React.Element = iconSet.TabBarItem;
export const TabBarItemIOS: React.Element = iconSet.TabBarItemIOS;
export const ToolbarAndroid: React.Element = iconSet.ToolbarAndroid;
export const getImageSource: React.Element = iconSet.getImageSource;
