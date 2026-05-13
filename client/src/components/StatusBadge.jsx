const styles = {
  PENDING:      'bg-f-amber/10 text-f-amber border border-f-amber/20',
  UNDER_REVIEW: 'bg-f-blue/10 text-f-blue border border-f-blue/20',
  SHORTLISTED:  'bg-f-violet/10 text-f-violet border border-f-violet/20',
  ACCEPTED:     'bg-f-green/10 text-f-green border border-f-green/20',
  REJECTED:     'bg-f-red/10 text-f-red border border-f-red/20',
  NOT_STARTED:  'bg-raised text-ash border border-edge',
  IN_PROGRESS:  'bg-f-blue/10 text-f-blue border border-f-blue/20',
  COMPLETED:    'bg-f-green/10 text-f-green border border-f-green/20',
};

const labels = {
  PENDING:      'Pending',
  UNDER_REVIEW: 'Under Review',
  SHORTLISTED:  'Shortlisted',
  ACCEPTED:     'Accepted',
  REJECTED:     'Rejected',
  NOT_STARTED:  'Not Started',
  IN_PROGRESS:  'In Progress',
  COMPLETED:    'Completed',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`badge text-[11px] ${styles[status] || 'bg-raised text-ash border border-edge'}`}>
      {labels[status] || status}
    </span>
  );
}
