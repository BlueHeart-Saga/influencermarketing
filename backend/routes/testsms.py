import requests
import json

def send_sms_with_textbelt(phone_number, message, api_key='8393c416c13a9f00f622be1e7d286b85a9526b5dASTiXJXGQl59Tc56QY3ZNsmrm'):
    """
    Send SMS using Textbelt API
    
    Args:
        phone_number (str): Recipient phone number (e.g., "+1234567890")
        message (str): SMS message text
        api_key (str): Your Textbelt API key
    
    Returns:
        dict: API response
    """
    
    # Textbelt API endpoint
    url = "https://textbelt.com/text"
    
    # Request payload
    payload = {
        'phone': phone_number,
        'message': message,
        'key': api_key  # Using your provided API key
    }
    
    try:
        # Send POST request
        response = requests.post(url, data=payload)
        result = response.json()
        
        # Check if successful
        if result.get('success'):
            print("✅ SMS sent successfully!")
            print(f"Message ID: {result.get('textId')}")
            print(f"Quota remaining: {result.get('quotaRemaining')}")
        else:
            print("❌ Failed to send SMS:")
            print(f"Error: {result.get('error')}")
            
        return result
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {'success': False, 'error': str(e)}

# Usage with your API key
if __name__ == "__main__":
    # Your API key from Textbelt
    API_KEY = "ASTiXJXGQl59Tc56QY3ZNsmrm"
    
    # Test details
    phone = "+917639191119"  # Replace with actual phone number
    text_message = "Hello from Textbelt API! This is a test message."
    
    # Send SMS
    result = send_sms_with_textbelt(phone, text_message, API_KEY)
    print("\nFull response:", json.dumps(result, indent=2))