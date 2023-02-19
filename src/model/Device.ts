export default abstract class Device
{
    public deviceId: string|null = null;

    public deviceName: string|null = null;

    public deviceModel: string|null = null;

    public type: string|null = null;

    public connectedSince: string|null = null;

    public lastRefresh: string|null = null;

    public receiveUpdates = true;
}
