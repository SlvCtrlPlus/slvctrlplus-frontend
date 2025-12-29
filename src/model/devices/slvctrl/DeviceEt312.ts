import type Device from "../Device";
import type {
    BoolDeviceAttribute,
    IntRangeDeviceAttribute,
    ListDeviceAttribute
} from "../Device";

type DeviceEt312Attributes = {
  connected: BoolDeviceAttribute<boolean>;
  adc: BoolDeviceAttribute;
  mode: ListDeviceAttribute<number, string>;
  levelA: IntRangeDeviceAttribute;
  levelB: IntRangeDeviceAttribute;
};

export type DeviceEt312 = Device<DeviceEt312Attributes>;
