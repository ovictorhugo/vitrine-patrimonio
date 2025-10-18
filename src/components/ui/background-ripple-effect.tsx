"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib";

type BackgroundRippleEffectProps = {
  height?: number | string;
  cellSize?: number;
  borderColor?: string;
  interactive?: boolean;
  className?: string;
  maxColoredCells?: number; // Quantidade máxima de quadrados coloridos
};

export const BackgroundRippleEffect = ({
  height = 400,
  cellSize = 56,
  borderColor = "var(--cell-border-color, #e4e4e7)",
  interactive = true,
  className,
  maxColoredCells = 10, // Máximo de quadrados coloridos
}: BackgroundRippleEffectProps) => {
  const [autoCols, setAutoCols] = useState<number>(0);
  const [autoRows, setAutoRows] = useState<number>(0);
  const [coloredCells, setColoredCells] = useState<Set<number>>(new Set()); // Armazenar células coloridas
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const heightStyle = typeof height === "number" ? `${height}px` : height;

  useEffect(() => {
    if (!wrapperRef.current) return;
    const el = wrapperRef.current;

    const computeGrid = () => {
      const width = el.clientWidth;
      const cols = Math.max(1, Math.floor(width / cellSize));
      const hPx =
        typeof height === "number"
          ? height
          : el.clientHeight || el.getBoundingClientRect().height || 0;
      const rows = Math.max(1, Math.floor(hPx / cellSize));

      setAutoCols(cols);
      setAutoRows(rows);
    };

    computeGrid();

    const ro = new ResizeObserver(() => computeGrid());
    ro.observe(el);
    return () => ro.disconnect();
  }, [cellSize, height]);

  // Animação das células coloridas para mudar de posição a cada X tempo
  useEffect(() => {
    const interval = setInterval(() => {
      setColoredCells(new Set(Array.from({ length: maxColoredCells }, () => Math.floor(Math.random() * (autoRows * autoCols)))));
    }, 3000); // Tempo de animação: 2000ms (2 segundos)

    return () => clearInterval(interval); // Limpar o intervalo ao desmontar o componente
  }, [autoRows, autoCols, maxColoredCells]);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "relative w-full overflow-hidden",
        "[--cell-border-color:var(--zinc-300)] [--cell-shadow-color:var(--zinc-800)]",
        "dark:[--cell-border-color:var(--zinc-700)] dark:[--cell-shadow-color:var(--zinc-900)]",
        className
      )}
      style={{ height: heightStyle }}
    >
      {/* GRID */}
      <DivGrid
        rows={autoRows || 1}
        cols={autoCols || 1}
        cellSize={cellSize}
        borderColor={borderColor}
        interactive={interactive}
        maxColoredCells={maxColoredCells} // Passa o limite de células coloridas
        coloredCells={coloredCells} // Passa as células coloridas
        setColoredCells={setColoredCells} // Atualiza o estado das células coloridas
      />

      {/* GRADIENTE SUPERIOR */}
      <div
        className={cn(
          "pointer-events-none absolute top-0 z-[1] left-0 w-full h-2/6",
          "bg-gradient-to-t from-transparent to-neutral-50",
          "dark:to-neutral-900"
        )}
      />

      {/* GRADIENTE INFERIOR */}
      <div
        className={cn(
          "pointer-events-none absolute bottom-0 z-[1] left-0 w-full h-2/6",
          "bg-gradient-to-b from-transparent to-neutral-50",
          "dark:to-neutral-900"
        )}
      />
    </div>
  );
};

type DivGridProps = {
  rows: number;
  cols: number;
  cellSize: number;
  borderColor: string;
  interactive?: boolean;
  maxColoredCells: number;
  coloredCells: Set<number>;
  setColoredCells: React.Dispatch<React.SetStateAction<Set<number>>>;
};

const DivGrid = ({
  rows,
  cols,
  cellSize,
  borderColor,
  interactive,
  maxColoredCells,
  coloredCells,
  setColoredCells,
}: DivGridProps) => {
  const cells = useMemo(() => Array.from({ length: rows * cols }, (_, idx) => idx), [rows, cols]);

  // Definindo uma lista de cores aleatórias para as células
  const colors = [
    "bg-eng-blue",
    "bg-eng-dark-blue",
  ];

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    width: cols * cellSize,
    height: rows * cellSize,
    marginInline: "auto",
  };

  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  return (
    <div className="relative z-[1]" style={gridStyle}>
      {cells.map((idx) => {
        const rowIdx = Math.floor(idx / cols);
        const colIdx = idx % cols;

        // Lógica para borda, garantindo a remoção nas extremidades
        const borders: string[] = [];
        const borderStyle = "border-[0.5px]"; // Borda fina e consistente
        if (rowIdx > 0) borders.push("border-t-[0.5px]"); // Não coloca borda superior na primeira linha
        if (colIdx > 0) borders.push("border-l-[0.5px]"); // Não coloca borda esquerda na primeira coluna

        // Verifica se a célula foi colorida e aplica a cor
        const isColored = coloredCells.has(idx);
        const randomColor = isColored ? getRandomColor() : ""; // Cor aleatória aplicada se a célula foi colorida

        return (
          <div
            key={idx}
            className={cn(
              "relative opacity-40 transition-opacity duration-150 will-change-transform hover:opacity-80",
              borders.join(" "),
              "dark:shadow-[0px_0px_40px_1px_var(--cell-shadow-color)_inset]",
              !interactive && "pointer-events-none",
              isColored && randomColor // Aplica cor aleatória se a célula for colorida
            )}
            style={{
              backgroundColor: randomColor, // Aplica cor aleatória ou transparente
              borderColor: borderColor,
              borderWidth: borderStyle, // Aplica a espessura da borda
            }}
          />
        );
      })}
    </div>
  );
};
