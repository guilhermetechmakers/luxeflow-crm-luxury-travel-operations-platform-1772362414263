/**
 * Templates API - Proposal & Handover DOCX/PDF generation
 * Uses mock for local development; swap for Supabase Edge Function in production
 * Runtime safety: all responses validated with nullish coalescing
 */
import { api } from '@/lib/api'
import type { BookingDetail } from '@/types/booking'

export type TemplateFormat = 'docx' | 'pdf'

export interface RenderTemplateRequest {
  template_type: 'proposal' | 'handover'
  format: TemplateFormat
  booking_data: Partial<BookingDetail>
}

export interface RenderTemplateResponse {
  url?: string
  blob_url?: string
  filename?: string
  status: 'success' | 'pending' | 'error'
  error?: string
}

export const templatesApi = {
  /**
   * POST /api/templates/render - Generate DOCX/PDF from booking data
   */
  async renderTemplate(
    request: RenderTemplateRequest
  ): Promise<RenderTemplateResponse> {
    try {
      const res = await api.post<RenderTemplateResponse>(
        '/templates/render',
        request
      )
      return res ?? { status: 'error', error: 'No response' }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate document'
      return { status: 'error', error: message }
    }
  },

  /**
   * POST /api/templates/generateCannedProposal - Quick proposal generation
   */
  async generateCannedProposal(
    bookingId: string,
    format: TemplateFormat = 'pdf'
  ): Promise<RenderTemplateResponse> {
    try {
      const res = await api.post<RenderTemplateResponse>(
        '/templates/generateCannedProposal',
        { booking_id: bookingId, format }
      )
      return res ?? { status: 'error', error: 'No response' }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate proposal'
      return { status: 'error', error: message }
    }
  },
}
