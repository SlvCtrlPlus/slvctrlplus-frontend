import type { Socket } from 'socket.io-client';
import type Device from '@/model/devices/Device';

type DeviceData<D extends Device> = {
  [K in keyof D['attributes']]-?: Exclude<D['attributes'][K], undefined> extends { value: infer V } ? V : never
};

export default class DeviceCommunicator<T extends Device> {
  private readonly io: Socket;

  private readonly device: T;

  public constructor(device: T, io: Socket) {
    this.io = io;
    this.device = device;
  }

  public setAttribute<K extends keyof T['attributes']>(attrName: K, newValue: DeviceData<T>[K] | null): void {
    const attributes = this.device.attributes as T['attributes'];

    if (null === newValue || undefined === attributes[attrName]) {
      return;
    }

    this.io.emit('deviceUpdate', {
      deviceId: this.device.deviceId,
      data: { [attrName]: newValue },
    });
  }
}
