export default function SkeletonLoader() {
  return (
    <div className="skeleton">
      <div className="skeleton-card skeleton-card-large" />
      <div className="skeleton-card skeleton-card-medium" />
      <div className="skeleton-line" />
      <div className="skeleton-row">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton-chip" />
        ))}
      </div>
    </div>
  );
}
