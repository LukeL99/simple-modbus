import {
  ForceMultipleCoilsCommand,
  ForceSingleCoilCommand, PresetMultipleRegistersCommand,
  PresetSingleRegisterCommand,
  ReadCoilStatusCommand,
  ReadHoldingRegistersCommand, ReadInputRegistersCommand,
  ReadInputStatusCommand
} from './modbus-commands'
import { TypedEvent } from './util/typed-event'
import { ModbusCommandError } from './error/modbus-errors'

/* istanbul ignore next */
export abstract class ModbusServer {

  public readonly onReadCoilStatus = new TypedEvent<ReadCoilStatusCommand>()

  public readonly onReadInputStatus = new TypedEvent<ReadInputStatusCommand>()

  public readonly onReadHoldingRegisters = new TypedEvent<ReadHoldingRegistersCommand>()

  public readonly onReadInputRegisters = new TypedEvent<ReadInputRegistersCommand>()

  public readonly onForceSingleCoil = new TypedEvent<ForceSingleCoilCommand>()

  public readonly onPresetSingleRegister = new TypedEvent<PresetSingleRegisterCommand>()

  public readonly onForceMultipleCoils = new TypedEvent<ForceMultipleCoilsCommand>()

  public readonly onPresetMultipleRegisters = new TypedEvent<PresetMultipleRegistersCommand>()

  public readonly onCommandError = new TypedEvent<ModbusCommandError>()

  public readonly onServerError = new TypedEvent<Error>()

}
