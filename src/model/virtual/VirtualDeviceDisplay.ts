import Device from "../Device";

interface VirtualDeviceDisplayData {
  content: string | null;
}

export default class VirtualDeviceDisplay extends Device {
  public data: VirtualDeviceDisplayData | null = null;
}
