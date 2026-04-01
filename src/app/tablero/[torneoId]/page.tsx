import { TableroView } from '@/presentation/components/tablero/TableroView'

interface Props {
  params: Promise<{ torneoId: string }>
}

export default async function TableroPage({ params }: Props) {
  const { torneoId } = await params
  return <TableroView torneoId={torneoId} />
}
