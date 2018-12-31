import { ModbusCommandError, ModbusServerError } from './modbus-errors'

describe('Error Tests', () => {

  it('should throw a well formed ModbusCommandError error', done => {
    try {
      // noinspection ExceptionCaughtLocallyJS
      throw new ModbusCommandError('Modbus Command Error')
    } catch (e) {
      expect(e).toBeInstanceOf(ModbusCommandError)
      expect(e.message).toEqual('Modbus Command Error')
      expect(e.toString()).toEqual('ModbusCommandError: Modbus Command Error')
      expect(e.requestBytes).toBeUndefined()
      done()
    }
  })

  it('should throw a well formed ModbusCommandError error with requestBytes', done => {
    try {
      // noinspection ExceptionCaughtLocallyJS
      throw new ModbusCommandError('Modbus Command Error', Buffer.from([1, 2, 3, 4]))
    } catch (e) {
      expect(e).toBeInstanceOf(ModbusCommandError)
      expect(e.message).toEqual('Modbus Command Error')
      expect(e.toString()).toEqual('ModbusCommandError: Modbus Command Error')
      expect(e.requestBytes).toEqual(Buffer.from([1, 2, 3, 4]))
      done()
    }
  })

  it('should throw a well formed ModbusServerError error', done => {
    try {
      // noinspection ExceptionCaughtLocallyJS
      throw new ModbusServerError('Modbus Server Error')
    } catch (e) {
      expect(e).toBeInstanceOf(ModbusServerError)
      expect(e.message).toEqual('Modbus Server Error')
      expect(e.toString()).toEqual('ModbusServerError: Modbus Server Error')
      done()
    }
  })

})
