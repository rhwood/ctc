export interface CtcControlConfig {
  hostname: string;
  port: number;
  socket: string;
}

export interface CtcProjectConfig {
  name: string;
  control: CtcControlConfig;
  http: {
    hostname: string;
    port: number;
    secure: boolean;
  };
  ctc: {
    version: string;
  };
}
