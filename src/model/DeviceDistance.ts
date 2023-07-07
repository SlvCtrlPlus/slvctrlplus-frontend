import Device from "./Device";
import type DeviceDistanceData from "./DeviceDistanceData.js";

export default class DeviceDistance extends Device {
  public data: DeviceDistanceData | null = null;
}
