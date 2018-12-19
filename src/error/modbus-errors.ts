// export declare class Error {
//   public name: string;
//   public message: string;
//   public stack: string;
//   constructor(message?: string);
// }

export class ModbusTcpServerError extends Error {

  constructor(public message: string) {
    super(message);
    this.name = 'ModbusTcpServerError';
    this.message = message;
    this.stack = (new Error()).stack;
  }
  toString() {
    return this.name + ': ' + this.message;
  }
}

export class ModbusCommandError extends Error {

  constructor(public message: string) {
    super(message)
    this.name = 'ModbusCommandError'
    this.message = message
    this.stack = (new Error()).stack
  }

  toString() {
    return this.name + ': ' + this.message
  }
}
