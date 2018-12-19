import { TypedEvent } from './util/typed-event'

export enum ModbusFunctionCode {
  READ_COIL_STATUS = 0X01,
  READ_INPUT_STATUS = 0X02,
  READ_HOLD_REGISTERS = 0X03,
  READ_INPUT_REGISTERS = 0X04,
  FORCE_SINGLE_COIL = 0X05,
  PRESET_SINGLE_REGISTER = 0X06,
  FORCE_MULTIPLE_COILS = 0X15,
  PRESET_MULTIPLE_REGISTERS = 0X16
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

export type SuccessGetter = (requestPacket: Buffer) => Buffer
export type FailureGetter = (requestPacket: Buffer, exception: ModbusCommandExcepton) => Buffer

export abstract class ModbusCommand<T extends ModbusCommand<any>> {

  public onComplete = new TypedEvent<Buffer>()

  protected readonly _rawPacket: Buffer
  protected readonly _unitIdGetter: UnitIdGetter
  protected readonly _functionCodeGetter: FunctionCodeGetter
  protected readonly _successGetter: SuccessGetter
  protected readonly _failureGetter: FailureGetter

  // Slave ID for RTU
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
    this.onComplete.emit(new Buffer('success'))
  }

  public fail(exception: ModbusCommandExcepton): void {
    this.onComplete.emit(new Buffer('fail'))
  }

}

export class PresetSingleRegisterCommand extends ModbusCommand<PresetSingleRegisterCommand> {

  // private _registerAddress: number
  // protected _unitId: number
  // protected _functionCode = ModbusFunctionCode.PRESET_SINGLE_REGISTER

  constructor(rawPacket: Buffer, unitIdGetter: UnitIdGetter, functionCodeGetter: FunctionCodeGetter,
              successGetter: SuccessGetter, failureGetter: FailureGetter) {
    super(rawPacket, unitIdGetter, functionCodeGetter, successGetter, failureGetter)
  }

}
