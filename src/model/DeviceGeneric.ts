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

export type AttributeValue = string | number | boolean;
export type DeviceData = Record<string, AttributeValue>;

export default interface DeviceGeneric<T extends DeviceData = DeviceData> extends Device {
  data: T;
  attributes: DeviceAttribute[];
}

export function getDeviceAttributeDefinition<T extends DeviceGeneric>(
    device: T, attrName: keyof T['data']
): DeviceAttribute|undefined {
    return device.attributes.find(attr => attr.name === attrName);
}
