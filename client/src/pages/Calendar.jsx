import { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import api from "../api/axios";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { formatDisplayDate } from "../utils/dateHelpers";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS }
});

const initialForm = { title: "", subject: "", type: "study", start: "", end: "", color: "#10b981", notes: "" };

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [eventRes, subjectRes] = await Promise.all([api.get("/calendar"), api.get("/subjects")]);
      setSubjects(subjectRes.data);
      setEvents(
        eventRes.data.map((event) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          title: event.title
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const dayEvents = useMemo(
    () => events.filter((event) => new Date(event.start).toDateString() === new Date(selectedDate).toDateString()),
    [events, selectedDate]
  );
  const upcoming = [...events].sort((a, b) => new Date(a.start) - new Date(b.start)).slice(0, 7);

  const saveEvent = async (e) => {
    e.preventDefault();
    if (!form.title || !form.start || !form.end) return;
    const payload = { ...form, subject: form.subject || null };
    if (selectedEvent?._id) await api.put(`/calendar/${selectedEvent._id}`, payload);
    else await api.post("/calendar", payload);
    setOpenModal(false);
    setSelectedEvent(null);
    setForm(initialForm);
    load();
  };

  const deleteEvent = async () => {
    if (!selectedEvent?._id) return;
    await api.delete(`/calendar/${selectedEvent._id}`);
    setOpenModal(false);
    setSelectedEvent(null);
    setForm(initialForm);
    load();
  };

  if (loading) return <Spinner text="Loading calendar..." />;

  return (
    <div className="space-y-4">
      <div className="card p-4 flex items-center justify-between">
        <h2 className="text-2xl font-display">Calendar</h2>
        <Button onClick={() => setOpenModal(true)}>Add Event</Button>
      </div>

      <div className="grid xl:grid-cols-4 gap-3">
        <div className="card p-3 xl:col-span-3">
          <div className="h-[620px] text-black">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              views={["month", "week", "day", "agenda"]}
              onSelectSlot={(slot) => {
                setForm((prev) => ({ ...prev, start: slot.start.toISOString().slice(0, 16), end: slot.end.toISOString().slice(0, 16) }));
                setSelectedEvent(null);
                setOpenModal(true);
              }}
              selectable
              onSelectEvent={(event) => {
                setSelectedEvent(event);
                setForm({
                  title: event.title,
                  subject: event.subject?._id || event.subject || "",
                  type: event.type || "study",
                  start: new Date(event.start).toISOString().slice(0, 16),
                  end: new Date(event.end).toISOString().slice(0, 16),
                  color: event.color || "#10b981",
                  notes: event.notes || ""
                });
                setOpenModal(true);
              }}
              onNavigate={(date) => setSelectedDate(date)}
              eventPropGetter={(event) => ({
                style: { backgroundColor: event.color || "#10b981", borderRadius: 8, border: "none", color: "#0f1117" }
              })}
            />
          </div>
        </div>
        <div className="card p-4 space-y-3">
          <h3 className="text-lg">Events on {formatDisplayDate(selectedDate)}</h3>
          {dayEvents.length ? (
            dayEvents.map((event) => (
              <div key={event._id} className="bg-navy-700 rounded-xl p-3">
                <p>{event.title}</p>
                <p className="text-xs text-white/60">{event.type}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-white/60">No events this day.</p>
          )}
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-lg mb-2">Upcoming 7 Events</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
          {upcoming.map((event) => (
            <div key={event._id} className="bg-navy-700 rounded-lg p-3">
              <p>{event.title}</p>
              <p className="text-xs text-white/60">{formatDisplayDate(event.start)}</p>
            </div>
          ))}
        </div>
      </div>

      <Modal open={openModal} title={selectedEvent ? "Edit Event" : "Add Event"} onClose={() => setOpenModal(false)}>
        <form onSubmit={saveEvent} className="space-y-3">
          <Input label="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          <label className="block space-y-1">
            <span className="text-sm text-white/70">Type</span>
            <select className="input" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
              {["assignment", "exam", "study", "reminder", "other"].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-sm text-white/70">Subject</span>
            <select className="input" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}>
              <option value="">No subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>
          <Input label="Start" type="datetime-local" value={form.start} onChange={(e) => setForm((p) => ({ ...p, start: e.target.value }))} />
          <Input label="End" type="datetime-local" value={form.end} onChange={(e) => setForm((p) => ({ ...p, end: e.target.value }))} />
          <Input label="Color" type="color" value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} />
          <label className="block space-y-1">
            <span className="text-sm text-white/70">Notes</span>
            <textarea className="input min-h-24" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          </label>
          <div className="flex gap-2">
            <Button className="flex-1">{selectedEvent ? "Save changes" : "Create event"}</Button>
            {selectedEvent ? (
              <Button type="button" variant="secondary" className="flex-1" onClick={deleteEvent}>
                Delete
              </Button>
            ) : null}
          </div>
        </form>
      </Modal>
    </div>
  );
}
