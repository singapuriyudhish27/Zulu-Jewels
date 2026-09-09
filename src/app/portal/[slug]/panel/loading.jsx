export default function AdminPanelLoading() {
  return (
    <div className="admin-page-skeleton" role="status" aria-label="Loading content">
      <div className="admin-skeleton-bar" />
      <div className="admin-skeleton-header">
        <div className="admin-skeleton-title" />
        <div className="admin-skeleton-subtitle" />
      </div>
      <div className="admin-skeleton-card">
        <div className="admin-skeleton-line" style={{ width: '40%' }} />
        <div className="admin-skeleton-line" style={{ width: '85%' }} />
        <div className="admin-skeleton-line" style={{ width: '70%' }} />
        <div className="admin-skeleton-line" style={{ width: '95%' }} />
      </div>
    </div>
  );
}
