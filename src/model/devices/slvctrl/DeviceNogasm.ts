import type Device from "../Device"
import type {IntRangeDeviceAttribute, ListDeviceAttribute} from "../Device";
import type { IntDeviceAttribute } from "../Device";

type DeviceNogasmAttributes = {
  timestampMs: IntDeviceAttribute;
  mode: ListDeviceAttribute<number, number>;
  currentSpeed: IntRangeDeviceAttribute;
  maxSpeed: IntRangeDeviceAttribute;
  currentPressure: IntRangeDeviceAttribute;
  avgPressure: IntRangeDeviceAttribute;
  sensitivity: IntRangeDeviceAttribute;
  maxPressureDelta: IntRangeDeviceAttribute;
  rampUpTime: IntRangeDeviceAttribute;
  remainingCoolDownTime: IntRangeDeviceAttribute;
}

export type DeviceNogasm = Device<DeviceNogasmAttributes>;
