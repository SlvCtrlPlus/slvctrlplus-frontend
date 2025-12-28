import type Device from "../Device";
import type { IntRangeDeviceAttribute } from "../Device";

type DeviceAirValveAttributes = {
  flow: IntRangeDeviceAttribute;
}

export type DeviceAirValve = Device<DeviceAirValveAttributes>;
