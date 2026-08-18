import React from 'react';
import { GameIcon } from '../../../game_icons';
import { SpeciesSprite } from '../species/SpeciesSprite';
import { SelectionTraits } from './SelectionTraits';
import { SelectionLore } from './SelectionLore';
import { normalizeImageUrl } from '../../../services/storageService';

interface SelectionDetailProps {
  category: string;
  detailData: any;
  loadingDetail: boolean;
  selectedKey?: string;
  hydratedTraits?: Record<string, any>;
}

export const SelectionDetail: React.FC<SelectionDetailProps> = ({
  category,
  detailData,
  loadingDetail,
  selectedKey = '',
  hydratedTraits = {}
}) => {
  if (loadingDetail) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white/40 border border-dragon-gold/20 rounded-sm p-6">
        <GameIcon name="refresh" color="#B8860B" size={24} className="animate-spin" />
      </div>
    );
  }

  if (!detailData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white/40 border border-dragon-gold/20 rounded-sm p-6 text-center opacity-30 space-y-2">
        <GameIcon name="info" size={36} color="currentColor" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Examine Records</p>
      </div>
    );
  }

  const artUrl = detailData.imageUrl;
  const lorePath = selectedKey === 'dwarf' ? '/assets/atlas/lore/species/dwarf.md' : undefined;

  const descText = (() => {
    const desc = detailData.desc || detailData.lore || detailData.description;
    if (Array.isArray(desc)) return desc.join('\n\n');
    return typeof desc === 'string' ? desc : "Historical records regarding this lineage are recorded in the Atlas.";
  })();

  const traitsList = detailData.traits || detailData.stats?.proficiencies || detailData.proficiencies || detailData.starting_proficiencies || [];

  return (
    <div className="flex-1 bg-white/40 border border-dragon-gold/20 rounded-sm p-4 relative overflow-hidden flex flex-col">
      <div className="h-full overflow-y-auto custom-scrollbar pr-2 space-y-5">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row gap-6 items-start border-b border-dragon-gold/15 pb-4">
          {(category === 'species' || artUrl) && (
            <div className="w-36 h-36 lg:w-44 lg:h-44 bg-dragon-red/5 border-2 border-dragon-gold/20 shadow-md overflow-hidden p-2 shrink-0 rounded-sm relative flex items-center justify-center">
              {category === 'species' ? (
                <div className="w-full h-full flex items-center justify-center relative z-10 p-1">
                  <SpeciesSprite
                    speciesKey={detailData?.index || selectedKey}
                    alt={detailData?.name}
                    fallbackUrl={artUrl ? normalizeImageUrl(artUrl, category, detailData.index) : undefined}
                    className="drop-shadow-xl max-h-full object-contain"
                  />
                </div>
              ) : (
                <img
                  src={normalizeImageUrl(artUrl, category, detailData.index)}
                  alt={detailData.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain relative z-10 drop-shadow-xl"
                />
              )}
            </div>
          )}

          <div className="flex-1 space-y-3">
            <h3 className="text-4xl font-header font-black text-dragon-darkRed uppercase tracking-wide leading-none">
              {detailData.name}
            </h3>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {category === 'species' ? (
                <>
                  <div className="flex flex-col border-b border-dragon-gold/20 pb-1.5 bg-gradient-to-t from-dragon-gold/5 to-transparent px-2.5 rounded-t-sm">
                    <span className="text-[9px] font-black uppercase text-parchment-500 tracking-wider">Velocity</span>
                    <span className="text-xl font-header font-black text-dragon-red uppercase">{detailData.stats?.speed || '30'} ft.</span>
                  </div>
                  <div className="flex flex-col border-b border-dragon-gold/20 pb-1.5 bg-gradient-to-t from-dragon-gold/5 to-transparent px-2.5 rounded-t-sm">
                    <span className="text-[9px] font-black uppercase text-parchment-500 tracking-wider">Magnitude</span>
                    <span className="text-xl font-header font-black text-dragon-red uppercase">{detailData.stats?.size || 'Medium'}</span>
                  </div>
                </>
              ) : category === 'class' ? (
                <>
                  <div className="flex flex-col border-b border-dragon-gold/20 pb-1.5 bg-gradient-to-t from-dragon-gold/5 to-transparent px-2.5 rounded-t-sm">
                    <span className="text-[9px] font-black uppercase text-parchment-500 tracking-wider">Hit Die</span>
                    <span className="text-xl font-header font-black text-dragon-red uppercase">d{detailData.stats?.hit_die || '8'}</span>
                  </div>
                  <div className="flex flex-col border-b border-dragon-gold/20 pb-1.5 bg-gradient-to-t from-dragon-gold/5 to-transparent px-2.5 rounded-t-sm">
                    <span className="text-[9px] font-black uppercase text-parchment-500 tracking-wider">Saves</span>
                    <span className="text-xs font-black text-dragon-red uppercase truncate">
                      {detailData.stats?.saving_throws?.map((s: any) => s.name || s).join(', ') || 'Standard'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="col-span-2 flex flex-col border-b border-dragon-gold/20 pb-1.5 bg-gradient-to-t from-dragon-gold/5 to-transparent px-2.5 rounded-t-sm">
                  <span className="text-[9px] font-black uppercase text-parchment-500 tracking-wider">Origin Calling</span>
                  <span className="text-lg font-header font-black text-dragon-red uppercase">{detailData.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feature for background */}
        {category === 'backgrounds' && detailData.feature && (
          <div className="p-3 bg-dragon-gold/10 border border-dragon-gold/20 rounded-sm space-y-1">
            <h5 className="text-[10px] font-black text-dragon-darkRed uppercase tracking-wider flex items-center gap-1.5">
              <GameIcon name="star" size={12} color="#B8860B" />
              Background Feature: {detailData.feature.name}
            </h5>
            <p className="text-[11px] font-bold text-parchment-800 leading-normal italic">
              {Array.isArray(detailData.feature.desc) ? detailData.feature.desc.join(' ') : detailData.feature.desc}
            </p>
          </div>
        )}

        {/* Starting equipment for background */}
        {category === 'backgrounds' && (detailData.starting_equipment || detailData.starting_equipment_options) && (
          <div className="space-y-1.5">
            <h5 className="text-[10px] font-black text-dragon-red uppercase tracking-wider flex items-center gap-1.5">
              <GameIcon name="shield" size={12} color="currentColor" />
              Starting Equipment & Gear
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {(detailData.starting_equipment || []).map((eq: any, i: number) => (
                <div key={i} className="px-2.5 py-1 bg-parchment-100 border border-dragon-gold/25 rounded-sm text-[9px] font-black text-dragon-darkRed uppercase tracking-tight shadow-sm">
                  {eq.equipment?.name || eq.name} {eq.quantity > 1 ? `x${eq.quantity}` : ''}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Traits & Proficiencies */}
        <SelectionTraits
          traits={traitsList}
          hydratedTraits={hydratedTraits}
          title={
            category === 'species' ? 'Ancestral Traits' :
            category === 'class' ? 'Core Proficiencies' :
            category === 'backgrounds' ? 'Learned Proficiencies' : 'Innate Traits'
          }
        />

        {/* Lore / Description */}
        <SelectionLore
          summaryText={descText}
          loreFilePath={lorePath}
          loreTitle={`${detailData.name} Lore Archives`}
        />
      </div>
    </div>
  );
};
