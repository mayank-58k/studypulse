import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { ClipboardList } from "lucide-react";
import api from "../api/axios";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import { humanDueDate } from "../utils/dateHelpers";
import { useSubjectContext } from "../context/SubjectContext";

const columns = [
  { key: "todo", title: "To Do" },
  { key: "inprogress", title: "In Progress" },
  { key: "done", title: "Done" }
];

const formInitial = { title: "", subject: "", description: "", dueDate: "", priority: "medium" };

export default function Assignments() {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const { subjects, loadSubjects } = useSubjectContext();
  const [filters, setFilters] = useState({ subject: "all", priority: "all", status: "all" });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(formInitial);

  const load = async () => {
    setLoading(true);
    try {
      const assignRes = await api.get("/assignments");
      setAssignments(assignRes.data);
      await loadSubjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!form.subject && subjects.length) setForm((prev) => ({ ...prev, subject: subjects[0]._id }));
  }, [subjects, form.subject]);

  const filteredAssignments = useMemo(
    () =>
      assignments.filter((item) => {
        if (filters.subject !== "all" && item.subject?._id !== filters.subject) return false;
        if (filters.priority !== "all" && item.priority !== filters.priority) return false;
        if (filters.status !== "all" && item.status !== filters.status) return false;
        return true;
      }),
    [assignments, filters]
  );

  const overdue = filteredAssignments.filter((a) => a.status !== "done" && new Date(a.dueDate) < new Date());
  const dueToday = filteredAssignments.filter((a) => new Date(a.dueDate).toDateString() === new Date().toDateString());

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId;
    const id = result.draggableId;
    setAssignments((prev) => prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a)));
    try {
      await api.patch(`/assignments/${id}/status`, { status: newStatus });
      if (newStatus === "done") await api.post("/badges/check");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to move task");
      load();
    }
  };

  const addAssignment = async (e) => {
    e.preventDefault();
    if (!form.title || !form.subject || !form.dueDate) return toast.error("Title, subject, and due date are required");
    await api.post("/assignments", form);
    toast.success("Assignment created");
    setShowModal(false);
    setForm(formInitial);
    load();
  };

  if (loading) return <Spinner text="Loading assignments..." />;

  return (
    <div className="space-y-4">
      <div className="card p-4 flex flex-wrap gap-2 justify-between">
        <div>
          <h2 className="text-2xl font-display">Assignments</h2>
          {dueToday.length ? <p className="text-sm text-neon-primary">Due today: {dueToday.length}</p> : null}
        </div>
        <Button onClick={() => setShowModal(true)}>Add Assignment</Button>
      </div>

      <div className="card p-4 grid sm:grid-cols-3 gap-2">
        <select className="input" value={filters.subject} onChange={(e) => setFilters((p) => ({ ...p, subject: e.target.value }))}>
          <option value="all">All subjects</option>
          {subjects.map((subject) => (
            <option key={subject._id} value={subject._id}>
              {subject.name}
            </option>
          ))}
        </select>
        <select className="input" value={filters.priority} onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value }))}>
          <option value="all">All priorities</option>
          {["low", "medium", "high"].map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <select className="input" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
          <option value="all">All statuses</option>
          {columns.map((col) => (
            <option key={col.key} value={col.key}>
              {col.title}
            </option>
          ))}
        </select>
      </div>

      {overdue.length ? (
        <div className="card p-4 border-neon-warning/40">
          <h3 className="text-neon-warning mb-2">Overdue</h3>
          <div className="flex flex-wrap gap-2">
            {overdue.map((a) => (
              <Badge key={a._id} color="bg-neon-warning/20 text-neon-warning">
                {a.title}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid lg:grid-cols-3 gap-3">
          {columns.map((column) => (
            <Droppable droppableId={column.key} key={column.key}>
              {(provided) => (
                <div className="card p-3 min-h-[320px]" ref={provided.innerRef} {...provided.droppableProps}>
                  <h3 className="mb-3 font-heading">{column.title}</h3>
                  <div className="space-y-2">
                    {filteredAssignments
                      .filter((a) => a.status === column.key)
                      .map((assignment, index) => (
                        <Draggable draggableId={assignment._id} index={index} key={assignment._id}>
                          {(dragProvided) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className="bg-navy-700 rounded-xl p-3 border border-white/10 interactive"
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{assignment.title}</p>
                                <Badge
                                  color={
                                    assignment.priority === "high"
                                      ? "bg-rose-500/20 text-rose-300"
                                      : assignment.priority === "medium"
                                        ? "bg-neon-secondary/20 text-neon-secondary"
                                        : "bg-neon-primary/20 text-neon-primary"
                                  }
                                >
                                  {assignment.priority}
                                </Badge>
                              </div>
                              <p className="text-xs text-white/60 mt-1">{assignment.subject?.name || "No subject"}</p>
                              <p className="text-xs mt-2 text-white/70">Due {humanDueDate(assignment.dueDate)}</p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {!assignments.length ? <EmptyState icon={ClipboardList} title="No assignments yet" message="Press N any time to jump here and add your first assignment." action={() => setShowModal(true)} actionText="Add Assignment" /> : null}

      <Modal open={showModal} title="Add Assignment" onClose={() => setShowModal(false)}>
        <form className="space-y-3" onSubmit={addAssignment}>
          <Input label="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          <label className="block space-y-1">
            <span className="text-sm text-white/70">Subject</span>
            <select className="input" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}>
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-sm text-white/70">Description</span>
            <textarea className="input min-h-24" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </label>
          <Input label="Due date" type="datetime-local" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} />
          <label className="block space-y-1">
            <span className="text-sm text-white/70">Priority</span>
            <select className="input" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
              {["low", "medium", "high"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <Button className="w-full">Save assignment</Button>
        </form>
      </Modal>
    </div>
  );
}
