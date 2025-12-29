import type Device from "../Device";
import type { IntDeviceAttribute, StrDeviceAttribute } from "../Device";

type DeviceDistanceAttributes = {
  distance: IntDeviceAttribute;
  lux: IntDeviceAttribute;
  sensor: StrDeviceAttribute;
}

export type DeviceDistance = Device<DeviceDistanceAttributes>;
