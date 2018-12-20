import { TypedEvent } from './util/typed-event'

export enum ModbusFunctionCode {
  READ_COIL_STATUS = 0X01,
  READ_INPUT_STATUS = 0X02,
  READ_HOLD_REGISTERS = 0X03,
  READ_INPUT_REGISTERS = 0X04,
  FORCE_SINGLE_COIL = 0X05,
  PRESET_SINGLE_REGISTER = 0X06,
  FORCE_MULTIPLE_COILS = 0X0F,
  PRESET_MULTIPLE_REGISTERS = 0X10
}

export enum ModbusCommandExcepton {
  ILLEGAL_FUNCTION = 0X01,
  ILLEGAL_DATA_ADDRESS = 0X02,
  ILLEGAL_DATA_VALUE = 0X03,
  SERVER_DEVICE_FAILURE = 0X04,
  ACKNOWLEDGE = 0X05,
  SERVER_DEVICE_BUSY = 0X06,
  NEGATIVE_ACKNOWLEDGE = 0X07,
  MEMORY_PARITY_ERROR = 0X08,
  GATEWAY_PATH_UNAVAILABLE = 0X0A,
  GATEWAY_TARGET_FAILED_TO_RESPOND = 0X0B
}

export type UnitIdGetter = (requestPacket: Buffer) => number
export type FunctionCodeGetter = (requestPacket: Buffer) => ModbusFunctionCode
export type RegisterAddressGetter = (requestPacket: Buffer) => number
export type RegisterValueGetter = (requestPacket: Buffer) => number

export type SuccessGetter = (requestPacket: Buffer) => Buffer
export type FailureGetter = (requestPacket: Buffer, exception: ModbusCommandExcepton) => Buffer

export abstract class ModbusCommand<T extends ModbusCommand<any>> {

  /**
   * Fires on either success or failure, with the response bytes. Mainly used by the server to send a response.
   */
  public onComplete = new TypedEvent<Buffer>()
  /**
   * Fires on a call of the success method.
   */
  public onSuccess = new TypedEvent<Buffer>()
  /**
   * Fires on a call of the fail method.
   */
  public onFailure = new TypedEvent<Buffer>()

  protected readonly _rawPacket: Buffer
  protected readonly _unitIdGetter: UnitIdGetter
  protected readonly _functionCodeGetter: FunctionCodeGetter
  protected readonly _successGetter: SuccessGetter
  protected readonly _failureGetter: FailureGetter

  // If RTU, unitId is equivalent to slaveId
  public get unitId() {
    return this._unitIdGetter(this._rawPacket)
  }

  public get functionCode() {
    return this._functionCodeGetter(this._rawPacket)
  }

  protected constructor(rawPacket: Buffer, unitIdGetter: UnitIdGetter, functionCodeGetter: FunctionCodeGetter,
                        successGetter: SuccessGetter, failureGetter: FailureGetter) {
    this._rawPacket = rawPacket
    this._unitIdGetter = unitIdGetter
    this._functionCodeGetter = functionCodeGetter
    this._successGetter = successGetter
    this._failureGetter = failureGetter
  }

  public success(): void {
    const successPacket: Buffer = this._successGetter(this._rawPacket)
    this.onComplete.emit(successPacket)
    this.onSuccess.emit(successPacket)
  }

  public fail(exception: ModbusCommandExcepton): void {
    const failurePacket: Buffer = this._failureGetter(this._rawPacket, exception)
    this.onComplete.emit(failurePacket)
    this.onFailure.emit(failurePacket)
  }

}

export class PresetSingleRegisterCommand extends ModbusCommand<PresetSingleRegisterCommand> {

  private _registerAddressGetter: RegisterAddressGetter
  private _registerValueGetter: RegisterValueGetter

  public get registerAddress() {
    return this._registerAddressGetter(this._rawPacket)
  }

  public get registerValue() {
    return this._registerValueGetter(this._rawPacket)
  }

  constructor(rawPacket: Buffer, unitIdGetter: UnitIdGetter, functionCodeGetter: FunctionCodeGetter,
              successGetter: SuccessGetter, failureGetter: FailureGetter, registerAddressGetter: RegisterAddressGetter,
              registerValueGetter: RegisterValueGetter) {
    super(rawPacket, unitIdGetter, functionCodeGetter, successGetter, failureGetter)
    this._registerAddressGetter = registerAddressGetter
    this._registerValueGetter = registerValueGetter
  }

}
