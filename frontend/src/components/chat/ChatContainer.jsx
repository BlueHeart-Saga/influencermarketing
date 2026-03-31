import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  Avatar,
  CircularProgress
} from '@mui/material';
import { Send, Close, Refresh } from '@mui/icons-material';
import { collaborationAPI } from '../../services/api';

const ChatContainer = ({ currentUser, collaboration, onClose, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    if (!collaboration?.id) return;

    try {
      setIsLoading(true);
      const messagesData = await collaborationAPI.getMessages(
        collaboration.id,
        currentUser.id,
        100,
        0
      );
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !collaboration?.id || isSending) return;

    try {
      setIsSending(true);
      const messageData = {
        content: newMessage.trim(),
        sender_id: currentUser.id
      };

      await collaborationAPI.sendMessage(collaboration.id, messageData);
      
      setNewMessage('');
      await fetchMessages(); // Refresh messages
      if (onMessageSent) onMessageSent(); // Notify parent to refresh collaborations list
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isOwnMessage = (senderId) => {
    return senderId === currentUser.id;
  };

  return (
    <Paper elevation={3} sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 40, height: 40 }}>
            {collaboration.brand_name?.charAt(0)?.toUpperCase() || 'B'}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {collaboration.brand_name || 'Unknown Brand'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {collaboration.campaign_title || 'Untitled Campaign'}
            </Typography>
          </Box>
        </Box>
        <Box>
          <IconButton onClick={fetchMessages} size="small" sx={{ color: 'white', mr: 1 }}>
            <Refresh />
          </IconButton>
          <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      </Box>

      {/* Messages Container */}
      <Box
        ref={messagesContainerRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          bgcolor: 'grey.50'
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column',
            textAlign: 'center'
          }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No messages yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start the conversation by sending a message!
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%' }}>
            {messages.map((message, index) => (
              <React.Fragment key={message.id || index}>
                <ListItem
                  sx={{
                    justifyContent: isOwnMessage(message.sender_id) ? 'flex-end' : 'flex-start',
                    px: 1
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: isOwnMessage(message.sender_id) ? 'row-reverse' : 'row',
                      alignItems: 'flex-end',
                      gap: 1,
                      maxWidth: '70%'
                    }}
                  >
                    {!isOwnMessage(message.sender_id) && (
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: 'primary.main'
                        }}
                      >
                        {message.sender_name?.charAt(0)?.toUpperCase() || 'U'}
                      </Avatar>
                    )}
                    <Box
                      sx={{
                        bgcolor: isOwnMessage(message.sender_id) ? 'primary.main' : 'white',
                        color: isOwnMessage(message.sender_id) ? 'white' : 'text.primary',
                        p: 2,
                        borderRadius: 2,
                        boxShadow: 1
                      }}
                    >
                      {!isOwnMessage(message.sender_id) && (
                        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                          {message.sender_name}
                        </Typography>
                      )}
                      <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                        {message.content}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          textAlign: 'right',
                          mt: 0.5,
                          opacity: 0.7,
                          color: isOwnMessage(message.sender_id) ? 'white' : 'text.secondary'
                        }}
                      >
                        {formatTime(message.timestamp)}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
                <div ref={messagesEndRef} />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Message Input */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'white'
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            variant="outlined"
            size="small"
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            color="primary"
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              '&:disabled': { bgcolor: 'grey.400' }
            }}
          >
            {isSending ? <CircularProgress size={24} /> : <Send />}
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default ChatContainer;