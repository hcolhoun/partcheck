import { checkCompatibility } from '@/lib/compatibility/engine'

export async function POST(req: Request) {
  const body = await req.json()
  const result = await checkCompatibility(body)
  return Response.json(result)
}