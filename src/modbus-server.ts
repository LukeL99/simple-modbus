import {
  ForceMultipleCoilsCommand,
  ForceSingleCoilCommand, PresetMultipleRegistersCommand,
  PresetSingleRegisterCommand,
  ReadCoilStatusCommand,
  ReadHoldingRegistersCommand, ReadInputRegistersCommand,
  ReadInputStatusCommand
} from './modbus-commands'
import { TypedEvent } from './util/typed-event'

/* istanbul ignore next */
export abstract class ModbusServer {

  public onReadCoilStatus = new TypedEvent<ReadCoilStatusCommand>()

  public onReadInputStatus = new TypedEvent<ReadInputStatusCommand>()

  public onReadHoldingRegisters = new TypedEvent<ReadHoldingRegistersCommand>()

  public onReadInputRegisters = new TypedEvent<ReadInputRegistersCommand>()

  public onForceSingleCoil = new TypedEvent<ForceSingleCoilCommand>()

  public onPresetSingleRegister = new TypedEvent<PresetSingleRegisterCommand>()

  public onForceMultipleCoils = new TypedEvent<ForceMultipleCoilsCommand>()

  public onPresetMultipleRegisters = new TypedEvent<PresetMultipleRegistersCommand>()

}
