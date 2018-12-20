export class ModbusTcpServerError extends Error {

  constructor(public message: string) {
    super(message);
    this.name = 'ModbusTcpServerError';
    this.message = message;
    this.stack = (new Error()).stack;
    Object.setPrototypeOf(this, ModbusTcpServerError.prototype);
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
    Object.setPrototypeOf(this, ModbusCommandError.prototype);
  }

  toString() {
    return this.name + ': ' + this.message
  }
}
