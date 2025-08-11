
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    cnic: "",
    contact: "",
    email: "",
  });

 
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const userId = localStorage.getItem("userId");
  
  if (!userId) {
    navigate("/login");
    return null;
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/profile/${userId}`);
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
      const res = await axios.put(`http://localhost:5000/api/profile/${userId}`, form);
      setUser(res.data);
      localStorage.setItem("userProfile", JSON.stringify(res.data));
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update user:", err);
      alert("Failed to update profile.");
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
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-[#6C0B14] mb-4">
                  <img 
                    src={user.avatar || "/profile-placeholder.png"}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-gray-600 mb-4">{user.email}</p>
                
                <div className="bg-[#F8F1F1] rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Account Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${user.premium ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                      {user.premium ? "Premium Member" : "Free Account"}
                    </span>
                  </div>
                  {!user.premium && (
                    <button
                      onClick={() => window.location.href = '/premium'}
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
                    <a href="/premium" className="flex items-center text-gray-600 hover:text-[#6C0B14] transition-colors">
                      <span className="mr-2">💳</span> Payment Methods
                    </a>
                  </li>
                  <li>
                    <a href="/notifications" className="flex items-center text-gray-600 hover:text-[#6C0B14] transition-colors">
                      <span className="mr-2">🔔</span> Notification Settings
                    </a>
                  </li>
                   <li>
                    <button
                      type="button"
                      className="flex items-center text-gray-600 hover:text-[#6C0B14] transition-colors w-full"
                      onClick={() => {
                        localStorage.removeItem("userId");
                        localStorage.removeItem("userProfile");
                        navigate("/login");
                      }}
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
                    <ProfileField label="Account Created" value={new Date(user.createdAt).toLocaleDateString()} />
                    <ProfileField label="Last Updated" value={new Date(user.updatedAt).toLocaleDateString()} />
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
                        value={user.premium ? "Premium" : "Free"} 
                        highlight={user.premium}
                      />
                      {user.premium ? (
                        <>
                          <ProfileField label="Subscription Start" value={new Date(user.subscriptionStart).toLocaleDateString()} />
                          <ProfileField label="Subscription End" value={new Date(user.subscriptionEnd).toLocaleDateString()} />
                          <ProfileField label="Auto Renewal" value={user.autoRenew ? "Enabled" : "Disabled"} />
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-600 mb-4">Upgrade to unlock premium features</p>
                          <button
                            onClick={() => window.location.href = '/premium'}
                            className="px-6 py-2 bg-[#6C0B14] text-white rounded-lg hover:bg-[#8a1220] transition-colors"
                          >
                            View Subscription Plans
                          </button>
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
    </div>
  );
}