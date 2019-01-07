import { TypedEvent } from './util/typed-event'
import { ModbusCommandError } from './error/modbus-errors'

export enum ModbusFunctionCode {
  READ_COIL_STATUS = 0x01,
  READ_INPUT_STATUS = 0x02,
  READ_HOLDING_REGISTERS = 0x03,
  READ_INPUT_REGISTERS = 0x04,
  FORCE_SINGLE_COIL = 0x05,
  PRESET_SINGLE_REGISTER = 0x06,
  FORCE_MULTIPLE_COILS = 0x0f,
  PRESET_MULTIPLE_REGISTERS = 0x10
}

export enum ModbusCommandException {
  ILLEGAL_FUNCTION = 0x01,
  ILLEGAL_DATA_ADDRESS = 0x02,
  ILLEGAL_DATA_VALUE = 0x03,
  SERVER_DEVICE_FAILURE = 0x04,
  ACKNOWLEDGE = 0x05,
  SERVER_DEVICE_BUSY = 0x06,
  NEGATIVE_ACKNOWLEDGE = 0x07,
  MEMORY_PARITY_ERROR = 0x08,
  GATEWAY_PATH_UNAVAILABLE = 0x0a,
  GATEWAY_TARGET_FAILED_TO_RESPOND = 0x0b
}

export enum CoilStatus {
  ON,
  OFF
}

/**
 * @hidden
 */
export type UnitIdGetter = (requestPacket: Buffer) => number
/**
 * @hidden
 */
export type FunctionCodeGetter = (requestPacket: Buffer) => ModbusFunctionCode
/**
 * @hidden
 */
export type CoilAddressGetter = (requestPacket: Buffer) => number
/**
 * @hidden
 */
export type CoilLengthGetter = (requestPacket: Buffer) => number
/**
 * @hidden
 */
export type CoilStatusGetter = (requestPacket: Buffer) => boolean
/**
 * @hidden
 */
export type CoilStatusesGetter = (requestPacket: Buffer) => Array<boolean>
/**
 * @hidden
 */
export type InputAddressGetter = (requestPacket: Buffer) => number
/**
 * @hidden
 */
export type InputLengthGetter = (requestPacket: Buffer) => number
/**
 * @hidden
 */
export type RegisterAddressGetter = (requestPacket: Buffer) => number
/**
 * @hidden
 */
export type RegisterValueGetter = (requestPacket: Buffer) => number
/**
 * @hidden
 */
export type RegisterValuesGetter = (requestPacket: Buffer) => Array<number>
/**
 * @hidden
 */
export type RegisterLengthGetter = (requestPacket: Buffer) => number

/**
 * @hidden
 */
export type GenericSuccessGetter = (requestPacket: Buffer, length?: number) => Buffer
/**
 * @hidden
 */
export type BoolArraySuccessGetter = (reqestPacket: Buffer, data: Array<boolean>) => Buffer
/**
 * @hidden
 */
export type Uint16ArraySuccessGetter = (requestPacket: Buffer, data: Uint16Array) => Buffer
/**
 * @hidden
 */
export type FailureGetter = (requestPacket: Buffer, exception: ModbusCommandException) => Buffer

export abstract class ModbusCommand<T extends ModbusCommand<any>> {
  /**
   * Fires on either success or failure, with the response bytes. Mainly used by the server to send a response.
   */
  public onComplete = new TypedEvent<ModbusCommand<any>>()
  /**
   * Fires on a call of the success method.
   */
  public onSuccess = new TypedEvent<ModbusCommand<any>>()
  /**
   * Fires on a call of the fail method.
   */
  public onFailure = new TypedEvent<ModbusCommand<any>>()

  protected readonly _rawPacket: Buffer
  protected _responsePacket?: Buffer
  protected readonly _unitIdGetter: UnitIdGetter
  protected readonly _functionCodeGetter: FunctionCodeGetter
  protected readonly _successGetter:
    | GenericSuccessGetter
    | BoolArraySuccessGetter
    | Uint16ArraySuccessGetter
  protected readonly _failureGetter: FailureGetter

  /**
   * If RTU, unitId is equivalent to slaveId
   */
  public get unitId(): number {
    return this._unitIdGetter(this._rawPacket)
  }

  /**
   * Modbus function code
   */
  public get functionCode(): ModbusFunctionCode {
    return this._functionCodeGetter(this._rawPacket)
  }

  /**
   * This function will give you the response packet bytes that will be sent on the emitting server. Before calling this function, the `success` or `fail` method must be called in order to set the response.
   *
   * @returns A buffer of the bytes representing the response to the server
   * @throws ModbusCommandError if success or fail hasn't been called yet
   */
  public get responsePacket(): Buffer {
    if (!this._responsePacket) {
      throw new ModbusCommandError(
        'Tried to read response packet, but success or fail has not been called.',
        this._rawPacket
      )
    }
    return this._responsePacket
  }

  protected constructor(
    rawPacket: Buffer,
    unitIdGetter: UnitIdGetter,
    functionCodeGetter: FunctionCodeGetter,
    successGetter: GenericSuccessGetter | BoolArraySuccessGetter | Uint16ArraySuccessGetter,
    failureGetter: FailureGetter
  ) {
    this._rawPacket = rawPacket
    this._unitIdGetter = unitIdGetter
    this._functionCodeGetter = functionCodeGetter
    this._successGetter = successGetter
    this._failureGetter = failureGetter
  }

  /**
   * Set a failure on this command to return an exception response to the emitting server.
   *
   * @param exception - The reason for the failure
   */
  public fail(exception: ModbusCommandException): void {
    this._responsePacket = this._failureGetter(this._rawPacket, exception)
    this.onComplete.emit(this)
    this.onFailure.emit(this)
  }
}

export class ReadCoilStatusCommand extends ModbusCommand<ReadCoilStatusCommand> {
  private readonly _coilAddressGetter: CoilAddressGetter
  private readonly _coilLengthGetter: CoilLengthGetter

  public get coilStartAddress() {
    return this._coilAddressGetter(this._rawPacket)
  }

  public get numberOfCoils() {
    return this._coilLengthGetter(this._rawPacket)
  }

  /**
   * Set success on this command to return a valid response to the emitting server.
   *
   * @param data - Boolean coil data, starting at `coilStartAddress`, of length `numberOfCoils`.
   */
  public success(data: Array<boolean>): void {
    // TODO: Throw error here if data length doesn't equal requested length
    this._responsePacket = (this._successGetter as BoolArraySuccessGetter)(this._rawPacket, data)
    this.onComplete.emit(this)
    this.onSuccess.emit(this)
  }

  /**
   * @hidden
   */
  constructor(
    rawPacket: Buffer,
    unitIdGetter: UnitIdGetter,
    functionCodeGetter: FunctionCodeGetter,
    successGetter: BoolArraySuccessGetter,
    failureGetter: FailureGetter,
    coilAddressGetter: CoilAddressGetter,
    coilLengthGetter: CoilLengthGetter
  ) {
    super(rawPacket, unitIdGetter, functionCodeGetter, successGetter, failureGetter)
    this._coilAddressGetter = coilAddressGetter
    this._coilLengthGetter = coilLengthGetter
  }
}

export class ReadInputStatusCommand extends ModbusCommand<ReadInputStatusCommand> {
  private readonly _inputAddressGetter: InputAddressGetter
  private readonly _inputLengthGetter: InputLengthGetter

  public get inputStartAddress() {
    return this._inputAddressGetter(this._rawPacket)
  }

  public get numberOfInputs() {
    return this._inputLengthGetter(this._rawPacket)
  }

  /**
   * Set success on this command to return a valid response to the emitting server.
   *
   * @param data - Input status data of requested discrete inputs. `true` = ON, `false` = off
   */
  public success(data: Array<boolean>): void {
    // TODO: Throw error here if data length doesn't equal requested length
    this._responsePacket = (this._successGetter as BoolArraySuccessGetter)(this._rawPacket, data)
    this.onComplete.emit(this)
    this.onSuccess.emit(this)
  }

  /**
   * @hidden
   */
  constructor(
    rawPacket: Buffer,
    unitIdGetter: UnitIdGetter,
    functionCodeGetter: FunctionCodeGetter,
    successGetter: BoolArraySuccessGetter,
    failureGetter: FailureGetter,
    inputAddressGetter: InputAddressGetter,
    inputLengthGetter: InputLengthGetter
  ) {
    super(rawPacket, unitIdGetter, functionCodeGetter, successGetter, failureGetter)
    this._inputAddressGetter = inputAddressGetter
    this._inputLengthGetter = inputLengthGetter
  }
}

export class ReadHoldingRegistersCommand extends ModbusCommand<ReadHoldingRegistersCommand> {
  private readonly _registerAddressGetter: RegisterAddressGetter
  private readonly _registerLengthGetter: RegisterLengthGetter

  public get registerStartAddress() {
    return this._registerAddressGetter(this._rawPacket)
  }

  public get registerLength() {
    return this._registerLengthGetter(this._rawPacket)
  }

  /**
   * Set success on this command to return a valid response to the emitting server.
   *
   * @param data - Array of values of the requested holding registers. Register values are 16 bits. Array length must equal `registerLength`. `data[0]` should be the value of the register at `registerStartAddress`.
   */
  public success(data: Uint16Array): void {
    // TODO: Throw error here if data length doesn't equal requested length
    this._responsePacket = (this._successGetter as Uint16ArraySuccessGetter)(this._rawPacket, data)
    this.onComplete.emit(this)
    this.onSuccess.emit(this)
  }

  /**
   * @hidden
   */
  constructor(
    rawPacket: Buffer,
    unitIdGetter: UnitIdGetter,
    functionCodeGetter: FunctionCodeGetter,
    successGetter: Uint16ArraySuccessGetter,
    failureGetter: FailureGetter,
    registerAddressGetter: RegisterAddressGetter,
    registerLengthGetter: RegisterLengthGetter
  ) {
    super(rawPacket, unitIdGetter, functionCodeGetter, successGetter, failureGetter)
    this._registerAddressGetter = registerAddressGetter
    this._registerLengthGetter = registerLengthGetter
  }
}

export class ReadInputRegistersCommand extends ModbusCommand<ReadInputRegistersCommand> {
  private readonly _registerAddressGetter: RegisterAddressGetter
  private readonly _registerLengthGetter: RegisterLengthGetter

  public get registerStartAddress() {
    return this._registerAddressGetter(this._rawPacket)
  }

  public get registerLength() {
    return this._registerLengthGetter(this._rawPacket)
  }

  /**
   * Set success on this command to return a valid response to the emitting server.
   *
   * @param data - Array of values of the requested input registers. Register values are 16 bits. Array length must equal `registerLength`. `data[0]` should be the value of the register at `registerStartAddress`.
   */
  public success(data: Uint16Array): void {
    // TODO: Throw error here if data length doesn't equal requested length
    this._responsePacket = (this._successGetter as Uint16ArraySuccessGetter)(this._rawPacket, data)
    this.onComplete.emit(this)
    this.onSuccess.emit(this)
  }

  /**
   * @hidden
   */
  constructor(
    rawPacket: Buffer,
    unitIdGetter: UnitIdGetter,
    functionCodeGetter: FunctionCodeGetter,
    successGetter: Uint16ArraySuccessGetter,
    failureGetter: FailureGetter,
    registerAddressGetter: RegisterAddressGetter,
    registerLengthGetter: RegisterLengthGetter
  ) {
    super(rawPacket, unitIdGetter, functionCodeGetter, successGetter, failureGetter)
    this._registerAddressGetter = registerAddressGetter
    this._registerLengthGetter = registerLengthGetter
  }
}

export class ForceSingleCoilCommand extends ModbusCommand<ForceSingleCoilCommand> {
  private readonly _coilAddressGetter: CoilAddressGetter
  private readonly _coilStatusGetter: CoilStatusGetter

  public get coilAddress() {
    return this._coilAddressGetter(this._rawPacket)
  }

  public get coilStatus() {
    return this._coilStatusGetter(this._rawPacket)
  }

  public get coilStatusAsCoilStatus() {
    return this.coilStatus === true ? CoilStatus.ON : CoilStatus.OFF
  }

  /**
   * Set success on this command to return a valid response to the emitting server.
   */
  public success(): void {
    this._responsePacket = (this._successGetter as GenericSuccessGetter)(this._rawPacket)
    this.onComplete.emit(this)
    this.onSuccess.emit(this)
  }

  /**
   * @hidden
   */
  constructor(
    rawPacket: Buffer,
    unitIdGetter: UnitIdGetter,
    functionCodeGetter: FunctionCodeGetter,
    successGetter: GenericSuccessGetter,
    failureGetter: FailureGetter,
    coilAddressGetter: CoilAddressGetter,
    coilStatusGetter: CoilStatusGetter
  ) {
    super(rawPacket, unitIdGetter, functionCodeGetter, successGetter, failureGetter)
    this._coilAddressGetter = coilAddressGetter
    this._coilStatusGetter = coilStatusGetter
  }
}

export class PresetSingleRegisterCommand extends ModbusCommand<PresetSingleRegisterCommand> {
  private readonly _registerAddressGetter: RegisterAddressGetter
  private readonly _registerValueGetter: RegisterValueGetter

  public get registerAddress() {
    return this._registerAddressGetter(this._rawPacket)
  }

  public get registerValue() {
    return this._registerValueGetter(this._rawPacket)
  }

  /**
   * Set success on this command to return a valid response to the emitting server.
   */
  public success(): void {
    this._responsePacket = (this._successGetter as GenericSuccessGetter)(this._rawPacket)
    this.onComplete.emit(this)
    this.onSuccess.emit(this)
  }

  /**
   * @hidden
   */
  constructor(
    rawPacket: Buffer,
    unitIdGetter: UnitIdGetter,
    functionCodeGetter: FunctionCodeGetter,
    successGetter: GenericSuccessGetter,
    failureGetter: FailureGetter,
    registerAddressGetter: RegisterAddressGetter,
    registerValueGetter: RegisterValueGetter
  ) {
    super(rawPacket, unitIdGetter, functionCodeGetter, successGetter, failureGetter)
    this._registerAddressGetter = registerAddressGetter
    this._registerValueGetter = registerValueGetter
  }
}

export class ForceMultipleCoilsCommand extends ModbusCommand<ForceMultipleCoilsCommand> {
  private readonly _coilAddressGetter: CoilAddressGetter
  private readonly _coilLengthGetter: CoilLengthGetter
  private readonly _coilStatusesGetter: CoilStatusesGetter

  public get coilStartAddress() {
    return this._coilAddressGetter(this._rawPacket)
  }

  public get coilLength() {
    return this._coilLengthGetter(this._rawPacket)
  }

  public get coilStatuses() {
    return this._coilStatusesGetter(this._rawPacket)
  }

  public get coilStatusesAsCoilStatusArray() {
    return this.coilStatuses.map(x => (x === true ? CoilStatus.ON : CoilStatus.OFF))
  }

  /**
   * Set success on this command to return a valid response to the emitting server.
   */
  public success(): void {
    this._responsePacket = (this._successGetter as GenericSuccessGetter)(this._rawPacket)
    this.onComplete.emit(this)
    this.onSuccess.emit(this)
  }

  /**
   * @hidden
   */
  constructor(
    rawPacket: Buffer,
    unitIdGetter: UnitIdGetter,
    functionCodeGetter: FunctionCodeGetter,
    successGetter: GenericSuccessGetter,
    failureGetter: FailureGetter,
    coilAddressGetter: CoilAddressGetter,
    coilLengthGetter: CoilLengthGetter,
    coilStatusesGetter: CoilStatusesGetter
  ) {
    super(rawPacket, unitIdGetter, functionCodeGetter, successGetter, failureGetter)
    this._coilAddressGetter = coilAddressGetter
    this._coilLengthGetter = coilLengthGetter
    this._coilStatusesGetter = coilStatusesGetter
  }
}

export class PresetMultipleRegistersCommand extends ModbusCommand<PresetMultipleRegistersCommand> {
  private readonly _registerAddressGetter: RegisterAddressGetter
  private readonly _registerLengthGetter: RegisterLengthGetter
  private readonly _registerValuesGetter: RegisterValuesGetter

  public get registerStartAddress() {
    return this._registerAddressGetter(this._rawPacket)
  }

  public get registerLength() {
    return this._registerLengthGetter(this._rawPacket)
  }

  public get registerValues() {
    return this._registerValuesGetter(this._rawPacket)
  }

  public get registerValuesAsUint16Array() {
    return new Uint16Array(this.registerValues)
  }

  /**
   * Set success on this command to return a valid response to the emitting server.
   */
  public success(): void {
    this._responsePacket = (this._successGetter as GenericSuccessGetter)(this._rawPacket)
    this.onComplete.emit(this)
    this.onSuccess.emit(this)
  }

  /**
   * @hidden
   */
  constructor(
    rawPacket: Buffer,
    unitIdGetter: UnitIdGetter,
    functionCodeGetter: FunctionCodeGetter,
    successGetter: GenericSuccessGetter,
    failureGetter: FailureGetter,
    registerAddressGetter: RegisterAddressGetter,
    registerLengthGetter: RegisterLengthGetter,
    registerValuesGetter: RegisterValuesGetter
  ) {
    super(rawPacket, unitIdGetter, functionCodeGetter, successGetter, failureGetter)
    this._registerAddressGetter = registerAddressGetter
    this._registerLengthGetter = registerLengthGetter
    this._registerValuesGetter = registerValuesGetter
  }
}
