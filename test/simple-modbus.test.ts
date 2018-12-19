import { PresetSingleRegisterCommand } from '../src/modbus-commands'
import { ModbusTcpEventFactory } from '../src/modbus-event-factory'

const eventFactory: ModbusTcpEventFactory = new ModbusTcpEventFactory()

describe("PresetSingleRegisterCommand test", () => {

  const validCommandBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x06, 0x00, 0x00, 0x00, 0x03]

  it("should return an instance of PresetSingleRegisterCommand", () => {
    let command = eventFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command).toBeInstanceOf(PresetSingleRegisterCommand)
  })
})
