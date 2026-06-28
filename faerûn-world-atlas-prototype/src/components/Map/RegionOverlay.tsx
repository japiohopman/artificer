import { SVGOverlay } from "react-leaflet";
import L from "leaflet";

interface RegionOverlayProps {
  key?: string | number;
  id: string;
  path: string;
  bounds: [[number, number], [number, number]];
  viewBox?: string;
  transform?: string;
  active?: boolean;
  hovered?: boolean;
  color?: string;
  pickingMode?: boolean;
  onHover?: (id: string | null) => void;
  onClick?: (id: string) => void;
}

export default function RegionOverlay({ 
  id,
  path, 
  bounds, 
  viewBox = "0 0 1000 1000", 
  transform,
  active, 
  hovered,
  color = "#D4AF37",
  pickingMode,
  onHover,
  onClick
}: RegionOverlayProps) {
  // We wrap the SVG path in an SVG element that covers the bounds
  
  return (
    <SVGOverlay bounds={bounds as L.LatLngBoundsExpression}>
      <svg
        viewBox={viewBox}
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={path}
          fill={active || hovered ? `${color}44` : `${color}05`}
          stroke={active || hovered ? color : "transparent"}
          strokeWidth={(active || hovered) ? "3" : "1"}
          transform={transform}
          fillRule="evenodd"
          className="transition-all duration-500 ease-in-out cursor-pointer hover:stroke-[4]"
          onMouseEnter={() => onHover?.(id)}
          onMouseLeave={() => onHover?.(null)}
          onClick={(e) => {
            if (pickingMode) return;
            L.DomEvent.stopPropagation(e);
            onClick?.(id);
          }}
          style={{
            filter: (active || hovered) ? `drop-shadow(0 0 15px ${color}88)` : "none",
            pointerEvents: pickingMode ? "none" : "auto"
          }}
        />
      </svg>
    </SVGOverlay>
  );
}
