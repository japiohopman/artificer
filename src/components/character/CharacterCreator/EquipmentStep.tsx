import React, { useState, useEffect } from 'react';
import { Character } from '../../../store/useStore';
import { cn } from '../../../lib/utils';
import { soundService } from '../../../services/soundService';
import { ItemInstance, InventoryContainer, InventorySlot, EQUIPMENT_SLOT_CATALOG } from '../../../types/inventory';
import { createItemInstance, createDefaultBackpack, createDefaultEquipment } from '../../../lib/inventoryUtils';
import { 
  fetchClassData, fetchBackgroundJson, fetchEquipmentData 
} from '../../../services/storageService';
import { atlasService } from '../../../services/atlasService';
import { EquipmentDoll } from '../EquipmentDoll';
import { ChromaKeyImage } from '../../ui/ChromaKeyImage';
import { GameIcon } from '../../../game_icons';

const ITEM_BACKGROUND = "https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1775921630292-back_item_slug.webp";

const EquipmentOptionChoice: React.FC<{
    opt: any;
    idx: number;
    source: string;
    completedOptions: Record<string, boolean>;
    choiceSelections: Record<string, string[]>;
    handleChoice: (opt: any, choiceIdx: number, optKey: string, actualChoice?: any) => void;
}> = ({ opt, idx, source, completedOptions, choiceSelections, handleChoice }) => {
    const optKey = `${source}-${idx}`;
    const isCompleted = completedOptions[optKey];
    const [categoryItems, setCategoryItems] = useState<any[]>([]);
    const [isCategoryLoading, setIsCategoryLoading] = useState(false);
    const [optionDetails, setOptionDetails] = useState<Record<string, any>>({});
    const [pendingItemIdx, setPendingItemIdx] = useState<number | null>(null);

    useEffect(() => {
        const loadOptions = async () => {
            setIsCategoryLoading(true);
            try {
                let baseOptions = opt.from?.options || opt.from?.equipment?.options || [];
                
                if (opt.from?.option_set_type === 'equipment_category' && opt.from?.equipment_category?.index) {
                    const catItems = await atlasService.loadEquipmentByCategory(opt.from.equipment_category.index);
                    const mappedItems = (catItems || []).map((item: any) => ({
                        option_type: 'reference',
                        item,
                        equipment: item,
                        index: item.index,
                        name: item.name
                    }));
                    setCategoryItems(mappedItems);
                } else {
                    const expanded: any[] = [];
                    for (const choice of baseOptions) {
                        if (choice.option_type === 'choice' && choice.choice?.from?.option_set_type === 'equipment_category') {
                            const subCatItems = await atlasService.loadEquipmentByCategory(choice.choice.from.equipment_category.index);
                            if (subCatItems) {
                                expanded.push(...subCatItems);
                            } else {
                                expanded.push(choice);
                            }
                        } else {
                            expanded.push(choice);
                        }
                    }
                    setCategoryItems(expanded);
                }
            } catch (e) {
                console.error("Error loading options", e);
            } finally {
                setIsCategoryLoading(false);
            }
        };
        loadOptions();
    }, [opt]);

    const options = categoryItems;

    const extractOptionIndices = (o: any): string[] => {
        if (!o) return [];
        if (o.option_type === 'multiple') {
            return (o.items || []).flatMap((i: any) => extractOptionIndices(i));
        }
        const idx = o.equipment?.index || o.index || o.item?.index || o.of?.index || o.equipment_category?.index;
        return idx ? [idx] : [];
    };

    const getItemName = (choice: any) => {
        if (choice.option_type === 'choice') {
            return choice.choice?.desc || "Special Selection";
        } else if (choice.option_type === 'multiple') {
            // Check if items have quantities and include them
            return choice.items?.map((i: any) => {
                const name = i.of?.name || i.item?.name || i.equipment?.name || "Item";
                const q = i.quantity || i.count || i.choice?.count || 1;
                return q > 1 ? `${name} (x${q})` : name;
            }).join(' & ') || "Multiple Items";
        } else {
            const name = choice.of?.name || choice.item?.name || choice.equipment?.name || choice.name || "Equipment Choice";
            const q = choice.quantity || choice.count || 1;
            return q > 1 ? `${name} (x${q})` : name;
        }
    };

    useEffect(() => {
        const fetchMissingDetails = async () => {
            const allIndices = options.flatMap(o => extractOptionIndices(o));
            const missing = allIndices.filter(idx => idx && !optionDetails[idx]);
            
            if (missing.length > 0) {
                const uniqueMissing = Array.from(new Set(missing));
                const results = await Promise.all(uniqueMissing.map(async (idx: string) => {
                    const data = await fetchEquipmentData(idx);
                    return { idx, data };
                }));
                
                const newDetails = { ...optionDetails };
                results.forEach(res => {
                    if (res?.data) newDetails[res.idx] = res.data;
                });
                setOptionDetails(newDetails);
            }
        };
        fetchMissingDetails();
    }, [options]);

    const handleItemClick = (cIdx: number) => {
        if (isCompleted) return;
        setPendingItemIdx(cIdx);
        soundService.playEffect('UI_CLICK_LIGHT');
    };

    const confirmSelection = () => {
        if (pendingItemIdx === null) return;
        handleChoice(opt, pendingItemIdx, optKey, options[pendingItemIdx]);
        setPendingItemIdx(null);
    };

    return (
        <div className={cn(
            "space-y-4 p-5 border rounded-sm transition-all relative overflow-hidden",
            isCompleted ? "bg-dragon-gold/5 border-dragon-gold/20" : "bg-white/40 border-dragon-red/10"
        )}>
            <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none">
                <GameIcon name="backpack" size={100} color="#8B0000" />
            </div>

            <div className="flex justify-between items-center text-center sm:text-left flex-col sm:flex-row gap-4 relative z-10">
                <div className="flex flex-col">
                    <h4 className="text-[12px] font-black uppercase text-dragon-darkRed tracking-[0.2em] flex items-center gap-2">
                        {source} Choice {idx + 1}
                        {opt.choose > 1 && <span className="text-[10px] bg-dragon-red text-white px-2 ml-1 rounded-full">Pick {opt.choose}</span>}
                    </h4>
                    <p className="text-[10px] text-parchment-500 font-bold uppercase tracking-widest mt-1 opacity-60">
                        {opt.desc || `Choose from the available ${source.toLowerCase()} provisions`}
                    </p>
                </div>
                {isCompleted ? (
                    <div className="flex items-center gap-2 text-dragon-green text-[10px] font-black uppercase bg-dragon-green/10 px-3 py-1 rounded-sm border border-dragon-green/20">
                        <GameIcon name="check" size={12} color="currentColor" /> Selection Confirmed
                    </div>
                ) : pendingItemIdx !== null && (
                    <button 
                        onClick={confirmSelection}
                        className="bg-dragon-red text-white px-6 py-2 text-[11px] font-black uppercase tracking-widest rounded-sm hover:bg-dragon-darkRed transition-all shadow-[0_0_15px_rgba(139,0,0,0.3)] animate-pulse"
                    >
                        Confirm Manifestation
                    </button>
                )}
            </div>
            
            <div className={cn(
                "relative z-10",
                options.length <= 4 ? "flex flex-col gap-4" : "grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-1.5"
            )}>
                {isCategoryLoading ? (
                    <div className="col-span-full p-8 flex flex-col items-center justify-center gap-3">
                        <GameIcon name="refresh" size={24} color="#B8860B" className="animate-spin" />
                        <span className="text-[10px] font-black text-dragon-gold/40 uppercase tracking-widest">Consulting the Vaults...</span>
                    </div>
                ) : options.map((choice: any, cIdx: number) => {
                    const choiceLabel = String.fromCharCode(65 + cIdx);
                    const name = getItemName(choice);
                    const indices = extractOptionIndices(choice);
                    const isMultiple = choice.option_type === 'multiple';
                    const isPending = pendingItemIdx === cIdx;
                    const isSelected = choiceSelections[optKey]?.includes(`${cIdx}`);
                        
                    if (options.length <= 4) {
                        // Choice Row Layout (A vs B)
                        return (
                            <div 
                                key={cIdx} 
                                onClick={() => handleItemClick(cIdx)}
                                className={cn(
                                    "flex items-stretch gap-4 p-4 border rounded-sm transition-all cursor-pointer group relative overflow-hidden",
                                    isCompleted 
                                        ? isSelected 
                                            ? "bg-dragon-red/10 border-dragon-red/40" 
                                            : "opacity-40 border-dragon-gold/10 grayscale"
                                        : isPending
                                            ? "bg-dragon-red/5 border-dragon-red shadow-[0_0_20px_rgba(139,0,0,0.1)] ring-1 ring-dragon-red/20 scale-[1.02]"
                                            : "bg-white/60 border-dragon-gold/10 hover:border-dragon-red/30 hover:bg-white"
                                )}
                            >
                                <div className="absolute inset-0 opacity-5 mix-blend-multiply pointer-events-none">
                                    <img src={ITEM_BACKGROUND} alt="" className="w-full h-full object-cover" />
                                </div>

                                {/* Label Circle */}
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center text-lg font-black shrink-0 relative z-10 border-2 transition-all",
                                    isPending || isSelected 
                                        ? "bg-dragon-red text-white border-dragon-gold" 
                                        : "bg-white/80 text-dragon-red border-dragon-red/10"
                                )}>
                                    {isSelected ? <GameIcon name="check" size={18} color="white" /> : choiceLabel}
                                </div>

                                <div className="flex-1 space-y-2 relative z-10">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black uppercase text-dragon-darkRed tracking-wider leading-tight">
                                                {name}
                                            </span>
                                            {isMultiple && (
                                                <span className="text-[8px] font-bold text-parchment-500 uppercase opacity-60">Bundle of Provisions</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Item Icons List */}
                                    <div className="flex flex-wrap gap-8 pt-2">
                                        {indices.map((idx, iIdx) => {
                                            const details = optionDetails[idx];
                                            const subItem = isMultiple ? choice.items.find((si: any) => (si.of?.index || si.item?.index || si.equipment?.index) === idx) : choice;
                                            const q = subItem?.quantity || subItem?.count || subItem?.choice?.count || 1;
                                            const subIsPack = details?.contents || details?.equipment_pack;

                                            return (
                                                <div key={`${idx}-${iIdx}`} className="flex items-start gap-4">
                                                    <div className="aspect-[9/16] w-14 shrink-0 bg-white rounded-sm border border-dragon-gold/20 overflow-hidden relative shadow-md">
                                                        <div className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none">
                                                            <img src={ITEM_BACKGROUND} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        {details?.imageUrl ? (
                                                            <ChromaKeyImage src={details.imageUrl} alt={details.name} className="h-full w-full object-contain" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-black/5">
                                                                <GameIcon name={subIsPack ? "backpack" : "weapon"} size={20} color="#8B0000" className="opacity-20" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-1.5 max-w-[180px]">
                                                        <span className="text-[10px] font-black uppercase text-dragon-darkRed tracking-wider leading-tight">
                                                            {details?.name || "Item"}
                                                            {q > 1 && <span className="ml-1 text-dragon-gold">x{q}</span>}
                                                        </span>
                                                        
                                                        {subIsPack && details?.contents && (
                                                            <div className="space-y-0.5 border-l border-dragon-gold/30 pl-2 py-0.5">
                                                                <div className="text-[6px] text-dragon-gold font-black uppercase opacity-60 mb-1">Pack Contents:</div>
                                                                {details.contents.map((inc: any, ii: number) => (
                                                                    <div key={ii} className="text-[7px] text-parchment-500 font-bold uppercase leading-tight opacity-90 break-words flex items-start gap-1">
                                                                        <span className="text-dragon-gold/40">•</span>
                                                                        <span>{inc.item?.name || inc.name} {inc.quantity > 1 ? `x${inc.quantity}` : ''}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {isPending && !isCompleted && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <div className="animate-pulse flex items-center gap-1">
                                            <span className="text-[8px] font-black text-dragon-red uppercase tracking-widest">Ready to Manifest</span>
                                            <GameIcon name="sparkles" size={12} color="#8B0000" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }

                    // Original Grid Layout for Categories/Large Sets
                    let mainIdx = indices[0] || "";
                    let quantity = choice.quantity || choice.count || 1;
                    const details = mainIdx ? optionDetails[mainIdx] : null;
                    const isPack = details?.contents || details?.equipment_pack;
                        
                    return (
                        <button
                            key={cIdx}
                            disabled={isCompleted}
                            onClick={() => handleItemClick(cIdx)}
                            title={name}
                            className={cn(
                                "aspect-[9/16] border rounded-sm transition-all group relative flex flex-col items-center justify-between p-1 overflow-hidden shadow-sm",
                                isCompleted 
                                    ? "opacity-40 grayscale cursor-not-allowed border-dragon-gold/10" 
                                    : isPending
                                        ? "bg-dragon-red/5 border-dragon-red ring-2 ring-dragon-red/20 scale-105 z-20 shadow-xl"
                                        : "bg-white border-[#c5a059]/30 hover:border-dragon-red/40 hover:bg-white/80 cursor-pointer hover:shadow-xl hover:-translate-y-1"
                            )}
                        >
                            <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none">
                                <img src={ITEM_BACKGROUND} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-t from-dragon-red to-transparent pointer-events-none" />
                            
                            <div className="w-full h-full bg-black/5 rounded-sm flex items-center justify-center overflow-hidden relative z-10 border border-[#c5a059]/10">
                                {details?.imageUrl ? (
                                    <ChromaKeyImage 
                                        src={details.imageUrl} 
                                        alt={name} 
                                        className="h-[90%] w-auto object-contain filter group-hover:scale-110 transition-transform duration-500" 
                                    />
                                ) : (
                                    <GameIcon name={isPack ? "backpack" : "weapon"} size={16} color="#8B0000" className="opacity-20 group-hover:opacity-40 transition-opacity" />
                                )}

                                {isPack && (
                                    <div className="absolute top-0 right-0 p-0.5">
                                        <GameIcon name="pouch" size={8} color="#B8860B" />
                                    </div>
                                )}
                                
                                {isSelected && (
                                    <div className="absolute inset-0 bg-dragon-red/40 flex items-center justify-center border-2 border-dragon-gold z-30">
                                        <GameIcon name="check" size={20} color="#FFFFFF" />
                                    </div>
                                )}
                            </div>

                            <div className={cn(
                                "absolute inset-x-0 bottom-0 bg-black/95 transition-all p-2 text-center z-20 max-h-[85%] overflow-y-auto custom-scrollbar border-t border-dragon-gold/30",
                                isPending ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full hover:translate-y-0 hover:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
                            )}>
                                <div className="text-[7px] text-white font-black uppercase tracking-tight mb-2 leading-tight">
                                    {name}
                                </div>
                                {isPack && details?.contents && (
                                    <div className="border-t border-white/20 pt-2 mt-1">
                                        <div className="text-[6px] text-dragon-gold font-black uppercase tracking-widest opacity-90 mb-1.5 text-left ml-0.5">Pack Contents:</div>
                                        {details.contents.map((inc: any, iIdx: number) => (
                                            <div key={iIdx} className="text-[5px] text-white/90 text-left ml-1 mb-1 leading-none flex items-start gap-1">
                                                <span className="text-dragon-gold">•</span>
                                                <span className="break-words">{inc.item?.name || inc.name} {inc.quantity > 1 ? `x${inc.quantity}` : ''}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {quantity > 1 && (
                                    <div className="mt-1 text-[6px] text-dragon-gold font-black uppercase border border-dragon-gold/20 inline-block px-1.5 rounded-full bg-dragon-gold/10">
                                        x{quantity}
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export const EquipmentStep: React.FC<{
    newChar: Partial<Character>;
    setNewChar: React.Dispatch<React.SetStateAction<Partial<Character>>>;
}> = ({ newChar, setNewChar }) => {
    const [classData, setClassData] = useState<any>(null);
    const [bgData, setBgData] = useState<any>(null);
    const [equipmentDetails, setEquipmentDetails] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [completedOptions, setCompletedOptions] = useState<Record<string, boolean>>({});
    const [choiceSelections, setChoiceSelections] = useState<Record<string, string[]>>({}); // optKey -> list of selected choice indices

    useEffect(() => {
        const loadEquipment = async () => {
            if (!newChar.class) return;
            setLoading(true);
            try {
                const [cData, bData] = await Promise.all([
                    fetchClassData(newChar.class!),
                    newChar.background ? fetchBackgroundJson(newChar.background) : Promise.resolve(null)
                ]);
                
                setClassData(cData);
                setBgData(bData);
                
                const equipmentToFetch: string[] = [];
                if (cData?.starting_equipment) {
                    for (const eq of cData.starting_equipment) {
                        if (eq.equipment?.index) {
                            equipmentToFetch.push(eq.equipment.index);
                        }
                    }
                }
                if (bData?.starting_equipment) {
                    for (const eq of bData.starting_equipment) {
                        if (eq.equipment?.index) {
                            equipmentToFetch.push(eq.equipment.index);
                        }
                    }
                }

                const uniqueIndices = Array.from(new Set(equipmentToFetch));
                const details: Record<string, any> = {};
                await Promise.all(uniqueIndices.map(async (idx) => {
                    const d = await fetchEquipmentData(idx);
                    if (d) details[idx] = d;
                }));
                setEquipmentDetails(prev => ({ ...prev, ...details }));

                const charId = newChar.id || 'new_character';
                const itemsRegistry: Record<string, ItemInstance> = { ...(newChar.items || {}) };
                const containers: Record<string, InventoryContainer> = { ...(newChar.containers || {}) };
                
                let equipment = newChar.equipment;
                if (!equipment || equipment.slots.length === 0) {
                    equipment = createDefaultEquipment(charId);
                }

                let backpack = Object.values(containers).find(c => c.type === 'backpack');
                if (!backpack) {
                    backpack = createDefaultBackpack(charId);
                    containers[backpack.id] = backpack;
                }

                const processList = async (equipmentList: any[]) => {
                    for (const eq of equipmentList) {
                        const idx = eq.equipment?.index;
                        if (!idx || !details[idx]) continue;
                        
                        // Prevent duplicates for starting gear
                        const alreadyHas = Object.values(itemsRegistry).some(inst => inst.template === idx);
                        if (alreadyHas) continue;

                        const itemMetadata = details[idx];
                        const instance = createItemInstance(idx, eq.quantity || 1, itemMetadata);
                        itemsRegistry[instance.id] = instance;

                        // UNPACK PACKS (Fixed Starting Equipment)
                        if (itemMetadata.contents && Array.isArray(itemMetadata.contents)) {
                            for (const contentItem of itemMetadata.contents) {
                                const cIdx = contentItem.item?.index || contentItem.index;
                                if (cIdx) {
                                    const cData = await fetchEquipmentData(cIdx);
                                    if (cData) {
                                        const subInstance = createItemInstance(cIdx, contentItem.quantity || 1, cData);
                                        itemsRegistry[subInstance.id] = subInstance;
                                        const bagSlot = backpack!.slots.find(s => s.itemId === null);
                                        if (bagSlot) bagSlot.itemId = subInstance.id;
                                    }
                                }
                            }
                        }

                        // Resolve slot
                        const slotId = idx.includes('shield') ? 'off_hand' : 
                                       (itemMetadata.armor_category ? 'chest' : 
                                       (itemMetadata.weapon_category ? 'main_hand' : 'backpack'));
                        
                        if (slotId !== 'backpack') {
                            const targetSlot = equipment?.slots.find(s => s.id === slotId && s.itemId === null);
                            if (targetSlot) {
                                targetSlot.itemId = instance.id;
                            } else {
                                const bagSlot = backpack?.slots.find(s => s.itemId === null);
                                if (bagSlot) bagSlot.itemId = instance.id;
                            }
                        } else {
                            const bagSlot = backpack?.slots.find(s => s.itemId === null);
                            if (bagSlot) bagSlot.itemId = instance.id;
                        }
                    }
                };

                if (cData?.starting_equipment) await processList(cData.starting_equipment);
                if (bData?.starting_equipment) await processList(bData.starting_equipment);

                setNewChar(prev => ({ 
                    ...prev, 
                    items: itemsRegistry,
                    containers,
                    equipment
                }));
            } catch (e) {
                console.error("Error loading equipment step", e);
            } finally {
                setLoading(false);
            }
        };

        loadEquipment();
    }, [newChar.class, newChar.background]);

    const resolveSlotId = async (item: any): Promise<string> => {
        const itemIndex = item.index || '';
        const cat = item.equipment_category?.index || '';
        const armorCat = item.armor_category || '';
        const weaponCat = item.weapon_category || '';

        if (armorCat === 'Shield' || itemIndex === 'shield') return 'off_hand';
        if (armorCat && ['Light', 'Medium', 'Heavy'].includes(armorCat)) return 'chest';
        if (weaponCat || cat === 'weapon') return 'main_hand';
        
        if (itemIndex.includes('focus') || itemIndex.includes('holy_symbol') || itemIndex === 'spellbook') return 'focus';
        if (itemIndex.includes('clothes') || itemIndex.includes('robes')) return 'clothes';
        if (itemIndex.includes('ring')) return 'ring_1';
        if (itemIndex.includes('amulet') || itemIndex.includes('necklace')) return 'neck';
        
        return 'backpack';
    };

    const resolveItemsFromChoice = async (choice: any): Promise<any[]> => {
        if (!choice) return [];
        const type = choice.option_type;
        if (type === 'counted_reference') {
            return [{ index: choice.of.index, quantity: choice.count || 1 }];
        }
        if (type === 'reference') {
            return [{ index: choice.item.index, quantity: choice.quantity || 1 }];
        }
        if (type === 'multiple') {
            const items: any[] = [];
            for (const subItem of choice.items) {
                const subResults = await resolveItemsFromChoice(subItem);
                items.push(...subResults);
            }
            return items;
        }
        if (type === 'choice') {
            if (choice.choice?.from?.options) {
                return resolveItemsFromChoice(choice.choice.from.options[0]);
            }
            return [];
        }
        const index = choice.equipment?.index || choice.index || (choice.item?.index);
        if (index) {
            return [{ index: index, quantity: choice.quantity || 1 }];
        }
        return [];
    };

    const handleChoice = async (opt: any, choiceIdx: number, optKey: string, actualChoice?: any) => {
        const selections = choiceSelections[optKey] || [];
        // Prevent picking more than allowed
        if (selections.length >= (opt.choose || 1)) return;

        const options = opt.from?.options || opt.from?.equipment?.options || [];
        const choice = actualChoice || options[choiceIdx];
        if (!choice) return;
        
        const itemsToProcess = await resolveItemsFromChoice(choice);
        
        setNewChar(prev => {
            const itemsRegistry = { ...(prev.items || {}) };
            const containers = { ...(prev.containers || {}) };
            let equipment = prev.equipment;
            
            const charId = prev.id || 'new_character';
            if (!equipment || equipment.slots.length === 0) equipment = createDefaultEquipment(charId);
            
            let backpack = Object.values(containers).find(c => c.type === 'backpack');
            if (!backpack) {
                backpack = createDefaultBackpack(charId);
                containers[backpack.id] = backpack;
            }

            // Sync backpack back to containers if modified
            const updateBackpackInContainers = (b: InventoryContainer) => {
                containers[b.id] = b;
            };

            const processItemRef = async (itemRef: any) => {
                const index = itemRef.index;
                if (!index) return;
                
                const itemData = await fetchEquipmentData(index);
                if (itemData) {
                    setEquipmentDetails(prevDetails => ({ ...prevDetails, [index]: itemData }));
                    
                    const instance = createItemInstance(index, itemRef.quantity || 1, itemData);
                    itemsRegistry[instance.id] = instance;
                    
                    // Add pack contents if it's a pack
                    if (itemData.contents && Array.isArray(itemData.contents)) {
                        for (const contentItem of itemData.contents) {
                            const cIdx = contentItem.item?.index || contentItem.index;
                            if (cIdx) {
                                const cData = await fetchEquipmentData(cIdx);
                                if (cData) {
                                    const subInstance = createItemInstance(cIdx, contentItem.quantity || 1, cData);
                                    itemsRegistry[subInstance.id] = subInstance;
                                    const bagSlot = backpack!.slots.find(s => s.itemId === null);
                                    if (bagSlot) bagSlot.itemId = subInstance.id;
                                }
                            }
                        }
                    }

                    const slotId = await resolveSlotId(itemData);
                    if (slotId !== 'backpack') {
                        const targetSlot = equipment!.slots.find(s => s.id === slotId && s.itemId === null);
                        if (targetSlot) targetSlot.itemId = instance.id;
                        else {
                            const bagSlot = backpack!.slots.find(s => s.itemId === null);
                            if (bagSlot) bagSlot.itemId = instance.id;
                        }
                    } else {
                        const bagSlot = backpack!.slots.find(s => s.itemId === null);
                        if (bagSlot) bagSlot.itemId = instance.id;
                    }
                }
            };

            itemsToProcess.forEach(item => processItemRef(item));

            return { ...prev, items: itemsRegistry, containers, equipment };
        });

        const newSelections = [...selections, `${choiceIdx}`];
        setChoiceSelections(prev => ({ ...prev, [optKey]: newSelections }));

        if (newSelections.length >= (opt.choose || 1)) {
            setCompletedOptions(prev => ({ ...prev, [optKey]: true }));
        }
        
        soundService.playEffect('UI_CLICK_LIGHT');
    };

    const toggleEquip = async (itemId: string, itemData: any) => {
        setNewChar(prev => {
            const equipment = { ...prev.equipment! };
            const containers = { ...prev.containers! };
            const backpack = Object.values(containers).find(c => c.type === 'backpack')!;
            
            // Find current location
            const currentEquippedSlot = equipment.slots.find(s => s.itemId === itemId);
            const currentBagSlot = backpack.slots.find(s => s.itemId === itemId);

            if (currentEquippedSlot) {
                // Unequip: move to backpack
                currentEquippedSlot.itemId = null;
                const emptyBagSlot = backpack.slots.find(s => s.itemId === null);
                if (emptyBagSlot) emptyBagSlot.itemId = itemId;
                soundService.playEffect('UI_BACK_EXIT');
            } else {
                // Equip
                resolveSlotId(itemData).then(targetSlotId => {
                    setNewChar(p => {
                        const eq = { ...p.equipment! };
                        const conts = { ...p.containers! };
                        const bag = Object.values(conts).find(c => c.type === 'backpack')!;
                        
                        const targetSlot = eq.slots.find(s => s.id === targetSlotId);
                        if (targetSlot) {
                            // If slot occupied, move current item to bag
                            if (targetSlot.itemId) {
                                const bagSlot = bag.slots.find(s => s.itemId === null);
                                if (bagSlot) bagSlot.itemId = targetSlot.itemId;
                            }
                            targetSlot.itemId = itemId;
                            
                            // Remove from bag
                            const bagSrcSlot = bag.slots.find(s => s.itemId === itemId);
                            if (bagSrcSlot) bagSrcSlot.itemId = null;
                        }
                        return { ...p, equipment: eq, containers: conts };
                    });
                });
                soundService.playEffect('EQUIP_ITEM');
            }

            return { ...prev, equipment, containers };
        });
    };

    return (
        <div className="h-full flex gap-6 p-2">
            <div className="w-[60%] flex flex-col gap-6 overflow-hidden">
                <div className="space-y-1 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-dragon-red/10 text-dragon-red border border-dragon-red/20 rounded-sm">
                            <GameIcon name="backpack" size={20} color="currentColor" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-header font-black text-dragon-darkRed uppercase tracking-tight">Armament Selection</h2>
                            <p className="text-[11px] text-parchment-600 font-medium">Equip your starting gear and resolve equipment choices.</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <GameIcon name="refresh" size={40} color="#8B0000" className="animate-spin" />
                        <span className="text-[10px] font-black text-dragon-red/40 uppercase tracking-widest">Hydrating Arsenals...</span>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-8">
                        {/* Fixed Starting Gear */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <GameIcon name="shield" size={14} color="#B8860B" />
                                <h3 className="text-[12px] font-black text-dragon-darkRed uppercase tracking-[0.2em]">Standard Provisions</h3>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                {[...(classData?.starting_equipment || []), ...(bgData?.starting_equipment || [])].map((eq: any, i: number) => {
                                    const item = equipmentDetails[eq.equipment?.index];
                                    const isEquipped = newChar.equipment?.slots.some(s => s.itemId && newChar.items?.[s.itemId]?.template === eq.equipment?.index);
                                    
                                    return (
                                        <div key={i} className="group aspect-[9/16] bg-white border border-[#c5a059]/30 rounded-sm flex flex-col items-center justify-center p-0.5 hover:border-dragon-gold/30 transition-all shadow-sm relative overflow-hidden">
                                            <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none">
                                                <img src={ITEM_BACKGROUND} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                            </div>
                                            <div className="w-full h-full bg-black/5 border border-[#c5a059]/10 rounded-sm overflow-hidden p-0.5 flex items-center justify-center relative z-10">
                                                {item?.imageUrl ? <ChromaKeyImage src={item.imageUrl} alt={item.name} className="h-[90%] w-auto mt-auto object-contain" /> : <GameIcon name="backpack" size={16} color="#B8860B" className="opacity-10 mx-auto" />}
                                                {isEquipped && (
                                                    <div className="absolute inset-0 bg-dragon-red/20 flex items-center justify-center">
                                                        <GameIcon name="check" size={16} color="#8B0000" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 bg-black/95 opacity-0 group-hover:opacity-100 transition-all p-1.5 text-center z-20 max-h-[90%] overflow-y-auto custom-scrollbar border-t border-dragon-gold/30 translate-y-2 group-hover:translate-y-0">
                                                <div className="text-[6px] text-white font-black uppercase tracking-tighter mb-1 leading-tight">{eq.equipment?.name}</div>
                                                {item?.contents && (
                                                    <div className="border-t border-white/20 pt-1 mt-1">
                                                        {item.contents.map((inc: any, ii: number) => (
                                                            <div key={ii} className="text-[5px] text-white/80 text-left ml-1 mb-0.5 leading-none flex items-start gap-1">
                                                                <span className="text-dragon-gold">•</span>
                                                                <span className="truncate">{inc.item?.name || inc.name} {inc.quantity > 1 ? `x${inc.quantity}` : ''}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="text-[5px] text-dragon-gold font-black uppercase mt-1">x{eq.quantity}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Choice Options */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <GameIcon name="sparkles" size={14} color="#B8860B" />
                                <h3 className="text-[12px] font-black text-dragon-darkRed uppercase tracking-[0.2em]">Equipment Choices</h3>
                            </div>
                            <div className="space-y-4">
                                {classData?.starting_equipment_options?.map((opt: any, idx: number) => (
                                    <EquipmentOptionChoice 
                                        key={`class-${idx}`} 
                                        opt={opt} 
                                        idx={idx} 
                                        source="Class" 
                                        completedOptions={completedOptions} 
                                        choiceSelections={choiceSelections}
                                        handleChoice={handleChoice} 
                                    />
                                ))}
                                {bgData?.starting_equipment_options?.map((opt: any, idx: number) => (
                                    <EquipmentOptionChoice 
                                        key={`bg-${idx}`} 
                                        opt={opt} 
                                        idx={idx} 
                                        source="Background" 
                                        completedOptions={completedOptions} 
                                        choiceSelections={choiceSelections}
                                        handleChoice={handleChoice} 
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Full Inventory */}
                        <div className="space-y-4 pt-6 border-t border-dragon-gold/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <GameIcon name="pouch" size={14} color="#B8860B" />
                                    <h3 className="text-[12px] font-black text-dragon-darkRed uppercase tracking-[0.2em]">Manifested Inventory</h3>
                                </div>
                                <span className="text-[8px] font-bold text-parchment-400 uppercase">Click cards to equip</span>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                {Object.values(newChar.containers || {}).find(c => c.type === 'backpack')?.slots.filter(s => s.itemId).map((slot: any) => {
                                    const instance = newChar.items?.[slot.itemId!];
                                    if (!instance) return null;
                                    const item = equipmentDetails[instance.template];
                                    const isEquipped = newChar.equipment?.slots.some(s => s.itemId === slot.itemId);

                                    return (
                                        <button
                                            key={slot.itemId}
                                            onClick={() => toggleEquip(slot.itemId!, item)}
                                            className={cn(
                                                "aspect-[9/16] border rounded-sm flex flex-col items-center justify-center p-0.5 group transition-all text-center relative overflow-hidden shadow-sm",
                                                isEquipped ? "bg-dragon-darkRed text-white border-dragon-gold/40 shadow-lg" : "bg-white border-[#c5a059]/30 hover:border-dragon-red/30"
                                            )}
                                        >
                                            <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none">
                                                <img src={ITEM_BACKGROUND} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                            </div>
                                            <div className="w-full h-full bg-black/5 rounded-sm overflow-hidden p-0.5 flex items-center justify-center relative z-10 border border-[#c5a059]/10">
                                                {item?.imageUrl ? <ChromaKeyImage src={item.imageUrl} alt={item?.name} className="h-[90%] w-auto mx-auto object-contain filter group-hover:scale-110 transition-transform" /> : <GameIcon name="backpack" size={16} color={isEquipped ? "#FFFFFF" : "#B8860B"} className="opacity-20" />}
                                                {isEquipped && <div className="absolute top-1 right-1"><GameIcon name="check" size={10} color="#B8860B" /></div>}
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 bg-black/95 opacity-0 group-hover:opacity-100 transition-all p-1.5 text-center z-20 max-h-[90%] overflow-y-auto custom-scrollbar border-t border-dragon-gold/30 translate-y-2 group-hover:translate-y-0">
                                                <span className="text-[6px] text-white font-black uppercase tracking-tighter block mb-1 leading-tight">{item?.name || instance.template}</span>
                                                {item?.contents && (
                                                    <div className="border-t border-white/20 pt-1 mt-1">
                                                        {item.contents.map((inc: any, ii: number) => (
                                                            <div key={ii} className="text-[5px] text-white/80 text-left ml-1 mb-0.5 leading-none flex items-start gap-1">
                                                                <span className="text-dragon-gold">•</span>
                                                                <span className="truncate">{inc.item?.name || inc.name} {inc.quantity > 1 ? `x${inc.quantity}` : ''}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col gap-6">
                <div className="flex-1 bg-dragon-darkRed/90 border border-dragon-gold/30 rounded-sm p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-paper-texture opacity-5 mix-blend-overlay pointer-events-none" />
                    <div className="w-full max-w-[280px] relative z-10 filter drop-shadow-[0_0_30px_rgba(255,215,0,0.2)]">
                        <EquipmentDoll alignment={newChar.alignment || 'Neutral'} equipment={newChar.equipment} items={newChar.items} equipmentDetails={equipmentDetails} showSupplements={true} maxWidth="100%" />
                    </div>
                    <div className="mt-8 text-center relative z-10 border-t border-dragon-gold/20 pt-4 w-full">
                        <h4 className="text-xl font-header font-black text-dragon-gold uppercase tracking-[0.2em] mb-1">Combat Posture</h4>
                    </div>
                </div>
            </div>
        </div>
    );
};
