// src/components/Tile.jsx


export default function Tile({ value, index, onClick }) {
    const isBlank = value === 0;
    return (
      <button
        type="button"
        onClick={() => onClick(index)}
        disabled={isBlank}
        className={
          "select-none aspect-square rounded-md text-lg font-semibold " +
          (isBlank
            ? "bg-transparent"
            : "bg-gray-200 hover:bg-gray-300 active:scale-[.98] shadow-sm")
        }
        aria-label={isBlank ? "blank" : `tile ${value}`}
      >
        {!isBlank && <span>{value}</span>}
      </button>
    );
  }
  