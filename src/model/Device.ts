export default interface Device {
   deviceId: string;
   deviceName: string;
   deviceModel: string;
   type: string;
   connectedSince: string;
   lastRefresh: string;
   receiveUpdates: boolean;
}
