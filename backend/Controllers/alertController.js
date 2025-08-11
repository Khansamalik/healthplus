import EmergencyAlert from '../models/EmergencyAlert.js';
import EmergencyContact from '../models/EmergencyContact.js';
import User from '../models/user.js';
import { sendSMS, sendEmail } from '../utils/notificationService.js';

// emergency alert
export const createEmergencyAlert = async (req, res) => {
  try {
    const { userId, alertType, description, location, serviceProvider } = req.body;
    
    if (!userId || !alertType || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    //  new alert
    const alert = new EmergencyAlert({
      userId,
      alertType,
      description,
      location,
      serviceProvider,
      status: 'PENDING'
    });
    
    await alert.save();
    
    // If its an ambulance alert, it immediately gets processd
    if (alertType === 'AMBULANCE') {
      await processAmbulanceRequest(alert);
    }
    
    // If its a contact notification alert emergency conatcts get notif
    if (alertType === 'CONTACT_NOTIFICATION') {
      await notifyEmergencyContacts(userId, alert._id, description, location);
    }
    
    res.status(201).json(alert);
  } catch (error) {
    console.error('Create emergency alert error:', error);
    res.status(500).json({ message: error.message });
  }
};

// alert by id
export const getAlertById = async (req, res) => {
  try {
    const alert = await EmergencyAlert.findById(req.params.id)
      .populate('recommendedHospitals.hospitalId')
      .populate('notifiedContacts.contactId');
      
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    res.status(200).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// all alerts for a user get
export const getUserAlerts = async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
      
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update alert status
export const updateAlertStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const alert = await EmergencyAlert.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    res.status(200).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Process ambulance request called internally
async function processAmbulanceRequest(alert) {
  try {
    // In a real system, we would connected to an ambulance dispatch API
    // For now, well simulate it by just updating the status
    
    // Update alert status to processing
    alert.status = 'PROCESSING';
    await alert.save();
    
    // Get user details
    const user = await User.findById(alert.userId);
    if (!user) {
      console.error('User not found for ambulance request');
      return;
    }
    
    // notification to ambulance service
    console.log(`AMBULANCE REQUEST: Service ${alert.serviceProvider} for user ${user.name}`);
    console.log(`Location: ${JSON.stringify(alert.location)}`);
    console.log(`Emergency: ${alert.description}`);
    
    // in real
    // 1. Call the ambulance service API
    // 2. Update the alert with the ambulance's ETA
    // 3. Send confirmation to the user
    // 4. Monitor status updates from the ambulance
    
    // For demo purposes ( will uncomment this to send SMS)
    // if (user.contact) {
    //   await sendSMS(
    //     user.contact,
    //     `Your emergency alert has been sent to ${alert.serviceProvider}. Help is on the way to your location.`
    //   );
    // }
    
    return true;
  } catch (error) {
    console.error('Error processing ambulance request:', error);
    return false;
  }
}

// Notify emergency contacts called internally
async function notifyEmergencyContacts(userId, alertId, message, location) {
  try {
    // Get user's emergency contacts
    const contacts = await EmergencyContact.find({ userId });
    
    if (contacts.length === 0) {
      console.log('No emergency contacts found for user');
      return;
    }
    
    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found for emergency contact notification');
      return;
    }
    
    // Update alert with contacts that will be notified
    const alert = await EmergencyAlert.findById(alertId);
    if (!alert) {
      console.error('Alert not found');
      return;
    }
    
    // For each contact send notification and update alert
    const notificationPromises = contacts.map(async (contact) => {
      // In a real this would send actual SMS/email notifications
      console.log(`EMERGENCY NOTIFICATION: Contacting ${contact.fullName} at ${contact.phone}`);
      
      // Prepare notification message
      const notificationMessage = `EMERGENCY ALERT: ${user.name} has reported an emergency: "${message}". ` +
        (location ? `Location: ${location.address || 'Check the app for location details'}` : '');
      
      // For demo purposes(uncomment this to sendi SMS)
      // await sendSMS(contact.phone, notificationMessage);
      
      // Add to notified contacts in the alert
      alert.notifiedContacts.push({
        contactId: contact._id,
        status: 'SENT'
      });
    });
    
    // Wait for all notifications to be sent
    await Promise.all(notificationPromises);
    
    // Save the updated alert
    await alert.save();
    
    return true;
  } catch (error) {
    console.error('Error notifying emergency contacts:', error);
    return false;
  }
}
