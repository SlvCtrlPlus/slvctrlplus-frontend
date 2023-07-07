import Device from "./Device";

export default class DeviceDistanceData extends Device {
  public distance: number | null = null;
  public lux: number | null = null;
  public sensor: string | null = null;
}
