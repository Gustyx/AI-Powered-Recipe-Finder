
export default function Card({ children, style }) {
  return (
    <div style={{ padding: "1rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", background: "#fff", ...style }}>
      {children}
    </div>
  );
}
