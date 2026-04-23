import { createContext, useContext, useEffect, useState } from "react";
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

  return <SubjectContext.Provider value={{ subjects, setSubjects, loadingSubjects, loadSubjects }}>{children}</SubjectContext.Provider>;
}

export const useSubjectContext = () => useContext(SubjectContext);
