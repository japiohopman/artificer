import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChromaKeyImage } from './ChromaKeyImage';
import { DiceText } from '../dice/DiceText';
import { GameIcon } from '../../game_icons';
import { getPackContents } from '../../lib/itemPacks';
import { fetchEquipmentData, normalizeImageUrl } from '../../services/storageService';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';

interface PackInspectorProps {
  pack: any;
  onClose: () => void;
}

export const PackInspector: React.FC<PackInspectorProps> = ({ pack, onClose }) => {
  const [packItems, setPackItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [takenQuantities, setTakenQuantities] = useState<Record<string, number>>({});
  const cardRef = useRef<HTMLDivElement>(null);

  // Load sub-items metadata
  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      try {
        const contents = getPackContents(pack.index || pack.name);
        if (contents) {
          const loaded = await Promise.all(
            contents.map(async (c) => {
              try {
                const data = await fetchEquipmentData(c.template);
                if (data) {
                  return {
                    ...data,
                    quantity: c.quantity,
                    template: c.template
                  };
                }
              } catch (e) {
                console.warn(`Error loading item data for ${c.template}:`, e);
              }
              return {
                index: c.template,
                name: c.template.replace(/-/g, ' '),
                desc: ["No description available."],
                quantity: c.quantity,
                template: c.template,
                weight: 0,
                cost: { quantity: 0, unit: 'gp' }
              };
            })
          );
          setPackItems(loaded.filter(Boolean));
        } else if (pack.contents && pack.contents.length > 0) {
          const loaded = await Promise.all(
            pack.contents.map(async (c: any) => {
              const idx = c.item?.index || c.index;
              try {
                const data = await fetchEquipmentData(idx);
                if (data) {
                  return {
                    ...data,
                    quantity: c.quantity || 1,
                    template: idx
                  };
                }
              } catch (e) {
                console.warn(`Error loading item data for ${idx}:`, e);
              }
              return {
                index: idx,
                name: (c.item?.name || c.name || idx).replace(/-/g, ' '),
                desc: ["No description available."],
                quantity: c.quantity || 1,
                template: idx,
                weight: 0,
                cost: { quantity: 0, unit: 'gp' }
              };
            })
          );
          setPackItems(loaded.filter(Boolean));
        }
      } catch (err) {
        console.error("Error loading pack items in FocusView:", err);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
    setSelectedItem(null); // Reset sub-selection when pack changes
  }, [pack]);

  // Handle 3D Mouse Tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const renderValue = (val: any) => {
    if (!val) return null;
    if (typeof val === 'object') return val.name || val.value || JSON.stringify(val);
    return val;
  };

  // Simulated take/store handlers
  const handleTakeItem = (itemTemplate: string) => {
    const item = packItems.find(i => i.template === itemTemplate);
    if (!item) return;
    const maxQty = item.quantity || 1;
    const currentTaken = takenQuantities[itemTemplate] || 0;
    if (currentTaken < maxQty) {
      setTakenQuantities(prev => ({
        ...prev,
        [itemTemplate]: currentTaken + 1
      }));
    }
  };

  const handleStoreItem = (itemTemplate: string) => {
    const currentTaken = takenQuantities[itemTemplate] || 0;
    if (currentTaken > 0) {
      setTakenQuantities(prev => ({
        ...prev,
        [itemTemplate]: currentTaken - 1
      }));
    }
  };

  // Calculations for Footer & Cargo representation
  const contentsWeight = packItems.reduce((acc, item) => {
    const qtyLeft = (item.quantity || 1) - (takenQuantities[item.template] || 0);
    return acc + ((item.weight || 0) * qtyLeft);
  }, 0);
  const totalWeight = (pack.weight || 0) + contentsWeight;

  const currentInspected = selectedItem || pack;
  const descriptionMarkdown = Array.isArray(currentInspected.desc)
    ? currentInspected.desc.join('\n\n')
    : renderValue(currentInspected.desc) || "No description available.";

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 relative z-10 overflow-hidden h-full max-h-[85vh]">
      
      {/* Left Column: Interactive 3D Pack Container Image Card */}
      <div className="flex-1 flex flex-col items-center justify-center perspective-[1000px] w-full max-h-[50vh] md:max-h-full">
        <motion.div
          ref={cardRef}
          layoutId={`item-image-${pack.index || pack.name}`}
          className="relative w-full max-w-[240px] md:max-w-[280px] aspect-[9/16] flex items-center justify-center group/card"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
            transition: 'transform 0.1s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {pack.imageUrl ? (
            <div className="relative z-10 w-full h-full p-2 flex items-center justify-center" style={{ transform: 'translateZ(50px)' }}>
              <ChromaKeyImage
                src={pack.imageUrl}
                alt={renderValue(pack.name)}
                className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
              />
            </div>
          ) : (
            <GameIcon name="backpack" size={120} color="#D4AF37" className="opacity-20" />
          )}
        </motion.div>
        
        {/* Active Item Indicator under the card */}
        <div className="mt-4 text-center select-none bg-black/40 border border-dragon-gold/20 px-4 py-1.5 rounded-full" onClick={(e) => e.stopPropagation()}>
          <span className="text-[10px] font-black uppercase text-dragon-gold tracking-[0.2em]">
            {selectedItem ? `Inspecting Content: ${selectedItem.name}` : `Container: ${pack.name}`}
          </span>
        </div>
      </div>

      {/* Right Column: Premium Interactive Workspace */}
      <div
        className="w-full md:w-[620px] h-full max-h-[75vh] flex flex-col z-[110] bg-parchment-100/90 border-[6px] border-[#c5a059]/40 rounded-[16px] overflow-hidden shadow-2xl relative select-none"
        style={{
          backgroundImage: `url('/assets/ui/parchment.jpg')`,
          backgroundColor: '#f5ebd0',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Texture Overlay */}
        <div className="absolute inset-0 bg-paper-texture opacity-25 mix-blend-multiply pointer-events-none" />

        {/* Decorative Borders */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-dragon-gold/30 rounded-tl" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-dragon-gold/30 rounded-tr" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-dragon-gold/30 rounded-bl" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-dragon-gold/30 rounded-br" />

        {/* Header */}
        <div className="p-4 md:p-6 pb-2 border-b border-dragon-gold/30 relative z-10 shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-header text-3xl md:text-4xl font-black text-dragon-darkRed leading-none drop-shadow-sm uppercase tracking-tight">
                {renderValue(pack.name)}
              </h2>
              <p className="text-[9px] font-black text-dragon-gold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1.5">
                <GameIcon name="backpack" size={10} color="#B8860B" /> Container Manifest
              </p>
            </div>
            {selectedItem && (
              <button
                onClick={() => setSelectedItem(null)}
                className="text-[8px] font-black uppercase text-white bg-dragon-red hover:bg-dragon-darkRed px-3 py-1 rounded-sm shadow-md transition-colors"
              >
                Show Pack Description
              </button>
            )}
          </div>
        </div>

        {/* Main Split Content Area */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 relative z-10">
          
          {/* Left Inner: Contents Grid */}
          <div className="w-full md:w-1/2 p-4 md:p-5 border-b md:border-b-0 md:border-r border-dragon-gold/20 flex flex-col min-h-0">
            <h3 className="text-[10px] font-black text-dragon-darkRed uppercase tracking-wider mb-3 flex items-center gap-1.5 shrink-0">
              <GameIcon name="loot" size={12} color="#8B0000" /> Contents ({packItems.length} items)
            </h3>
            
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                <GameIcon name="refresh" size={24} color="#B8860B" className="animate-spin" />
                <span className="text-[9px] font-bold text-dragon-gold/70 uppercase tracking-widest">Unpacking Provisions...</span>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-4 gap-2">
                  {packItems.map((item, idx) => {
                    const isSelected = selectedItem?.template === item.template;
                    const itemCategory = item.equipment_category?.index || item.equipment_category || '';
                    const itemIconName = (typeof itemCategory === 'object' ? itemCategory.index : String(itemCategory)).replace(/-/g, '_');
                    const totalQty = item.quantity || 1;
                    const takenQty = takenQuantities[item.template] || 0;
                    const qtyLeft = totalQty - takenQty;

                    return (
                      <button
                        key={`${item.template}-${idx}`}
                        onClick={() => setSelectedItem(item)}
                        className={cn(
                          "aspect-square rounded border transition-all relative flex flex-col items-center justify-center p-1 overflow-hidden shadow-sm hover:scale-[1.03]",
                          isSelected
                            ? "bg-dragon-darkRed/95 border-dragon-gold ring-2 ring-dragon-gold/30 z-10"
                            : "bg-white/75 border-[#c5a059]/20 hover:border-dragon-red/30 hover:bg-white",
                          qtyLeft === 0 && "opacity-40 grayscale"
                        )}
                      >
                        {/* Item Image or Fallback Icon */}
                        <div className="w-full h-full flex items-center justify-center overflow-hidden relative p-0.5">
                          {item.imageUrl ? (
                            <ChromaKeyImage
                              src={normalizeImageUrl(item.imageUrl, 'equipment', item.template)}
                              alt={item.name}
                              className="h-[90%] w-auto object-contain transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <GameIcon name={itemIconName as any || 'loot'} size={18} color={isSelected ? "#FFF" : "#8B0000"} className="opacity-40" />
                          )}
                        </div>

                        {/* Pocket/Taken Indicator Badge */}
                        {takenQty > 0 && (
                          <div className="absolute top-0.5 left-0.5 bg-yellow-600 border border-dragon-gold/30 text-white rounded-full w-4 h-4 flex items-center justify-center text-[7px] font-black shadow-sm">
                            +{takenQty}
                          </div>
                        )}

                        {/* Quantity Badge */}
                        {qtyLeft > 0 && (
                          <div className={cn(
                            "absolute bottom-0.5 right-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-anton tracking-wider shadow border",
                            isSelected
                              ? "bg-dragon-gold text-dragon-darkRed border-dragon-gold/40"
                              : "bg-dragon-darkRed text-white border-white/10"
                          )}>
                            x{qtyLeft}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Pocket items list */}
                {Object.values(takenQuantities).some(q => q > 0) && (
                  <div className="mt-4 pt-3 border-t border-dragon-gold/20 shrink-0">
                    <h4 className="text-[9px] font-black text-yellow-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <GameIcon name="pocket" size={12} color="#B5A642" /> Simulated Pocket ({Object.values(takenQuantities).reduce((a, b) => a + b, 0)} items)
                    </h4>
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                      {packItems.map((item, idx) => {
                        const takenQty = takenQuantities[item.template] || 0;
                        if (takenQty === 0) return null;
                        const itemCategory = item.equipment_category?.index || item.equipment_category || '';
                        const itemIconName = (typeof itemCategory === 'object' ? itemCategory.index : String(itemCategory)).replace(/-/g, '_');

                        return (
                          <button
                            key={`pocket-${item.template}-${idx}`}
                            onClick={() => setSelectedItem(item)}
                            className="w-12 h-12 shrink-0 rounded border bg-amber-50/50 border-yellow-600/30 flex flex-col items-center justify-center relative hover:scale-[1.03] transition-all"
                          >
                            <div className="w-full h-full flex items-center justify-center overflow-hidden p-0.5 opacity-85">
                              {item.imageUrl ? (
                                <ChromaKeyImage
                                  src={normalizeImageUrl(item.imageUrl, 'equipment', item.template)}
                                  alt={item.name}
                                  className="h-[80%] w-auto object-contain"
                                />
                              ) : (
                                <GameIcon name={itemIconName as any || 'loot'} size={14} color="#B5A642" />
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-yellow-600 border border-white/20 text-white rounded-full px-1.5 py-0.2 text-[7px] font-black shadow">
                              x{takenQty}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Inner: Dynamic Detail Panel */}
          <div className="w-full md:w-1/2 p-4 md:p-5 flex flex-col min-h-0 bg-parchment-200/40">
            <div className="flex justify-between items-start border-b border-dragon-gold/20 pb-2 mb-3 shrink-0">
              <div>
                <h4 className="font-header text-lg font-bold uppercase text-dragon-darkRed tracking-tight leading-tight">
                  {currentInspected.name}
                </h4>
                <p className="text-[8px] font-bold text-parchment-500 uppercase tracking-wider mt-0.5">
                  {renderValue(currentInspected.equipment_category) || 'Adventuring Gear'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] font-bold text-dragon-red flex items-center gap-1 leading-none">
                  <GameIcon name="coins" size={10} color="#D97706" />
                  {renderValue(currentInspected.cost?.quantity)} {renderValue(currentInspected.cost?.unit)}
                </span>
                <span className="text-[9px] font-bold text-parchment-500 flex items-center gap-1 leading-none">
                  <GameIcon name="weight" size={9} color="#7F1D1D" className="opacity-50" />
                  {renderValue(currentInspected.weight)} lbs.
                </span>
              </div>
            </div>

            {/* Simulated Take/Store controls */}
            {selectedItem && (
              <div className="bg-white/80 border border-dragon-gold/30 rounded p-2 mb-3 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[7px] font-black uppercase text-[#8B0000] tracking-wider">Simulated Pocket</span>
                  <span className="text-[10px] font-bold text-stone-700">
                    In Pack: {(selectedItem.quantity || 1) - (takenQuantities[selectedItem.template] || 0)} left &bull; Taken: {takenQuantities[selectedItem.template] || 0}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleStoreItem(selectedItem.template)}
                    disabled={!(takenQuantities[selectedItem.template] > 0)}
                    className="px-2 py-1 text-[8px] font-black uppercase bg-stone-200 hover:bg-stone-300 disabled:opacity-30 text-stone-800 rounded transition-all flex items-center gap-1 border border-stone-300 shadow-sm active:scale-95"
                  >
                    Store 1
                  </button>
                  <button
                    onClick={() => handleTakeItem(selectedItem.template)}
                    disabled={!((selectedItem.quantity || 1) - (takenQuantities[selectedItem.template] || 0) > 0)}
                    className="px-2 py-1 text-[8px] font-black uppercase bg-dragon-darkRed hover:bg-dragon-red disabled:opacity-30 text-white rounded transition-all flex items-center gap-1 border border-dragon-red shadow-sm active:scale-95"
                  >
                    Take 1
                  </button>
                </div>
              </div>
            )}

            {/* Scrollable description box */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0">
              <div className="text-[10px] text-parchment-800 italic leading-relaxed space-y-2 font-body markdown-body">
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-2"><DiceText iconSize={11}>{children}</DiceText></p>,
                    li: ({ children }) => <li className="mb-1"><DiceText iconSize={11}>{children}</DiceText></li>
                  }}
                >
                  {descriptionMarkdown}
                </Markdown>
              </div>

              {/* Specialized stats (Damage / AC) */}
              {currentInspected.properties && currentInspected.properties.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-dragon-gold/15">
                  {currentInspected.properties.map((prop: any, i: number) => (
                    <span key={i} className="text-[7px] font-black uppercase bg-dragon-red/5 text-dragon-red border border-dragon-red/10 px-1.5 py-0.5 rounded">
                      {renderValue(prop)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer Summary Bar */}
        <div className="p-3 md:p-4 bg-dragon-darkRed/95 border-t border-dragon-gold/30 flex items-center justify-between text-white relative z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <GameIcon name="coins" size={12} color="#D4AF37" />
              <div className="flex flex-col">
                <span className="text-[7px] uppercase font-black tracking-widest text-white/40">Total Cost</span>
                <span className="text-xs font-anton text-white tracking-wide">
                  {renderValue(pack.cost?.quantity)} {renderValue(pack.cost?.unit)}
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-white/10" />

            <div className="flex items-center gap-1.5">
              <GameIcon name="weight" size={12} color="#FFFFFF" className="opacity-45" />
              <div className="flex flex-col">
                <span className="text-[7px] uppercase font-black tracking-widest text-white/40">Pack Weight</span>
                <span className="text-xs font-anton text-white tracking-wide">
                  {renderValue(pack.weight)} lb.
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-white/10" />

            <div className="flex items-center gap-1.5">
              <GameIcon name="box" size={12} color="#FFFFFF" className="opacity-45" />
              <div className="flex flex-col">
                <span className="text-[7px] uppercase font-black tracking-widest text-white/40">Total Cargo</span>
                <span className="text-xs font-anton text-white tracking-wide">
                  {totalWeight.toFixed(1)} lb. <span className="text-[8px] text-dragon-gold/80 font-normal">({contentsWeight.toFixed(1)} lb. Cargo)</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-dragon-gold hover:bg-yellow-600 text-dragon-darkRed font-black uppercase text-[9px] tracking-widest rounded-sm shadow border border-dragon-gold/30 transition-all active:scale-95"
          >
            Close Manifest
          </button>
        </div>

      </div>
    </div>
  );
};
