import { PresetSingleRegisterCommand, ReadCoilStatusCommand, ReadInputStatusCommand } from './modbus-commands'
import { TypedEvent } from './util/typed-event'

// export enum ModbusFunctionCode {
//   READ_COIL_STATUS = 0X01,
//   READ_INPUT_STATUS = 0X02,
//   READ_HOLD_REGISTERS = 0X03,
//   READ_INPUT_REGISTERS = 0X04,
//   FORCE_SINGLE_COIL = 0X05,
//   PRESET_SINGLE_REGISTER = 0X06,
//   FORCE_MULTIPLE_COILS = 0X15,
//   PRESET_MULTIPLE_REGISTERS = 0X16
// }

/* istanbul ignore next */
export abstract class ModbusServer {

  public onReadCoilStatus = new TypedEvent<ReadCoilStatusCommand>()

  public onReadInputStatus = new TypedEvent<ReadInputStatusCommand>()

  public onPresetSingleRegister = new TypedEvent<PresetSingleRegisterCommand>()

}
