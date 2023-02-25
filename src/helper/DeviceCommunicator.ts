import type { Socket } from "socket.io-client";
import TimeoutHelper from "./TimeoutHelper";
import type Device from "../model/Device";

export default class DeviceCommunicator {
  private readonly io: Socket;

  private readonly timeout: TimeoutHelper;

  private readonly device: Device;

  public constructor(device: Device, io: Socket) {
    this.io = io;
    this.device = device;
    this.timeout = new TimeoutHelper(
      () => (this.device.receiveUpdates = true),
      500
    );
  }

  public setAttribute(
    attrName: string,
    newValue: string | boolean | number
  ): void {
    this.device.receiveUpdates = false;

    this.io.emit("deviceUpdate", {
      deviceId: this.device.deviceId,
      data: { [attrName]: newValue },
    });

    this.timeout.schedule();
  }
}
