import { apiClient } from '@/lib/api-client'
import {
  apiEndpoints,
  DashboardSummaryResponseSchema,
  DashboardVehicleDetailResponseSchema,
} from '@rocket-lease/contracts'
import type {
  DashboardPeriod,
  DashboardSummaryResponse,
  DashboardVehicleDetailResponse,
} from '@rocket-lease/contracts'

export interface DashboardRangeParams {
  period: DashboardPeriod
  from?: string
  to?: string
}

const parseSummary = (input: unknown): DashboardSummaryResponse =>
  DashboardSummaryResponseSchema.parse(input)

const parseVehicleDetail = (input: unknown): DashboardVehicleDetailResponse =>
  DashboardVehicleDetailResponseSchema.parse(input)

function buildQuery({ period, from, to }: DashboardRangeParams): string {
  const params = new URLSearchParams({ period })
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  return params.toString()
}

export const dashboardApi = {
  async getMetrics(
    params: DashboardRangeParams,
  ): Promise<DashboardSummaryResponse> {
    const res = await apiClient.get<unknown>(
      `${apiEndpoints.dashboard.metrics}?${buildQuery(params)}`,
    )
    return parseSummary(res)
  },

  async getVehicleMetrics(
    vehicleId: string,
    params: DashboardRangeParams,
  ): Promise<DashboardVehicleDetailResponse> {
    const res = await apiClient.get<unknown>(
      `${apiEndpoints.dashboard.vehicleMetrics(vehicleId)}?${buildQuery(params)}`,
    )
    return parseVehicleDetail(res)
  },
}
