import { AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react'
import Modal from './Modal.jsx'

const copy = {
  vi: {
    completeTitle: 'Xác nhận hoàn thành?',
    completeMessage: 'Bạn có chắc muốn đánh dấu mục này là đã xong không?',
    reopenTitle: 'Đổi lại chưa xong?',
    reopenMessage: 'Bạn có chắc muốn đưa mục này về trạng thái chưa xong không?',
    paidTitle: 'Xác nhận đã thanh toán?',
    paidMessage: 'Bạn có chắc hóa đơn này đã được thanh toán không?',
    unpaidTitle: 'Đổi lại chưa thanh toán?',
    unpaidMessage: 'Bạn có chắc muốn đổi hóa đơn này về trạng thái chưa thanh toán không?',
    deleteTitle: 'Xóa mục này?',
    deleteMessage: 'Hành động này sẽ xóa dữ liệu khỏi app. Bạn có chắc muốn xóa không?',
    cancel: 'Không, giữ lại',
    complete: 'Đúng, đã xong',
    reopen: 'Đổi lại',
    paid: 'Đúng, đã trả',
    unpaid: 'Đổi lại',
    delete: 'Xóa',
  },
  en: {
    completeTitle: 'Mark as complete?',
    completeMessage: 'Are you sure you want to mark this item as complete?',
    reopenTitle: 'Mark as not done?',
    reopenMessage: 'Are you sure you want to move this item back to active?',
    paidTitle: 'Mark bill as paid?',
    paidMessage: 'Are you sure this bill has been paid?',
    unpaidTitle: 'Mark bill as unpaid?',
    unpaidMessage: 'Are you sure you want to mark this bill as unpaid?',
    deleteTitle: 'Delete this item?',
    deleteMessage: 'This will remove the item from the app. Are you sure you want to delete it?',
    cancel: 'No, keep it',
    complete: 'Yes, complete',
    reopen: 'Change it back',
    paid: 'Yes, paid',
    unpaid: 'Change it back',
    delete: 'Delete',
  },
}

function dialogText(type, lang) {
  const c = copy[lang] || copy.en
  if (type === 'delete') return { title: c.deleteTitle, message: c.deleteMessage, confirm: c.delete }
  if (type === 'reopen') return { title: c.reopenTitle, message: c.reopenMessage, confirm: c.reopen }
  if (type === 'paid') return { title: c.paidTitle, message: c.paidMessage, confirm: c.paid }
  if (type === 'unpaid') return { title: c.unpaidTitle, message: c.unpaidMessage, confirm: c.unpaid }
  return { title: c.completeTitle, message: c.completeMessage, confirm: c.complete }
}

export default function ConfirmDialog({ open, type = 'complete', itemTitle, lang = 'en', onCancel, onConfirm }) {
  const c = copy[lang] || copy.en
  const text = dialogText(type, lang)
  const isDelete = type === 'delete'
  const Icon = isDelete ? Trash2 : type === 'complete' || type === 'paid' ? CheckCircle2 : AlertTriangle

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={text.title}
      footer={(
        <>
          <button className="btn-secondary" onClick={onCancel}>{c.cancel}</button>
          <button
            className={isDelete ? 'inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 font-bold text-white shadow-soft hover:bg-rose-700' : 'btn-primary'}
            onClick={onConfirm}
          >
            {text.confirm}
          </button>
        </>
      )}
    >
      <div className="flex items-start gap-3">
        <div className={isDelete ? 'mt-0.5 rounded-2xl bg-rose-50 p-3 text-rose-600' : 'mt-0.5 rounded-2xl bg-brand-50 p-3 text-brand-700'}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-ink-600">{text.message}</p>
          {itemTitle ? <p className="mt-3 rounded-xl bg-ink-50 px-3 py-2 text-sm font-semibold text-ink-900 break-words">{itemTitle}</p> : null}
        </div>
      </div>
    </Modal>
  )
}
