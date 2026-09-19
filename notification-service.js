const { EventEmitter } = require('events');

class NotificationService extends EventEmitter {
  constructor() {
    super();
    // Map of userId -> Set of SSE response objects
    this.clients = new Map();
    // Set of admin SSE response objects for instant broadcast
    this.adminClients = new Set();

    // Start 25s keepalive heartbeat
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 25000);
    if (this.heartbeatInterval.unref) {
      this.heartbeatInterval.unref();
    }
  }

  /**
   * Register a new SSE connection for a user.
   */
  registerClient(userId, role, res) {
    if (!userId || !res) return;

    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId).add(res);

    if (role === 'admin') {
      this.adminClients.add(res);
    }

    // Handle connection close
    res.on('close', () => {
      this.removeClient(userId, role, res);
    });
  }

  /**
   * Remove closed SSE connection.
   */
  removeClient(userId, role, res) {
    if (this.clients.has(userId)) {
      const userSet = this.clients.get(userId);
      userSet.delete(res);
      if (userSet.size === 0) {
        this.clients.delete(userId);
      }
    }
    if (role === 'admin') {
      this.adminClients.delete(res);
    }
  }

  /**
   * Send SSE message to a specific user.
   */
  sendToUser(userId, notification) {
    if (!userId) return 0;
    const userSet = this.clients.get(userId);
    let deliveredCount = 0;

    if (userSet && userSet.size > 0) {
      const payload = `data: ${JSON.stringify(notification)}\n\n`;
      userSet.forEach((res) => {
        try {
          res.write(payload);
          deliveredCount++;
        } catch (err) {
          // Stale socket
        }
      });
    }

    this.emit('notification:sent', { userId, notification, deliveredCount });
    return deliveredCount;
  }

  /**
   * Send SSE message to all connected users with a given role (e.g. 'admin').
   */
  sendToRole(role, notification) {
    let deliveredCount = 0;
    const payload = `data: ${JSON.stringify(notification)}\n\n`;

    if (role === 'admin') {
      this.adminClients.forEach((res) => {
        try {
          res.write(payload);
          deliveredCount++;
        } catch (err) { }
      });
    }

    this.emit('notification:role_broadcast', { role, notification, deliveredCount });
    return deliveredCount;
  }

  /**
   * Broadcast message to all connected clients.
   */
  broadcast(notification) {
    const payload = `data: ${JSON.stringify(notification)}\n\n`;
    let deliveredCount = 0;

    for (const [, set] of this.clients.entries()) {
      set.forEach((res) => {
        try {
          res.write(payload);
          deliveredCount++;
        } catch (err) { }
      });
    }
    return deliveredCount;
  }

  /**
   * Send SSE heartbeat to keep connections open across proxies and routers.
   */
  sendHeartbeat() {
    const comment = `: ping ${Date.now()}\n\n`;
    for (const [, set] of this.clients.entries()) {
      set.forEach((res) => {
        try {
          res.write(comment);
        } catch (err) { }
      });
    }
  }

  /**
   * Get stats about connected clients.
   */
  getConnectedStats() {
    let totalConnections = 0;
    for (const [, set] of this.clients.entries()) {
      totalConnections += set.size;
    }
    return {
      uniqueUsers: this.clients.size,
      totalConnections,
      adminConnections: this.adminClients.size
    };
  }
}

const notificationService = new NotificationService();
module.exports = notificationService;
