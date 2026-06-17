import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { GameIcon } from '../../game_icons';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { soundService } from '../../services/soundService';

interface ProfileSettingsProps {
  onClose: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onClose }) => {
  const { userProfile, updateUserProfile } = useAuthStore();
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
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-parchment-50 overflow-hidden p-8">
       <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-header font-black text-dragon-darkRed uppercase tracking-widest">Profile Configuration</h2>
          <button onClick={onClose} className="p-2 hover:bg-dragon-red/10 rounded-full transition-all text-parchment-400 hover:text-dragon-red"><GameIcon name="close" size={24} /></button>
       </div>
       <div className="space-y-6">
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-dragon-red tracking-widest">Display Identity</label>
             <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full p-4 bg-white border border-dragon-red/10 rounded-sm focus:outline-none focus:border-dragon-red transition-all" />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-dragon-red tracking-widest">Chronicle (Bio)</label>
             <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full p-4 bg-white border border-dragon-red/10 rounded-sm focus:outline-none focus:border-dragon-red transition-all resize-none" />
          </div>
          <div className="flex justify-end gap-4 mt-8">
             <button onClick={onClose} className="px-6 py-3 border border-dragon-red/20 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-parchment-100 transition-all">Discard</button>
             <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 bg-dragon-red text-white rounded-sm font-header font-black text-xs uppercase tracking-widest shadow-xl hover:bg-dragon-darkRed transition-all disabled:opacity-50">Commit Profile</button>
          </div>
       </div>
    </div>
  );
};
