import Device from "./Device";
import type DeviceAirValveData from "./DeviceAirValveData";

export default class DeviceAirValve extends Device
{
    public data: DeviceAirValveData|null = null;
}