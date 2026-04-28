const noflo = require('noflo');

exports.getComponent = () => {
  const c = new noflo.Component();
  c.inPorts.add('in',
    { datatype: 'object' });
  c.inPorts.add('client',
    { datatype: 'object' });
  c.outPorts.add('out',
    { datatype: 'object' });
  c.outPorts.add('error',
    { datatype: 'object' });
  c.pendingDisconnect = {};
  return c.process((input, output) => {
    if (!input.hasData('in', 'client')) { return; }
    const [payload, client] = input.getData('in', 'client');
    if (!payload || typeof payload.connected !== 'boolean') {
      // Ignore malformed/legacy payloads instead of breaking startup flow.
      output.done();
      return;
    }
    const shouldConnect = payload.connected;
    const clientId = client.definition.id || client.definition.address || 'runtime';

    if (shouldConnect) {
      if (c.pendingDisconnect[clientId]) {
        // If disconnect is still in-flight, connect as soon as it finalizes.
        client.once('disconnected', () => {
          client.connect()
            .catch(() => {
            });
        });
        output.sendDone({ out: client.definition });
        return;
      }
      client.connect()
        .then(() => output.sendDone({ out: client.definition }))
        .catch((err) => output.done(err));
      return;
    }
    c.pendingDisconnect[clientId] = true;
    client.disconnect()
      .catch(() => {
      })
      .then(() => {
        delete c.pendingDisconnect[clientId];
      });
    // Don't block the processing queue while transport disconnect settles.
    output.sendDone({ out: client.definition });
  });
};
