import Device from "../Device";

interface VirtualDeviceTtsData {
  text: string | null;
  queuing: boolean | null;
  queueLength: number | null;
  speaking: boolean | null;
}

export default class VirtualDeviceTts extends Device {
  public data: VirtualDeviceTtsData = {} as VirtualDeviceTtsData;
}
