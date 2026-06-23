import { z } from 'zod'

const jobTypeSchema = z.enum(['planning', 'design', 'publishing', 'dev'])
const projectStatusSchema = z.enum(['active', 'completed', 'paused', 'internal', 'cancelled'])
const teamCategorySchema = z.enum(['dev', 'publishing', 'design'])

const jobRecordSchema = z.object({
  planning: z.number().min(0),
  design: z.number().min(0),
  publishing: z.number().min(0),
  dev: z.number().min(0),
})

const assignmentSchema = z.object({
  id: z.string(),
  employeeId: z.string().min(1, '담당자를 선택해 주세요'),
  jobType: jobTypeSchema,
  startDate: z.string().min(1, '시작일을 입력해 주세요'),
  endDate: z.string().min(1, '종료일을 입력해 주세요'),
  allocation: z.number().min(0).max(1),
})

const operationsSchema = z.object({
  clientName: z.string(),
  startDate: z.string().min(1, '시작일을 입력해 주세요'),
  endDate: z.string().min(1, '종료일을 입력해 주세요'),
  contractAmount: z.number().min(0),
  contractMDs: jobRecordSchema,
  contractRates: jobRecordSchema,
  assignments: z.array(assignmentSchema),
})

export const projectOpsFormSchema = z.object({
  name: z.string().trim().min(1, '프로젝트명을 입력해 주세요'),
  description: z.string(),
  owner: z.string(),
  status: projectStatusSchema,
  teamCategory: teamCategorySchema.optional(),
  operations: operationsSchema,
})

export type ProjectOpsFormValues = z.infer<typeof projectOpsFormSchema>

export const projectCreateSchema = z.object({
  name: z.string().trim().min(1, '프로젝트명을 입력해 주세요'),
  description: z.string(),
  owner: z.string(),
})

export type ProjectCreateFormValues = z.infer<typeof projectCreateSchema>
