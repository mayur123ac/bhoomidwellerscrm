'use client';

import { useState } from 'react';
import { Phone, MessageCircle, MessageSquare, Calendar, User, IndianRupee, MapPin, Save, Clock } from 'lucide-react';

export default function EmployeeLeadDashboard() {
  // In a real app, you would get these from your login session/URL params
  const currentEmployee = "Lokesh"; 
  const currentTeamLeader = "Ramsha Farooq";

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('DETAILS'); // DETAILS, CALL, WHATSAPP

  const [leadData, setLeadData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    propertyType: '',
    budget: '',
    siteVisitDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setLeadData({ ...leadData, [e.target.name]: e.target.value });
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadData,
          employeeName: currentEmployee,
          teamLeaderName: currentTeamLeader
        })
      });

      if (!res.ok) throw new Error("Failed to save lead");
      
      alert("Client Details Saved Successfully!");
      // Reset form
      setLeadData({ name: '', phone: '', whatsapp: '', propertyType: '', budget: '', siteVisitDate: '' });
    } catch (error) {
      alert("Error saving client details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] p-8 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Lead</h1>
            <p className="text-sm text-gray-500">Enter client details and schedule visits.</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Assigned To</p>
            <p className="font-medium text-purple-700">{currentEmployee}</p>
            <p className="text-xs text-gray-400">TL: {currentTeamLeader}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Action Tabs (Matching your screenshot) */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button 
              onClick={() => setActiveTab('DETAILS')}
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center transition-colors ${activeTab === 'DETAILS' ? 'text-purple-700 border-b-2 border-purple-700 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <User className="w-4 h-4 mr-2" /> Client Details
            </button>
            <button 
              onClick={() => setActiveTab('CALL')}
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center transition-colors ${activeTab === 'CALL' ? 'text-purple-700 border-b-2 border-purple-700 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <Phone className="w-4 h-4 mr-2" /> Call
            </button>
            <button 
              onClick={() => setActiveTab('WHATSAPP')}
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center transition-colors ${activeTab === 'WHATSAPP' ? 'text-purple-700 border-b-2 border-purple-700 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {activeTab === 'DETAILS' && (
              <form onSubmit={handleSaveLead} className="space-y-6">
                
                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Client Name</label>
                    <input type="text" name="name" required value={leadData.name} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. Mohd Hammad" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center"><Phone className="w-3 h-3 mr-1"/> Phone Number</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg">+91</span>
                      <input type="tel" name="phone" required value={leadData.phone} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-r-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Enter Phone Number" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center"><MessageCircle className="w-3 h-3 mr-1"/> WhatsApp Number</label>
                    <input type="tel" name="whatsapp" value={leadData.whatsapp} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Same as phone if left empty" />
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Property Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Property Type</label>
                    <select name="propertyType" value={leadData.propertyType} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                      <option value="">Select Requirement...</option>
                      <option value="1BHK">1 BHK Apartment</option>
                      <option value="2BHK">2 BHK Apartment</option>
                      <option value="3BHK">3 BHK Apartment</option>
                      <option value="Villa">Luxury Villa</option>
                      <option value="Commercial">Commercial Space</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center"><IndianRupee className="w-3 h-3 mr-1"/> Budget Range</label>
                    <select name="budget" value={leadData.budget} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                      <option value="">Select Budget...</option>
                      <option value="Under 50L">Under 50 Lacs</option>
                      <option value="50L - 1Cr">50 Lacs - 1 Crore</option>
                      <option value="1Cr - 3Cr">1 Crore - 3 Crores</option>
                      <option value="Above 3Cr">Above 3 Crores</option>
                    </select>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Site Visit Scheduling */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center"><Calendar className="w-3 h-3 mr-1"/> Schedule Site Visit</label>
                  <input type="datetime-local" name="siteVisitDate" value={leadData.siteVisitDate} onChange={handleChange} className="w-full md:w-1/2 p-3 bg-purple-50 text-purple-900 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={isLoading} className="flex items-center px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50">
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Client Details'}
                  </button>
                </div>

              </form>
            )}

            {/* Placeholder for other tabs based on screenshot */}
            {activeTab === 'CALL' && (
              <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                  <Phone className="w-8 h-8" />
                </div>
                <p>Click below to initiate a call via Truecaller / SIM integration</p>
                <button className="mt-6 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium transition flex items-center">
                  <Phone className="w-4 h-4 mr-2"/> Start Call
                </button>
              </div>
            )}

            {activeTab === 'WHATSAPP' && (
              <div className="py-8">
                <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4 inline-flex items-center border border-green-200">
                  <MessageCircle className="w-4 h-4 mr-2" /> Sending from My Mobile WhatsApp
                </div>
                <textarea className="w-full p-4 border border-gray-200 rounded-lg h-32 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Enter WhatsApp msg text. Enter / for templates..."></textarea>
                <div className="flex justify-end mt-4">
                  <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition flex items-center">
                    Send <MessageSquare className="w-4 h-4 ml-2"/>
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}