export type DeviceZc95Data = {
  activePattern: number;
  patternStarted: boolean;
  [key: `powerChannel${number}`]: number;
  [key: `patternAttribute${number}`]: number;
}

