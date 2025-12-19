export default interface DeviceZc95Data {
  activePattern: number;
  patternStarted: boolean;
  [key: `powerChannel${number}`]: number;
  [key: `patternAttribute${number}`]: number;
}
