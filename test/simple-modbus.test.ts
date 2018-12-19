import { ModbusCommandExcepton, PresetSingleRegisterCommand } from '../src/modbus-commands'
import { ModbusTcpEventFactory } from '../src/modbus-event-factory'

const eventFactory: ModbusTcpEventFactory = new ModbusTcpEventFactory()

describe("PresetSingleRegisterCommand test", () => {

  // 0-1   = Transaction ID
  // 2-3   = Protocol ID (0x0000)
  // 4-5   = Message Length
  // 6     = UnitId
  // 7     = Function code
  // 8-9   = Register Address
  // 10-11 = Register Value
  const validCommandBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x06, 0x00, 0x00, 0x00, 0x03]

  const validResponseBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x06, 0x00, 0x00, 0x00, 0x03]

  it("should return an instance of PresetSingleRegisterCommand", () => {
    let command = eventFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command).toBeInstanceOf(PresetSingleRegisterCommand)
  })

  it("should return the right register address", () => {
    let command = eventFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command.registerAddress).toEqual(0)
  })

  it("should return the right register value", () => {
    let command = eventFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command.registerValue).toEqual(3)
  })

  it("should return the right Unit ID", () => {
    let command = eventFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command.unitId).toEqual(0x11)
  })

  it("should emit a valid response on success", done => {
    let command = eventFactory.fromPacket(Buffer.from(validCommandBytes))
    command.onComplete.on((buf: Buffer) => {
      expect(buf).toEqual(Buffer.from(validResponseBytes))
      done()
    })
    command.success()
  })

  it("should emit a valid response on failure", done => {
    let command = eventFactory.fromPacket(Buffer.from(validCommandBytes))
    command.onComplete.on((buf: Buffer) => {
      // TODO: Fill this in
      expect(buf).toEqual(Buffer.from(validResponseBytes))
      done()
    })
    command.fail(ModbusCommandExcepton.SERVER_DEVICE_FAILURE)
  })
})
