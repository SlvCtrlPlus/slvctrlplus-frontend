import Rule from "./Rule.js";
import type Device from "./Device.js";
import type ValueMap from "./ValueMap.js";

export default class MapRule extends Rule {
  public fromDevice: Device | null = null;

  public toDevice: Device | null = null;

  public fromMap: ValueMap | null = null;

  public toMap: ValueMap | null = null;
}
