import { ModbusCommand } from './modbus-commands'

export interface ModbusCommandFactory {

  fromPacket(packet: Buffer): ModbusCommand<any>

}
