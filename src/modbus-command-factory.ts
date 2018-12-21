import { ModbusCommand } from './modbus-commands'

export abstract class ModbusCommandFactory {
  public abstract fromPacket(packet: Buffer): ModbusCommand<any>
}
