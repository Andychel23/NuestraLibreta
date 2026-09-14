import { useApp } from '../state/AppState'
import Sheet from './Sheet'
import TripForm from '../forms/TripForm'
import PlaceForm from '../forms/PlaceForm'
import EventForm from '../forms/EventForm'
import ExpenseForm from '../forms/ExpenseForm'

const TITLES = {
  'trip-form': (p) => p.trip ? 'Editar viaje' : 'Nuevo viaje',
  'place-form': (p) => p.place ? 'Editar lugar' : 'Nuevo lugar',
  'event-form': (p) => p.event ? 'Editar evento' : 'Nuevo evento',
  'expense-form': (p) => p.expense ? 'Editar gasto' : 'Nuevo gasto',
}

export default function SheetHost() {
  const { sheet, closeSheet } = useApp()
  const open = !!sheet
  const type = sheet?.type
  const props = sheet?.props || {}

  return (
    <Sheet open={open} onClose={closeSheet} title={open ? TITLES[type]?.(props) : ''}>
      {type === 'trip-form' && <TripForm trip={props.trip} onDone={closeSheet} />}
      {type === 'place-form' && <PlaceForm place={props.place} presetTripId={props.presetTripId} onDone={closeSheet} />}
      {type === 'event-form' && <EventForm event={props.event} date={props.date} onDone={closeSheet} />}
      {type === 'expense-form' && <ExpenseForm expense={props.expense} presetTripId={props.presetTripId} onDone={closeSheet} />}
    </Sheet>
  )
}
