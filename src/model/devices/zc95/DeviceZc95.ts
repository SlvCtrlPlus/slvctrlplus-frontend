import type Device from "../Device";
import type {
    BoolDeviceAttribute,
    IntRangeDeviceAttribute,
    ListDeviceAttribute
} from "../Device";

type RequiredDeviceZc95Attributes = {
    activePattern: ListDeviceAttribute<number, string>;
    patternStarted: BoolDeviceAttribute<boolean>;
}

export type PowerChannelDeviceZc95Attributes = {
    powerChannel1: IntRangeDeviceAttribute;
    powerChannel2: IntRangeDeviceAttribute;
    powerChannel3: IntRangeDeviceAttribute;
    powerChannel4: IntRangeDeviceAttribute;
}

export type PatternDeviceZc95Attributes = {
    [key: `patternAttribute${number}`]: ListDeviceAttribute<number, string>|IntRangeDeviceAttribute;
}

export type DeviceZc95Attributes = Partial<PowerChannelDeviceZc95Attributes & PatternDeviceZc95Attributes>
    & Required<RequiredDeviceZc95Attributes>;

export type DeviceZc95 = Device<DeviceZc95Attributes>;
