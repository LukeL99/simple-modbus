import net from 'net'
import '../util/typed-event'
import { ModbusServer } from '../modbus-server'
import { ModbusTcpCommandFactory } from './modbus-tcp-command-factory'
import {
  ForceMultipleCoilsCommand,
  ForceSingleCoilCommand,
  ModbusCommand,
  ModbusFunctionCode, PresetMultipleRegistersCommand,
  PresetSingleRegisterCommand,
  ReadCoilStatusCommand, ReadHoldingRegistersCommand, ReadInputRegistersCommand, ReadInputStatusCommand
} from '../modbus-commands'
import { ModbusCommandFactoryOptions } from '../modbus-command-factory'
import { ModbusCommandError } from '../error/modbus-errors'

/**
 * Options that only affect the server (timeouts, etc.) should go here,
 * options that affect the commands being emitted should be added to [ModbusCommandFactoryOptions](../classes/modbuscommandfactoryoptions.html)
 */
export interface ModbusTcpServerOptions extends ModbusCommandFactoryOptions {
}

export class ModbusTcpServer extends ModbusServer {
  private _tcpServer: net.Server
  private _commandFactory = new ModbusTcpCommandFactory()
  private _options?: ModbusTcpServerOptions

  constructor(options?: ModbusTcpServerOptions) {
    super()

    this._options = options
    this._commandFactory = new ModbusTcpCommandFactory(options)

    this._tcpServer = net.createServer(socket => {
      const _this: ModbusTcpServer = this

      socket.on('data', data => {
        try {
          // Build object from packet
          let command = this._commandFactory.fromPacket(data)

          // Listen for success or failure events being emitted from command object
          command.onComplete.once((command: ModbusCommand<any>) => {
            socket.write(command.responsePacket)
          })

          // Determine packet type and emit corresponding event type
          switch (command.functionCode) {
            case ModbusFunctionCode.READ_COIL_STATUS:
              _this.onReadCoilStatus.emit(command as ReadCoilStatusCommand)
              break
            case ModbusFunctionCode.READ_INPUT_STATUS:
              _this.onReadInputStatus.emit(command as ReadInputStatusCommand)
              break
            case ModbusFunctionCode.READ_HOLDING_REGISTERS:
              _this.onReadHoldingRegisters.emit(command as ReadHoldingRegistersCommand)
              break
            case ModbusFunctionCode.READ_INPUT_REGISTERS:
              _this.onReadInputRegisters.emit(command as ReadInputRegistersCommand)
              break
            case ModbusFunctionCode.FORCE_SINGLE_COIL:
              _this.onForceSingleCoil.emit(command as ForceSingleCoilCommand)
              break
            case ModbusFunctionCode.PRESET_SINGLE_REGISTER:
              _this.onPresetSingleRegister.emit(command as PresetSingleRegisterCommand)
              break
            case ModbusFunctionCode.FORCE_MULTIPLE_COILS:
              _this.onForceMultipleCoils.emit(command as ForceMultipleCoilsCommand)
              break
            case ModbusFunctionCode.PRESET_MULTIPLE_REGISTERS:
              _this.onPresetMultipleRegisters.emit(command as PresetMultipleRegistersCommand)
              break
          }
        } catch (e) {
          // TODO: Explicit typeguard here, look into changing from try/catch
          _this.onCommandError.emit(e as ModbusCommandError)
        }

      })

      socket.on('error', e => {
        _this.onServerError.emit(e)
      })

    })
  }

  public listen(port: number): ModbusTcpServer {
    this._tcpServer.listen(port)
    return this
  }

  public close(): ModbusTcpServer {
    this._tcpServer.close()
    return this
  }
}
