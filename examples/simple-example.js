const ModbusTcp = require('..').ModbusTcp
const ModbusCommandException = require('..').ModbusCommandException
const server = new ModbusTcp.Server();
server.listen(502);
server.onReadCoilStatus.on(function (command) {
    console.log("Read Coil Status - Address: " + command.coilStartAddress + " Number: " + command.numberOfCoils);
    // Respond with Success (response array must be same length as numberOfCoils)
    command.success([true, false, true, false]);
});
server.onReadInputStatus.on(function (command) {
    console.log("Read Input Status - Address: " + command.inputStartAddress + " Number: " + command.numberOfInputs);
    // Respond with Success (response array must be same length as numberOfInputs)
    command.success([true, false, true, false]);
});
server.onReadHoldingRegisters.on(function (command) {
    console.log("Read Holding Registers - Address: " + command.registerStartAddress + " Number: " + command.registerLength);
    // Respond with Success (response array must be same length as registerLength)
    command.success(new Uint16Array([0xFFFF, 0x0000, 0xDEAD, 0xBEEF]));
});
server.onReadInputRegisters.on(function (command) {
    console.log("Read Input Registers - Address: " + command.registerStartAddress + " Number: " + command.registerLength);
    // Respond with Success (response array must be same length as registerLength)
    command.success(new Uint16Array([0xFFFF, 0x0000, 0xDEAD, 0xBEEF]));
});
server.onPresetSingleRegister.on(function (command) {
    console.log("Preset Single Register - Address: " + command.registerAddress + " - Value: " + command.registerValue);
    // Respond with Success
    command.success();
});
server.onPresetMultipleRegisters.on(function (command) {
    console.log("Preset Multiple Registers - Start Address: " + command.registerStartAddress + " Length: " + command.registerLength + " Values: " + command.registerValues);
    // Respond with Success
    command.success();
});
server.onForceSingleCoil.on(function (command) {
    console.log("Force Single Coil - Address: " + command.coilAddress + " Value: " + command.coilStatusAsCoilStatus + "}");
    // Respond with Success
    command.success();
});
server.onForceMultipleCoils.on(function (command) {
    console.log("Force Multiple Coils - Start Address: " + command.coilStartAddress + " Length: " + command.coilLength + " Values: " + command.coilStatuses + "}");
    // Respond with Failure
    command.fail(ModbusCommandException.ILLEGAL_DATA_ADDRESS);
});
server.onCommandError.on(function (err) {
    console.error("Error when trying to decode a packet: " + err.message);
});
server.onServerError.on(function (err) {
    console.error("Error from underlying TCP server: " + err.message);
});
