/**
 * Booking utilities - SafeArrayOps, DataValidators, ConflictChecker
 * Runtime safety: guard all array operations, validate inputs, detect conflicts
 */

/** Safe array operations - guard against null/undefined */
export const SafeArrayOps = {
  /** Return array or empty array */
  ensure<T>(value: T[] | null | undefined): T[] {
    return Array.isArray(value) ? value : []
  },

  /** Map with null safety */
  map<T, U>(items: T[] | null | undefined, fn: (item: T) => U): U[] {
    const arr = Array.isArray(items) ? items : []
    return arr.map(fn)
  },

  /** Filter with null safety */
  filter<T>(items: T[] | null | undefined, fn: (item: T) => boolean): T[] {
    const arr = Array.isArray(items) ? items : []
    return arr.filter(fn)
  },

  /** Find with null safety */
  find<T>(items: T[] | null | undefined, fn: (item: T) => boolean): T | undefined {
    const arr = Array.isArray(items) ? items : []
    return arr.find(fn)
  },

  /** Reduce with null safety */
  reduce<T, U>(items: T[] | null | undefined, fn: (acc: U, item: T) => U, initial: U): U {
    const arr = Array.isArray(items) ? items : []
    return arr.reduce(fn, initial)
  },
}

/** Data validators for booking inputs */
export const DataValidators = {
  /** Timeline: Quote <= Confirmed <= Pre-arrival <= In-stay start <= In-stay end <= Post-stay */
  isValidTimelineOrder(stages: Array<{ stage: string; timestamp: string }>): boolean {
    const order = ['quote', 'confirmed', 'pre_arrival', 'in_stay', 'post_stay']
    const timestamps = order.map((s) => {
      const stage = stages?.find((st) => st.stage === s)
      return stage?.timestamp ? new Date(stage.timestamp).getTime() : null
    })
    for (let i = 1; i < timestamps.length; i++) {
      const prev = timestamps[i - 1]
      const curr = timestamps[i]
      if (prev != null && curr != null && curr < prev) return false
    }
    return true
  },

  /** Payment: due date valid, amount positive */
  isValidPayment(milestone: { due_date: string; amount: number }): boolean {
    const d = new Date(milestone.due_date)
    if (Number.isNaN(d.getTime())) return false
    return typeof milestone.amount === 'number' && milestone.amount >= 0
  },

  /** Attachment: valid mime, size within limit */
  isValidAttachment(file: { type?: string; size?: number }): { valid: boolean; error?: string } {
    const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.type && !ALLOWED.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Use PDF, JPEG, PNG, or DOC.' }
    }
    if (file.size != null && file.size > MAX_SIZE) {
      return { valid: false, error: 'File too large (max 10MB)' }
    }
    return { valid: true }
  },

  /** Required fields for stage */
  requiredFieldsForStage(stage: string): string[] {
    const map: Record<string, string[]> = {
      quote: ['client_id', 'resort_id', 'check_in', 'check_out'],
      confirmed: ['client_id', 'resort_id', 'check_in', 'check_out', 'total_amount'],
      pre_arrival: ['client_id', 'resort_id', 'check_in', 'check_out', 'total_amount'],
      in_stay: ['client_id', 'resort_id', 'check_in', 'check_out', 'total_amount'],
      post_stay: ['client_id', 'resort_id', 'check_in', 'check_out', 'total_amount'],
    }
    return map[stage] ?? []
  },
}

/** Conflict checker - scheduling, deadlines */
export const ConflictChecker = {
  /** Balance urgency: overdue, due_soon, or ok */
  getBalanceUrgency(
    balance: number,
    nextDueDate?: string,
    _nextAmount?: number
  ): 'overdue' | 'due_soon' | 'ok' {
    if (balance <= 0) return 'ok'
    if (!nextDueDate) return 'ok'
    const due = new Date(nextDueDate)
    const now = new Date()
    if (due < now) return 'overdue'
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    if (due <= sevenDays) return 'due_soon'
    return 'ok'
  },

  /** Check if payment is overdue */
  isPaymentOverdue(dueDate: string, status: string): boolean {
    if (status === 'paid') return false
    return new Date(dueDate) < new Date()
  },

  /** Check if payment is due within N days */
  isPaymentDueSoon(dueDate: string, status: string, days = 7): boolean {
    if (status === 'paid') return false
    const due = new Date(dueDate)
    const now = new Date()
    const limit = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    return due >= now && due <= limit
  },

  /** Check if stay is within N days */
  isStayUpcoming(checkIn: string, days = 7): boolean {
    const checkInDate = new Date(checkIn)
    const now = new Date()
    const limit = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    return checkInDate >= now && checkInDate <= limit
  },

  /** Check if deadline is overdue */
  isDeadlineOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date()
  },

  /** Check date range overlap */
  hasDateOverlap(
    aStart: string,
    aEnd: string,
    bStart: string,
    bEnd: string
  ): boolean {
    const aS = new Date(aStart).getTime()
    const aE = new Date(aEnd).getTime()
    const bS = new Date(bStart).getTime()
    const bE = new Date(bEnd).getTime()
    return aS < bE && bS < aE
  },
}
