import type Device from "../Device"
import type {IntRangeDeviceAttribute, ListDeviceAttribute} from "../Device";
import type { IntDeviceAttribute } from "../Device";

// "attributes;timestampMs:ro[int],mode:rw[%d|%d],currentSpeed:ro[0-%d],maxSpeed:rw[%d-%d],currentPressure:ro[0-4095],avgPressure:ro[0-4095],sensitivity:rw[1-%d],maxPressureDelta:ro[1-600],rampUpTime:rw[10-60],remainingCoolDownTime:ro[0-15]\n",

type DeviceNogasmAttributes = {
  timestampMs: IntDeviceAttribute;
  mode: ListDeviceAttribute<string, string>;
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
