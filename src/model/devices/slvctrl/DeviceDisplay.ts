import type Device from "../Device";
import type { StrDeviceAttribute } from "../Device";

type DeviceDisplayAttributes = {
  content: StrDeviceAttribute;
}

export type DeviceDisplay = Device<DeviceDisplayAttributes>;
