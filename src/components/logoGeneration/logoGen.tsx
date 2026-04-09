import React, { useState } from "react";

const GeradorCodigoBarras = () => {
  const totalSlots = 15;
  const emptySlotIndex = 14;
  const centerIndex = (totalSlots - 2) / 2; // O meio das 14 barras (índice 6.5)

  // Constantes de dimensão
  const thickWidth = 12;
  const thinWidth = 4;
  const shiftX = 7;
  const itemGap = 12;
  const incline = 3; // Rampa do topo
  const barColor = "#559FB8";

  // ==========================================
  // ESTADOS: BARRAS GROSSAS (Fundo)
  // ==========================================
  const [meanHeightThick, setMeanHeightThick] = useState(150);
  const [slopeThick, setSlopeThick] = useState(8);
  const [offsetThick, setOffsetThick] = useState(0);

  // ==========================================
  // ESTADOS: BARRAS FINAS (Frente)
  // ==========================================
  const [meanHeightThin, setMeanHeightThin] = useState(120);
  const [slopeThin, setSlopeThin] = useState(5);
  const [offsetThin, setOffsetThin] = useState(0);

  // Cálculos de dimensão do SVG
  const slotWidth = Math.max(thickWidth, thinWidth) + itemGap;
  const svgWidth = totalSlots * slotWidth + shiftX + 20;

  // Cálculo de altura máxima dinâmica para o ViewBox
  const maxPossibleH =
    Math.max(meanHeightThick, meanHeightThin) +
    Math.max(Math.abs(slopeThick), Math.abs(slopeThin)) * totalSlots;
  const baseY = maxPossibleH + incline + 40;
  const svgHeight = baseY + 10;

  const renderBars = (type: "thick" | "thin") => {
    const isThick = type === "thick";
    const offset = isThick ? offsetThick : offsetThin;
    const slope = isThick ? slopeThick : slopeThin;
    const mean = isThick ? meanHeightThick : meanHeightThin;
    const width = isThick ? thickWidth : thinWidth;
    const currentShift = isThick ? 0 : shiftX;

    return Array.from({ length: totalSlots }).map((_, i) => {
      const mathIndex = (i + offset) % totalSlots;

      if (mathIndex === emptySlotIndex) return null;

      /**
       * EQUAÇÃO ATUALIZADA:
       * Altura = Média + (Inclinação * Distância do Centro)
       */
      const rawH = mean + slope * (mathIndex - centerIndex);

      // Trava para que a altura nunca seja menor que 0
      const h = Math.max(0, Math.floor(rawH));

      const midX = i * slotWidth + slotWidth / 2 + currentShift;
      const xStart = midX - width / 2;
      const xEnd = midX + width / 2;

      return (
        <polygon
          key={`${type}-${i}`}
          points={`
            ${xStart},${baseY} 
            ${xEnd},${baseY} 
            ${xEnd},${baseY - (h + incline)} 
            ${xStart},${baseY - h}
          `}
          fill={barColor}
          style={{ transition: "all 0.1s ease-out" }}
        />
      );
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 rounded-xl shadow-lg font-sans">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Gerador de Barras (Média + Inclinação)
      </h2>

      <div className="mb-8 flex justify-center bg-white p-6 rounded-lg shadow-sm border border-gray-200 overflow-x-auto relative z-10">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="fileira-grossas">{renderBars("thick")}</g>
          <g id="fileira-finas">{renderBars("thin")}</g>
        </svg>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 relative z-20 space-y-8">
        {/* Controles Grossas */}
        <div className="border-l-4 border-gray-400 pl-4">
          <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">
            Barras Grossas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 mb-1">
                Rotação: {offsetThick}
              </label>
              <input
                type="range"
                min="0"
                max={totalSlots - 1}
                value={offsetThick}
                onChange={(e) => setOffsetThick(Number(e.target.value))}
                className="accent-gray-600"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 mb-1">
                Altura Média: {meanHeightThick}px
              </label>
              <input
                type="range"
                min="0"
                max="300"
                value={meanHeightThick}
                onChange={(e) => setMeanHeightThick(Number(e.target.value))}
                className="accent-gray-600"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 mb-1">
                Inclinação: {slopeThick}
              </label>
              <input
                type="range"
                min="-30"
                max="30"
                value={slopeThick}
                onChange={(e) => setSlopeThick(Number(e.target.value))}
                className="accent-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Controles Finas */}
        <div className="border-l-4 border-blue-400 pl-4">
          <h3 className="text-sm font-bold text-blue-700 mb-4 uppercase tracking-wider">
            Barras Finas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 mb-1">
                Rotação: {offsetThin}
              </label>
              <input
                type="range"
                min="0"
                max={totalSlots - 1}
                value={offsetThin}
                onChange={(e) => setOffsetThin(Number(e.target.value))}
                className="accent-blue-600"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 mb-1">
                Altura Média: {meanHeightThin}px
              </label>
              <input
                type="range"
                min="0"
                max="300"
                value={meanHeightThin}
                onChange={(e) => setMeanHeightThin(Number(e.target.value))}
                className="accent-blue-600"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 mb-1">
                Inclinação: {slopeThin}
              </label>
              <input
                type="range"
                min="-30"
                max="30"
                value={slopeThin}
                onChange={(e) => setSlopeThin(Number(e.target.value))}
                className="accent-blue-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeradorCodigoBarras;
