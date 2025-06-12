import Device from "../Device";

interface VirtualDeviceRandomGeneratorData {
  value: string | null;
}

export default class VirtualRandomGenerator extends Device {
  public data: VirtualDeviceRandomGeneratorData | null = null;
}
