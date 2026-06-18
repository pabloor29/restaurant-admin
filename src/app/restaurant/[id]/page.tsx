import { redirect } from 'next/navigation'

export default async function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/restaurant/${id}/reservations`)
}
