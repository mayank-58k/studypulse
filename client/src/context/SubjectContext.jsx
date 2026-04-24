import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const SubjectContext = createContext(null);

export function SubjectProvider({ children }) {
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const loadSubjects = async () => {
    if (!localStorage.getItem("studypulse_token")) return;
    setLoadingSubjects(true);
    try {
      const { data } = await api.get("/subjects");
      setSubjects(data);
    } finally {
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const value = useMemo(
    () => ({
      subjects,
      setSubjects,
      loadingSubjects,
      loadSubjects,
      addSubject: (subject) => setSubjects((prev) => [subject, ...prev]),
      updateSubjectInStore: (subject) => setSubjects((prev) => prev.map((s) => (s._id === subject._id ? subject : s))),
      removeSubjectFromStore: (subjectId) => setSubjects((prev) => prev.filter((s) => s._id !== subjectId))
    }),
    [subjects, loadingSubjects]
  );

  return <SubjectContext.Provider value={value}>{children}</SubjectContext.Provider>;
}

export const useSubjectContext = () => useContext(SubjectContext);
