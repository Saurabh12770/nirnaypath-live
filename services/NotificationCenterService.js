const Redis = require('ioredis');

class NotificationCenterService {
    constructor() {
        this.redisPublisher = new Redis();
        this.redisSubscriber = new Redis();
        this.channel = 'nirnaypath:notifications';
    }

    async init(io) {
        this.io = io;
        this.redisSubscriber.subscribe(this.channel);
        this.redisSubscriber.on('message', (channel, message) => {
            if (channel === this.channel) {
                this.broadcast(JSON.parse(message));
            }
        });
    }

    async dispatch(userId, type, payload) {
        const notification = { userId, type, payload, timestamp: Date.now() };
        // Throttle check could go here
        await this.redisPublisher.publish(this.channel, JSON.stringify(notification));
    }

    broadcast(notification) {
        if (this.io) {
            // Emits to a specific user's room
            this.io.to(`user_${notification.userId}`).emit('notification', notification);
        }
    }
}

module.exports = new NotificationCenterService();
