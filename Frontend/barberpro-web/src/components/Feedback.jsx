export default function Feedback({ message, type }) {
  if (!message) return null;

  return <p className={`feedback ${type || ''}`}>{message}</p>;
}
