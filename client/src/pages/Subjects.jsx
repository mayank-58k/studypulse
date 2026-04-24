import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../api/axios";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import { BookOpen } from "lucide-react";
import { calcWeightedAverage } from "../utils/gpaCalculator";
import { useSubjectContext } from "../context/SubjectContext";

const blankSubject = { name: "", color: "#00ff88", icon: "BookOpen", targetGrade: 85, semester: "Spring" };
const blankGrade = { category: "quiz", title: "", score: "", maxScore: "100", weight: "1", date: "" };

export default function Subjects() {
  const { subjects, loadingSubjects, addSubject, updateSubjectInStore, removeSubjectFromStore, loadSubjects } = useSubjectContext();
  const [openSubjectModal, setOpenSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState(blankSubject);
  const [editing, setEditing] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [grades, setGrades] = useState([]);
  const [gradeForm, setGradeForm] = useState(blankGrade);
  const [semesterFilter, setSemesterFilter] = useState("All");

  const loadGrades = async (subjectId) => {
    setActiveId(subjectId);
    const { data } = await api.get(`/subjects/${subjectId}/grades`);
    setGrades(data);
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const filteredSubjects = useMemo(
    () => subjects.filter((s) => semesterFilter === "All" || (s.semester || "Unknown") === semesterFilter),
    [subjects, semesterFilter]
  );
  const semesters = ["All", ...new Set(subjects.map((s) => s.semester || "Unknown"))];

  const gpaEstimate = useMemo(() => {
    if (!filteredSubjects.length) return 0;
    const points = filteredSubjects.map((subject) => {
      const avg = calcWeightedAverage(grades.filter((g) => g.subject === subject._id));
      if (avg >= 90) return 4;
      if (avg >= 80) return 3;
      if (avg >= 70) return 2;
      if (avg >= 60) return 1;
      return 0;
    });
    return Number((points.reduce((a, b) => a + b, 0) / points.length).toFixed(2));
  }, [filteredSubjects, grades]);

  const saveSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) return toast.error("Subject name is required");
    try {
      if (editing) {
        const { data } = await api.put(`/subjects/${editing._id}`, subjectForm);
        updateSubjectInStore(data);
      } else {
        const { data } = await api.post("/subjects", subjectForm);
        addSubject(data);
      }
      toast.success(editing ? "Subject updated" : "Subject created");
      setOpenSubjectModal(false);
      setEditing(null);
      setSubjectForm(blankSubject);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save subject");
    }
  };

  const removeSubject = async (id) => {
    if (!window.confirm("Delete subject and related grades?")) return;
    await api.delete(`/subjects/${id}`);
    removeSubjectFromStore(id);
    toast.success("Subject deleted");
    if (activeId === id) {
      setActiveId(null);
      setGrades([]);
    }
  };

  const addGrade = async (e) => {
    e.preventDefault();
    if (!activeId) return;
    if (!gradeForm.title || Number(gradeForm.score) < 0 || Number(gradeForm.maxScore) <= 0) {
      toast.error("Fill all grade fields correctly");
      return;
    }
    await api.post("/grades", {
      ...gradeForm,
      subject: activeId,
      score: Number(gradeForm.score),
      maxScore: Number(gradeForm.maxScore),
      weight: Number(gradeForm.weight)
    });
    setGradeForm(blankGrade);
    toast.success("Grade added");
    loadGrades(activeId);
  };

  if (loadingSubjects) return <Spinner text="Loading subjects..." />;

  return (
    <div className="space-y-4">
      <div className="card p-4 flex flex-wrap gap-2 items-center justify-between">
        <div>
          <h2 className="text-2xl font-display">Subjects</h2>
          <p className="text-sm text-white/70">Estimated GPA: {gpaEstimate}</p>
        </div>
        <div className="flex gap-2">
          <select className="input" value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)}>
            {semesters.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <Button onClick={() => setOpenSubjectModal(true)}>Add Subject</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredSubjects.map((subject) => {
          const subjectGrades = grades.filter((g) => g.subject === subject._id || g.subject?._id === subject._id);
          const avg = calcWeightedAverage(subjectGrades);
          return (
            <div className="card p-4 border-l-4 interactive hover:shadow-[0_0_25px_rgba(0,255,136,0.22)]" key={subject._id} style={{ borderLeftColor: subject.color }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-heading">{subject.name}</h3>
                  <p className="text-sm text-white/60">{subject.semester || "Unknown semester"}</p>
                </div>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }} />
              </div>
              <p className="mt-2 text-neon-primary font-mono">Average: {avg}%</p>
              <div className="mt-3 flex gap-2 flex-wrap">
                <Button variant="secondary" onClick={() => loadGrades(subject._id)}>
                  View Grades
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditing(subject);
                    setSubjectForm({
                      name: subject.name,
                      color: subject.color,
                      icon: subject.icon || "BookOpen",
                      targetGrade: subject.targetGrade || 85,
                      semester: subject.semester || "Spring"
                    });
                    setOpenSubjectModal(true);
                  }}
                >
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => removeSubject(subject._id)}>
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {!filteredSubjects.length ? <EmptyState icon={BookOpen} title="No subjects yet" message="Add your first subject and it will instantly appear in assignment forms." /> : null}

      {activeId ? (
        <div className="grid lg:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-lg mb-2">Grade Breakdown</h3>
            <div className="max-h-72 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-white/60">
                    <th>Title</th>
                    <th>Category</th>
                    <th>Score</th>
                    <th>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade._id} className="border-t border-white/5">
                      <td>{grade.title}</td>
                      <td>{grade.category}</td>
                      <td>{grade.score}/{grade.maxScore}</td>
                      <td>{grade.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-lg mb-2">Trend Chart</h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[...grades].sort((a, b) => new Date(a.date) - new Date(b.date)).map((g) => ({ ...g, percent: (g.score / g.maxScore) * 100 }))}>
                  <XAxis dataKey="title" hide />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="percent" stroke="#00ff88" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <form className="card p-4 lg:col-span-2 grid md:grid-cols-6 gap-2" onSubmit={addGrade}>
            <select className="input" value={gradeForm.category} onChange={(e) => setGradeForm((p) => ({ ...p, category: e.target.value }))}>
              {["test", "quiz", "assignment", "project", "exam"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <Input className="md:col-span-2" placeholder="Title" value={gradeForm.title} onChange={(e) => setGradeForm((p) => ({ ...p, title: e.target.value }))} />
            <Input type="number" placeholder="Score" value={gradeForm.score} onChange={(e) => setGradeForm((p) => ({ ...p, score: e.target.value }))} />
            <Input type="number" placeholder="Max" value={gradeForm.maxScore} onChange={(e) => setGradeForm((p) => ({ ...p, maxScore: e.target.value }))} />
            <Input type="number" placeholder="Weight" value={gradeForm.weight} onChange={(e) => setGradeForm((p) => ({ ...p, weight: e.target.value }))} />
            <Input type="date" className="md:col-span-2" value={gradeForm.date} onChange={(e) => setGradeForm((p) => ({ ...p, date: e.target.value }))} />
            <Button className="md:col-span-2">Add Grade</Button>
          </form>
        </div>
      ) : null}

      <Modal open={openSubjectModal} title={editing ? "Edit Subject" : "Add Subject"} onClose={() => setOpenSubjectModal(false)}>
        <form className="space-y-3" onSubmit={saveSubject}>
          <Input label="Name" value={subjectForm.name} onChange={(e) => setSubjectForm((p) => ({ ...p, name: e.target.value }))} />
          <Input label="Color" type="color" value={subjectForm.color} onChange={(e) => setSubjectForm((p) => ({ ...p, color: e.target.value }))} />
          <Input label="Icon" value={subjectForm.icon} onChange={(e) => setSubjectForm((p) => ({ ...p, icon: e.target.value }))} />
          <Input label="Target grade" type="number" value={subjectForm.targetGrade} onChange={(e) => setSubjectForm((p) => ({ ...p, targetGrade: Number(e.target.value) }))} />
          <Input label="Semester" value={subjectForm.semester} onChange={(e) => setSubjectForm((p) => ({ ...p, semester: e.target.value }))} />
          <Button className="w-full">{editing ? "Save changes" : "Create subject"}</Button>
        </form>
      </Modal>
    </div>
  );
}
