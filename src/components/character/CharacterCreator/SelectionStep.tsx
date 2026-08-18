import React, { useState, useEffect } from 'react';
import { SelectionIntro } from './SelectionIntro';
import { SelectionList } from './SelectionList';
import { SelectionDetail } from './SelectionDetail';
import { SelectionHelp } from './SelectionHelp';
import { 
  fetchSpeciesWikiData, fetchSpeciesData,
  fetchClassWikiData, fetchClassData,
  fetchBackgroundData, fetchAlignmentData,
  fetchSubraceData, fetchTraitData, fetchWikiAsset
} from '../../../services/storageService';
import { soundService } from '../../../services/soundService';

export const SelectionStep: React.FC<{
  title: string;
  desc: string;
  items: { name: string; index: string }[];
  selected?: string;
  onSelect: (val: string) => void;
  category: string;
}> = ({ title, desc, items, selected, onSelect, category }) => {
  const [detailData, setDetailData] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [hydratedTraits, setHydratedTraits] = useState<Record<string, any>>({});
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    if (selected) {
      fetchDetail(selected);
    }
  }, [selected]);

  const fetchDetail = async (index: string) => {
    setDetailData(null);
    setLoadingDetail(true);
    let data = null;
    let statsData = null;
    try {
      if (category === 'species') {
        data = await fetchSpeciesWikiData(index);
        statsData = await fetchSpeciesData(index);
      } else if (category === 'subrace') {
        data = await fetchSubraceData(index);
        statsData = data;
      } else if (category === 'class') {
        data = await fetchClassWikiData(index);
        statsData = await fetchClassData(index);
      } else if (category === 'backgrounds') {
        data = await fetchBackgroundData(index);
      } else if (category === 'alignments') {
        data = await fetchAlignmentData(index);
      }

      setDetailData({ ...data, stats: statsData });

      // Hydrate traits/proficiencies for tooltips
      const traits = (data?.traits || statsData?.proficiencies || data?.proficiencies || []).slice(0, 20);
      const traitPromises = traits.map(async (t: any) => {
        const tIndex = t.index || (typeof t === 'string' ? t.toLowerCase().replace(/\s+/g, '_') : '');
        const tUrl = t.url;

        let tData = null;
        if (tUrl && !tUrl.includes('/json/')) {
          if (tUrl.includes('/traits/')) {
            tData = await fetchTraitData(tIndex);
          } else {
            tData = await fetchWikiAsset(tUrl);
          }
        } else if (tIndex) {
          tData = await fetchTraitData(tIndex);
        }

        if (tData) return { id: tIndex || (t.name || t), data: tData };
        return null;
      });

      const results = await Promise.all(traitPromises);
      const traitsMap: Record<string, any> = {};
      results.forEach(r => {
        if (r) traitsMap[r.id] = r.data;
      });
      setHydratedTraits(traitsMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const choiceAssetPath =
    category === 'species' ? '/assets/ui/official/races/race_choice.md' :
    category === 'class' ? '/assets/ui/official/classes/class_choice.md' :
    category === 'backgrounds' ? '/assets/ui/official/backgrounds/background_choice.md' :
    category === 'equipment' ? '/assets/atlas/equipment/equipment_choice.md' : undefined;

  const handleItemSelect = (val: string) => {
    soundService.playEffect('UI_CHARACTER_SELECT');
    onSelect(val);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden p-2 space-y-3">
      {/* Introduction Banner */}
      <SelectionIntro
        title={title}
        desc={desc}
        choiceAssetPath={choiceAssetPath}
      />

      {/* Main Workspace: List and Detail */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden min-h-0">
        <SelectionList
          items={items}
          selected={selected}
          onSelect={handleItemSelect}
          category={category}
        />

        <SelectionDetail
          category={category}
          detailData={detailData}
          loadingDetail={loadingDetail}
          selectedKey={selected}
          hydratedTraits={hydratedTraits}
          choiceAssetPath={choiceAssetPath}
        />
      </div>
    </div>
  );
};
