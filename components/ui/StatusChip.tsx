import { cn } from '@/lib/utils'

type StatusType = 'selesai' | 'menunggu' | 'ditolak' | 'draft'

interface StatusChipProps {
  status: StatusType
  className?: string
}

const STATUS_CONFIG: Record<
  StatusType,
  { label: string; icon: string; className: string }
> = {
  selesai: {
    label: 'Selesai',
    icon: 'done_all',
    className:
      'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]',
  },
  menunggu: {
    label: 'Menunggu Verifikasi',
    icon: 'hourglass_top',
    className:
      'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]',
  },
  ditolak: {
    label: 'Ditolak',
    icon: 'cancel',
    className:
      'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]',
  },
  draft: {
    label: 'Draft',
    icon: 'edit_note',
    className:
      'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]',
  },
}

export default function StatusChip({ status, className }: StatusChipProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-md font-label-md font-semibold whitespace-nowrap',
        config.className,
        className,
      )}
    >
      <span className="ms text-[14px]">{config.icon}</span>
      {config.label}
    </span>
  )
}
