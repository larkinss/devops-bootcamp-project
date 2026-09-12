import raw from '../ship.config.json';
import { toRenderParams } from './ship-schema.js';

export const ship = toRenderParams(raw);
