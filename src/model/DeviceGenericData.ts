import Device from "./Device";

export default class DeviceEt312Data extends Device
{
    public connected: boolean|null = null;
    public adc: boolean|null = null;
    public mode: number|null = null;
    public levelA: number|null = null;
    public levelB: number|null = null;
}