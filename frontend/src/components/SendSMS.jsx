import React, { useState } from "react";
import { sendSMS } from "../services/api";

const SendSMS = () => {
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState(null);

  const handleSendSMS = async () => {
    try {
      const res = await sendSMS(recipient, message);
      setResponse(res.data.message);
    } catch (err) {
      setResponse(err.response?.data?.detail || "❌ Failed to send SMS");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-lg rounded-xl">
      <h2 className="text-xl font-bold mb-4">Send SMS</h2>

      <input
        type="text"
        placeholder="Recipient (+919876543210)"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      />

      <textarea
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      />

      <button
        onClick={handleSendSMS}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Send SMS
      </button>

      {response && (
        <div className="mt-4 p-2 text-center border rounded bg-gray-50">
          {response}
        </div>
      )}
    </div>
  );
};

export default SendSMS;
