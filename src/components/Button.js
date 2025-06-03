// src/components/ui/button.js
export default function Button({ children, onClick, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.75rem 1.5rem",
        backgroundColor: "#10B981",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
