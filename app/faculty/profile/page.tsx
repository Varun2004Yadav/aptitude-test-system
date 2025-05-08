"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil } from "lucide-react";

interface ProfileData {
  profilePicture?: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  department: string;
  country: string;
  city: string;
  pinCode: string;
  location: string;
  gender?: string;
}

export default function FacultyProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    profilePicture: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    department: "",
    country: "",
    city: "",
    pinCode: "",
    location: "Leeds, United Kingdom",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editSection, setEditSection] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMsg, setPasswordMsg] = useState("");

  // Move fetchProfile here
  const fetchProfile = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/faculty/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch profile");
      const data = await response.json();
      setProfile({
        profilePicture: data.profilePicture || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        username: data.username || "",
        email: data.email || "",
        phone: data.phone || "",
        department: data.department || "",
        country: data.country || "",
        city: data.city || "",
        pinCode: data.pinCode || "",
        location: data.location || "Leeds, United Kingdom",
        gender: data.gender || "",
      });
    } catch (err: any) {
      setError(err.message || "Error fetching profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("profilePicture", file);
    setUploading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/faculty/profile-picture", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload profile picture");
      const data = await response.json();
      setProfile((prev) => ({ ...prev, profilePicture: data.profilePicture }));
    } catch (err: any) {
      setError(err.message || "Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (section: string) => {
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/faculty/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(profile),
      });
      if (!response.ok) throw new Error("Failed to save profile");
      setEditSection(null);
      // Now this works!
      await fetchProfile();
    } catch (err: any) {
      setError(err.message || "Error saving profile");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg("");
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg("New passwords do not match.");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/faculty/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to change password");
      setPasswordMsg("Password updated successfully!");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setPasswordMsg(err.message || "Error changing password");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10">
      <h2 className="text-3xl font-bold mb-10">My Profile</h2>
      {/* Top Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center gap-8 mb-10">
        <div className="relative">
          <Avatar className="h-28 w-28">
            <AvatarImage src={profile.profilePicture || "/default-profile.png"} alt="Profile" />
            <AvatarFallback className="text-3xl">{profile.firstName?.charAt(0) || "F"}</AvatarFallback>
          </Avatar>
          <input
            type="file"
            accept="image/*"
            id="profile-upload"
            className="hidden"
            onChange={handleImageChange}
            disabled={uploading}
          />
          <label htmlFor="profile-upload" className="absolute bottom-2 right-2 cursor-pointer bg-white rounded-full p-2 shadow">
            <Pencil className="h-5 w-5 text-gray-500" />
          </label>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="text-2xl font-bold mb-1">{profile.username}</div>
          <div className="text-lg text-gray-600 mb-1">{profile.department}</div>
          {(profile.city || profile.country) && (
            <div className="text-base text-gray-400">
              {[profile.city, profile.country].filter(Boolean).join(", ")}
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" className="self-center md:self-start" onClick={() => setEditSection("top")}>Edit <Pencil className="h-4 w-4 ml-1" /></Button>
      </div>

      {/* Two-column grid for Personal Info and Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Personal Information Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="font-semibold text-xl">Personal Information</div>
            <Button variant="outline" size="sm" onClick={() => setEditSection("personal")}>Edit <Pencil className="h-4 w-4 ml-1" /></Button>
          </div>
          <div className="grid grid-cols-1 gap-5">
            <div>
              <div className="text-xs text-gray-400">First Name</div>
              {editSection === "personal" ? (
                <input name="firstName" value={profile.firstName} onChange={handleChange} className="border rounded px-3 py-2 w-full text-lg" />
              ) : (
                <div className="font-semibold text-lg">{profile.firstName}</div>
              )}
            </div>
            <div>
              <div className="text-xs text-gray-400">Last Name</div>
              {editSection === "personal" ? (
                <input name="lastName" value={profile.lastName} onChange={handleChange} className="border rounded px-3 py-2 w-full text-lg" />
              ) : (
                <div className="font-semibold text-lg">{profile.lastName}</div>
              )}
            </div>
            <div>
              <div className="text-xs text-gray-400">Username</div>
              {editSection === "personal" ? (
                <input name="username" value={profile.username} onChange={handleChange} className="border rounded px-3 py-2 w-full text-lg" />
              ) : (
                <div className="font-semibold text-lg">{profile.username}</div>
              )}
            </div>
            <div>
              <div className="text-xs text-gray-400">Email address</div>
              {editSection === "personal" ? (
                <input name="email" value={profile.email} onChange={handleChange} className="border rounded px-3 py-2 w-full text-lg" />
              ) : (
                <div className="font-semibold text-lg">{profile.email}</div>
              )}
            </div>
            <div>
              <div className="text-xs text-gray-400">Phone</div>
              {editSection === "personal" ? (
                <input name="phone" value={profile.phone} onChange={handleChange} className="border rounded px-3 py-2 w-full text-lg" />
              ) : (
                <div className="font-semibold text-lg">{profile.phone}</div>
              )}
            </div>
            <div>
              <div className="text-xs text-gray-400">Department</div>
              {editSection === "personal" ? (
                <input name="department" value={profile.department} onChange={handleChange} className="border rounded px-3 py-2 w-full text-lg" />
              ) : (
                <div className="font-semibold text-lg">{profile.department}</div>
              )}
            </div>
            {/* Example extra field */}
            <div>
              <div className="text-xs text-gray-400">Gender</div>
              {editSection === "personal" ? (
                <input name="gender" value={profile.gender || ""} onChange={handleChange} className="border rounded px-3 py-2 w-full text-lg" />
              ) : (
                <div className="font-semibold text-lg">{profile.gender || "-"}</div>
              )}
            </div>
          </div>
          {editSection === "personal" && (
            <div className="mt-6 flex gap-2">
              <Button size="sm" onClick={() => handleSave("personal")}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditSection(null)}>Cancel</Button>
            </div>
          )}
        </div>
        {/* Address Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="font-semibold text-xl">Address</div>
            <Button variant="outline" size="sm" onClick={() => setEditSection("address")}>Edit <Pencil className="h-4 w-4 ml-1" /></Button>
          </div>
          <div className="grid grid-cols-1 gap-5">
            <div>
              <div className="text-xs text-gray-400">Country</div>
              {editSection === "address" ? (
                <input name="country" value={profile.country} onChange={handleChange} className="border rounded px-3 py-2 w-full text-lg" />
              ) : (
                <div className="font-semibold text-lg">{profile.country}</div>
              )}
            </div>
            <div>
              <div className="text-xs text-gray-400">City/State</div>
              {editSection === "address" ? (
                <input name="city" value={profile.city} onChange={handleChange} className="border rounded px-3 py-2 w-full text-lg" />
              ) : (
                <div className="font-semibold text-lg">{profile.city}</div>
              )}
            </div>
            <div>
              <div className="text-xs text-gray-400">Pin Code</div>
              {editSection === "address" ? (
                <input name="pinCode" value={profile.pinCode} onChange={handleChange} className="border rounded px-3 py-2 w-full text-lg" />
              ) : (
                <div className="font-semibold text-lg">{profile.pinCode}</div>
              )}
            </div>
          </div>
          {editSection === "address" && (
            <div className="mt-6 flex gap-2">
              <Button size="sm" onClick={() => handleSave("address")}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditSection(null)}>Cancel</Button>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Card (full width) */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
        <div className="flex justify-between items-center mb-6">
          <div className="font-semibold text-xl">Change Password</div>
        </div>
        <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            name="oldPassword"
            type="password"
            value={passwords.oldPassword}
            onChange={handlePasswordChange}
            placeholder="Old password"
            className="border rounded px-3 py-3 text-lg"
            required
          />
          <input
            name="newPassword"
            type="password"
            value={passwords.newPassword}
            onChange={handlePasswordChange}
            placeholder="New password"
            className="border rounded px-3 py-3 text-lg"
            required
          />
          <input
            name="confirmPassword"
            type="password"
            value={passwords.confirmPassword}
            onChange={handlePasswordChange}
            placeholder="Confirm new password"
            className="border rounded px-3 py-3 text-lg col-span-2"
            required
          />
          <div className="col-span-2 flex gap-2 mt-2">
            <Button type="submit" size="sm">Change Password</Button>
            {passwordMsg && (
              <span className={`text-sm ${passwordMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {passwordMsg}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 