import Device from "./Device";
import type DeviceEt312Data from "./DeviceEt312Data";

export default class DeviceGeneric extends Device
{
    public data: JsonObject|null = null;
}
