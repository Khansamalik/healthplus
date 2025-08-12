
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProfileInput = ({ label, name, value, onChange, type = "text" }) => (
  <div className="mb-6">
    <label className="block text-gray-600 text-sm font-medium mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C0B14] focus:border-transparent transition-colors"
    />
  </div>
);

const ProfileField = ({ label, value, highlight = false }) => (
  <div className="flex justify-between items-center py-4 border-b border-gray-100">
    <span className={`text-sm ${highlight ? "font-bold text-[#6C0B14]" : "font-medium text-gray-600"}`}>
      {label}
    </span>
    <span className={`text-right ${highlight ? "font-bold text-lg" : "text-gray-800"}`}>
      {value}
    </span>
  </div>
);

export default function Profile() {
  const navigate = useNavigate();
  const { logout, isPremium: authIsPremium, premiumPlan, downgradeToBasic } = useAuth();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    cnic: "",
    contact: "",
    email: "",
  });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

 
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);

  const userId = localStorage.getItem("userId");
  const API = "http://localhost:5000";
  
  if (!userId) {
    navigate("/login");
    return null;
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
  const res = await axios.get(`${API}/api/profile/${userId}`);
        setUser(res.data);
        setForm(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        navigate("/login");
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
  const res = await axios.put(`${API}/api/profile/${userId}`, form);
      setUser(res.data);
      localStorage.setItem("userProfile", JSON.stringify(res.data));
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update user:", err);
      alert("Failed to update profile.");
    }
  };

  const handleLogout = () => {
    // Clear through auth context so Navbar updates immediately
    logout();
    localStorage.removeItem("userId");
    localStorage.removeItem("userProfile");
    navigate("/login", { replace: true });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append('avatar', file);
    try {
      setAvatarUploading(true);
  const res = await axios.post(`${API}/api/profile/${userId}/avatar`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newAvatar = res.data?.avatar;
      if (newAvatar) {
        setUser((prev) => ({ ...prev, avatar: newAvatar }));
        setForm((prev) => ({ ...prev, avatar: newAvatar }));
      }
    } catch (err) {
      console.error('Avatar upload failed', err);
      alert('Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
      // reset input so same file can be re-selected
      e.target.value = '';
    }
  };

  const submitPasswordChange = async (e) => {
    e?.preventDefault?.();
    setPasswordError("");
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Please fill all fields');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    try {
      setPasswordLoading(true);
      await axios.patch(`${API}/api/profile/${userId}/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      alert('Password updated successfully');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update password';
      setPasswordError(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDowngrade = async () => {
    try {
      await downgradeToBasic();
      setShowDowngradeModal(false);
      // Refresh user data to reflect changes
      window.location.reload();
    } catch (error) {
      // Error is already handled in downgradeToBasic function
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center text-gray-500 text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#6C0B14] text-white py-6 shadow-md">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold">My Account</h1>
        </div>
      </header>

      {/* Main Content */}
  <main className="container mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Profile Sidebar */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 text-center">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-[#6C0B14] mb-4 bg-gray-100">
                  <img 
                    src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${API}${user.avatar}`) : "/profile-placeholder.png"}
                    alt="profile"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = "/profile-placeholder.png"; }}
                  />
                </div>
                <div className="mt-2">
                  <label className="inline-flex items-center px-3 py-1.5 text-sm rounded bg-gray-100 hover:bg-gray-200 cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    {avatarUploading ? 'Uploading…' : 'Change Photo'}
                  </label>
                </div>
                <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-gray-600 mb-4">{user.email}</p>
                
                <div className="bg-[#F8F1F1] rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Account Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${authIsPremium ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                      {authIsPremium ? "Premium Member" : "Free Account"}
                    </span>
                  </div>
                  {!authIsPremium && (
                    <button
                      onClick={() => navigate('/premium')}
                      className="w-full mt-3 bg-[#6C0B14] text-white py-2 rounded-lg hover:bg-[#8a1220] transition-colors"
                    >
                      Upgrade to Premium
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setEditing(!editing)}
                  className={`w-full py-2 rounded-lg ${editing ? "bg-gray-300 text-gray-800 hover:bg-gray-400" : "bg-[#6C0B14] text-white hover:bg-[#8a1220]"} transition-colors`}
                >
                  {editing ? "Cancel Editing" : "Edit Profile"}
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mt-6">
              <div className="p-6">
                <h3 className="font-bold text-gray-800 mb-4">Account Settings</h3>
                <ul className="space-y-3">
                  <li>
                    <button
                      type="button"
                      className="flex items-center text-gray-600 hover:text-[#6C0B14] transition-colors w-full"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      <span className="mr-2">🔒</span> Change Password
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => setShowPayment(true)} className="flex items-center text-gray-600 hover:text-[#6C0B14] transition-colors w-full text-left">
                      <span className="mr-2">💳</span> Payment Methods
                    </button>
                  </li>
                  <li>
                    <a href="/notifications" className="flex items-center text-gray-600 hover:text-[#6C0B14] transition-colors">
                      <span className="mr-2">🔔</span> Notifications
                    </a>
                  </li>
                   <li>
                    <button
                      type="button"
                      className="flex items-center text-gray-600 hover:text-[#6C0B14] transition-colors w-full"
                      onClick={handleLogout}
                    >
                      <span className="mr-2">🚪</span> Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {editing ? "Edit Your Profile" : "Personal Information"}
                </h2>

                {editing ? (
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <ProfileInput label="Full Name" name="name" value={form.name} onChange={handleChange} required />
                      <ProfileInput label="CNIC" name="cnic" value={form.cnic} onChange={handleChange} required />
                      <ProfileInput label="Contact Number" name="contact" value={form.contact} onChange={handleChange} required />
                      <ProfileInput label="Email Address" name="email" value={form.email} onChange={handleChange} required type="email" />
                    </div>
                    <div className="flex justify-end space-x-4 mt-8">
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#6C0B14] text-white rounded-lg hover:bg-[#8a1220] transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <ProfileField label="Full Name" value={user.name} highlight />
                    <ProfileField label="CNIC" value={user.cnic} />
                    <ProfileField label="Contact Number" value={user.contact} />
                    <ProfileField label="Email Address" value={user.email} />
                    <ProfileField label="Account Created" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'} />
                    <ProfileField label="Last Updated" value={user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : '—'} />
                  </div>
                )}
              </div>
            </div>

            {/* Additional Sections */}
            {!editing && (
              <>
                {/* Subscription Details */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden mt-6">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Subscription Details</h3>
                    <div className="space-y-4">
                      <ProfileField 
                        label="Membership Type" 
                        value={authIsPremium ? "Premium" : "Free"} 
                        highlight={authIsPremium}
                      />
                      {authIsPremium ? (
                        <>
                          <ProfileField label="Plan" value={premiumPlan === 'annual' ? 'Annual' : 'Pro Care'} />
                          <ProfileField label="Subscription Start" value={user.subscriptionStart ? new Date(user.subscriptionStart).toLocaleDateString() : '—'} />
                          <ProfileField label="Subscription End" value={user.subscriptionEnd ? new Date(user.subscriptionEnd).toLocaleDateString() : '—'} />
                          <ProfileField label="Auto Renewal" value={user.autoRenew ? "Enabled" : "Disabled"} />
                          <div className="pt-4 text-center">
                            <button 
                              onClick={() => setShowDowngradeModal(true)}
                              className="px-6 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Cancel Subscription
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-600 mb-4">Upgrade to unlock premium features</p>
                          <button onClick={() => navigate('/premium')} className="px-6 py-2 bg-[#6C0B14] text-white rounded-lg hover:bg-[#8a1220] transition-colors">Subscribe to Premium</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden mt-6">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      <div className="flex items-start"></div>
                      <div className="flex items-start">
                        <div className="bg-green-100 p-2 rounded-full mr-3">
                          <span className="text-green-600">💳</span>
                        </div>
                        <div>
                          <p className="font-medium">Payment Processed</p>
                          <p className="text-sm text-gray-500">Subscription renewal - 1 week ago</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-purple-100 p-2 rounded-full mr-3">
                          <span className="text-purple-600">🔔</span>
                        </div>
                        <div>
                          <p className="font-medium">Notification Settings</p>
                          <p className="text-sm text-gray-500">Updated email preferences - 2 weeks ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
  {/* Modals */}
  <PaymentMethodsModal open={showPayment} onClose={() => setShowPayment(false)} />
  <DowngradeModal 
    open={showDowngradeModal} 
    onClose={() => setShowDowngradeModal(false)}
    onConfirm={handleDowngrade}
  />
      <PasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={submitPasswordChange}
        form={passwordForm}
        setForm={setPasswordForm}
        loading={passwordLoading}
        error={passwordError}
      />
    </div>
  );
}

// Inline password modal
function PasswordModal({ open, onClose, onSubmit, form, setForm, loading, error }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-[#6C0B14]">Change Password</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Current Password</label>
            <input type="password" value={form.currentPassword} onChange={(e)=>setForm({...form, currentPassword: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">New Password</label>
            <input type="password" value={form.newPassword} onChange={(e)=>setForm({...form, newPassword: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
            <input type="password" value={form.confirmPassword} onChange={(e)=>setForm({...form, confirmPassword: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
            <button type="submit" disabled={loading} className={`px-4 py-2 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-[#6C0B14] hover:bg-[#8a1220]'}`}>
              {loading ? 'Saving…' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PaymentMethodsModal({ open, onClose }) {
  if (!open) return null;
  const items = [
    { name: 'Credit/Debit Cards', icon: '💳' },
    { name: 'EasyPaisa', icon: '📱' },
    { name: 'JazzCash', icon: '📲' },
  ];
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-[#6C0B14]">We Accept</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
        </div>
        <div className="p-6 space-y-3">
          {items.map(i => (
            <div key={i.name} className="flex items-center gap-3 p-3 border rounded-lg">
              <span className="text-xl">{i.icon}</span>
              <span className="font-medium">{i.name}</span>
            </div>
          ))}
        </div>
        <div className="p-4 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-[#6C0B14] text-white hover:bg-[#8a1220]">Close</button>
        </div>
      </div>
    </div>
  );
}

function DowngradeModal({ open, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg">
        <div className="p-6">
          <h3 className="text-xl font-bold text-[#6C0B14] mb-4">Cancel Subscription</h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to cancel your premium subscription? You will lose access to:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
            <li>Medical records storage</li>
            <li>Pharmacy and lab access</li>
            <li>Advanced emergency features</li>
            <li>Priority support</li>
          </ul>
          <p className="text-sm text-gray-500 mb-6">
            You can resubscribe anytime from the premium page.
          </p>
        </div>
        <div className="p-4 border-t flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Keep Premium
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>
  );
}