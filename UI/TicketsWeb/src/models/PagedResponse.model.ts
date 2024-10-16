import { Ticket } from "./Ticket.model"

export interface PagedResponse {
    pageNumber: number
    pageSize: number
    totalCount: number
    totalPages: number
    data: Ticket[]
  }