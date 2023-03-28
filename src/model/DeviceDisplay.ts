import Device from "./Device";
import type DeviceDisplayData from "./DeviceDisplayData";

export default class DeviceDisplay extends Device
{
    public data: DeviceDisplayData|null = null;
}
