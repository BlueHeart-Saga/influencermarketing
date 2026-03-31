// WebSocket Manager
export const websocketManager = {
  ws: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectDelay: 3000,
  isExplicitClose: false,
  messageQueue: [],
  
  connect(url, token, onMessage, onOpen, onClose, onError) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }
    
    this.isExplicitClose = false;
    
    try {
      const wsUrl = `${url}?token=${encodeURIComponent(token)}`;
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = (event) => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        if (onOpen) onOpen(event);
        
        // Send any queued messages
        this.flushMessageQueue();
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        if (onClose) onClose(event);
        
        if (!this.isExplicitClose && this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
            this.connect(url, token, onMessage, onOpen, onClose, onError);
          }, this.reconnectDelay);
        }
      };
      
      this.ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        if (onError) onError(event);
      };
      
    } catch (error) {
      console.error('WebSocket connection error:', error);
      if (onError) onError(error);
    }
  },
  
  send(data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log('WebSocket not connected, queuing message:', data.type);
      this.messageQueue.push(data);
      return false;
    }
    
    try {
      const message = JSON.stringify(data);
      this.ws.send(message);
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      this.messageQueue.push(data);
      return false;
    }
  },
  
  flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  },
  
  close() {
    this.isExplicitClose = true;
    if (this.ws) {
      this.ws.close(1000, 'User initiated close');
      this.ws = null;
    }
    this.messageQueue = [];
  },
  
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  },
  
  getConnectionState() {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'disconnected';
    }
  }
};