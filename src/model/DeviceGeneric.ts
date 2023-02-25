import Device from "./Device";

export default class DeviceGeneric extends Device {
  public data: JsonObject | null = null;

  public attributes: JsonObject | null = null;
}
