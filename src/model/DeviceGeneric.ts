import type Device from "./Device";

export interface DeviceAttribute {
  name: string;
  label?: string;
  uom?: string;
  type: 'bool' | 'list' | 'str' | 'float' | 'int' | 'range';
  modifier?: 'ro' | 'rw';
  values?: Record<string, string>;
  min?: number;
  max?: number;
  incrementStep?: number;
}

export default interface DeviceGeneric<T = Record<string, string |number|boolean>> extends Device {
  data: T;
  attributes: DeviceAttribute[];
}

export function getDeviceAttribute(device: DeviceGeneric, attrName: string): DeviceAttribute|undefined {
    return device.attributes.find(attr => attr.name === attrName);
}
