import { ModbusCommandExcepton, ModbusFunctionCode, PresetSingleRegisterCommand } from '../src/modbus-commands'
import { ModbusCommandError } from '../src/error/modbus-errors'
import { ModbusTcpCommandFactory } from '../src/tcp/modbus-tcp-command-factory'

const commandFactory: ModbusTcpCommandFactory = new ModbusTcpCommandFactory()

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
    let command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command).toBeInstanceOf(PresetSingleRegisterCommand)
  })

  it("should return the right function code", () => {
    let command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command.functionCode).toEqual(ModbusFunctionCode.PRESET_SINGLE_REGISTER)
  })

  it("should return the right register address", () => {
    let command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command.registerAddress).toEqual(0)
  })

  it("should return the right register value", () => {
    let command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command.registerValue).toEqual(3)
  })

  it("should return the right Unit ID", () => {
    let command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command.unitId).toEqual(0x11)
  })

  it("should emit a complete response on success", done => {
    let command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    command.onComplete.on((buf: Buffer) => {
      expect(buf).toEqual(Buffer.from(validResponseBytes))
      done()
    })
    command.success()
  })

  it("should emit a success response on success", done => {
    let command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    command.onSuccess.on((buf: Buffer) => {
      expect(buf).toEqual(Buffer.from(validResponseBytes))
      done()
    })
    command.success()
  })

  it("should emit a complete response on failure", done => {
    const failureBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x03, 0x11, 0x86, 0x04]
    let command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    command.onComplete.on((buf: Buffer) => {
      expect(buf).toEqual(Buffer.from(failureBytes))
      done()
    })
    command.fail(ModbusCommandExcepton.SERVER_DEVICE_FAILURE)
  })

  it("should emit a failure response on failure", done => {
    const failureBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x03, 0x11, 0x86, 0x04]
    let command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    command.onFailure.on((buf: Buffer) => {
      expect(buf).toEqual(Buffer.from(failureBytes))
      done()
    })
    command.fail(ModbusCommandExcepton.SERVER_DEVICE_FAILURE)
  })
})

describe("Malformed packet tests", () => {

  it("should throw a command exception on invalid fc", done => {
    const invalidCommandBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x14, 0x00, 0x00, 0x00, 0x03]
    try {
      commandFactory.fromPacket(Buffer.from(invalidCommandBytes))
    } catch( e) {
      expect(e).toBeInstanceOf(ModbusCommandError)
      expect(e.message).toEqual('Function code not implemented')
      done()
    }
  })

  it("should throw a command exception on short packet", done => {
    const invalidCommandBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x14, 0x00, 0x00]
    try {
      commandFactory.fromPacket(Buffer.from(invalidCommandBytes))
    } catch( e) {
      expect(e).toBeInstanceOf(ModbusCommandError)
      expect(e.message).toEqual('Packet length too short')
      done()
    }
  })

})
