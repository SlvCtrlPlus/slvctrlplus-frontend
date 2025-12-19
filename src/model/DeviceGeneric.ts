import Device from "./Device";

interface DeviceAttribute {
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

export default class DeviceGeneric extends Device {
  public data: Record<string, string | number | boolean> = {};

  public attributes: DeviceAttribute[] = [];
}
