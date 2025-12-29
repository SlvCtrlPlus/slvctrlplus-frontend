import type Device from "../Device";
import type { IntRangeDeviceAttribute } from "../Device";

type DeviceStrikerMk2Attributes = {
  speed: IntRangeDeviceAttribute;
};

export type DeviceStrikerMk2 = Device<DeviceStrikerMk2Attributes>;
