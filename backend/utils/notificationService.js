// This is a mock notification service
// In a real application, this would integrate with SMS and email services

// Mock SMS service
export async function sendSMS(phoneNumber, message) {
  // In a real application, this would call a third-party SMS API
  // such as Twilio, Nexmo, etc.
  console.log(`MOCK SMS to ${phoneNumber}: ${message}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return success for demo purposes
  return {
    success: true,
    sid: `mock-sms-${Date.now()}`,
    to: phoneNumber,
    message
  };
}

// Mock email service
export async function sendEmail(email, subject, message) {
  // In a real application, this would call a third-party email API
  // such as SendGrid, Mailgun, AWS SES, etc.
  console.log(`MOCK EMAIL to ${email}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${message}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return success for demo purposes
  return {
    success: true,
    messageId: `mock-email-${Date.now()}`,
    to: email,
    subject,
    message
  };
}

// Send emergency notification
export async function sendEmergencyNotification(contact, userInfo, message, location) {
  try {
    const notificationMessage = `EMERGENCY ALERT from ${userInfo.name}: ${message}`;
    let notificationSent = false;
    
    // Try SMS first
    if (contact.phone) {
      try {
        const smsResult = await sendSMS(contact.phone, notificationMessage);
        notificationSent = smsResult.success;
        console.log(`Emergency SMS notification sent to ${contact.fullName}`);
      } catch (error) {
        console.error(`Failed to send emergency SMS to ${contact.fullName}:`, error);
      }
    }
    
    // Try email as backup or additional channel
    if (contact.email) {
      try {
        const emailResult = await sendEmail(
          contact.email,
          'EMERGENCY ALERT',
          `${notificationMessage}
          
          ${location ? `Location: ${location.address || 'Check the app for location details.'}` : ''}
          
          This is an automated emergency alert from ShatPlus Medical Assistance.
          `
        );
        notificationSent = notificationSent || emailResult.success;
        console.log(`Emergency email notification sent to ${contact.fullName}`);
      } catch (error) {
        console.error(`Failed to send emergency email to ${contact.fullName}:`, error);
      }
    }
    
    return notificationSent;
  } catch (error) {
    console.error('Error sending emergency notification:', error);
    return false;
  }
}
