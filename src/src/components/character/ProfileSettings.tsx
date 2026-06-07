import React, { useState, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { GameIcon } from '../../game_icons';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { soundService } from '../../services/soundService';

interface ProfileSettingsProps {
  onClose: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onClose }) => {
  const { userProfile, updateUserProfile } = useStore();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({
        displayName,
        bio,
        photoURL
      });
      soundService.playEffect('TRANSACTION_SUCCESS');
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      soundService.playEffect('UI_ERROR');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to ~800KB for Firestore safety
    if (file.size > 800 * 1024) {
      alert("Image is too large. Please select an image under 800KB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPhotoURL(result);
      setIsUploading(false);
      soundService.playEffect('UI_CLICK_LIGHT');
    };

    reader.onerror = () => {
      console.error("FileReader error");
      setIsUploading(false);
      soundService.playEffect('UI_ERROR');
    };

    reader.readAsDataURL(file);
  };

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    // Placeholder for AI generation flow
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-parchment-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-dragon-red/10 bg-parchment-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-dragon-red/5 rounded-lg border border-dragon-red/20 text-dragon-red">
            <GameIcon name="user" size={20} color="#8B0000" />
          </div>
          <div>
            <h2 className="text-xl font-header font-black text-dragon-darkRed uppercase tracking-widest">Profile settings</h2>
            <p className="text-[10px] font-bold text-parchment-500 uppercase tracking-widest leading-none mt-1">Manage your personal profile and account</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          title="Close Settings"
          aria-label="Close Settings"
          className="p-2 hover:bg-dragon-red/10 rounded-full text-parchment-400 hover:text-dragon-red transition-all"
        >
          <GameIcon name="close" size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {/* Profile Card Preview */}
        <div className="bg-white border-2 border-dragon-red/10 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden min-h-[160px]">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-dragon-red" />
          
          <div className="relative group shrink-0">
            <div className="w-28 h-28 rounded-2xl bg-parchment-100 border-2 border-parchment-300 overflow-hidden shadow-lg group-hover:border-dragon-red/50 transition-all relative">
              {photoURL ? (
                <img src={photoURL} className="w-full h-full object-cover" alt="Profile" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-parchment-300">
                   <GameIcon name="user" size={44} color="currentColor" />
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                   <GameIcon name="loading" size={24} color="#FFFFFF" className="animate-spin" />
                </div>
              )}
            </div>
            
            {/* Action Buttons for Avatar */}
            <div className="absolute -bottom-2 -right-2 flex gap-1.5">
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="image/*"
                 onChange={handleFileUpload}
               />
               <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Upload localized asset"
                aria-label="Upload profile image"
                className="p-2.5 bg-white rounded-xl border border-parchment-300 text-parchment-600 hover:text-dragon-red hover:border-dragon-red shadow-lg transition-all active:scale-95 disabled:opacity-50"
               >
                  <GameIcon name="camera" size={16} color="currentColor" />
               </button>
               <button 
                onClick={handleGenerateImage}
                disabled={isGenerating}
                title="Scribe image with AI"
                aria-label="Generate profile image with AI"
                className="p-2.5 bg-dragon-red text-white rounded-xl shadow-lg hover:bg-dragon-darkRed transition-all active:scale-95 disabled:opacity-50"
               >
                  {isGenerating ? <GameIcon name="loading" size={16} color="#FFFFFF" className="animate-spin" /> : <GameIcon name="bot" size={16} color="#FFFFFF" />}
               </button>
            </div>
          </div>

          <div className="flex-1 space-y-2 text-center md:text-left py-1">
             <div className="flex flex-col">
                <span className="text-2xl font-header font-black text-dragon-darkRed leading-none uppercase truncate tracking-tight">{displayName || 'Nameless_Traveler'}</span>
                <span className="text-sm font-bold text-parchment-400 mt-2 font-mono uppercase tracking-tighter opacity-80">{userProfile?.email}</span>
             </div>
             <div className="flex items-center gap-2 justify-center md:justify-start pt-3">
                <div className="px-3 py-1 bg-dragon-red/5 border border-dragon-red/20 rounded-full flex items-center gap-2">
                   <GameIcon name="shield" size={10} color="#8B0000" />
                   <span className="text-[9px] font-black text-dragon-red uppercase tracking-[0.2em]">{userProfile?.role}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="space-y-6">
              <div className="space-y-2.5">
                 <label htmlFor="display-name" className="text-[11px] font-black text-dragon-red uppercase tracking-[0.15em] block ml-1">Display Name</label>
                 <div className="relative group">
                    <GameIcon name="user" className="absolute left-4 top-1/2 -translate-y-1/2 text-parchment-400 transition-colors group-focus-within:text-dragon-red" size={16} color="currentColor" />
                    <input 
                      id="display-name"
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your public name..."
                      aria-label="Display Name"
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-parchment-300 rounded-2xl focus:outline-none focus:border-dragon-red shadow-sm transition-all font-medium"
                    />
                 </div>
              </div>

              <div className="space-y-2.5">
                 <label className="text-[11px] font-black text-dragon-red uppercase tracking-[0.15em] block ml-1">Avatar Source</label>
                 <div className="relative group">
                    <GameIcon name="sparkles" className="absolute left-4 top-1/2 -translate-y-1/2 text-parchment-400 transition-colors group-focus-within:text-dragon-red" size={16} color="currentColor" />
                    <input 
                      type="text" 
                      value={photoURL.startsWith('data:') ? 'Local asset uploaded...' : photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      placeholder="Paste image URL..."
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-parchment-300 rounded-2xl focus:outline-none focus:border-dragon-red shadow-sm transition-all font-medium text-sm"
                    />
                 </div>
                 <p className="text-[10px] text-parchment-400 font-bold italic uppercase tracking-wider ml-1 mt-2 opacity-60">
                   * Use camera icon to upload or scribe with AI
                 </p>
              </div>
           </div>

           <div className="space-y-2.5">
              <label className="text-[11px] font-black text-dragon-red uppercase tracking-[0.15em] block ml-1">Biography</label>
              <textarea 
                 value={bio}
                 onChange={(e) => setBio(e.target.value)}
                 placeholder="Tell your story in the Atlas..."
                 rows={6}
                 className="w-full p-5 bg-white border border-parchment-300 rounded-3xl focus:outline-none focus:border-dragon-red resize-none transition-all leading-relaxed font-medium shadow-sm"
              />
           </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-dragon-red/10 bg-parchment-100 flex justify-end gap-5 shrink-0">
        <button 
          onClick={onClose}
          className="px-8 py-3.5 border border-parchment-300 rounded-2xl font-black text-[11px] text-parchment-600 uppercase tracking-widest hover:bg-parchment-200 transition-all active:scale-95 shadow-sm"
        >
          Discard Changes
        </button>
        <button 
          onClick={handleSave}
          disabled={isSaving || isUploading}
          className="flex items-center gap-2.5 px-10 py-3.5 bg-dragon-red text-white rounded-2xl font-header font-black text-sm uppercase tracking-[0.15em] shadow-xl hover:bg-dragon-darkRed transition-all active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <GameIcon name="loading" size={20} color="#FFFFFF" className="animate-spin" /> : <GameIcon name="save_data" size={20} color="currentColor" />}
          Save Profile
        </button>
      </div>
    </div>
  );
};
