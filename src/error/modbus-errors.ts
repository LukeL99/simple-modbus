export class ModbusServerError extends Error {

  // Impossible to get Jest to see super branch as covered, have to ignore whole constructor
  /* istanbul ignore next */
  constructor(public message: string) {
    super(message);
    this.name = 'ModbusServerError';
    this.message = message;
    this.stack = (new Error()).stack;
    Object.setPrototypeOf(this, ModbusServerError.prototype);
  }

  toString() {
    return this.name + ': ' + this.message;
  }
}

export class ModbusCommandError extends Error {

  // Impossible to get Jest to see super branch as covered, have to ignore whole constructor
  /* istanbul ignore next */
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
